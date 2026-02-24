import { IsString, IsOptional, IsEnum } from 'class-validator';

enum MuscleGroupEnum {
  chest = 'chest',
  back = 'back',
  shoulders = 'shoulders',
  biceps = 'biceps',
  triceps = 'triceps',
  legs = 'legs',
  glutes = 'glutes',
  abs = 'abs',
  cardio = 'cardio',
  full_body = 'full_body',
  quads = 'quads',
  hamstrings = 'hamstrings',
  calves = 'calves',
  forearms = 'forearms',
  traps = 'traps',
  core = 'core',
  abductors = 'abductors',
  adductors = 'adductors',
  hybrid = 'hybrid',
}

export class CreateExerciseDictDto {
  @IsString()
  name!: string;

  @IsEnum(MuscleGroupEnum)
  muscleGroup!: string;

  @IsString()
  @IsOptional()
  videoUrl?: string;
}

export class ExerciseDictResponseDto {
  id!: string;
  name!: string;
  muscleGroup!: string;
  videoUrl?: string | null;
  createdAt!: string;

  static fromEntity(entity: any): ExerciseDictResponseDto {
    const response = new ExerciseDictResponseDto();
    response.id = entity.id;
    response.name = entity.name;
    response.muscleGroup = entity.muscleGroup;
    response.videoUrl = entity.videoUrl;
    response.createdAt = entity.createdAt.toISOString();
    return response;
  }
}
