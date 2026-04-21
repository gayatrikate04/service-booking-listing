// src/modules/users/user.controller.js

import { userService } from './user.service.js';
import { asyncWrapper } from '../../utils/asyncWrapper.js';

const getMe = asyncWrapper(async (req, res) => {
  const user = await userService.getProfile(req.user.id);
  res.status(200).json({ success: true, data: user });
});

const updateMe = asyncWrapper(async (req, res) => {
  const { full_name, city, profile_pic } = req.body;
  const user = await userService.updateProfile(req.user.id, { full_name, city, profile_pic });
  res.status(200).json({ success: true, data: user });
});

const changePassword = asyncWrapper(async (req, res) => {
  const result = await userService.changePassword(req.user.id, req.body);
  res.status(200).json({ success: true, data: result });
});

export const userController = { getMe, updateMe, changePassword };