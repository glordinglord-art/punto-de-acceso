import { Module } from '@nestjs/common';
import { TasksController } from './adapters/http/tasks.controller';
import { PrismaTaskRepository } from './adapters/persistence/prisma-task.repository';
import { TASK_REPOSITORY } from '../domain/ports/task.repository.port';
import { WeeklyAuditService } from '../application/services/weekly-audit.service';

@Module({
  controllers: [TasksController],
  providers: [
    {
      provide: TASK_REPOSITORY,
      useClass: PrismaTaskRepository,
    },
    WeeklyAuditService,
  ],
  exports: [TASK_REPOSITORY, WeeklyAuditService],
})
export class TasksModule {}
