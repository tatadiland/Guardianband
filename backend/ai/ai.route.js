import express from 'express';
import { verifyToken } from '../middleware/auth.js';
import { askAI } from './ai.controller.js';

export function createAIRouter() {
  const router = express.Router();

  router.post('/ask', verifyToken, askAI);

  return router;
}

export default express.Router();
