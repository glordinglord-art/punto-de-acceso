import { BaseEntity } from '../../../../shared/domain/base.entity';
import { RoutineDay } from './routine-day.entity';

export enum DayOfWeek {
  MONDAY = 'monday',
  TUESDAY = 'tuesday',
  WEDNESDAY = 'wednesday',
  THURSDAY = 'thursday',
  FRIDAY = 'friday',
  SATURDAY = 'saturday',
  SUNDAY = 'sunday',
}

export interface CreateRoutineProps {
  name: string;
  description?: string;
  trainerId: string;
  clientId: string;
  weekCount?: number;
  days: RoutineDay[];
}

export class Routine extends BaseEntity {
  name: string;
  description: string;
  trainerId: string;
  clientId: string;
  weekCount: number;
  days: RoutineDay[];
  isActive: boolean;

  constructor(props: CreateRoutineProps, id?: string) {
    super(id);
    this.name = props.name;
    this.description = props.description ?? '';
    this.trainerId = props.trainerId;
    this.clientId = props.clientId;
    this.weekCount = props.weekCount ?? 4;
    this.days = props.days;
    this.isActive = true;
  }

  addDay(day: RoutineDay): void {
    this.days.push(day);
    this.markUpdated();
  }

  removeDay(dayId: string): void {
    this.days = this.days.filter((d) => d.id !== dayId);
    this.markUpdated();
  }

  deactivate(): void {
    this.isActive = false;
    this.markUpdated();
  }
}
