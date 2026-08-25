-- Migration: Add Resend email configuration fields to raffle_config
-- Purpose: Enable Resend as email provider instead of Brevo

ALTER TABLE public.raffle_config
ADD COLUMN IF NOT EXISTS resend_api_key TEXT,
ADD COLUMN IF NOT EXISTS resend_sender_email TEXT,
ADD COLUMN IF NOT EXISTS resend_sender_name TEXT;

-- Notes:
-- - resend_api_key: API key from Resend dashboard
-- - resend_sender_email: Verified sender email in Resend
-- - resend_sender_name: Display name for sender
-- - These fields are used by send-ticket-email edge function