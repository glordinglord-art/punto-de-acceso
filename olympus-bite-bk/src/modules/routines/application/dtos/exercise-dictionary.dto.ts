import { IsString, IsOptional, IsEnum, IsArray } from 'class-validator';

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

  @IsString()
  @IsOptional()
  equipment?: string;

  @IsString()
  @IsOptional()
  category?: string;

  @IsString()
  @IsOptional()
  target?: string;

  @IsString()
  @IsOptional()
  gifUrl?: string;

  @IsString()
  @IsOptional()
  imageUrl?: string;

  @IsString()
  @IsOptional()
  instructionsEs?: string;

  @IsArray()
  @IsString({ each: true })
  @IsOptional()
  instructionStepsEs?: string[];

  @IsArray()
  @IsString({ each: true })
  @IsOptional()
  secondaryMuscles?: string[];

  @IsString()
  @IsOptional()
  attribution?: string;
}

export class ExerciseDictResponseDto {
  id!: string;
  name!: string;
  muscleGroup!: string;
  videoUrl?: string | null;
  equipment?: string | null;
  category?: string | null;
  target?: string | null;
  gifUrl?: string | null;
  imageUrl?: string | null;
  instructionsEs?: string | null;
  instructionStepsEs?: string[];
  secondaryMuscles?: string[];
  attribution?: string | null;
  createdAt!: string;

  static fromEntity(entity: any): ExerciseDictResponseDto {
    const response = new ExerciseDictResponseDto();
    response.id = entity.id;
    response.name = entity.name;
    response.muscleGroup = entity.muscleGroup;
    response.videoUrl = entity.videoUrl;
    response.equipment = entity.equipment;
    response.category = entity.category;
    response.target = entity.target;
    response.gifUrl = entity.gifUrl;
    response.imageUrl = entity.imageUrl;
    response.instructionsEs = entity.instructionsEs;
    response.instructionStepsEs = entity.instructionStepsEs ?? [];
    response.secondaryMuscles = entity.secondaryMuscles ?? [];
    response.attribution = entity.attribution;
    response.createdAt = entity.createdAt.toISOString();
    return response;
  }
}
