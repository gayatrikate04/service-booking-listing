// src/modules/users/user.routes.js

import { Router } from 'express';
import { userController } from './user.controller.js';
import { authenticate } from '../../middleware/auth.js';

export const userRouter = Router();

userRouter.use(authenticate);

userRouter.get('/me',              userController.getMe);
userRouter.patch('/me',            userController.updateMe);
userRouter.patch('/me/password',   userController.changePassword);