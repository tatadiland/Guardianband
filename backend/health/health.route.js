import express from 'express';
import { verifyToken } from '../middleware/auth.js';
import { getHealthDataByChildId, recordHealth } from './health.controller.js';

export function createHealthRouter(Health) {
  const router = express.Router();

  router.get('/child/:childId', (req, res) => getHealthDataByChildId(req, res, Health));
  router.post('/child/:childId', verifyToken, (req, res) => recordHealth(req, res, Health));

  return router;
}

export default express.Router();
