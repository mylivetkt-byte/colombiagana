-- Migration: QR Code Storage Bucket Setup
-- Created: 2026-08-25
-- Purpose: Enable QR code image storage for payment methods

-- ============================================
-- INSTRUCTIONS FOR SUPABASE SETUP
-- ============================================
-- Run this command in terminal to create the bucket:
-- supabase storage buckets create payment-method-qr-codes --public
--
-- Or create via Dashboard:
-- 1. Go to Supabase Dashboard -> Storage
-- 2. Create bucket: payment-method-qr-codes
-- 3. Make bucket PUBLIC

-- ============================================
-- DATABASE CHANGES (if needed in future)
-- ============================================
-- Currently, QR code URLs are stored as JSON in payment_methods column
-- No additional table changes needed for basic implementation

-- ============================================
-- NOTES
-- ============================================
-- - QR images are uploaded via PaymentMethodsForm component
-- - URLs are stored in methods[].qrImageUrl field (JSONB)
-- - Max file size: 5MB (enforced in frontend)
-- - Allowed formats: image/* (PNG, JPG, etc.)

-- This SQL file serves as documentation for the required setup