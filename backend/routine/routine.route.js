import express from 'express';
import { verifyToken } from '../middleware/auth.js';
import { getRoutinesByChildId, createRoutine, updateRoutine, deleteRoutine } from './routine.controller.js';

export function createRoutineRouter(Routine) {
  const router = express.Router();

  router.get('/child/:childId', (req, res) => getRoutinesByChildId(req, res, Routine));
  router.post('/child/:childId', verifyToken, (req, res) => createRoutine(req, res, Routine));
  router.put('/:id', verifyToken, (req, res) => updateRoutine(req, res, Routine));
  router.delete('/:id', verifyToken, (req, res) => deleteRoutine(req, res, Routine));

  return router;
}

export default express.Router();
