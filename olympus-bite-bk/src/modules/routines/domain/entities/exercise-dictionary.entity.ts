export enum MuscleGroup {
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

export interface CreateExerciseDictionaryProps {
  id?: string;
  name: string;
  muscleGroup: string;
  videoUrl?: string | null;
  createdAt?: Date;
  updatedAt?: Date;
}

export class ExerciseDictionary {
  public readonly id: string;
  public name: string;
  public muscleGroup: string;
  public videoUrl: string | null;
  public readonly createdAt: Date;
  public readonly updatedAt: Date;

  constructor(props: CreateExerciseDictionaryProps) {
    this.id = props.id ?? crypto.randomUUID();
    this.name = props.name;
    this.muscleGroup = props.muscleGroup;
    this.videoUrl = props.videoUrl ?? null;
    this.createdAt = props.createdAt ?? new Date();
    this.updatedAt = props.updatedAt ?? new Date();
  }
}
