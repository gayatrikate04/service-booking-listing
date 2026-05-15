// // src/app.js
// // Express application factory. Returns a configured app instance.
// // Keeping this separate from server.js allows importing the app
// // in tests without starting an HTTP server.



// import express from 'express';
// import cors from 'cors';
// import helmet from 'helmet';
// import morgan from 'morgan';
// import { env } from './config/env.js';
// import { logger } from './config/logger.js';
// import { errorHandler } from './middleware/errorHandler.js';
// import { authRouter } from './modules/auth/auth.routes.js';
// import { userRouter } from './modules/users/user.routes.js';
// import { providerRouter } from './modules/providers/provider.routes.js';
// import { categoryRouter } from './modules/services/category.routes.js';
// import { bookingRouter } from './modules/bookings/booking.routes.js';
// import { availabilityRouter } from './modules/availability/availability.routes.js';
// import { reviewRouter } from './modules/reviews/review.routes.js';
// import { adminRouter } from './modules/admin/admin.routes.js';

// export function createApp() {
  
//   const app = express();
  

//   // Security headers. Prevents common web vulnerabilities.
//   // Sets X-Content-Type-Options, X-Frame-Options, etc.
//   app.use(helmet());

//   // CORS: restrict which origins can call your API.
//   app.use(cors({
//     origin:      env.cors.origin,
//     credentials: true,            // Allow cookies for refresh token
//     methods:     ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
//     allowedHeaders: ['Content-Type', 'Authorization'],
//   }));

//   // Parse JSON bodies. Limit size to prevent payload attacks.
//   app.use(express.json({ limit: '10kb' }));
//   app.use(express.urlencoded({ extended: true, limit: '10kb' }));

//   // HTTP request logging. In production, pipe to log aggregator.
//   app.use(morgan('combined', {
//     stream: { write: (msg) => logger.http(msg.trim()) },
//     skip: (req) => req.url === '/health', // Don't log health checks
//   }));

//   // Health check endpoint — no auth, no processing, just confirms process is alive
//   app.get('/health', (req, res) => {
//     res.status(200).json({
//       status: 'ok',
//       timestamp: new Date().toISOString(),
//       uptime: process.uptime(),
//     });
//   });

//   // API routes — all under /api/v1 prefix
//   app.use('/api/v1/auth',         authRouter);
//   app.use('/api/v1/users',        userRouter);
//   app.use('/api/v1/providers',    providerRouter);
//   app.use('/api/v1/categories',   categoryRouter);
//   app.use('/api/v1/bookings',     bookingRouter);
//   app.use('/api/v1/availability', availabilityRouter);
//   app.use('/api/v1/reviews',      reviewRouter);
//   app.use('/api/v1/admin',        adminRouter);

//   // 404 handler — catches requests to routes that don't exist
//   app.use((req, res) => {
//     res.status(404).json({
//       success: false,
//       error: {
//         code:    'ROUTE_NOT_FOUND',
//         message: `Cannot ${req.method} ${req.originalUrl}`,
//       }
//     });
//   });

//   // Global error handler — MUST be last
//   app.use(errorHandler);

//   return app;
// }

// src/app.js
// CORS in production must explicitly list your Vercel domain.
// The CORS_ORIGIN env var can be comma-separated for multiple origins.

import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import { env } from './config/env.js';
import { logger } from './config/logger.js';
import { errorHandler } from './middleware/errorHandler.js';

// Import all routers
import { authRouter }         from './modules/auth/auth.routes.js';
import { userRouter }         from './modules/users/user.routes.js';
import { providerRouter }     from './modules/providers/provider.routes.js';
import { categoryRouter }     from './modules/services/category.routes.js';
import { bookingRouter }      from './modules/bookings/booking.routes.js';
import { availabilityRouter } from './modules/availability/availability.routes.js';
import { reviewRouter }       from './modules/reviews/review.routes.js';
import { adminRouter }        from './modules/admin/admin.routes.js';

export function createApp() {
  const app = express();

  app.set('trust proxy', 1);
  // 'trust proxy' = 1 tells Express to trust the first proxy hop (Railway's load balancer).
  // Without this, req.ip returns the proxy IP, not the real client IP.
  // Required for rate limiting and IP-based audit logs to work correctly.

  app.use(helmet());

  // Parse CORS_ORIGIN: supports "https://a.vercel.app" or "https://a.vercel.app,https://b.com"
  const allowedOrigins = env.cors.origin
    .split(',')
    .map(o => o.trim())
    .filter(Boolean);

  app.use(cors({
    origin: (requestOrigin, callback) => {
      // Allow requests with no origin (curl, Postman, server-to-server)
      if (!requestOrigin) return callback(null, true);
      if (allowedOrigins.includes(requestOrigin)) {
        return callback(null, true);
      }
      // In development, also allow localhost
      if (env.nodeEnv === 'development' && requestOrigin.includes('localhost')) {
        return callback(null, true);
      }
      callback(new Error(`CORS blocked: ${requestOrigin}`));
    },
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
  }));

  app.use(express.json({ limit: '10kb' }));
  app.use(express.urlencoded({ extended: true, limit: '10kb' }));

  app.use(morgan('combined', {
    stream: { write: (msg) => logger.http(msg.trim()) },
    skip: (req) => req.url === '/health',
  }));

  // Health check — Railway uses this to verify your app started correctly
  app.get('/health', (req, res) => {
    res.status(200).json({
      status:    'ok',
      timestamp: new Date().toISOString(),
      uptime:    process.uptime(),
      env:       env.nodeEnv,
    });
  });

  app.use('/api/v1/auth',         authRouter);
  app.use('/api/v1/users',        userRouter);
  app.use('/api/v1/providers',    providerRouter);
  app.use('/api/v1/categories',   categoryRouter);
  app.use('/api/v1/bookings',     bookingRouter);
  app.use('/api/v1/availability', availabilityRouter);
  app.use('/api/v1/reviews',      reviewRouter);
  app.use('/api/v1/admin',        adminRouter);

  app.use((req, res) => {
  res.status(404).json({
    success: false,
    error: {
      code: 'ROUTE_NOT_FOUND',
      message: `Cannot ${req.method} ${req.originalUrl}`,
    },
  });
});

  app.use(errorHandler);
  return app;
}