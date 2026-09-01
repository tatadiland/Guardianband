import express from 'express';
import { verifyToken } from '../middleware/auth.js';
import upload from '../middleware/upload.js';
import { getChildByUserId, getMyChild, createChild, updateChild, deleteChild } from './child.controller.js';

export function createChildRouter(Child) {
  const router = express.Router();

  router.get('/user/me', verifyToken, (req, res) => getMyChild(req, res, Child));
  router.get('/:userId', (req, res) => getChildByUserId(req, res, Child));
  router.post('/', verifyToken, upload.single('photo'), (req, res) => createChild(req, res, Child));
  router.put('/:id', verifyToken, upload.single('photo'), (req, res) => updateChild(req, res, Child));
  router.delete('/:id', verifyToken, (req, res) => deleteChild(req, res, Child));

  return router;
}

export default express.Router();
