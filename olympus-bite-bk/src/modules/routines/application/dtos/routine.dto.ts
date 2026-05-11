import {
  IsArray,
  IsBoolean,
  IsNumber,
  IsOptional,
  IsString,
  ValidateNested,
} from 'class-validator';
import { Type } from 'class-transformer';

export class ExerciseDto {
  @IsString()
  name!: string;

  @IsString()
  muscleGroup!: string;

  @IsNumber()
  sets!: number;

  @IsString()
  reps!: string; // "8-12", "Fallo técnico"

  @IsNumber()
  @IsOptional()
  restSeconds?: number;

  @IsString()
  @IsOptional()
  observations?: string; // "180'' descanso", "Por pierna"

  @IsString()
  @IsOptional()
  videoUrl?: string;
}

export class RoutineDayDto {
  @IsNumber()
  dayNumber!: number;

  @IsString()
  focusArea!: string; // "Cuádriceps", "Espalda y Hombros"

  @IsBoolean()
  @IsOptional()
  isRestDay?: boolean;

  @IsString()
  @IsOptional()
  restDayNote?: string; // "DÍA CLAVE. El crecimiento ocurre aquí"

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => ExerciseDto)
  @IsOptional()
  exercises?: ExerciseDto[];
}

export class CreateRoutineDto {
  @IsString()
  name!: string;

  @IsString()
  @IsOptional()
  description?: string;

  @IsString()
  clientId!: string;

  @IsNumber()
  @IsOptional()
  weekCount?: number; // default 4

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => RoutineDayDto)
  days!: RoutineDayDto[];
}

export class LogWorkoutDto {
  @IsString()
  exerciseId!: string;

  @IsNumber()
  weekNumber!: number;

  @IsNumber()
  @IsOptional()
  weight?: number;

  @IsString()
  @IsOptional()
  repsDone?: string;

  @IsString()
  @IsOptional()
  observations?: string;

  @IsArray()
  @IsOptional()
  setsData?: {
    set: number;
    weight: number | null;
    reps: number | null;
    rest: number | null;
    completed: boolean;
  }[];

  @IsNumber()
  @IsOptional()
  duration?: number;
}
