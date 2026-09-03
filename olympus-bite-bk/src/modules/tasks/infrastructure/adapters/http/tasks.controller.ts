import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  Query,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { Inject } from '@nestjs/common';
import {
  TASK_REPOSITORY,
  TaskRepositoryPort,
} from '../../../domain/ports/task.repository.port';
import {
  CreateTaskDto,
  UpdateTaskDto,
  ToggleTaskLogDto,
} from '../../../application/dtos/task.dto';

import { PrismaService } from '../../../../../shared/infrastructure/prisma/prisma.service';
import { Prisma } from '@prisma/client';

@Controller('tasks')
export class TasksController {
  constructor(
    @Inject(TASK_REPOSITORY)
    private readonly taskRepo: TaskRepositoryPort,
    private readonly prisma: PrismaService,
  ) {}

  /* ─── Tasks CRUD ─────────────────────────── */

  @Post(':userId')
  @HttpCode(HttpStatus.CREATED)
  async createTask(
    @Param('userId') userId: string,
    @Body() dto: CreateTaskDto,
  ) {
    const task = await this.taskRepo.createTask(
      userId,
      dto.title,
      dto.icon ?? '✅',
      dto.order ?? 0,
    );
    return { success: true, data: task };
  }

  @Get(':userId')
  async getTasks(@Param('userId') userId: string) {
    const tasks = await this.taskRepo.getTasksByUser(userId);
    return { success: true, data: tasks };
  }

  @Put(':taskId')
  async updateTask(
    @Param('taskId') taskId: string,
    @Body() dto: UpdateTaskDto,
  ) {
    const task = await this.taskRepo.updateTask(taskId, dto);
    return { success: true, data: task };
  }

  @Delete(':taskId')
  @HttpCode(HttpStatus.OK)
  async deleteTask(@Param('taskId') taskId: string) {
    await this.taskRepo.deleteTask(taskId);
    return { success: true, data: null };
  }

  /* ─── Task Logs ──────────────────────────── */

  @Post(':taskId/toggle/:userId')
  @HttpCode(HttpStatus.OK)
  async toggleLog(
    @Param('taskId') taskId: string,
    @Param('userId') userId: string,
    @Body() dto: ToggleTaskLogDto,
  ) {
    const log = await this.taskRepo.toggleLog(taskId, userId, dto.date);
    return { success: true, data: log };
  }

  @Get(':userId/logs')
  async getLogs(
    @Param('userId') userId: string,
    @Query('start') start: string,
    @Query('end') end: string,
  ) {
    const logs = await this.taskRepo.getLogsByUserAndDateRange(
      userId,
      start,
      end,
    );
    return { success: true, data: logs };
  }

  @Get(':userId/logs/:date')
  async getLogsByDate(
    @Param('userId') userId: string,
    @Param('date') date: string,
  ) {
    const logs = await this.taskRepo.getLogsByDate(userId, date);
    return { success: true, data: logs };
  }

  /* ─── Stress Tracking ────────────────────── */

  @Post(':userId/stress')
  @HttpCode(HttpStatus.OK)
  async saveDailyStress(
    @Param('userId') userId: string,
    @Body()
    dto: {
      date: string;
      stressLevel: number;
      mood?: string;
      energyLevel?: number;
      notes?: string;
    },
  ) {
    const stressLog = await this.prisma.dailyStressLog.upsert({
      where: {
        userId_date: { userId, date: dto.date },
      },
      update: {
        stressLevel: dto.stressLevel,
        mood: dto.mood,
        energyLevel: dto.energyLevel,
        notes: dto.notes,
      },
      create: {
        userId,
        date: dto.date,
        stressLevel: dto.stressLevel,
        mood: dto.mood,
        energyLevel: dto.energyLevel,
        notes: dto.notes,
      },
    });

    // Auto-complete the daily stress habit if it exists
    const stressTask = await this.prisma.dailyTask.findFirst({
      where: {
        userId,
        isActive: true,
        title: { contains: 'estrés', mode: 'insensitive' },
      },
    });

    if (stressTask) {
      await this.prisma.taskLog.upsert({
        where: { taskId_date: { taskId: stressTask.id, date: dto.date } },
        update: { completed: true },
        create: {
          taskId: stressTask.id,
          userId,
          date: dto.date,
          completed: true,
        },
      });
    }

    return { success: true, data: stressLog };
  }

  @Get(':userId/stress')
  async getDailyStressLogs(
    @Param('userId') userId: string,
    @Query('start') start?: string,
    @Query('end') end?: string,
  ) {
    const where: { userId: string; date?: { gte: string; lte: string } } = {
      userId,
    };
    if (start && end) {
      where.date = { gte: start, lte: end };
    }

    const logs = await this.prisma.dailyStressLog.findMany({
      where,
      orderBy: { date: 'desc' },
      take: 30,
    });
    return { success: true, data: logs };
  }

  /* ─── Weekly Monday Check-in ─────────────── */

