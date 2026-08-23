-- Add show_draw_date column to raffle_config table
ALTER TABLE public.raffle_config
ADD COLUMN IF NOT EXISTS show_draw_date BOOLEAN DEFAULT true;
