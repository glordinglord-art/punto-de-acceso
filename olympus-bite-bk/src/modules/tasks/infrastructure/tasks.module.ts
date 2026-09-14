import { Module } from '@nestjs/common';
import { TasksController } from './adapters/http/tasks.controller';
import { PrismaTaskRepository } from './adapters/persistence/prisma-task.repository';
import { TASK_REPOSITORY } from '../domain/ports/task.repository.port';
import { WeeklyAuditService } from '../application/services/weekly-audit.service';
import { StorageCleanupService } from '../application/services/storage-cleanup.service';

@Module({
  controllers: [TasksController],
  providers: [
    {
      provide: TASK_REPOSITORY,
      useClass: PrismaTaskRepository,
    },
    WeeklyAuditService,
    StorageCleanupService,
  ],
  exports: [TASK_REPOSITORY, WeeklyAuditService, StorageCleanupService],
})
export class TasksModule {}
