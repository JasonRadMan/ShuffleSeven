import webPush from 'web-push';
import { storage } from './storage';
import type { NotificationSubscription } from '@shared/schema';

const VAPID_PUBLIC_KEY = process.env.VAPID_PUBLIC_KEY;
const VAPID_PRIVATE_KEY = process.env.VAPID_PRIVATE_KEY;
const VAPID_SUBJECT = process.env.VAPID_SUBJECT || 'mailto:hello@shuffle7.app';

if (VAPID_PUBLIC_KEY && VAPID_PRIVATE_KEY) {
  webPush.setVapidDetails(VAPID_SUBJECT, VAPID_PUBLIC_KEY, VAPID_PRIVATE_KEY);
  console.log('VAPID credentials configured for push notifications');
} else {
  console.warn('VAPID credentials not found. Push notifications will not work.');
}

export interface PushNotificationPayload {
  title: string;
  body: string;
  icon?: string;
  badge?: string;
  image?: string;
  tag?: string;
  data?: Record<string, any>;
  actions?: Array<{ action: string; title: string; icon?: string }>;
  requireInteraction?: boolean;
  vibrate?: number[];
}

export async function sendPushNotification(
  subscription: NotificationSubscription,
  payload: PushNotificationPayload
): Promise<boolean> {
  if (!VAPID_PUBLIC_KEY || !VAPID_PRIVATE_KEY) {
    console.error('Cannot send push notification: VAPID credentials not configured');
    return false;
  }

  const pushSubscription = {
    endpoint: subscription.endpoint,
    keys: {
      p256dh: subscription.p256dhKey,
      auth: subscription.authKey,
    },
  };

  try {
    await webPush.sendNotification(pushSubscription, JSON.stringify(payload));
    console.log(`Push notification sent to subscription ${subscription.id}`);
    return true;
  } catch (error: any) {
    console.error(`Failed to send push notification to subscription ${subscription.id}:`, error.message);
    
    if (error.statusCode === 410 || error.statusCode === 404) {
      console.log(`Subscription ${subscription.id} is no longer valid, deactivating...`);
      await storage.updateNotificationSubscription(subscription.id, false);
    }
    
    return false;
  }
}

export async function sendDailyCardReminder(): Promise<{ sent: number; failed: number }> {
  const activeSubscriptions = await storage.getActiveNotificationSubscriptions();
  
  if (activeSubscriptions.length === 0) {
    console.log('No active subscriptions to send daily reminders to');
    return { sent: 0, failed: 0 };
  }

  console.log(`Sending daily card reminders to ${activeSubscriptions.length} subscribers`);

  const payload: PushNotificationPayload = {
    title: 'Shuffle 7 - Daily Card',
    body: 'Your daily mindset card is ready! Draw your card now.',
    icon: '/assets/icon-192.png',
    badge: '/assets/icon-192.png',
    tag: 'daily-card-reminder',
    data: {
      url: '/',
      type: 'daily-reminder',
    },
    requireInteraction: false,
    vibrate: [200, 100, 200],
  };

  let sent = 0;
  let failed = 0;

  for (const subscription of activeSubscriptions) {
    const success = await sendPushNotification(subscription, payload);
    if (success) {
      sent++;
    } else {
      failed++;
    }
  }

  console.log(`Daily reminders sent: ${sent} successful, ${failed} failed`);
  return { sent, failed };
}

export async function sendTestNotification(userId: string): Promise<boolean> {
  const subscriptions = await storage.getNotificationSubscriptionsByUserId(userId);
  const activeSubscription = subscriptions.find(s => s.isActive);
  
  if (!activeSubscription) {
    console.log('No active subscription found for user:', userId);
    return false;
  }

  const payload: PushNotificationPayload = {
    title: 'Test Notification',
    body: 'Your Shuffle 7 notifications are working!',
    icon: '/assets/icon-192.png',
    badge: '/assets/icon-192.png',
    tag: 'test-notification',
  };

  return await sendPushNotification(activeSubscription, payload);
}
