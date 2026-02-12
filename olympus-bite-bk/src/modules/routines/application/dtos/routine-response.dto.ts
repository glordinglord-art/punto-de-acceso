import { Routine } from '../../domain/entities/routine.entity';

interface ExerciseResponse {
  id: string;
  name: string;
  muscleGroup: string;
  sets: number;
  reps: string;
  restSeconds: number;
  observations: string | null;
  order: number;
}

interface RoutineDayResponse {
  id: string;
  dayNumber: number;
  focusArea: string;
  isRestDay: boolean;
  restDayNote: string | null;
  exercises: ExerciseResponse[];
}

export class RoutineResponseDto {
  id!: string;
  name!: string;
  description!: string;
  trainerId!: string;
  clientId!: string;
  weekCount!: number;
  isActive!: boolean;
  days!: RoutineDayResponse[];
  createdAt!: Date;

  static fromEntity(routine: Routine): RoutineResponseDto {
    const dto = new RoutineResponseDto();
    dto.id = routine.id;
    dto.name = routine.name;
    dto.description = routine.description;
    dto.trainerId = routine.trainerId;
    dto.clientId = routine.clientId;
    dto.weekCount = routine.weekCount;
    dto.isActive = routine.isActive;
    dto.days = routine.days
      .sort((a, b) => a.dayNumber - b.dayNumber)
      .map((day) => ({
        id: day.id,
        dayNumber: day.dayNumber,
        focusArea: day.focusArea,
        isRestDay: day.isRestDay,
        restDayNote: day.restDayNote,
        exercises: day.exercises.map((e) => ({
          id: e.id,
          name: e.name,
          muscleGroup: e.muscleGroup,
          sets: e.sets,
          reps: e.reps,
          restSeconds: e.restSeconds,
          observations: e.observations,
          order: e.order,
        })),
      }));
    dto.createdAt = routine.createdAt;
    return dto;
  }
}
