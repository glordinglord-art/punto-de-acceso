import { Module } from '@nestjs/common';
import { RoutinesController } from './adapters/http/routines.controller';
import { PrismaRoutineRepository } from './adapters/persistence/prisma-routine.repository';
import { PrismaWorkoutLogRepository } from './adapters/persistence/prisma-workout-log.repository';
import { CreateRoutineUseCase } from '../application/use-cases/create-routine.use-case';
import { UpdateRoutineUseCase } from '../application/use-cases/update-routine.use-case';
import { DeleteRoutineUseCase } from '../application/use-cases/delete-routine.use-case';
import { GetRoutinesByClientUseCase } from '../application/use-cases/get-routines-by-client.use-case';
import { LogWorkoutUseCase, WORKOUT_LOG_REPOSITORY } from '../application/use-cases/log-workout.use-case';
import { ROUTINE_REPOSITORY } from '../domain/ports/routine.repository.port';

@Module({
  controllers: [RoutinesController],
  providers: [
    {
      provide: ROUTINE_REPOSITORY,
      useClass: PrismaRoutineRepository,
    },
    {
      provide: WORKOUT_LOG_REPOSITORY,
      useClass: PrismaWorkoutLogRepository,
    },
    CreateRoutineUseCase,
    UpdateRoutineUseCase,
    DeleteRoutineUseCase,
    GetRoutinesByClientUseCase,
    LogWorkoutUseCase,
  ],
  exports: [ROUTINE_REPOSITORY],
})
export class RoutinesModule {}
