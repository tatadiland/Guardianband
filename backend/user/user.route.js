import express from 'express';
import { register, login, getCurrentUser, updateCurrentUser, getAllUsers } from './user.controller.js';
import { verifyToken } from '../middleware/auth.js';

export function createUserRouter(User) {
  const router = express.Router();

  router.post('/register', (req, res) => register(req, res, User));
  router.post('/login', (req, res) => login(req, res, User));
  router.get('/me', verifyToken, (req, res) => getCurrentUser(req, res, User));
  router.put('/me', verifyToken, (req, res) => updateCurrentUser(req, res, User));
  router.get('/get-all-users', (req, res) => getAllUsers(req, res, User));

  return router;
}

export default express.Router();
