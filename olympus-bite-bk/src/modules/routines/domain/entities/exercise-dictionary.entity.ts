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
  equipment?: string | null;
  category?: string | null;
  target?: string | null;
  gifUrl?: string | null;
  imageUrl?: string | null;
  instructionsEs?: string | null;
  instructionStepsEs?: string[];
  secondaryMuscles?: string[];
  attribution?: string | null;
  createdAt?: Date;
  updatedAt?: Date;
}

export class ExerciseDictionary {
  public readonly id: string;
  public name: string;
  public muscleGroup: string;
  public videoUrl: string | null;
  public equipment: string | null;
  public category: string | null;
  public target: string | null;
  public gifUrl: string | null;
  public imageUrl: string | null;
  public instructionsEs: string | null;
  public instructionStepsEs: string[];
  public secondaryMuscles: string[];
  public attribution: string | null;
  public readonly createdAt: Date;
  public readonly updatedAt: Date;

  constructor(props: CreateExerciseDictionaryProps) {
    this.id = props.id ?? crypto.randomUUID();
    this.name = props.name;
    this.muscleGroup = props.muscleGroup;
    this.videoUrl = props.videoUrl ?? null;
    this.equipment = props.equipment ?? null;
    this.category = props.category ?? null;
    this.target = props.target ?? null;
    this.gifUrl = props.gifUrl ?? null;
    this.imageUrl = props.imageUrl ?? null;
    this.instructionsEs = props.instructionsEs ?? null;
    this.instructionStepsEs = props.instructionStepsEs ?? [];
    this.secondaryMuscles = props.secondaryMuscles ?? [];
    this.attribution = props.attribution ?? null;
    this.createdAt = props.createdAt ?? new Date();
    this.updatedAt = props.updatedAt ?? new Date();
  }
}
