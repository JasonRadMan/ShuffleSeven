import { useState, useEffect } from 'react';
import { useAuth } from './useAuth';
import type { User } from '@shared/schema';

interface PushSubscription {
  endpoint: string;
  keys: {
    p256dh: string;
    auth: string;
  };
}

type NotificationPermission = 'granted' | 'denied' | 'default' | 'unsupported';

export function useNotifications() {
  const [permission, setPermission] = useState<NotificationPermission>('default');
  const [isSubscribed, setIsSubscribed] = useState(false);
  const [loading, setLoading] = useState(false);
  const { user } = useAuth();

  // Placeholder VAPID public key - replace with actual key when implementing server-side push
  const VAPID_PUBLIC_KEY = 'BCVfRY1x3j8Hgm0Ld4KyJgFgQ2hGfY8KJA9MNk3tYzK2lC3mVhZ0Qb2JgFYjX5wT';

  useEffect(() => {
    // Check initial notification permission
    if ('Notification' in window) {
      setPermission(Notification.permission as NotificationPermission);
    } else {
      setPermission('unsupported');
    }

    // Check if user is already subscribed
    checkSubscriptionStatus();
  }, []);

  const requestPermission = async (): Promise<NotificationPermission> => {
    if (!('Notification' in window)) {
      return 'unsupported';
    }

    setLoading(true);
    
    try {
      const result = await Notification.requestPermission();
      setPermission(result as NotificationPermission);
      
      if (result === 'granted') {
        // Automatically subscribe to push notifications when permission is granted
        await subscribeToPush();
      }
      
      return result as NotificationPermission;
    } catch (error) {
      console.error('Error requesting notification permission:', error);
      return 'denied';
    } finally {
      setLoading(false);
    }
  };

  const checkSubscriptionStatus = async () => {
    if (!('serviceWorker' in navigator) || !('PushManager' in window)) {
      return;
    }

    try {
      const registration = await navigator.serviceWorker.ready;
      const subscription = await registration.pushManager.getSubscription();
      setIsSubscribed(!!subscription);
    } catch (error) {
      console.error('Error checking subscription status:', error);
    }
  };

  const subscribeToPush = async (): Promise<boolean> => {
    if (!('serviceWorker' in navigator) || !('PushManager' in window)) {
      console.warn('Push messaging is not supported');
      return false;
    }

    if (permission !== 'granted') {
      console.warn('Notification permission not granted');
      return false;
    }

    if (!user) {
      console.warn('User not authenticated');
      return false;
    }

    setLoading(true);

    try {
      const registration = await navigator.serviceWorker.ready;
      
      // Check if already subscribed
      let subscription = await registration.pushManager.getSubscription();
      
      if (!subscription) {
        // Convert VAPID key to Uint8Array
        const applicationServerKey = urlBase64ToUint8Array(VAPID_PUBLIC_KEY);
        
        subscription = await registration.pushManager.subscribe({
          userVisibleOnly: true,
          applicationServerKey
        });
      }

      if (subscription) {
        // Send subscription to server
        await saveSubscriptionToServer(subscription);
        setIsSubscribed(true);
        return true;
      }
      
      return false;
    } catch (error) {
      console.error('Error subscribing to push notifications:', error);
      return false;
    } finally {
      setLoading(false);
    }
  };

  const unsubscribeFromPush = async (): Promise<boolean> => {
    if (!('serviceWorker' in navigator)) {
      return false;
    }

    setLoading(true);

    try {
      const registration = await navigator.serviceWorker.ready;
      const subscription = await registration.pushManager.getSubscription();
      
      if (subscription) {
        await subscription.unsubscribe();
        // Remove subscription from server
        await removeSubscriptionFromServer();
        setIsSubscribed(false);
        return true;
      }
      
      return false;
    } catch (error) {
      console.error('Error unsubscribing from push notifications:', error);
      return false;
    } finally {
      setLoading(false);
    }
  };

  const saveSubscriptionToServer = async (subscription: globalThis.PushSubscription) => {
    try {
      const subscriptionData: PushSubscription = {
        endpoint: subscription.endpoint,
        keys: {
          p256dh: arrayBufferToBase64(subscription.getKey('p256dh')),
          auth: arrayBufferToBase64(subscription.getKey('auth'))
        }
      };

      const response = await fetch('/api/notifications/subscribe', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userId: (user as User)?.id,
          subscription: subscriptionData
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to save subscription to server');
      }
    } catch (error) {
      console.error('Error saving subscription to server:', error);
      throw error;
    }
  };

  const removeSubscriptionFromServer = async () => {
    try {
      const response = await fetch('/api/notifications/unsubscribe', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userId: (user as User)?.id
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to remove subscription from server');
      }
    } catch (error) {
      console.error('Error removing subscription from server:', error);
      throw error;
    }
  };

  const sendTestNotification = () => {
    if (permission === 'granted') {
      new Notification('Shuffle 7 Test', {
        body: 'Your daily card is ready to be drawn!',
        icon: '/assets/icon-192.png',
        badge: '/assets/icon-192.png'
      });
    }
  };

  return {
    permission,
    isSubscribed,
    loading,
    requestPermission,
    subscribeToPush,
    unsubscribeFromPush,
    sendTestNotification,
    isSupported: 'Notification' in window && 'serviceWorker' in navigator && 'PushManager' in window
  };
}

// Helper functions
function urlBase64ToUint8Array(base64String: string): Uint8Array {
  const padding = '='.repeat((4 - base64String.length % 4) % 4);
  const base64 = (base64String + padding)
    .replace(/-/g, '+')
    .replace(/_/g, '/');

  const rawData = window.atob(base64);
  const outputArray = new Uint8Array(rawData.length);

  for (let i = 0; i < rawData.length; ++i) {
    outputArray[i] = rawData.charCodeAt(i);
  }
  return outputArray;
}

function arrayBufferToBase64(buffer: ArrayBuffer | null): string {
  if (!buffer) return '';
  
  const bytes = new Uint8Array(buffer);
  let binary = '';
  for (let i = 0; i < bytes.byteLength; i++) {
    binary += String.fromCharCode(bytes[i]);
  }
  return window.btoa(binary);
}