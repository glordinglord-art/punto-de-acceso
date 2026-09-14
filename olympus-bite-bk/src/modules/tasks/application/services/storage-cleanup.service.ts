import { Injectable, Logger } from '@nestjs/common';
import { Cron } from '@nestjs/schedule';
import { PrismaService } from '../../../../shared/infrastructure/prisma/prisma.service';

export interface StorageCleanupResult {
  cleanedAt: string;
  daysKept: number;
  deletedFiles: number;
  freedMb: number;
  remainingFiles: number;
  remainingMb: number;
  updatedMeals: number;
}

@Injectable()
export class StorageCleanupService {
  private readonly logger = new Logger(StorageCleanupService.name);

  constructor(private readonly prisma: PrismaService) {}

  /**
   * Limpieza automática de imágenes en Supabase Storage.
   * Corre todos los días a las 03:00 AM para mantener el almacenamiento
   * siempre por debajo del límite gratuito de 1 GB de Supabase.
   */
  @Cron('0 3 * * *')
  async handleDailyStorageCleanup() {
    this.logger.log(
      '🧹 Iniciando purga automática programada de imágenes en Supabase Storage...',
    );
    try {
      const result = await this.cleanupOldImages(2);
      this.logger.log(
        `✅ Purga automática completada: ${result.deletedFiles} archivos eliminados (~${result.freedMb} MB liberados), ${result.remainingFiles} archivos restantes (${result.remainingMb} MB).`,
      );
    } catch (err) {
      this.logger.error(
        '❌ Error en purga automática programada de imágenes:',
        err,
      );
    }
  }

  /**
   * Ejecuta la purga conservando sólo las imágenes de los últimos `daysToKeep` días (por defecto 2).
   */
  async cleanupOldImages(daysToKeep = 2): Promise<StorageCleanupResult> {
    const filesToDeleteStats = await this.prisma.$queryRawUnsafe<
      Array<{
        delete_count?: string | number | bigint;
        delete_mb?: string | number;
      }>
    >(`
      SELECT 
        count(*) as delete_count,
        round(COALESCE(sum((metadata->>'size')::bigint), 0) / (1024 * 1024), 2) as delete_mb
      FROM storage.objects
      WHERE bucket_id = 'meal-images'
        AND created_at < NOW() - INTERVAL '${daysToKeep} days';
    `);

    const firstDeleteStat = filesToDeleteStats[0];
    const deleteCount = Number(firstDeleteStat?.delete_count ?? 0);
    const deleteMb = Number(firstDeleteStat?.delete_mb ?? 0);

    let deletedFiles = 0;
    let updatedMeals = 0;

    if (deleteCount > 0) {
      await this.prisma.$transaction(async (tx) => {
        // Habilitar eliminación directa en storage.objects
        await tx.$executeRawUnsafe(
          `SET LOCAL storage.allow_delete_query = 'true';`,
        );

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
    }

    const remainingStats = await this.prisma.$queryRawUnsafe<
      Array<{
        total_files?: string | number | bigint;
        total_mb?: string | number;
      }>
    >(`
      SELECT 
        count(*) as total_files,
        round(COALESCE(sum((metadata->>'size')::bigint), 0) / (1024 * 1024), 2) as total_mb
      FROM storage.objects
      WHERE bucket_id = 'meal-images';
    `);

    const firstRemainingStat = remainingStats[0];

    return {
      cleanedAt: new Date().toISOString(),
      daysKept: daysToKeep,
      deletedFiles,
      freedMb: deleteMb,
      remainingFiles: Number(firstRemainingStat?.total_files ?? 0),
      remainingMb: Number(firstRemainingStat?.total_mb ?? 0),
      updatedMeals,
    };
  }
}
