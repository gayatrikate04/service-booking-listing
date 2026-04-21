// src/modules/auth/auth.routes.js

import { Router } from 'express';
import { authController } from './auth.controller.js';
import { validate } from '../../middleware/validate.js';
import { registerSchema, loginSchema } from './auth.schema.js';

export const authRouter = Router();

authRouter.post('/register', validate(registerSchema), authController.register);
authRouter.post('/login',    validate(loginSchema),    authController.login);