// migrations/20250301_001_initial_schema.js
// Complete initial schema migration.
// knex migrate:latest runs this once and records it in knex_migrations.
// knex migrate:rollback runs the down() function.

export async function up(knex) {
  await knex.raw(`SET sql_mode = 'STRICT_TRANS_TABLES,NO_ZERO_DATE,NO_ENGINE_SUBSTITUTION'`);

  await knex.schema.createTable('users', (t) => {
    t.increments('id').unsigned().primary();
    t.string('email', 255).notNullable().unique();
    t.string('phone', 20).notNullable().unique();
    t.string('password_hash', 255).notNullable();
    t.string('full_name', 100).notNullable();
    t.enu('role', ['customer', 'provider', 'admin']).notNullable();
    t.string('city', 100).notNullable();
    t.string('profile_pic', 500).nullable();
    t.boolean('is_active').notNullable().defaultTo(true);
    t.boolean('is_verified').notNullable().defaultTo(false);
    t.timestamp('last_login_at').nullable();
    t.timestamps(true, true);

    t.index(['role']);
    t.index(['city']);
    t.index(['role', 'city', 'is_active'], 'idx_users_role_city_active');
  });

  await knex.schema.createTable('provider_profiles', (t) => {
    t.increments('id').unsigned().primary();
    t.integer('user_id').unsigned().notNullable().unique();
    t.text('bio').nullable();
    t.tinyint('years_exp').unsigned().notNullable().defaultTo(0);
    t.decimal('avg_rating', 3, 2).notNullable().defaultTo(0.00);
    t.integer('total_reviews').unsigned().notNullable().defaultTo(0);
    t.integer('total_bookings').unsigned().notNullable().defaultTo(0);
    t.boolean('is_verified').notNullable().defaultTo(false);
    t.tinyint('service_radius_km').unsigned().notNullable().defaultTo(10);
    t.timestamps(true, true);

    t.foreign('user_id').references('users.id').onDelete('CASCADE');
    t.index(['avg_rating']);
    t.index(['is_verified', 'avg_rating'], 'idx_provider_verified_rating');
  });

  await knex.schema.createTable('service_categories', (t) => {
    t.increments('id').unsigned().primary();
    t.string('name', 100).notNullable().unique();
    t.string('slug', 100).notNullable().unique();
    t.text('description').nullable();
    t.string('icon_url', 500).nullable();
    t.decimal('base_price', 10, 2).nullable();
    t.boolean('is_active').notNullable().defaultTo(true);
    t.tinyint('display_order').unsigned().notNullable().defaultTo(0);
    t.timestamps(true, true);

    t.index(['is_active', 'display_order'], 'idx_categories_active_order');
  });

  await knex.schema.createTable('provider_services', (t) => {
    t.increments('id').unsigned().primary();
    t.integer('provider_id').unsigned().notNullable();
    t.integer('service_category_id').unsigned().notNullable();
    t.decimal('price_per_hour', 10, 2).notNullable();
    t.enu('price_unit', ['per_hour', 'per_visit', 'per_sqft']).notNullable().defaultTo('per_hour');
    t.tinyint('min_booking_hours').unsigned().notNullable().defaultTo(1);
    t.text('description').nullable();
    t.boolean('is_active').notNullable().defaultTo(true);
    t.timestamps(true, true);

    t.unique(['provider_id', 'service_category_id'], 'uq_provider_services_combo');
    t.foreign('provider_id').references('users.id').onDelete('CASCADE');
    t.foreign('service_category_id').references('service_categories.id').onDelete('RESTRICT');
    t.index(['service_category_id']);
  });

  await knex.schema.createTable('availability_templates', (t) => {
    t.increments('id').unsigned().primary();
    t.integer('provider_id').unsigned().notNullable();
    t.tinyint('day_of_week').unsigned().notNullable();
    t.time('start_time').notNullable();
    t.time('end_time').notNullable();
    t.tinyint('slot_duration_min').unsigned().notNullable().defaultTo(60);
    t.boolean('is_active').notNullable().defaultTo(true);
    t.timestamps(true, true);

    t.foreign('provider_id').references('users.id').onDelete('CASCADE');
    t.index(['provider_id', 'day_of_week'], 'idx_at_provider_day');
    t.raw('CONSTRAINT chk_at_day CHECK (day_of_week BETWEEN 0 AND 6)');
    t.raw('CONSTRAINT chk_at_times CHECK (end_time > start_time)');
  });

  await knex.schema.createTable('time_slots', (t) => {
    t.increments('id').unsigned().primary();
    t.integer('provider_id').unsigned().notNullable();
    t.date('slot_date').notNullable();
    t.time('start_time').notNullable();
    t.time('end_time').notNullable();
    t.enu('status', ['available', 'booked', 'blocked']).notNullable().defaultTo('available');
    t.timestamps(true, true);

    t.unique(['provider_id', 'slot_date', 'start_time'], 'uq_ts_provider_date_start');
    t.foreign('provider_id').references('users.id').onDelete('CASCADE');
    t.index(['provider_id', 'slot_date', 'status'], 'idx_ts_provider_date_status');
    t.index(['slot_date', 'status'], 'idx_ts_date_status');
  });

  await knex.schema.createTable('bookings', (t) => {
    t.increments('id').unsigned().primary();
    t.integer('customer_id').unsigned().notNullable();
    t.integer('provider_id').unsigned().notNullable();
    t.integer('time_slot_id').unsigned().notNullable().unique();
    t.integer('service_id').unsigned().notNullable();
    t.enu('status', ['requested','confirmed','in_progress','completed','cancelled','rejected'])
      .notNullable().defaultTo('requested');
    t.decimal('price_snapshot', 10, 2).notNullable();
    t.decimal('duration_hours', 4, 2).notNullable();
    t.decimal('total_amount', 10, 2).notNullable();
    t.text('notes').nullable();
    t.integer('cancelled_by').unsigned().nullable();
    t.string('cancel_reason', 500).nullable();
    t.timestamp('cancelled_at').nullable();
    t.timestamps(true, true);

    t.foreign('customer_id').references('users.id').onDelete('RESTRICT');
    t.foreign('provider_id').references('users.id').onDelete('RESTRICT');
    t.foreign('time_slot_id').references('time_slots.id').onDelete('RESTRICT');
    t.foreign('service_id').references('provider_services.id').onDelete('RESTRICT');

    t.index(['customer_id']);
    t.index(['provider_id']);
    t.index(['status']);
    t.index(['provider_id', 'status'], 'idx_bookings_provider_status');
    t.index(['customer_id', 'created_at'], 'idx_bookings_customer_created');
    t.index(['created_at']);
  });

  await knex.schema.createTable('booking_events', (t) => {
    t.increments('id').unsigned().primary();
    t.integer('booking_id').unsigned().notNullable();
    t.string('from_status', 20).nullable();
    t.string('to_status', 20).notNullable();
    t.integer('actor_id').unsigned().notNullable();
    t.enu('actor_role', ['customer','provider','admin','system']).notNullable();
    t.string('notes', 1000).nullable();
    t.string('ip_address', 45).nullable();
    t.timestamp('created_at').notNullable().defaultTo(knex.fn.now());

    t.foreign('booking_id').references('bookings.id').onDelete('RESTRICT');
    t.index(['booking_id']);
    t.index(['created_at']);
  });

  await knex.schema.createTable('reviews', (t) => {
    t.increments('id').unsigned().primary();
    t.integer('booking_id').unsigned().notNullable().unique();
    t.integer('reviewer_id').unsigned().notNullable();
    t.integer('provider_id').unsigned().notNullable();
    t.tinyint('rating').unsigned().notNullable();
    t.text('comment').nullable();
    t.boolean('is_flagged').notNullable().defaultTo(false);
    t.string('flag_reason', 500).nullable();
    t.timestamps(true, true);

    t.foreign('booking_id').references('bookings.id').onDelete('RESTRICT');
    t.foreign('reviewer_id').references('users.id').onDelete('RESTRICT');
    t.foreign('provider_id').references('users.id').onDelete('RESTRICT');

    t.index(['provider_id']);
    t.index(['reviewer_id']);
    t.index(['is_flagged']);
    t.raw('CONSTRAINT chk_reviews_rating CHECK (rating BETWEEN 1 AND 5)');
  });

  await knex.schema.createTable('payments', (t) => {
    t.increments('id').unsigned().primary();
    t.integer('booking_id').unsigned().notNullable().unique();
    t.decimal('amount', 10, 2).notNullable();
    t.string('currency', 3).notNullable().defaultTo('INR');
    t.enu('status', ['pending','paid','failed','refunded','partially_refunded'])
      .notNullable().defaultTo('pending');
    t.enu('payment_method', ['mock_upi','mock_card','mock_cash','mock_wallet'])
      .notNullable().defaultTo('mock_upi');
    t.string('mock_transaction_id', 100).nullable();
    t.timestamp('paid_at').nullable();
    t.decimal('refund_amount', 10, 2).nullable().defaultTo(0.00);
    t.string('refund_reason', 500).nullable();
    t.timestamp('refunded_at').nullable();
    t.timestamps(true, true);

    t.foreign('booking_id').references('bookings.id').onDelete('RESTRICT');
    t.index(['status']);
  });
}

export async function down(knex) {
  // Drop in reverse dependency order
  const tables = [
    'payments', 'reviews', 'booking_events', 'bookings',
    'time_slots', 'availability_templates', 'provider_services',
    'service_categories', 'provider_profiles', 'users'
  ];
  for (const table of tables) {
    await knex.schema.dropTableIfExists(table);
  }
}