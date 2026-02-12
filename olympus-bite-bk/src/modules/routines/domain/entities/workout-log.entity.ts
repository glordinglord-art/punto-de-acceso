import { BaseEntity } from '../../../../shared/domain/base.entity';

export class WorkoutLog extends BaseEntity {
  exerciseId: string;
  userId: string;
  weekNumber: number;
  weight: number | null;
  repsDone: string | null;
  observations: string | null;

  constructor(
    props: {
      exerciseId: string;
      userId: string;
      weekNumber: number;
      weight?: number;
      repsDone?: string;
      observations?: string;
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
  }

  updateLog(data: { weight?: number; repsDone?: string; observations?: string }): void {
    if (data.weight !== undefined) this.weight = data.weight;
    if (data.repsDone !== undefined) this.repsDone = data.repsDone;
    if (data.observations !== undefined) this.observations = data.observations;
    this.markUpdated();
  }
}
