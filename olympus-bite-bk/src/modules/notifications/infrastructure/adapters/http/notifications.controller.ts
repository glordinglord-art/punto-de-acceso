import { Body, Controller, Get, Param, Post, Put } from '@nestjs/common';
import { NotificationsService } from '../../../application/services/notifications.service';
import {
  SaveSubscriptionDto,
  UpdateNotificationPreferencesDto,
} from '../../../application/dtos/notification.dto';

@Controller('notifications')
export class NotificationsController {
  constructor(private readonly notificationsService: NotificationsService) {}

  @Get('config')
  getConfig() {
    return { success: true, data: this.notificationsService.getPublicConfig() };
  }

  @Get(':userId/preferences')
  async getPreferences(@Param('userId') userId: string) {
    const data = await this.notificationsService.getPreferences(userId);
    return { success: true, data };
  }

  @Put(':userId/preferences')
  async updatePreferences(
    @Param('userId') userId: string,
    @Body() dto: UpdateNotificationPreferencesDto,
  ) {
    const data = await this.notificationsService.updatePreferences(userId, dto);
    return { success: true, data };
  }

  @Post(':userId/subscribe')
  async subscribe(
    @Param('userId') userId: string,
    @Body() dto: SaveSubscriptionDto,
  ) {
    const data = await this.notificationsService.saveSubscription(
      userId,
      dto.subscription,
      dto.userAgent,
    );
    return { success: true, data };
  }

  @Post(':userId/test')
  async test(@Param('userId') userId: string) {
    const data = await this.notificationsService.sendTest(userId);
    return { success: true, data };
  }
}
