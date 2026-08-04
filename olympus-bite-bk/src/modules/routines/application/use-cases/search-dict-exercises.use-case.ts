import { Inject, Injectable } from '@nestjs/common';
import {
  EXERCISE_DICTIONARY_REPOSITORY,
  ExerciseDictionaryRepositoryPort,
  ExerciseDictFilterParams,
  ExerciseDictPaginatedResult,
} from '../../domain/ports/exercise-dictionary.repository.port';

@Injectable()
export class SearchDictExercisesUseCase {
  constructor(
    @Inject(EXERCISE_DICTIONARY_REPOSITORY)
    private readonly repository: ExerciseDictionaryRepositoryPort,
  ) {}

  async execute(
    filters: ExerciseDictFilterParams,
  ): Promise<ExerciseDictPaginatedResult> {
    return this.repository.findFiltered(filters);
  }
}
