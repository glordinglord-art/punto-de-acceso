export interface PushSubscriptionDto {
  endpoint: string;
  keys: {
    p256dh: string;
    auth: string;
  };
}

export class SaveSubscriptionDto {
  subscription!: PushSubscriptionDto;
  userAgent?: string;
}

export class UpdateNotificationPreferencesDto {
  enabled?: boolean;
  breakfastTime?: string;
  lunchTime?: string;
  dinnerTime?: string;
  workoutTime?: string;
  timezoneOffset?: number;
}

export interface NotificationPayload {
  title: string;
  body: string;
  url?: string;
  tag?: string;
}
