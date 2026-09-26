import express from 'express';
import { register, getAllUsers, login, getCurrentUser, updateCurrentUser } from './user.controller.js';
import { verifyToken } from '../middleware/auth.middleware.js';

const userRouter = express.Router();
userRouter.post('/register', register);
userRouter.get('/get-all-users', getAllUsers);
userRouter.post('/login', login);
userRouter.get('/me', verifyToken, getCurrentUser);
userRouter.put('/me', verifyToken, updateCurrentUser);

export default userRouter;