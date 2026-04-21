// src/modules/auth/auth.controller.js

import { authService } from './auth.service.js';
import { asyncWrapper } from '../../utils/asyncWrapper.js';

const register = asyncWrapper(async (req, res) => {
  const result = await authService.register(req.body);
  res.status(201).json({ success: true, data: result });
});

const login = asyncWrapper(async (req, res) => {
  const result = await authService.login(req.body);
  res.status(200).json({ success: true, data: result });
});

export const authController = { register, login };