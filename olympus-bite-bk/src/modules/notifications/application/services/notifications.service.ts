import { Injectable } from '@nestjs/common';
import webPush, { PushSubscription } from 'web-push';
import { PrismaService } from '../../../../shared/infrastructure/prisma/prisma.service';
import {
  NotificationPayload,
  PushSubscriptionDto,
  UpdateNotificationPreferencesDto,
} from '../dtos/notification.dto';

const DEFAULT_PREFS = {
  breakfastTime: '08:00',
  lunchTime: '13:00',
  dinnerTime: '20:00',
  workoutTime: '18:00',
};

@Injectable()
export class NotificationsService {
  private readonly vapidPublicKey = process.env.VAPID_PUBLIC_KEY ?? '';
  private readonly vapidPrivateKey = process.env.VAPID_PRIVATE_KEY ?? '';

  constructor(private readonly prisma: PrismaService) {
    if (this.isConfigured()) {
      webPush.setVapidDetails(
        process.env.VAPID_SUBJECT ?? 'mailto:admin@punto-de-inflexion.local',
        this.vapidPublicKey,
        this.vapidPrivateKey,
      );
    }
  }

  isConfigured() {
    return Boolean(this.vapidPublicKey && this.vapidPrivateKey);
  }

  getPublicConfig() {
    return {
      configured: this.isConfigured(),
      publicKey: this.vapidPublicKey,
    };
  }

  async saveSubscription(
    userId: string,
    subscription: PushSubscriptionDto,
    userAgent?: string,
  ) {
    const saved = await this.prisma.notificationSubscription.upsert({
      where: { endpoint: subscription.endpoint },
      update: {
        userId,
        p256dh: subscription.keys.p256dh,
        auth: subscription.keys.auth,
        userAgent,
        isActive: true,
      },
      create: {
        userId,
        endpoint: subscription.endpoint,
        p256dh: subscription.keys.p256dh,
        auth: subscription.keys.auth,
        userAgent,
      },
    });

    await this.ensurePreferences(userId);
    return saved;
  }

  async getPreferences(userId: string) {
    return this.ensurePreferences(userId);
  }

  async updatePreferences(
    userId: string,
    dto: UpdateNotificationPreferencesDto,
  ) {
    await this.ensurePreferences(userId);
    return this.prisma.notificationPreference.update({
      where: { userId },
      data: {
        enabled: dto.enabled,
        breakfastTime: dto.breakfastTime,
        lunchTime: dto.lunchTime,
        dinnerTime: dto.dinnerTime,
        workoutTime: dto.workoutTime,
        timezoneOffset: dto.timezoneOffset,
      },
    });
  }

  async sendTest(userId: string) {
    return this.sendToUser(userId, {
      title: 'Notificaciones activadas',
      body: 'Listo. Te podemos recordar comidas y rutinas desde el navegador.',
      url: '/dashboard',
      tag: 'test-notification',
    });
  }

  async sendToUser(userId: string, payload: NotificationPayload) {
    if (!this.isConfigured()) {
      return {
        sent: 0,
        skipped: true,
        reason: 'VAPID keys are not configured',
      };
    }

    const subscriptions = await this.prisma.notificationSubscription.findMany({
      where: { userId, isActive: true },
    });

    let sent = 0;
    await Promise.all(
      subscriptions.map(async (subscription) => {
        try {
          await webPush.sendNotification(
            {
              endpoint: subscription.endpoint,
              keys: {
                p256dh: subscription.p256dh,
                auth: subscription.auth,
              },
            } as PushSubscription,
            JSON.stringify(payload),
          );
          sent += 1;
        } catch (error) {
          const statusCode = (error as { statusCode?: number }).statusCode;
          if (statusCode === 404 || statusCode === 410) {
            await this.prisma.notificationSubscription.update({
              where: { id: subscription.id },
              data: { isActive: false },
            });
          }
        }
      }),
    );

    return { sent, skipped: false };
  }

  async sendDueReminders() {
    const now = new Date();
    const preferences = await this.prisma.notificationPreference.findMany({
      where: { enabled: true },
      include: { user: { select: { id: true, name: true } } },
    });

    for (const pref of preferences) {
      const localNow = new Date(now.getTime() - pref.timezoneOffset * 60_000);
      const today = localNow.toISOString().split('T')[0];
      const currentTime = localNow.toISOString().slice(11, 16);

      await this.maybeSendReminder(
        pref.userId,
        pref.breakfastTime,
        currentTime,
        pref.lastBreakfastAt,
        today,
        {
          title: 'Hora del desayuno',
          body: `${pref.user.name}, registra tu desayuno para mantener el plan al dia.`,
          url: '/meals',
          tag: `breakfast-${today}`,
        },
        'lastBreakfastAt',
      );

      await this.maybeSendReminder(
        pref.userId,
        pref.lunchTime,
        currentTime,
        pref.lastLunchAt,
        today,
        {
          title: 'Hora de comer',
          body: 'Tu almuerzo cuenta. Sube tu comida y revisa los macros.',
          url: '/meals',
          tag: `lunch-${today}`,
        },
        'lastLunchAt',
      );

      await this.maybeSendReminder(
        pref.userId,
        pref.dinnerTime,
        currentTime,
        pref.lastDinnerAt,
        today,
        {
          title: 'Cena pendiente',
          body: 'Cierra el dia registrando tu cena.',
          url: '/meals',
          tag: `dinner-${today}`,
        },
        'lastDinnerAt',
      );

      await this.maybeSendReminder(
        pref.userId,
        pref.workoutTime,
        currentTime,
        pref.lastWorkoutAt,
        today,
        {
          title: 'Rutina del dia',
          body: 'Abre tu rutina y empieza la sesion guiada.',
          url: '/routines',
          tag: `workout-${today}`,
        },
        'lastWorkoutAt',
      );
    }
  }

  private async ensurePreferences(userId: string) {
    return this.prisma.notificationPreference.upsert({
      where: { userId },
      update: {},
      create: {
        userId,
        enabled: true,
        ...DEFAULT_PREFS,
      },
    });
  }

  private async maybeSendReminder(
    userId: string,
    targetTime: string,
    currentTime: string,
    lastSentAt: string | null,
    today: string,
    payload: NotificationPayload,
    field: 'lastBreakfastAt' | 'lastLunchAt' | 'lastDinnerAt' | 'lastWorkoutAt',
  ) {
    if (targetTime !== currentTime || lastSentAt === today) return;
    const result = await this.sendToUser(userId, payload);
    if (!result.skipped) {
      await this.prisma.notificationPreference.update({
        where: { userId },
        data: { [field]: today },
      });
    }
  }
}
