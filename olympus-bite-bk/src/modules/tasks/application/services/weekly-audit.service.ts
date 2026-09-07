import { Injectable, Logger } from '@nestjs/common';
import { Cron } from '@nestjs/schedule';
import { PrismaService } from '../../../../shared/infrastructure/prisma/prisma.service';

export interface WeeklyAuditResult {
  auditedAt: string;
  totalAthletes: number;
  approvedCount: number;
  flaggedCount: number;
  flaggedAthletes: Array<{
    athleteId: string;
    athleteName: string;
    phone: string | null;
    trainerId: string | null;
    complianceScore: number;
    nutritionScore: number;
    habitsScore: number;
    workoutsCount: number;
    actionTaken: string;
    reasons: string[];
  }>;
}

@Injectable()
export class WeeklyAuditService {
  private readonly logger = new Logger(WeeklyAuditService.name);

  constructor(private readonly prisma: PrismaService) {}

  /**
   * Motor 1: La Regla del 80%
   * Corre automáticamente todos los domingos a la medianoche (00:00:00).
   */
  @Cron('0 0 * * 0')
  async handleSundayMidnightAudit() {
    this.logger.log(
      '🕛 Iniciando Motor 1: Auditoría Dominical de la Regla del 80%...',
    );
    try {
      const result = await this.runAudit();
      this.logger.log(
        `✅ Auditoría dominical completada: ${result.approvedCount} aprobados, ${result.flaggedCount} con bandera roja para el lunes 6:00 AM.`,
      );
    } catch (err) {
      this.logger.error('Error ejecutando auditoría dominical:', err);
    }
  }

  async runAudit(trainerId?: string): Promise<WeeklyAuditResult> {
    const clients = await this.prisma.user.findMany({
      where: {
        role: 'client',
        isActive: true,
        ...(trainerId ? { trainerId } : {}),
      },
    });

    const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
    const now = new Date();
    const mondayDateStr = new Date(
      now.setDate(now.getDate() - now.getDay() + 1),
    )
      .toISOString()
      .slice(0, 10);

    const flaggedAthletes: WeeklyAuditResult['flaggedAthletes'] = [];
    let approvedCount = 0;

    for (const client of clients) {
      // 1. Meals in the last 7 days (Target: 4 meals/day = 28/week)
      const meals = await this.prisma.meal.findMany({
        where: {
          userId: client.id,
          date: { gte: sevenDaysAgo },
        },
      });
      const nutritionScore = Math.min(
        100,
        Math.round((meals.length / 28) * 100),
      );

      // 2. Habits / Tasks
      const taskLogs = await this.prisma.taskLog.findMany({
        where: {
          userId: client.id,
          createdAt: { gte: sevenDaysAgo },
          completed: true,
        },
      });
      const habitsScore = Math.min(
        100,
        Math.round((taskLogs.length / 14) * 100),
      );

      // 3. Workouts
      const workoutsCount = await this.prisma.workoutLog.count({
        where: {
          userId: client.id,
          createdAt: { gte: sevenDaysAgo },
        },
      });

      // Overall Score
      const overallScore = Math.round(
        nutritionScore * 0.45 +
          habitsScore * 0.35 +
          (workoutsCount > 0 ? 20 : 0),
      );

      if (overallScore >= 80) {
        approvedCount++;
      } else {
        // Flagged (< 80%)
        const reasons: string[] = [];
        if (nutritionScore < 70) {
          reasons.push(
            `Solo ${meals.length} comidas registradas en 7 días (${nutritionScore}% meta nutricional)`,
          );
        }
        if (habitsScore < 70) {
          reasons.push(
            `Cumplimiento de hábitos clave al ${habitsScore}% (descanso/hidratación omitidos)`,
          );
        }
        if (workoutsCount === 0) {
          reasons.push('Sin sesiones de entrenamiento completadas en la semana');
        } else if (workoutsCount < 3) {
          reasons.push(`Solo ${workoutsCount} entrenamientos registrados`);
        }
        if (reasons.length === 0) {
          reasons.push('Adherencia general por debajo del umbral clínico (80%)');
        }

        const actionTaken =
          'Semáforo rojo encendido. Pausa de progresión de cargas para prevenir lesiones por baja recuperación.';

        flaggedAthletes.push({
          athleteId: client.id,
          athleteName: client.name,
          phone: client.phone || null,
          trainerId: client.trainerId,
          complianceScore: overallScore,
          nutritionScore,
          habitsScore,
          workoutsCount,
          actionTaken,
          reasons,
        });

        // Register check-in or note for Monday 6:00 AM triage
        await this.prisma.weeklyCheckin.upsert({
          where: {
            userId_weekDate: {
              userId: client.id,
              weekDate: mondayDateStr,
            },
          },
          update: {
            notes: `[SISTEMA IA - REGLA DEL 80%]: Cumplimiento semanal de ${overallScore}% (< 80%). ${actionTaken}`,
            dietPerception: overallScore < 50 ? 'deficiente' : 'regular',
          },
          create: {
            userId: client.id,
            weekDate: mondayDateStr,
            stressRating: 7,
            energyRating: 4,
            notes: `[SISTEMA IA - REGLA DEL 80%]: Cumplimiento semanal de ${overallScore}% (< 80%). ${actionTaken}`,
            dietPerception: overallScore < 50 ? 'deficiente' : 'regular',
          },
        });
      }
    }

    return {
      auditedAt: new Date().toISOString(),
      totalAthletes: clients.length,
      approvedCount,
      flaggedCount: flaggedAthletes.length,
      flaggedAthletes,
    };
  }
}
