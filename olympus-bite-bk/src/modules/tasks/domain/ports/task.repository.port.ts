import { DailyTask, TaskLog } from '../entities/daily-task.entity';

export const TASK_REPOSITORY = 'TASK_REPOSITORY';

export interface TaskRepositoryPort {
  // Tasks CRUD
  createTask(
    userId: string,
    title: string,
    icon: string,
    order: number,
  ): Promise<DailyTask>;
  getTasksByUser(userId: string): Promise<DailyTask[]>;
  updateTask(
    taskId: string,
    data: { title?: string; icon?: string; order?: number; isActive?: boolean },
  ): Promise<DailyTask>;
  deleteTask(taskId: string): Promise<void>;

  // Logs
  toggleLog(
    taskId: string,
    userId: string,
    date: string,
  ): Promise<TaskLog | null>;
  getLogsByUserAndDateRange(
    userId: string,
    startDate: string,
    endDate: string,
  ): Promise<TaskLog[]>;
  getLogsByDate(userId: string, date: string): Promise<TaskLog[]>;
}
