/**
 * Security Configuration
 * Central location for all security-related settings
 */

// Input validation patterns
export const VALIDATION_PATTERNS = {
  email: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
  phone: /^[+]?[(]?[0-9]{3}[)]?[-\s.]?[0-9]{3}[-\s.]?[0-9]{4,6}$/,
  username: /^[a-zA-Z0-9_-]{3,20}$/,
  password: /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/,
  url: /^https?:\/\/.+/,
};

// Rate limiting config
export const RATE_LIMITS = {
  login: { attempts: 5, windowMs: 15 * 60 * 1000 }, // 5 attempts per 15 min
  apiCall: { requests: 100, windowMs: 60 * 1000 }, // 100 requests per minute
  upload: { maxSize: 5 * 1024 * 1024, maxFiles: 10 }, // 5MB per file, max 10
};

// CORS settings
export const CORS_CONFIG = {
  origin: process.env.NODE_ENV === 'production' 
    ? process.env.VITE_ALLOWED_ORIGINS?.split(',') || [] 
    : ['http://localhost:5173', 'http://localhost:3000'],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'],
  allowedHeaders: ['Content-Type', 'Authorization'],
};

// Security headers
export const SECURITY_HEADERS = {
  'Content-Security-Policy': "default-src 'self'; script-src 'self' 'unsafe-inline'; style-src 'self' 'unsafe-inline'",
  'X-Content-Type-Options': 'nosniff',
  'X-Frame-Options': 'DENY',
  'X-XSS-Protection': '1; mode=block',
  'Referrer-Policy': 'strict-origin-when-cross-origin',
  'Permissions-Policy': 'geolocation=(), microphone=(), camera=()',
};

// Encryption config
export const ENCRYPTION_CONFIG = {
  algorithm: 'aes-256-gcm',
  saltRounds: 12,
  tokenExpiry: 24 * 60 * 60 * 1000, // 24 hours
};

export default {
  VALIDATION_PATTERNS,
  RATE_LIMITS,
  CORS_CONFIG,
  SECURITY_HEADERS,
  ENCRYPTION_CONFIG,
};
