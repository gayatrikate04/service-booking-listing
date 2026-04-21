// src/config/logger.js

// A logger = a smart notebook where your server writes what is happening.
// Winston provides structured logging for Node.js applications.
//  It allows us to log messages to multiple transports like console and files, supports different 
// formats for development and production, includes timestamps and stack traces, and prevents uncontrolled 
// log growth using file rotation. 
// This helps monitor and debug production systems effectively.
import winston from 'winston';
import { env } from './env.js';

const { combine, timestamp, json, colorize, simple, errors } = winston.format;

// In production: JSON format for log aggregation tools (Datadog, CloudWatch).
// In development: colorized simple format for human reading.
const productionFormat = combine(
  errors({ stack: true }),  // Include stack traces in log objects
  timestamp(),
  json()
);

const developmentFormat = combine(
  colorize(),
  simple()
);

export const logger = winston.createLogger({
  level: env.nodeEnv === 'production' ? 'warn' : 'debug',
  format: env.nodeEnv === 'production' ? productionFormat : developmentFormat,
  defaultMeta: { service: 'booking-platform-api' },
  transports: [
    new winston.transports.Console(),
    new winston.transports.File({
      filename: 'logs/error.log',
      level: 'error',
      maxsize: 10 * 1024 * 1024,  // 10MB before rotation
      maxFiles: 5,
    }),
    new winston.transports.File({
      filename: 'logs/combined.log',
      maxsize: 10 * 1024 * 1024,
      maxFiles: 5,
    }),
  ],
  // Do not exit on unhandled errors from logger itself
  exitOnError: false,
});