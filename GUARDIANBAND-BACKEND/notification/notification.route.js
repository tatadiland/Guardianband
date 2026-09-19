import express from 'express';
import { verifyToken } from '../middleware/auth.middleware.js';
import { registerSubscription, sendTestNotification, unregisterSubscription } from './notification.controller.js';

const router = express.Router();
router.use(verifyToken);
router.post('/subscription', registerSubscription);
router.delete('/subscription', unregisterSubscription);
router.post('/test', sendTestNotification);

export default router;