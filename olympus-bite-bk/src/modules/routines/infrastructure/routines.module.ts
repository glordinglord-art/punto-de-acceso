import { Module } from '@nestjs/common';
import { RoutinesController } from './adapters/http/routines.controller';
import { PrismaRoutineRepository } from './adapters/persistence/prisma-routine.repository';
import { PrismaWorkoutLogRepository } from './adapters/persistence/prisma-workout-log.repository';
import { CreateRoutineUseCase } from '../application/use-cases/create-routine.use-case';
import { UpdateRoutineUseCase } from '../application/use-cases/update-routine.use-case';
import { SwapDaysUseCase } from '../application/use-cases/swap-days.use-case';
import { DeleteRoutineUseCase } from '../application/use-cases/delete-routine.use-case';
import { GetRoutinesByClientUseCase } from '../application/use-cases/get-routines-by-client.use-case';
import {
  LogWorkoutUseCase,
  WORKOUT_LOG_REPOSITORY,
} from '../application/use-cases/log-workout.use-case';
import { EvaluateRoutineUseCase } from '../application/use-cases/evaluate-routine.use-case';
import { ROUTINE_REPOSITORY } from '../domain/ports/routine.repository.port';
import { ActivateRoutineUseCase } from '../application/use-cases/activate-routine.use-case';

// Exercise Dictionary
import { ExerciseDictionaryController } from './adapters/http/exercise-dictionary.controller';
import { PrismaExerciseDictionaryRepository } from './adapters/persistence/prisma-exercise-dictionary.repository';
import { EXERCISE_DICTIONARY_REPOSITORY } from '../domain/ports/exercise-dictionary.repository.port';
import { CreateDictExerciseUseCase } from '../application/use-cases/create-dict-exercise.use-case';
import { GetDictExercisesUseCase } from '../application/use-cases/get-dict-exercises.use-case';
import { DeleteDictExerciseUseCase } from '../application/use-cases/delete-dict-exercise.use-case';

@Module({
  controllers: [RoutinesController, ExerciseDictionaryController],
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
    SwapDaysUseCase,
    DeleteRoutineUseCase,
    GetRoutinesByClientUseCase,
    LogWorkoutUseCase,
    EvaluateRoutineUseCase,
    ActivateRoutineUseCase,
    {
      provide: EXERCISE_DICTIONARY_REPOSITORY,
      useClass: PrismaExerciseDictionaryRepository,
    },
    CreateDictExerciseUseCase,
    GetDictExercisesUseCase,
    DeleteDictExerciseUseCase,
  ],
  exports: [ROUTINE_REPOSITORY, EXERCISE_DICTIONARY_REPOSITORY],
})
export class RoutinesModule {}
