import { removeSubscription, saveSubscription, sendPushToUser, vapidConfigured } from './notification.service.js';

export async function registerSubscription(req, res) {
  try {
    const subscription = await saveSubscription(req.user.id, req.body);
    return res.status(201).json({ message: 'Push subscription saved', subscription });
  } catch (error) {
    return res.status(error.status || 500).json({ message: error.message || 'Unable to save push subscription' });
  }
}

export async function unregisterSubscription(req, res) {
  try {
    const { endpoint } = req.body;
    if (!endpoint) return res.status(400).json({ message: 'Subscription endpoint is required' });
    await removeSubscription(req.user.id, endpoint);
    return res.status(204).send();
  } catch (error) {
    return res.status(500).json({ message: 'Unable to remove push subscription' });
  }
}

export async function sendTestNotification(req, res) {
  if (!vapidConfigured) return res.status(503).json({ message: 'VAPID keys are not configured' });

  try {
    const result = await sendPushToUser(req.user.id, {
      title: 'GuardianBand test notification',
      body: 'This is a test notification from the GuardianBand backend.',
      url: '/alerts',
      tag: 'guardianband-test',
    });
    return res.status(200).json({ message: 'Test notification queued', ...result });
  } catch (error) {
    return res.status(500).json({ message: 'Unable to send test notification' });
  }
}