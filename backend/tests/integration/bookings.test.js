// tests/integration/bookings.test.js

import request from 'supertest';
import { createApp } from '../../src/app.js';
import { pool } from '../../src/config/db.js';

const app = createApp();

let customerToken, providerToken;
let providerId, slotId, serviceId, bookingId;

// Helper to register and log in a user, return token
async function registerAndLogin(role, suffix) {
  const ts    = Date.now() + suffix;
  const phone = `9${String(ts).slice(-9)}`;
  await request(app).post('/api/v1/auth/register').send({
    email:     `${role}_${ts}@test.com`,
    phone,
    password:  'Test@1234',
    full_name: `Test ${role}`,
    role,
    city:      'Pune',
  });
  const login = await request(app).post('/api/v1/auth/login').send({
    email:    `${role}_${ts}@test.com`,
    password: 'Test@1234',
  });
  return {
    token:  login.body.data.accessToken,
    userId: login.body.data.user.id,
  };
}

beforeAll(async () => {
  const customer = await registerAndLogin('customer', 0);
  const provider = await registerAndLogin('provider', 1);
  customerToken = customer.token;
  providerToken = provider.token;
  providerId    = provider.userId;

  // Seed: add service category, provider service, and a time slot
  await pool.query(
    `INSERT IGNORE INTO service_categories (name, slug) VALUES ('Test Plumbing', 'test-plumbing-${Date.now()}')`
  );
  const [[cat]] = await pool.query(
    `SELECT id FROM service_categories WHERE slug LIKE 'test-plumbing-%' ORDER BY id DESC LIMIT 1`
  );

  await pool.query(
    `INSERT INTO provider_services (provider_id, service_category_id, price_per_hour)
     VALUES (?, ?, 500)
     ON DUPLICATE KEY UPDATE price_per_hour = 500`,
    [providerId, cat.id]
  );
  const [[svc]] = await pool.query(
    `SELECT id FROM provider_services WHERE provider_id = ? AND service_category_id = ?`,
    [providerId, cat.id]
  );
  serviceId = svc.id;

  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  const dateStr = tomorrow.toISOString().slice(0, 10);

  await pool.query(
    `INSERT IGNORE INTO time_slots (provider_id, slot_date, start_time, end_time)
     VALUES (?, ?, '10:00:00', '11:00:00')`,
    [providerId, dateStr]
  );
  const [[slot]] = await pool.query(
    `SELECT id FROM time_slots WHERE provider_id = ? AND slot_date = ? AND start_time = '10:00:00'`,
    [providerId, dateStr]
  );
  slotId = slot.id;
});

afterAll(async () => {
  await pool.end();
});

describe('Full booking flow', () => {
  it('creates a booking as customer', async () => {
    const res = await request(app)
      .post('/api/v1/bookings')
      .set('Authorization', `Bearer ${customerToken}`)
      .send({ provider_id: providerId, time_slot_id: slotId, service_id: serviceId });

    expect(res.status).toBe(201);
    expect(res.body.data.bookingId).toBeDefined();
    bookingId = res.body.data.bookingId;
  });

  it('returns 409 on second booking for same slot', async () => {
    const res = await request(app)
      .post('/api/v1/bookings')
      .set('Authorization', `Bearer ${customerToken}`)
      .send({ provider_id: providerId, time_slot_id: slotId, service_id: serviceId });

    expect(res.status).toBe(409);
    expect(res.body.error.code).toBe('SLOT_UNAVAILABLE');
  });

  it('provider confirms the booking', async () => {
    const res = await request(app)
      .patch(`/api/v1/bookings/${bookingId}/status`)
      .set('Authorization', `Bearer ${providerToken}`)
      .send({ status: 'confirmed' });

    expect(res.status).toBe(200);
    expect(res.body.data.to).toBe('confirmed');
  });

  it('customer cannot confirm a booking', async () => {
    // Create a new booking for this test — previous one is already confirmed
    const res = await request(app)
      .patch(`/api/v1/bookings/${bookingId}/status`)
      .set('Authorization', `Bearer ${customerToken}`)
      .send({ status: 'in_progress' });

    expect(res.status).toBe(403);
    expect(res.body.error.code).toBe('UNAUTHORIZED_TRANSITION');
  });

  it('returns 401 without auth token', async () => {
    const res = await request(app).post('/api/v1/bookings').send({});
    expect(res.status).toBe(401);
  });
});