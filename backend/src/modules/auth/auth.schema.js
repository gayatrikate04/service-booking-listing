// src/modules/auth/auth.schema.js

import { z } from 'zod';

export const registerSchema = z.object({
  body: z.object({
    email:     z.string().email('Invalid email address').toLowerCase().trim(),
    phone:     z.string()
                 .regex(/^[6-9]\d{9}$/, 'Invalid Indian mobile number (10 digits, starts 6-9)'),
    password:  z.string()
                 .min(8, 'Password must be at least 8 characters')
                 .regex(/[A-Z]/, 'Password must contain at least one uppercase letter')
                 .regex(/[0-9]/, 'Password must contain at least one number'),
    full_name: z.string().min(2).max(100).trim(),
    role:      z.enum(['customer', 'provider'], {
                 errorMap: () => ({ message: 'Role must be customer or provider' })
               }),
    city:      z.string().min(2).max(100).trim(),
  })
});

export const loginSchema = z.object({
  body: z.object({
    email:    z.string().email().toLowerCase().trim(),
    password: z.string().min(1, 'Password is required'),
  })
});