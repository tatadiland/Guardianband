import express from 'express';
import { verifyToken } from '../middleware/auth.js';
import { getGeofencesByChildId, createGeofence, updateGeofence, deleteGeofence } from './geofence.controller.js';

export function createGeofenceRouter(Geofence) {
  const router = express.Router();

  router.get('/child/:childId', (req, res) => getGeofencesByChildId(req, res, Geofence));
  router.post('/child/:childId', verifyToken, (req, res) => createGeofence(req, res, Geofence));
  router.put('/:id', verifyToken, (req, res) => updateGeofence(req, res, Geofence));
  router.delete('/:id', verifyToken, (req, res) => deleteGeofence(req, res, Geofence));

  return router;
}

export default express.Router();