  @Post(':userId/weekly-checkin')
  @HttpCode(HttpStatus.OK)
  async saveWeeklyCheckin(
    @Param('userId') userId: string,
    @Body()
    dto: {
      weekDate: string;
      stressRating: number;
      energyRating: number;
      recoveryRating?: string;
      dietPerception?: string;
      notes?: string;
      rawAnswers?: Prisma.InputJsonValue;
    },
  ) {
    const checkin = await this.prisma.weeklyCheckin.upsert({
      where: {
        userId_weekDate: { userId, weekDate: dto.weekDate },
      },
      update: {
        stressRating: dto.stressRating,
        energyRating: dto.energyRating,
        recoveryRating: dto.recoveryRating,
        dietPerception: dto.dietPerception,
        notes: dto.notes,
        rawAnswers: dto.rawAnswers ?? Prisma.DbNull,
      },
      create: {
        userId,
        weekDate: dto.weekDate,
        stressRating: dto.stressRating,
        energyRating: dto.energyRating,
        recoveryRating: dto.recoveryRating,
        dietPerception: dto.dietPerception,
        notes: dto.notes,
        rawAnswers: dto.rawAnswers ?? Prisma.DbNull,
      },
    });

    return { success: true, data: checkin };
  }

  @Get(':userId/weekly-checkin')
  async getWeeklyCheckins(@Param('userId') userId: string) {
    const checkins = await this.prisma.weeklyCheckin.findMany({
      where: { userId },
      orderBy: { weekDate: 'desc' },
      take: 12,
    });
    return { success: true, data: checkins };
  }

  /* ─── Intelligent Adherence / Compliance Metrics ── */

  @Get(':userId/compliance')
  async getCompliance(
    @Param('userId') userId: string,
    @Query('date') queryDate?: string,
  ) {
    const today = queryDate || new Date().toISOString().slice(0, 10);

    // 1. Get user's active tasks and today's logs
    const tasks = await this.prisma.dailyTask.findMany({
      where: { userId, isActive: true },
    });
    const taskLogs = await this.prisma.taskLog.findMany({
      where: { userId, date: today, completed: true },
    });
    const completedTasksToday = taskLogs.length;
    const totalTasks = tasks.length || 2;
    const habitsPct = Math.min(
      100,
      Math.round((completedTasksToday / totalTasks) * 100),
    );

    // 2. Today's meals (Target is 4 meals/day: breakfast, lunch, dinner, snack)
    const startOfToday = new Date(`${today}T00:00:00.000Z`);
    const endOfToday = new Date(`${today}T23:59:59.999Z`);
    const mealsToday = await this.prisma.meal.findMany({
      where: {
        userId,
        date: { gte: startOfToday, lte: endOfToday },
      },
    });
    const mealsTodayCount = mealsToday.length;
    const nutritionPct = Math.min(100, Math.round((mealsTodayCount / 4) * 100));

    // 3. Workouts today
    const workoutsToday = await this.prisma.workoutLog.count({
      where: {
        userId,
        createdAt: { gte: startOfToday, lte: endOfToday },
      },
    });
    const workoutPct = workoutsToday > 0 ? 100 : 0;

    // 4. Overall Today Score
    const overallToday = Math.round(
      nutritionPct * 0.45 + habitsPct * 0.35 + (workoutPct > 0 ? 20 : 0),
    );

    // 5. Last 7 Days Analytics (Weekly)
    const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
    const recentMeals = await this.prisma.meal.findMany({
      where: {
        userId,
        date: { gte: sevenDaysAgo },
      },
      select: { date: true, mealType: true },
    });

    const recentTaskLogs = await this.prisma.taskLog.findMany({
      where: {
        userId,
        createdAt: { gte: sevenDaysAgo },
      },
    });

    const recentWorkouts = await this.prisma.workoutLog.count({
      where: {
        userId,
        createdAt: { gte: sevenDaysAgo },
      },
    });

    const weeklyTargetMeals = 7 * 4; // 28 meals in 7 days
    const weeklyNutritionPct = Math.min(
      100,
      Math.round((recentMeals.length / weeklyTargetMeals) * 100),
    );
    const weeklyHabitsPct = Math.min(
      100,
      Math.round((recentTaskLogs.length / (totalTasks * 7)) * 100),
    );
    const weeklyOverallPct = Math.round(
      weeklyNutritionPct * 0.5 +
        weeklyHabitsPct * 0.3 +
        (recentWorkouts > 0 ? 20 : 0),
    );

    const latestCheckin = await this.prisma.weeklyCheckin.findFirst({
      where: { userId },
      orderBy: { weekDate: 'desc' },
    });

    return {
      success: true,
      data: {
        today: {
          date: today,
          mealsCount: mealsTodayCount,
          mealsTarget: 4,
          nutritionPct,
          tasksCompleted: completedTasksToday,
          tasksTotal: totalTasks,
          habitsPct,
          workoutsLogged: workoutsToday,
          overallPct: Math.min(100, overallToday),
        },
        week: {
          totalMeals: recentMeals.length,
          targetMeals: weeklyTargetMeals,
          nutritionPct: weeklyNutritionPct,
          totalWorkouts: recentWorkouts,
          habitsCompleted: recentTaskLogs.length,
          habitsPct: weeklyHabitsPct,
          overallPct: Math.min(100, weeklyOverallPct),
          latestCheckin,
        },
      },
    };
  }
}
