import api from './api';

const PUBLIC_KEY = import.meta.env.VITE_VAPID_PUBLIC_KEY as string | undefined;

function urlBase64ToUint8Array(value: string) {
  const padding = '='.repeat((4 - (value.length % 4)) % 4);
  const base64 = `${value}${padding}`.replace(/-/g, '+').replace(/_/g, '/');
  const rawData = window.atob(base64);
  return Uint8Array.from([...rawData].map((character) => character.charCodeAt(0)));
}

export function supportsPushNotifications() {
  return Boolean(
    typeof window !== 'undefined' &&
      'serviceWorker' in navigator &&
      'PushManager' in window &&
      'Notification' in window,
  );
}

export function getNotificationPermission(): NotificationPermission | 'unsupported' {
  if (!supportsPushNotifications()) return 'unsupported';
  return Notification.permission;
}

export async function requestNotificationPermission() {
  if (!supportsPushNotifications()) return 'unsupported' as const;
  if (Notification.permission !== 'default') return Notification.permission;
  return Notification.requestPermission();
}

export async function subscribeToPushNotifications() {
  if (!PUBLIC_KEY) throw new Error('VITE_VAPID_PUBLIC_KEY is not configured.');
  const permission = await requestNotificationPermission();
  if (permission !== 'granted') return { permission, subscription: null };

  const registration = await navigator.serviceWorker.ready;
  const subscription =
    (await registration.pushManager.getSubscription()) ||
    (await registration.pushManager.subscribe({
      userVisibleOnly: true,
      applicationServerKey: urlBase64ToUint8Array(PUBLIC_KEY),
    }));

  await api.post('/api/notifications/subscription', subscription.toJSON());
  return { permission, subscription };
}

export async function unsubscribeFromPushNotifications() {
  const registration = await navigator.serviceWorker.ready;
  const subscription = await registration.pushManager.getSubscription();
  if (!subscription) return;

  await api.delete('/api/notifications/subscription', {
    data: { endpoint: subscription.endpoint },
  });
  await subscription.unsubscribe();
}

export async function getPushSubscription() {
  if (!supportsPushNotifications()) return null;
  const registration = await navigator.serviceWorker.ready;
  return registration.pushManager.getSubscription();
}