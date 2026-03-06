import { Module } from '@nestjs/common';
import { TasksController } from './adapters/http/tasks.controller';
import { PrismaTaskRepository } from './adapters/persistence/prisma-task.repository';
import { TASK_REPOSITORY } from '../domain/ports/task.repository.port';

@Module({
  controllers: [TasksController],
  providers: [
    {
      provide: TASK_REPOSITORY,
      useClass: PrismaTaskRepository,
    },
  ],
  exports: [TASK_REPOSITORY],
})
export class TasksModule {}
