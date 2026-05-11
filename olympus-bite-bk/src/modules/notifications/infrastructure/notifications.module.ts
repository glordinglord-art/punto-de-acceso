import { Module } from '@nestjs/common';
import { NotificationsController } from './adapters/http/notifications.controller';
import { NotificationsService } from '../application/services/notifications.service';
import { NotificationsScheduler } from './notifications.scheduler';

@Module({
  controllers: [NotificationsController],
  providers: [NotificationsService, NotificationsScheduler],
  exports: [NotificationsService],
})
export class NotificationsModule {}
