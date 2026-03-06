import { BaseEntity } from '../../../../shared/domain/base.entity';

export interface SetData {
  set: number;
  weight: number | null;
  reps: number | null;
  rest: number | null;
  completed: boolean;
}

export class WorkoutLog extends BaseEntity {
  exerciseId: string;
  userId: string;
  weekNumber: number;
  weight: number | null;
  repsDone: string | null;
  observations: string | null;
  setsData: SetData[] | null;
  duration: number | null;
  completedAt: Date | null;

  constructor(
    props: {
      exerciseId: string;
      userId: string;
      weekNumber: number;
      weight?: number;
      repsDone?: string;
      observations?: string;
      setsData?: SetData[];
      duration?: number;
      completedAt?: Date;
    },
    id?: string,
  ) {
    super(id);
    this.exerciseId = props.exerciseId;
    this.userId = props.userId;
    this.weekNumber = props.weekNumber;
    this.weight = props.weight ?? null;
    this.repsDone = props.repsDone ?? null;
    this.observations = props.observations ?? null;
    this.setsData = props.setsData ?? null;
    this.duration = props.duration ?? null;
    this.completedAt = props.completedAt ?? null;
  }

  updateLog(data: {
    weight?: number;
    repsDone?: string;
    observations?: string;
    setsData?: SetData[];
    duration?: number;
    completedAt?: Date | null;
  }): void {
    if (data.weight !== undefined) this.weight = data.weight;
    if (data.repsDone !== undefined) this.repsDone = data.repsDone;
    if (data.observations !== undefined) this.observations = data.observations;
    if (data.setsData !== undefined) this.setsData = data.setsData;
    if (data.duration !== undefined) this.duration = data.duration;
    if (data.completedAt !== undefined) this.completedAt = data.completedAt;
    this.markUpdated();
  }
}
