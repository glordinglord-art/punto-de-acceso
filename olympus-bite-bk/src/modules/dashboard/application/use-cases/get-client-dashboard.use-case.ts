import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../../../shared/infrastructure/prisma/prisma.service';

export interface ClientDashboardDto {
  /** Info del cliente */
  clientName: string;
  trainerName: string | null;

  /** Stats de comidas */
  mealsToday: number;
  caloriesToday: number;
  proteinToday: number;
  carbsToday: number;
  fatToday: number;
  fiberToday: number;
  sugarToday: number;
  mealsThisWeek: number;

  /** Tendencia semanal */
  weeklyTrend: {
    day: string;
    date: string;
    meals: number;
    calories: number;
  }[];

  /** Distribución por tipo */
  mealTypeDistribution: { type: string; count: number }[];

  /** Rutina activa */
  activeRoutine: {
    id: string;
    name: string;
    description: string | null;
    weekCount: number;
    totalDays: number;
    trainingDays: number;
    exerciseCount: number;
    completedLogs: number;
    totalLogs: number;
    days: {
      dayNumber: number;
      focusArea: string;
      isRestDay: boolean;
      exercises: {
        id: string;
        name: string;
        muscleGroup: string;
        sets: number;
        reps: string;
      }[];
    }[];
  } | null;

  /** Comidas recientes */
  recentMeals: {
    id: string;
    mealName: string;
    calories: number;
    protein: number;
    mealType: string;
    imageUrl: string | null;
    time: Date;
  }[];
}

@Injectable()
export class GetClientDashboardUseCase {
  constructor(private readonly prisma: PrismaService) {}

  async execute(clientId: string, tzOffset = 0): Promise<ClientDashboardDto> {
    // Calcular "hoy" en la zona horaria del usuario
    const now = new Date();
    const userNow = new Date(now.getTime() - tzOffset * 60_000);
    const todayStart = new Date(
      Date.UTC(userNow.getUTCFullYear(), userNow.getUTCMonth(), userNow.getUTCDate()) + tzOffset * 60_000,
    );
    const todayEnd = new Date(todayStart.getTime() + 86400000);

    const dayOfWeek = todayStart.getUTCDay();
    const mondayOffset = dayOfWeek === 0 ? 6 : dayOfWeek - 1;
    const weekStart = new Date(todayStart);
    weekStart.setDate(weekStart.getDate() - mondayOffset);

    const sevenDaysAgo = new Date(todayStart);
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 6);

    // ── BATCH: Todo en paralelo ──
    const [client, activeRoutine, mealsLast7, recentMealsRaw] =
      await Promise.all([
        // Info del cliente + trainer
        this.prisma.user.findUnique({
          where: { id: clientId },
          select: {
            name: true,
            trainer: { select: { name: true } },
          },
        }),
        // Rutina activa con días y ejercicios
        this.prisma.routine.findFirst({
          where: { clientId, isActive: true },
          orderBy: { updatedAt: 'desc' },
          include: {
            routineDays: {
              orderBy: { dayNumber: 'asc' },
              include: {
                exercises: {
                  orderBy: { order: 'asc' },
                  select: {
                    id: true,
                    name: true,
                    muscleGroup: true,
                    sets: true,
                    reps: true,
                  },
                },
              },
            },
          },
        }),
        // Comidas últimos 7 días
        this.prisma.meal.findMany({
          where: {
            userId: clientId,
            date: { gte: sevenDaysAgo },
          },
          select: {
            id: true,
            calories: true,
            protein: true,
            carbs: true,
            fat: true,
            fiber: true,
            sugar: true,
            mealType: true,
            name: true,
            imageUrl: true,
            date: true,
          },
          orderBy: { date: 'desc' },
        }),
        // Comidas recientes (solo últimas 10 fuera de ventana de 7d)
        this.prisma.meal.findMany({
          where: { userId: clientId },
          orderBy: { date: 'desc' },
          take: 10,
          select: {
            id: true,
            name: true,
            calories: true,
            protein: true,
            mealType: true,
            imageUrl: true,
            date: true,
          },
        }),
      ]);

