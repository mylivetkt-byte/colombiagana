-- Add email tracking fields to ticket_purchases
ALTER TABLE public.ticket_purchases
ADD COLUMN IF NOT EXISTS email_sent_at TIMESTAMPTZ,
ADD COLUMN IF NOT EXISTS email_error TEXT;
