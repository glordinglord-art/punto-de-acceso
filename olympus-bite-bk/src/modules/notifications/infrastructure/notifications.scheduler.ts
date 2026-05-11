import { Injectable } from '@nestjs/common';
import { Cron } from '@nestjs/schedule';
import { NotificationsService } from '../application/services/notifications.service';

@Injectable()
export class NotificationsScheduler {
  constructor(private readonly notificationsService: NotificationsService) {}

  @Cron('* * * * *')
  async handleReminders() {
    await this.notificationsService.sendDueReminders();
  }
}
