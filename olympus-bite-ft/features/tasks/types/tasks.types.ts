export interface DailyTask {
  id: string;
  userId: string;
  title: string;
  icon: string;
  order: number;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface TaskLog {
  id: string;
  taskId: string;
  userId: string;
  date: string;
  completed: boolean;
  createdAt: string;
}
