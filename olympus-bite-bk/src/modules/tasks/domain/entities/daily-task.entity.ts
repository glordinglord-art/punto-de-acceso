export class DailyTask {
  id: string;
  userId: string;
  title: string;
  icon: string;
  order: number;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;

  constructor(props: Partial<DailyTask>) {
    Object.assign(this, props);
  }
}

export class TaskLog {
  id: string;
  taskId: string;
  userId: string;
  date: string; // "YYYY-MM-DD"
  completed: boolean;
  createdAt: Date;

  constructor(props: Partial<TaskLog>) {
    Object.assign(this, props);
  }
}
