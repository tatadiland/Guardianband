import express from 'express';
import {register} from './user.controller.js'
import {getAllUsers} from './user.controller.js'
import {login} from './user.controller.js'
const userRouter = express.Router();
userRouter.post('/register', register);
userRouter.get('/get-all-users', getAllUsers);
userRouter.post('/login', login);

 export default userRouter;