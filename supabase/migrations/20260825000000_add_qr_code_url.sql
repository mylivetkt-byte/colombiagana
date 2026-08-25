-- Migration to add QR code URL field to payment methods
-- This stores a public URL to a QR code image generated externally

-- Since payment_methods is a JSON column, no DB changes needed
-- Simply add the 'qrUrl' field to PaymentMethod type