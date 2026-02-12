import { BaseEntity } from '../../../../shared/domain/base.entity';
import { Exercise } from './exercise.entity';

export class RoutineDay extends BaseEntity {
  dayNumber: number;
  focusArea: string;
  isRestDay: boolean;
  restDayNote: string | null;
  exercises: Exercise[];

  constructor(
    props: {
      dayNumber: number;
      focusArea: string;
      isRestDay?: boolean;
      restDayNote?: string;
      exercises?: Exercise[];
    },
    id?: string,
  ) {
    super(id);
    this.dayNumber = props.dayNumber;
    this.focusArea = props.focusArea;
    this.isRestDay = props.isRestDay ?? false;
    this.restDayNote = props.restDayNote ?? null;
    this.exercises = props.exercises ?? [];
  }

  addExercise(exercise: Exercise): void {
    this.exercises.push(exercise);
    this.markUpdated();
  }

  removeExercise(exerciseId: string): void {
    this.exercises = this.exercises.filter((e) => e.id !== exerciseId);
    this.markUpdated();
  }
}
