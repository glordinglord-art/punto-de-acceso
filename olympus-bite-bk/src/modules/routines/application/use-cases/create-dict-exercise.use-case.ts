import { Inject, Injectable, ConflictException } from '@nestjs/common';
import {
  EXERCISE_DICTIONARY_REPOSITORY,
  ExerciseDictionaryRepositoryPort,
} from '../../domain/ports/exercise-dictionary.repository.port';
import { ExerciseDictionary } from '../../domain/entities/exercise-dictionary.entity';
import { CreateExerciseDictDto } from '../dtos/exercise-dictionary.dto';

@Injectable()
export class CreateDictExerciseUseCase {
  constructor(
    @Inject(EXERCISE_DICTIONARY_REPOSITORY)
    private readonly repository: ExerciseDictionaryRepositoryPort,
  ) {}

  async execute(dto: CreateExerciseDictDto): Promise<ExerciseDictionary> {
    const existing = await this.repository.findByName(dto.name);
    if (existing) {
      throw new ConflictException(
        'Ya existe un ejercicio con ese nombre en el diccionario.',
      );
    }

    const newExercise = new ExerciseDictionary({
      name: dto.name,
      muscleGroup: dto.muscleGroup,
      videoUrl: dto.videoUrl,
      equipment: dto.equipment,
      category: dto.category,
      target: dto.target,
      gifUrl: dto.gifUrl,
      imageUrl: dto.imageUrl,
      instructionsEs: dto.instructionsEs,
      instructionStepsEs: dto.instructionStepsEs,
      secondaryMuscles: dto.secondaryMuscles,
      attribution: dto.attribution,
    });

    return this.repository.save(newExercise);
  }
}
