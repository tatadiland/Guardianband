import express from 'express';
import { verifyToken } from '../middleware/auth.js';
import { getAlertsByChildId, createAlert, markAlertAsRead, deleteAlert } from './alert.controller.js';

export function createAlertRouter(Alert) {
  const router = express.Router();

  router.get('/child/:childId', (req, res) => getAlertsByChildId(req, res, Alert));
  router.post('/child/:childId', verifyToken, (req, res) => createAlert(req, res, Alert));
  router.put('/:id/read', verifyToken, (req, res) => markAlertAsRead(req, res, Alert));
  router.delete('/:id', verifyToken, (req, res) => deleteAlert(req, res, Alert));

  return router;
}

export default express.Router();
