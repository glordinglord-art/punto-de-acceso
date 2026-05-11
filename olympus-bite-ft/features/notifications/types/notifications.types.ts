export interface NotificationConfig {
  configured: boolean;
  publicKey: string;
}

export interface NotificationPreferences {
  id: string;
  userId: string;
  enabled: boolean;
  breakfastTime: string;
  lunchTime: string;
  dinnerTime: string;
  workoutTime: string;
  timezoneOffset: number;
}

export interface SerializedPushSubscription {
  endpoint: string;
  keys: {
    p256dh: string;
    auth: string;
  };
}
