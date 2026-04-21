// tests/integration/auth.test.js
// Integration tests hit the real Express app with a test database.
// Requires TEST_DB_NAME in .env.test to be a separate empty test database.

import request from 'supertest';
import { createApp } from '../../src/app.js';
import { pool } from '../../src/config/db.js';

const app = createApp();

afterAll(async () => {
  await pool.end();
});

describe('POST /api/v1/auth/register', () => {
  const uniqueEmail = `test_${Date.now()}@example.com`;
  const uniquePhone = `9${Math.floor(100000000 + Math.random() * 900000000)}`;

  it('returns 201 and token for valid customer registration', async () => {
    const res = await request(app)
      .post('/api/v1/auth/register')
      .send({
        email:     uniqueEmail,
        phone:     uniquePhone,
        password:  'Test@1234',
        full_name: 'Test Customer',
        role:      'customer',
        city:      'Pune',
      });

    expect(res.status).toBe(201);
    expect(res.body.success).toBe(true);
    expect(res.body.data.accessToken).toBeDefined();
    expect(res.body.data.user.password_hash).toBeUndefined();
  });

  it('returns 409 when email is already registered', async () => {
    const res = await request(app)
      .post('/api/v1/auth/register')
      .send({
        email:     uniqueEmail,  // same email as above
        phone:     `9${Math.floor(100000000 + Math.random() * 900000000)}`,
        password:  'Test@1234',
        full_name: 'Another User',
        role:      'customer',
        city:      'Pune',
      });

    expect(res.status).toBe(409);
    expect(res.body.error.code).toBe('EMAIL_TAKEN');
  });

  it('returns 422 for invalid role', async () => {
    const res = await request(app)
      .post('/api/v1/auth/register')
      .send({
        email:     `invalid_${Date.now()}@test.com`,
        phone:     `9${Math.floor(100000000 + Math.random() * 900000000)}`,
        password:  'Test@1234',
        full_name: 'Bad Role',
        role:      'superuser',   // invalid
        city:      'Pune',
      });

    expect(res.status).toBe(422);
    expect(res.body.error.code).toBe('VALIDATION_ERROR');
  });
});

describe('POST /api/v1/auth/login', () => {
  it('returns 401 for wrong password', async () => {
    const res = await request(app)
      .post('/api/v1/auth/login')
      .send({ email: 'nonexistent@example.com', password: 'wrongpass' });

    expect(res.status).toBe(401);
  });
});