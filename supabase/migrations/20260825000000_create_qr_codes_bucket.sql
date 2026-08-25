-- Migration to set up QR codes bucket for payment methods
-- Note: Supabase storage buckets must be created via the Supabase dashboard or CLI
-- Run: supabase storage buckets create payment-method-qr-codes --public

-- This SQL file documents the requirement for a public bucket named:
-- payment-method-qr-codes

-- The qrImageUrl field in payment_methods JSONB stores the public URL
-- of the uploaded QR code image for each payment method

-- Example usage flow:
-- 1. Admin uploads QR image via PaymentMethodsForm
-- 2. Image is uploaded to 'payment-method-qr-codes' bucket
-- 3. Public URL is returned and stored in qrImageUrl field
-- 4. Customer sees QR code in PaymentConfirmation