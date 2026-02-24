import { Inject, Injectable, NotFoundException } from '@nestjs/common';
import {
  EXERCISE_DICTIONARY_REPOSITORY,
  ExerciseDictionaryRepositoryPort,
} from '../../domain/ports/exercise-dictionary.repository.port';

@Injectable()
export class DeleteDictExerciseUseCase {
  constructor(
    @Inject(EXERCISE_DICTIONARY_REPOSITORY)
    private readonly repository: ExerciseDictionaryRepositoryPort,
  ) {}

  async execute(id: string): Promise<void> {
    const existing = await this.repository.findById(id);
    if (!existing) {
      throw new NotFoundException('El ejercicio no existe en el diccionario.');
    }
    await this.repository.delete(id);
  }
}
