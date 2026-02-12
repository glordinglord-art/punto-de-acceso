import { BaseEntity } from '../../../../shared/domain/base.entity';

export enum MuscleGroup {
  CHEST = 'chest',
  BACK = 'back',
  SHOULDERS = 'shoulders',
  BICEPS = 'biceps',
  TRICEPS = 'triceps',
  LEGS = 'legs',
  GLUTES = 'glutes',
  ABS = 'abs',
  CARDIO = 'cardio',
  FULL_BODY = 'full_body',
  QUADS = 'quads',
  HAMSTRINGS = 'hamstrings',
  CALVES = 'calves',
  FOREARMS = 'forearms',
  TRAPS = 'traps',
  CORE = 'core',
  ABDUCTORS = 'abductors',
  ADDUCTORS = 'adductors',
  HYBRID = 'hybrid',
}

export class Exercise extends BaseEntity {
  name: string;
  muscleGroup: MuscleGroup;
  sets: number;
  reps: string;           // "8-12", "10-15", "Fallo técnico"
  restSeconds: number;
  observations: string | null;  // "180'' descanso", "Por pierna", "En polea"
  videoUrl: string | null;
  order: number;

  constructor(
    props: {
      name: string;
      muscleGroup: MuscleGroup;
      sets: number;
      reps: string;
      restSeconds?: number;
      observations?: string;
      videoUrl?: string;
      order: number;
    },
    id?: string,
  ) {
    super(id);
    this.name = props.name;
    this.muscleGroup = props.muscleGroup;
    this.sets = props.sets;
    this.reps = props.reps;
    this.restSeconds = props.restSeconds ?? 60;
    this.observations = props.observations ?? null;
    this.videoUrl = props.videoUrl ?? null;
    this.order = props.order;
  }
}
