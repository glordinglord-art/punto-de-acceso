/**
 * cleanup-storage.mjs
 * Borra imágenes VIEJAS de meals para liberar storage.
 * - Conserva imágenes de las meals más recientes hasta TARGET_MB
 * - En la BD: pone imageUrl=null, imageUrls=[] en las meals sin imagen
 * - El historial de comidas queda intacto
 *
 * Uso:
 *   node cleanup-storage.mjs --dry-run   (ver plan sin tocar nada)
 *   node cleanup-storage.mjs             (ejecutar)
 */

import { createClient } from '@supabase/supabase-js';
import { PrismaClient } from '@prisma/client';

const SUPABASE_URL = process.env.SUPABASE_URL;
const SUPABASE_KEY = process.env.SUPABASE_KEY;

if (!SUPABASE_URL || !SUPABASE_KEY) {
  console.error('Error: SUPABASE_URL y SUPABASE_KEY deben estar en .env o variables de entorno');
  process.exit(1);
}
const BUCKET = 'meal-images';
const TARGET_MB = 700;
const TARGET_BYTES = TARGET_MB * 1024 * 1024;

const DRY_RUN = process.argv.includes('--dry-run');

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);
const prisma = new PrismaClient();

function extractPath(url) {
  if (!url) return null;
  const marker = `/object/public/${BUCKET}/`;
  const idx = url.indexOf(marker);
  if (idx === -1) return null;
  return decodeURIComponent(url.slice(idx + marker.length));
}

async function listAllFiles() {
  const files = [];
  let offset = 0;
  while (true) {
    const { data, error } = await supabase.storage
      .from(BUCKET)
      .list('', { limit: 1000, offset, sortBy: { column: 'created_at', order: 'desc' } });
    if (error) throw new Error(`Storage list: ${error.message}`);
    if (!data?.length) break;
    files.push(...data);
    if (data.length < 1000) break;
    offset += 1000;
  }
  return files;
}

async function main() {
  if (DRY_RUN) console.log('🔍 DRY-RUN — no se modifica nada\n');

  // 1. Obtener todas las meals con imágenes, ordenadas más nuevas primero
  console.log('1. Leyendo meals con imágenes de BD...');
  const meals = await prisma.meal.findMany({
    where: {
      OR: [
        { imageUrl: { not: null } },
        { imageUrls: { isEmpty: false } },
      ],
    },
    select: { id: true, imageUrl: true, imageUrls: true, createdAt: true },
    orderBy: { createdAt: 'desc' }, // más nuevas primero
  });
  console.log(`   ${meals.length} meals con imágenes`);

  // 2. Obtener tamaños del storage
  console.log('2. Listando archivos en storage...');
  const allFiles = await listAllFiles();
  const sizeMap = new Map(
    allFiles.filter(f => f.metadata?.size).map(f => [f.name, f.metadata.size])
  );
  const totalStorageBytes = [...sizeMap.values()].reduce((a, b) => a + b, 0);
  console.log(`   ${sizeMap.size} archivos — ${(totalStorageBytes / 1024 / 1024).toFixed(1)} MB`);

  // 3. Recorrer meals de nueva a vieja, acumular tamaño
  //    Cuando superamos TARGET_BYTES → esas meals las limpiamos
  let accumulated = 0;
  const mealsToKeep = [];
  const mealsToClean = [];

  for (const meal of meals) {
    const paths = [
      extractPath(meal.imageUrl),
      ...(meal.imageUrls ?? []).map(extractPath),
    ].filter(Boolean);

    const size = paths.reduce((acc, p) => acc + (sizeMap.get(p) ?? 0), 0);

    if (accumulated + size <= TARGET_BYTES) {
      accumulated += size;
      mealsToKeep.push(meal);
    } else {
      mealsToClean.push({ meal, paths });
    }
  }

  const pathsToDelete = [...new Set(mealsToClean.flatMap(m => m.paths))];
  const willFreeBytes = pathsToDelete.reduce((acc, p) => acc + (sizeMap.get(p) ?? 0), 0);

  console.log(`\n📋 Plan:`);
  console.log(`   Conservar imágenes: ${mealsToKeep.length} meals (${(accumulated / 1024 / 1024).toFixed(1)} MB)`);
  console.log(`   Limpiar imágenes:   ${mealsToClean.length} meals antiguas`);
  console.log(`   Archivos a borrar:  ${pathsToDelete.length} (libera ~${(willFreeBytes / 1024 / 1024).toFixed(1)} MB)`);
  console.log(`   Storage resultante: ~${((totalStorageBytes - willFreeBytes) / 1024 / 1024).toFixed(1)} MB`);

  if (mealsToClean.length === 0) {
    console.log('\nNada que limpiar.');
    return;
  }

  if (DRY_RUN) {
    const oldest = mealsToClean.at(-1)?.meal.createdAt;
    const newest = mealsToClean.at(0)?.meal.createdAt;
    console.log(`\n   Meals a limpiar: desde ${oldest?.toISOString().slice(0,10)} hasta ${newest?.toISOString().slice(0,10)}`);
    return;
  }

  // Confirmación
  console.log('\n⚠️  Esto borrará imágenes del storage y pondrá imageUrl=null en BD.');
  console.log('    El historial de comidas queda intacto. Los registros NO se borran.');
  console.log('    Escribe "si" para confirmar:');
  process.stdin.setEncoding('utf8');
  const answer = await new Promise(r => process.stdin.once('data', r));
  if (answer.trim().toLowerCase() !== 'si') {
    console.log('Cancelado.');
    return;
  }

  // 4. Borrar archivos del storage en lotes
  console.log('\nBorrando archivos del storage...');
  let deleted = 0;
  const BATCH = 100;
  for (let i = 0; i < pathsToDelete.length; i += BATCH) {
    const batch = pathsToDelete.slice(i, i + BATCH);
    const { error } = await supabase.storage.from(BUCKET).remove(batch);
    if (error) console.error(`\nError lote storage: ${error.message}`);
    else {
      deleted += batch.length;
      process.stdout.write(`\r   ${deleted}/${pathsToDelete.length} archivos borrados`);
    }
  }

  // 5. Limpiar URLs en BD
  console.log('\n\nActualizando BD...');
  const mealIds = mealsToClean.map(m => m.meal.id);
  const updated = await prisma.meal.updateMany({
    where: { id: { in: mealIds } },
    data: { imageUrl: null, imageUrls: [] },
  });
  console.log(`   ${updated.count} meals actualizadas (imageUrl=null, imageUrls=[])`);

  console.log(`\n✅ Listo.`);
  console.log(`   Liberados: ~${(willFreeBytes / 1024 / 1024).toFixed(1)} MB`);
  console.log(`   Storage aprox: ~${((totalStorageBytes - willFreeBytes) / 1024 / 1024).toFixed(1)} MB`);
}

main()
  .catch(e => { console.error('Error fatal:', e.message); process.exit(1); })
  .finally(() => prisma.$disconnect());
