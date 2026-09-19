/// <reference lib="webworker" />
import { clientsClaim } from 'workbox-core';
import { cleanupOutdatedCaches, precacheAndRoute } from 'workbox-precaching';

declare const self: ServiceWorkerGlobalScope & {
  __WB_MANIFEST: Array<{ url: string; revision?: string }>;
};

self.skipWaiting();
clientsClaim();
cleanupOutdatedCaches();
precacheAndRoute(self.__WB_MANIFEST);

type PushPayload = {
  title?: string;
  body?: string;
  icon?: string;
  url?: string;
  tag?: string;
};

self.addEventListener('push', (event) => {
  let payload: PushPayload = {};

  try {
    payload = event.data?.json() ?? {};
  } catch {
    payload = { body: event.data?.text() };
  }

  event.waitUntil(
    self.registration.showNotification(payload.title || 'GuardianBand notification', {
      body: payload.body || 'There is a new GuardianBand alert.',
      icon: payload.icon || '/icons/guardianband-192.svg',
      badge: '/icons/guardianband-192.svg',
      tag: payload.tag || 'guardianband-alert',
      data: { url: payload.url || '/alerts' },
    }),
  );
});

self.addEventListener('notificationclick', (event) => {
  event.notification.close();
  const targetUrl = new URL(event.notification.data?.url || '/alerts', self.location.origin).href;

  event.waitUntil(
    self.clients.matchAll({ type: 'window', includeUncontrolled: true }).then((clientList) => {
      const existingClient = clientList.find((client) => 'focus' in client);
      if (existingClient) return existingClient.navigate(targetUrl).then((client) => client?.focus());
      return self.clients.openWindow(targetUrl);
    }),
  );
});