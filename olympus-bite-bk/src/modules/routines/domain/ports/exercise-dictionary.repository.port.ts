import { ExerciseDictionary } from '../entities/exercise-dictionary.entity';

export const EXERCISE_DICTIONARY_REPOSITORY = Symbol(
  'EXERCISE_DICTIONARY_REPOSITORY',
);

export interface ExerciseDictionaryRepositoryPort {
  save(exercise: ExerciseDictionary): Promise<ExerciseDictionary>;
  findById(id: string): Promise<ExerciseDictionary | null>;
  findByName(name: string): Promise<ExerciseDictionary | null>;
  findAll(): Promise<ExerciseDictionary[]>;
  delete(id: string): Promise<void>;
}
