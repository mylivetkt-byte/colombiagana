-- Add payment_methods column to raffle_config
ALTER TABLE public.raffle_config 
ADD COLUMN payment_methods jsonb DEFAULT '[]'::jsonb;

-- Update default to include common payment methods structure
COMMENT ON COLUMN public.raffle_config.payment_methods IS 'Array of payment method objects with name, type, account_number, account_holder, and instructions';