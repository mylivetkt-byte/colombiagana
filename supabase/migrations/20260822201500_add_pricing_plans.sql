-- Add pricing_plans column to raffle_config table
ALTER TABLE public.raffle_config
ADD COLUMN IF NOT EXISTS pricing_plans JSONB DEFAULT '[]'::jsonb;
