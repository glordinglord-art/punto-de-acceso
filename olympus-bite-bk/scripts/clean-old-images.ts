import { PrismaClient } from '@prisma/client';
import * as dotenv from 'dotenv';
dotenv.config();

const prisma = new PrismaClient();

async function cleanOldImages(daysToKeep = 2) {
  console.log('====================================================');
  console.log(`🧹 INICIANDO LIMPIEZA DE IMÁGENES EN SUPABASE STORAGE`);
  console.log(`⏱️ Conservando sólo imágenes de los últimos ${daysToKeep} días...`);
  console.log('====================================================\n');

  try {
    // 1. Estadísticas previas
    const beforeStats: any = await prisma.$queryRawUnsafe(`
      SELECT 
        count(*) as total_files,
        round(sum((metadata->>'size')::bigint) / (1024 * 1024), 2) as total_mb,
        round(sum((metadata->>'size')::bigint) / (1024 * 1024 * 1024), 2) as total_gb
      FROM storage.objects
      WHERE bucket_id = 'meal-images';
    `);

    const filesToDeleteStats: any = await prisma.$queryRawUnsafe(`
      SELECT 
        count(*) as delete_count,
        round(sum((metadata->>'size')::bigint) / (1024 * 1024), 2) as delete_mb
      FROM storage.objects
      WHERE bucket_id = 'meal-images'
        AND created_at < NOW() - INTERVAL '${daysToKeep} days';
    `);

    const mealsToCleanStats: any = await prisma.$queryRawUnsafe(`
      SELECT count(*) as count
      FROM meals
      WHERE date < NOW() - INTERVAL '${daysToKeep} days'
        AND (image_url IS NOT NULL OR cardinality(image_urls) > 0);
    `);

    console.log(`📊 ESTADO ACTUAL:`);
    console.log(`- Archivos totales en Supabase: ${beforeStats[0].total_files} (${beforeStats[0].total_mb} MB / ${beforeStats[0].total_gb} GB)`);
    console.log(`- Archivos que serán eliminados (> ${daysToKeep} días): ${filesToDeleteStats[0].delete_count} (~${filesToDeleteStats[0].delete_mb} MB)`);
    console.log(`- Comidas a desvincular imagen (> ${daysToKeep} días): ${mealsToCleanStats[0].count}\n`);

    if (Number(filesToDeleteStats[0].delete_count) === 0 && Number(mealsToCleanStats[0].count) === 0) {
      console.log('✅ No hay imágenes antiguas para limpiar. Todo está en orden.');
      return;
    }

    // 2. Ejecutar eliminación en transacción PostgreSQL
    console.log(`⏳ Ejecutando purga en PostgreSQL...`);

    let deletedFiles = 0;
    let updatedMeals = 0;

    await prisma.$transaction(async (tx) => {
      // Habilitar eliminación directa en storage.objects
      await tx.$executeRawUnsafe(`SET LOCAL storage.allow_delete_query = 'true';`);

      // Eliminar objetos en storage.objects
      deletedFiles = await tx.$executeRawUnsafe(`
        DELETE FROM storage.objects
        WHERE bucket_id = 'meal-images'
          AND created_at < NOW() - INTERVAL '${daysToKeep} days';
      `);

      // Desvincular URLs de imágenes en comidas antiguas
      updatedMeals = await tx.$executeRawUnsafe(`
        UPDATE meals
        SET image_url = NULL,
            image_urls = '{}'::text[]
        WHERE date < NOW() - INTERVAL '${daysToKeep} days'
          AND (image_url IS NOT NULL OR cardinality(image_urls) > 0);
      `);
    });

    // 3. Estadísticas posteriores
    const afterStats: any = await prisma.$queryRawUnsafe(`
      SELECT 
        count(*) as total_files,
        round(sum((metadata->>'size')::bigint) / (1024 * 1024), 2) as total_mb,
        round(sum((metadata->>'size')::bigint) / (1024 * 1024 * 1024), 2) as total_gb
      FROM storage.objects
      WHERE bucket_id = 'meal-images';
    `);

    console.log('\n====================================================');
    console.log('🎉 LIMPIEZA COMPLETADA CON ÉXITO');
    console.log('====================================================');
    console.log(`🗑️ Archivos eliminados de Supabase Storage: ${deletedFiles}`);
    console.log(`💾 Espacio liberado: ~${filesToDeleteStats[0].delete_mb} MB`);
    console.log(`🍽️ Registros de comidas actualizados (sin fotos rotas): ${updatedMeals}`);
    console.log(`📉 Nuevo tamaño en Supabase Storage: ${afterStats[0].total_files} archivos (${afterStats[0].total_mb || 0} MB / ${afterStats[0].total_gb || 0} GB)`);
    console.log(`⚡ Supabase actualizará el cálculo de cuota en el transcurso de hasta 1 hora para restaurar el servicio por completo.`);
    console.log('====================================================\n');

  } catch (error) {
    console.error('❌ Error ejecutando limpieza de imágenes:', error);
  } finally {
    await prisma.$disconnect();
  }
}

cleanOldImages(2);
