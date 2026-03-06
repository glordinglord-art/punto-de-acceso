import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../../../../shared/infrastructure/prisma/prisma.service';
import { TaskRepositoryPort } from '../../../domain/ports/task.repository.port';
import { DailyTask, TaskLog } from '../../../domain/entities/daily-task.entity';

@Injectable()
export class PrismaTaskRepository implements TaskRepositoryPort {
  constructor(private readonly prisma: PrismaService) {}

  async createTask(userId: string, title: string, icon: string, order: number): Promise<DailyTask> {
    const task = await this.prisma.dailyTask.create({
      data: { userId, title, icon, order },
    });
    return new DailyTask(task);
  }

  async getTasksByUser(userId: string): Promise<DailyTask[]> {
    const tasks = await this.prisma.dailyTask.findMany({
      where: { userId, isActive: true },
      orderBy: { order: 'asc' },
    });
    return tasks.map((t) => new DailyTask(t));
  }

  async updateTask(taskId: string, data: { title?: string; icon?: string; order?: number; isActive?: boolean }): Promise<DailyTask> {
    const task = await this.prisma.dailyTask.update({
      where: { id: taskId },
      data,
    });
    return new DailyTask(task);
  }

  async deleteTask(taskId: string): Promise<void> {
    await this.prisma.dailyTask.delete({ where: { id: taskId } });
  }

  async toggleLog(taskId: string, userId: string, date: string): Promise<TaskLog | null> {
    // Check if already logged
    const existing = await this.prisma.taskLog.findUnique({
      where: { taskId_date: { taskId, date } },
    });

    if (existing) {
      await this.prisma.taskLog.delete({ where: { id: existing.id } });
      return null; // Removed
    }

    const log = await this.prisma.taskLog.create({
      data: { taskId, userId, date },
    });
    return new TaskLog(log);
  }

  async getLogsByUserAndDateRange(userId: string, startDate: string, endDate: string): Promise<TaskLog[]> {
    const logs = await this.prisma.taskLog.findMany({
      where: {
        userId,
        date: { gte: startDate, lte: endDate },
      },
      orderBy: { date: 'asc' },
    });
    return logs.map((l) => new TaskLog(l));
  }

  async getLogsByDate(userId: string, date: string): Promise<TaskLog[]> {
    const logs = await this.prisma.taskLog.findMany({
      where: { userId, date },
    });
    return logs.map((l) => new TaskLog(l));
  }
}
