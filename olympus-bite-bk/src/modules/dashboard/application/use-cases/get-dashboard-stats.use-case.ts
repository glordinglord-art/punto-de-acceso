import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../../../shared/infrastructure/prisma/prisma.service';
import { DashboardStatsDto } from '../dtos/dashboard-stats.dto';

@Injectable()
export class GetDashboardStatsUseCase {
  constructor(private readonly prisma: PrismaService) {}

  async execute(trainerId: string): Promise<DashboardStatsDto> {
    const now = new Date();
    const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const todayEnd = new Date(todayStart.getTime() + 86400000);

    const dayOfWeek = now.getDay();
    const mondayOffset = dayOfWeek === 0 ? 6 : dayOfWeek - 1;
    const weekStart = new Date(todayStart);
    weekStart.setDate(weekStart.getDate() - mondayOffset);

    const lastWeekStart = new Date(weekStart);
    lastWeekStart.setDate(lastWeekStart.getDate() - 7);
    const lastWeekEnd = new Date(weekStart);

    const sevenDaysAgo = new Date(todayStart);
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 6);

    const thirtyDaysAgo = new Date(todayStart);
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    // ── BATCH 1: Todo en paralelo (solo 1 round-trip lógico) ──
    const [trainer, clients] = await Promise.all([
      this.prisma.user.findUnique({
        where: { id: trainerId },
        select: { id: true, name: true, avatarUrl: true },
      }),
      this.prisma.user.findMany({
        where: { trainerId, isActive: true },
        select: { id: true, name: true, avatarUrl: true },
      }),
    ]);

    const clientIds = clients.map((c) => c.id);
    const allUserIds = [trainerId, ...clientIds];

    // ── BATCH 2: Todas las queries de datos en paralelo ──
    const [
      totalRoutines,
      activeRoutines,
      activeRoutinesByClient,
      mealsLast30,
      recentMealsRaw,
      mealsThisWeek,
      mealsLastWeek,
    ] = await Promise.all([
      // Rutinas totales
      this.prisma.routine.count({ where: { trainerId } }),
      // Rutinas activas
      this.prisma.routine.count({ where: { trainerId, isActive: true } }),
      // Rutinas activas agrupadas por cliente (para clientsOverview)
      this.prisma.routine.groupBy({
        by: ['clientId'],
        where: { trainerId, isActive: true },
        _count: true,
      }),
      // TODAS las comidas de 30 días (una sola query para: hoy, semanal, trends, tipos, foods)
      this.prisma.meal.findMany({
        where: {
          userId: { in: allUserIds },
          date: { gte: thirtyDaysAgo },
        },
        select: {
          id: true,
          userId: true,
          name: true,
          calories: true,
          protein: true,
          carbs: true,
          fat: true,
          fiber: true,
          sugar: true,
          mealType: true,
          imageUrl: true,
          foods: true,
          date: true,
          user: { select: { name: true } },
        },
        orderBy: { date: 'desc' },
      }),
      // Últimas 15 comidas (ya incluye las de hoy, pero necesitamos el top reciente)
      this.prisma.meal.findMany({
        where: { userId: { in: allUserIds } },
        orderBy: { date: 'desc' },
        take: 15,
        select: {
          id: true,
          name: true,
          calories: true,
          protein: true,
          mealType: true,
          imageUrl: true,
          date: true,
          user: { select: { name: true } },
        },
      }),
      // Conteo semana actual
      this.prisma.meal.count({
        where: {
          userId: { in: allUserIds },
          date: { gte: weekStart, lt: todayEnd },
        },
      }),
      // Conteo semana pasada
      this.prisma.meal.count({
        where: {
          userId: { in: allUserIds },
          date: { gte: lastWeekStart, lt: lastWeekEnd },
        },
      }),
    ]);

    // ── Procesar todo en memoria (0 queries extra) ──

    // Comidas de hoy
    const mealsToday = mealsLast30.filter(
      (m) => m.date >= todayStart && m.date < todayEnd,
    );

    // Promedio calorías hoy
    const avgCaloriesToday =
      mealsToday.length > 0
        ? Math.round(mealsToday.reduce((s, m) => s + m.calories, 0) / mealsToday.length)
        : 0;

