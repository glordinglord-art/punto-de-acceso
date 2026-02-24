import { Inject, Injectable } from '@nestjs/common';
import {
  EXERCISE_DICTIONARY_REPOSITORY,
  ExerciseDictionaryRepositoryPort,
} from '../../domain/ports/exercise-dictionary.repository.port';
import { ExerciseDictionary } from '../../domain/entities/exercise-dictionary.entity';

@Injectable()
export class GetDictExercisesUseCase {
  constructor(
    @Inject(EXERCISE_DICTIONARY_REPOSITORY)
    private readonly repository: ExerciseDictionaryRepositoryPort,
  ) {}

  async execute(): Promise<ExerciseDictionary[]> {
    return this.repository.findAll();
  }
}
