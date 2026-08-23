-- Migration to add Brevo email API columns to raffle_config table
ALTER TABLE raffle_config ADD COLUMN IF NOT EXISTS brevo_api_key TEXT;
ALTER TABLE raffle_config ADD COLUMN IF NOT EXISTS brevo_sender_email TEXT;
ALTER TABLE raffle_config ADD COLUMN IF NOT EXISTS brevo_sender_name TEXT;