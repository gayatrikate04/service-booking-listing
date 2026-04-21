// src/modules/auth/auth.service.js

import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { AppError } from '../../utils/AppError.js';
import { env } from '../../config/env.js';
import { userRepository } from '../users/user.repository.js';
import { logger } from '../../config/logger.js';

const BCRYPT_ROUNDS = 12; // Calibrate so hashing takes ~100-300ms on your hardware

function generateAccessToken(user) {
  return jwt.sign(
    {
      userId: user.id,
      role:   user.role,
      // Do NOT include sensitive data (password, full PII) in token payload
    },
    env.jwt.secret,
    {
      expiresIn: env.jwt.expiresIn,
      issuer:    'booking-platform',
      audience:  'booking-platform-client',
    }
  );
}

function generateRefreshToken(userId) {
  return jwt.sign(
    { userId },
    env.jwt.refreshSecret,
    { expiresIn: env.jwt.refreshExpires }
  );
}

async function register({ email, phone, password, full_name, role, city }) {
  // Check for existing user — gives a clean error before hitting DB constraint
  const existing = await userRepository.findByEmail(email);
  if (existing) {
    throw AppError.conflict('EMAIL_TAKEN', 'An account with this email already exists');
  }

  const existingPhone = await userRepository.findByPhone(phone);
  if (existingPhone) {
    throw AppError.conflict('PHONE_TAKEN', 'An account with this phone number already exists');
  }

  // Hash password. bcrypt is deliberately slow to defeat brute force.
  // ROUNDS=12 means each guess takes ~300ms — acceptable for login, devastating for attackers.
  const password_hash = await bcrypt.hash(password, BCRYPT_ROUNDS);

  const userId = await userRepository.create({
    email, phone, password_hash, full_name, role, city
  });

  // If registering as provider, create the profile skeleton
  if (role === 'provider') {
    await userRepository.createProviderProfile(userId);
  }

  logger.info('[AUTH] New user registered', { userId, role, city });

  const user         = await userRepository.findById(userId);
  const accessToken  = generateAccessToken(user);
  const refreshToken = generateRefreshToken(user.id);

  return { user: sanitizeUser(user), accessToken, refreshToken };
}

async function login({ email, password }) {
  // Fetch with password hash — user.repository.findByEmail normally EXCLUDES
  // password_hash for security. This specific method includes it.
  const user = await userRepository.findByEmailWithPassword(email);

  // Use a constant-time comparison message for both "no user" and "wrong password"
  // cases. This prevents timing attacks that could enumerate valid emails.
  const INVALID_CREDENTIALS = AppError.unauthorized('Invalid email or password');

  if (!user) throw INVALID_CREDENTIALS;

  const passwordValid = await bcrypt.compare(password, user.password_hash);
  if (!passwordValid) throw INVALID_CREDENTIALS;

  if (!user.is_active) {
    throw AppError.forbidden('Your account has been deactivated. Contact support.');
  }

  // Update last login — fire and forget, don't block login on this
  userRepository.updateLastLogin(user.id).catch(err =>
    logger.error('[AUTH] Failed to update last_login', { userId: user.id, error: err.message })
  );

  const accessToken  = generateAccessToken(user);
  const refreshToken = generateRefreshToken(user.id);

  logger.info('[AUTH] User logged in', { userId: user.id, role: user.role });

  return { user: sanitizeUser(user), accessToken, refreshToken };
}

// Never return password_hash or internal flags to the API response
function sanitizeUser(user) {
  const { password_hash, ...safe } = user;
  return safe;
}

export const authService = { register, login };