import express from 'express';
import { verifyToken } from '../middleware/auth.js';
import { getDeviceByChildId, linkDevice, updateDevice } from './device.controller.js';

export function createDeviceRouter(Device) {
  const router = express.Router();

  router.get('/child/:childId', (req, res) => getDeviceByChildId(req, res, Device));
  router.post('/child/:childId', verifyToken, (req, res) => linkDevice(req, res, Device));
  router.put('/:id', verifyToken, (req, res) => updateDevice(req, res, Device));

  return router;
}

export default express.Router();
