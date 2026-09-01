import express from 'express';
import { verifyToken } from '../middleware/auth.js';
import { getLastLocationByDeviceId, recordLocation, getLocationHistoryByDeviceId } from './location.controller.js';

export function createLocationRouter(Location) {
  const router = express.Router();

  router.get('/device/:deviceId', (req, res) => getLastLocationByDeviceId(req, res, Location));
  router.get('/device/:deviceId/history', (req, res) => getLocationHistoryByDeviceId(req, res, Location));
  router.post('/device/:deviceId', verifyToken, (req, res) => recordLocation(req, res, Location));

  return router;
}

export default express.Router();
