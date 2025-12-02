import { useState, useEffect, useCallback, useRef } from 'react';
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
  const [vapidPublicKey, setVapidPublicKey] = useState<string | null>(null);
  const { user } = useAuth();
  const vapidKeyFetched = useRef(false);

  // Fetch VAPID public key from server
  const fetchVapidKey = useCallback(async () => {
    if (vapidKeyFetched.current) return;
    
    try {
      const response = await fetch('/api/notifications/vapid-public-key');
      if (response.ok) {
        const data = await response.json();
        setVapidPublicKey(data.publicKey);
        vapidKeyFetched.current = true;
      }
    } catch (error) {
      console.error('Error fetching VAPID public key:', error);
    }
  }, []);

  useEffect(() => {
    // Check initial notification permission
    if ('Notification' in window) {
      setPermission(Notification.permission as NotificationPermission);
    } else {
      setPermission('unsupported');
    }

    // Fetch VAPID key and check subscription status
    fetchVapidKey();
    checkSubscriptionStatus();
  }, [fetchVapidKey]);

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

    if (!vapidPublicKey) {
      console.warn('VAPID public key not available');
      // Try to fetch it if not available
      await fetchVapidKey();
      if (!vapidPublicKey) {
        return false;
      }
    }

    setLoading(true);

    try {
      const registration = await navigator.serviceWorker.ready;
      
      // Check if already subscribed
      let subscription = await registration.pushManager.getSubscription();
      
      if (!subscription) {
        // Convert VAPID key to Uint8Array
        const applicationServerKey = urlBase64ToUint8Array(vapidPublicKey);
        
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

  const sendLocalTestNotification = () => {
    if (permission === 'granted') {
      new Notification('Shuffle 7 Test', {
        body: 'Your daily card is ready to be drawn!',
        icon: '/assets/icon-192.png',
        badge: '/assets/icon-192.png'
      });
    }
  };

  const sendServerTestNotification = async (): Promise<boolean> => {
    if (!user || !isSubscribed) {
      console.warn('User not authenticated or not subscribed');
      return false;
    }

    setLoading(true);
    try {
      const response = await fetch('/api/notifications/test', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (response.ok) {
        return true;
      } else {
        const data = await response.json();
        console.error('Test notification failed:', data.message);
        return false;
      }
    } catch (error) {
      console.error('Error sending test notification:', error);
      return false;
    } finally {
      setLoading(false);
    }
  };

  return {
    permission,
    isSubscribed,
    loading,
    requestPermission,
    subscribeToPush,
    unsubscribeFromPush,
    sendLocalTestNotification,
    sendServerTestNotification,
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