    // ── Comidas de hoy ──
    const mealsToday = mealsLast7.filter(
      (m) => m.date >= todayStart && m.date < todayEnd,
    );

    // Conteo semana (en memoria)
    const mealsThisWeek = mealsLast7.filter(
      (m) => m.date >= weekStart && m.date < todayEnd,
    ).length;

    const caloriesToday = mealsToday.reduce((s, m) => s + m.calories, 0);
    const proteinToday = mealsToday.reduce((s, m) => s + m.protein, 0);
    const carbsToday = mealsToday.reduce((s, m) => s + m.carbs, 0);
    const fatToday = mealsToday.reduce((s, m) => s + m.fat, 0);
    const fiberToday = mealsToday.reduce((s, m) => s + m.fiber, 0);
    const sugarToday = mealsToday.reduce((s, m) => s + m.sugar, 0);

    // ── Tendencia semanal ──
    const dayNames = ['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb'];
    const weeklyTrend: ClientDashboardDto['weeklyTrend'] = [];

    for (let i = 6; i >= 0; i--) {
      const dayStart = new Date(todayStart);
      dayStart.setDate(dayStart.getDate() - i);
      const dayEnd = new Date(dayStart.getTime() + 86400000);
      const dateStr = dayStart.toISOString().split('T')[0];

      const dayMeals = mealsLast7.filter(
        (m) => m.date >= dayStart && m.date < dayEnd,
      );

      weeklyTrend.push({
        day: dayNames[dayStart.getDay()],
        date: dateStr,
        meals: dayMeals.length,
        calories: dayMeals.reduce((s, m) => s + m.calories, 0),
      });
    }

    // ── Distribución por tipo ──
    const typeLabels: Record<string, string> = {
      breakfast: 'Desayuno',
      lunch: 'Almuerzo',
      dinner: 'Cena',
      snack: 'Snack',
    };
    const typeCounts: Record<string, number> = {};
    mealsLast7.forEach((m) => {
      typeCounts[m.mealType] = (typeCounts[m.mealType] || 0) + 1;
    });
    const mealTypeDistribution = Object.entries(typeCounts).map(
      ([type, count]) => ({
        type: typeLabels[type] || type,
        count,
      }),
    );

    // ── Rutina activa procesada ──
    let routineData: ClientDashboardDto['activeRoutine'] = null;

    if (activeRoutine) {
      // Contar logs completados
      const completedLogs = await this.prisma.workoutLog.count({
        where: {
          userId: clientId,
          exercise: { routineDay: { routineId: activeRoutine.id } },
        },
      });

      const exerciseCount = activeRoutine.routineDays.reduce(
        (s, d) => s + d.exercises.length,
        0,
      );
      const totalLogs = exerciseCount * activeRoutine.weekCount;

      routineData = {
        id: activeRoutine.id,
        name: activeRoutine.name,
        description: activeRoutine.description,
        weekCount: activeRoutine.weekCount,
        totalDays: activeRoutine.routineDays.length,
        trainingDays: activeRoutine.routineDays.filter((d) => !d.isRestDay)
          .length,
        exerciseCount,
        completedLogs,
        totalLogs,
        days: activeRoutine.routineDays.map((d) => ({
          dayNumber: d.dayNumber,
          focusArea: d.focusArea,
          isRestDay: d.isRestDay,
          exercises: d.exercises,
        })),
      };
    }

    return {
      clientName: client?.name ?? 'Usuario',
      trainerName: client?.trainer?.name ?? null,
      mealsToday: mealsToday.length,
      caloriesToday,
      proteinToday,
      carbsToday,
      fatToday,
      fiberToday,
      sugarToday,
      mealsThisWeek,
      weeklyTrend,
      mealTypeDistribution,
      activeRoutine: routineData,
      recentMeals: recentMealsRaw.map((m) => ({
        id: m.id,
        mealName: m.name,
        calories: m.calories,
        protein: m.protein,
        mealType: m.mealType,
        imageUrl: m.imageUrl,
        time: m.date,
      })),
    };
  }
}
