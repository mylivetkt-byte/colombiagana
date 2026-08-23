-- Add Brevo configuration fields to raffle_config
ALTER TABLE public.raffle_config
ADD COLUMN IF NOT EXISTS brevo_api_key TEXT,
ADD COLUMN IF NOT EXISTS brevo_sender_email TEXT,
ADD COLUMN IF NOT EXISTS brevo_sender_name TEXT;