    // Promedio macros hoy
    const macroAverages =
      mealsToday.length > 0
        ? {
            protein: Math.round(mealsToday.reduce((s, m) => s + m.protein, 0) / mealsToday.length),
            carbs: Math.round(mealsToday.reduce((s, m) => s + m.carbs, 0) / mealsToday.length),
            fat: Math.round(mealsToday.reduce((s, m) => s + m.fat, 0) / mealsToday.length),
            fiber: Math.round(mealsToday.reduce((s, m) => s + m.fiber, 0) / mealsToday.length),
            sugar: Math.round(mealsToday.reduce((s, m) => s + m.sugar, 0) / mealsToday.length),
          }
        : { protein: 0, carbs: 0, fat: 0, fiber: 0, sugar: 0 };

    // Tendencia semanal: agrupar en memoria
    const dayNames = ['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb'];
    const weeklyTrend: DashboardStatsDto['weeklyTrend'] = [];

    for (let i = 6; i >= 0; i--) {
      const dayStart = new Date(todayStart);
      dayStart.setDate(dayStart.getDate() - i);
      const dayEnd = new Date(dayStart.getTime() + 86400000);
      const dateStr = dayStart.toISOString().split('T')[0];

      const dayMeals = mealsLast30.filter(
        (m) => m.date >= dayStart && m.date < dayEnd,
      );

      weeklyTrend.push({
        day: dayNames[dayStart.getDay()],
        date: dateStr,
        meals: dayMeals.length,
        calories: dayMeals.reduce((s, m) => s + m.calories, 0),
      });
    }

    // Distribución por tipo: agrupar en memoria
    const typeLabels: Record<string, string> = {
      breakfast: 'Desayuno',
      lunch: 'Almuerzo',
      dinner: 'Cena',
      snack: 'Snack',
    };
    const typeCounts: Record<string, number> = {};
    mealsLast30.forEach((m) => {
      typeCounts[m.mealType] = (typeCounts[m.mealType] || 0) + 1;
    });
    const mealTypeDistribution = Object.entries(typeCounts).map(([type, count]) => ({
      type: typeLabels[type] || type,
      count,
    }));

    // Top foods: agrupar en memoria
    const foodCounts: Record<string, number> = {};
    mealsLast30.forEach((m) => {
      m.foods.forEach((f) => {
        const key = f.toLowerCase().trim();
        foodCounts[key] = (foodCounts[key] || 0) + 1;
      });
    });
    const topFoods = Object.entries(foodCounts)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 8)
      .map(([name, count]) => ({ name, count }));

    // Recent meals
    const recentMeals = recentMealsRaw.map((m) => ({
      id: m.id,
      userName: m.user.name,
      mealName: m.name,
      calories: m.calories,
      protein: m.protein,
      mealType: m.mealType,
      imageUrl: m.imageUrl,
      time: m.date,
    }));

    // Rutinas activas como mapa para lookup O(1)
    const routineMap = new Map<string, number>();
    activeRoutinesByClient.forEach((r) => routineMap.set(r.clientId, r._count));

    // Última comida por usuario: agrupar desde mealsLast30 (ya ordenadas por date desc)
    const lastMealByUser = new Map<string, Date>();
    // recentMealsRaw ya está desc, pero mealsLast30 también; usemos mealsLast30 que tiene userId
    for (const m of mealsLast30) {
      if (!lastMealByUser.has(m.userId)) {
        lastMealByUser.set(m.userId, m.date);
      }
    }

    // Comidas esta semana por usuario
    const weekMealsByUser = new Map<string, number>();
    mealsLast30.forEach((m) => {
      if (m.date >= weekStart && m.date < todayEnd) {
        weekMealsByUser.set(m.userId, (weekMealsByUser.get(m.userId) || 0) + 1);
      }
    });

    // ClientsOverview: solo clientes reales (no el entrenador)
    const clientsOverview = clients.map((person) => {
      const personMealsToday = mealsToday.filter((m) => m.userId === person.id);
      return {
        id: person.id,
        name: person.name,
        avatarUrl: person.avatarUrl,
        mealsToday: personMealsToday.length,
        caloriesToday: personMealsToday.reduce((s, m) => s + m.calories, 0),
        proteinToday: personMealsToday.reduce((s, m) => s + m.protein, 0),
        mealsThisWeek: weekMealsByUser.get(person.id) || 0,
        hasActiveRoutine: (routineMap.get(person.id) || 0) > 0,
        lastMealTime: lastMealByUser.get(person.id) ?? null,
      };
    });

    return {
      totalClients: clients.length,
      activeMealsToday: mealsToday.length,
      totalRoutines,
      activeRoutines,
      avgCaloriesToday,
      mealsThisWeek,
      mealsLastWeek,
      macroAverages,
      weeklyTrend,
      mealTypeDistribution,
      topFoods,
      recentMeals,
      clientsOverview,
    };
  }
}
