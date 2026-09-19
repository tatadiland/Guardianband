import 'dotenv/config';
import webpush from 'web-push';
import PushSubscription from './notification.model.js';

const vapidConfigured = Boolean(
  process.env.VAPID_PUBLIC_KEY && process.env.VAPID_PRIVATE_KEY && process.env.VAPID_SUBJECT,
);

if (vapidConfigured) {
  webpush.setVapidDetails(
    process.env.VAPID_SUBJECT,
    process.env.VAPID_PUBLIC_KEY,
    process.env.VAPID_PRIVATE_KEY,
  );
}

export async function saveSubscription(userId, subscription) {
  const { endpoint, keys } = subscription || {};
  if (!endpoint || !keys?.p256dh || !keys?.auth) {
    const error = new Error('A valid push subscription is required.');
    error.status = 400;
    throw error;
  }

  const [savedSubscription] = await PushSubscription.upsert({
    userId,
    endpoint,
    p256dh: keys.p256dh,
    auth: keys.auth,
  }, { returning: true });

  return savedSubscription;
}

export async function removeSubscription(userId, endpoint) {
  return PushSubscription.destroy({ where: { userId, endpoint } });
}

export async function sendPushToUser(userId, payload) {
  if (!vapidConfigured) return { sent: 0, skipped: true };

  const subscriptions = await PushSubscription.findAll({ where: { userId } });
  let sent = 0;

  for (const subscription of subscriptions) {
    try {
      await webpush.sendNotification(
        {
          endpoint: subscription.endpoint,
          keys: { p256dh: subscription.p256dh, auth: subscription.auth },
        },
        JSON.stringify(payload),
      );
      sent += 1;
    } catch (error) {
      if (error.statusCode === 404 || error.statusCode === 410) {
        await subscription.destroy();
      } else {
        console.error('Push delivery error:', error.message);
      }
    }
  }

  return { sent, skipped: false };
}

export { vapidConfigured };