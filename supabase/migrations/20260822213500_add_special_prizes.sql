-- Create special_prizes table for raffle winners feature
CREATE TABLE IF NOT EXISTS public.special_prizes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  raffle_id UUID REFERENCES public.raffle_config(id) ON DELETE CASCADE,
  ticket_number INTEGER NOT NULL,
  prize_type TEXT NOT NULL DEFAULT 'article',
  prize_description TEXT NOT NULL,
  prize_amount NUMERIC,
  is_active BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.special_prizes ENABLE ROW LEVEL SECURITY;

-- Public can read active prizes
CREATE POLICY "Anyone can view active special prizes"
  ON public.special_prizes FOR SELECT
  USING (true);

-- Only authenticated admins can manage prizes
CREATE POLICY "Admins can manage special prizes"
  ON public.special_prizes FOR ALL
  USING (auth.role() = 'authenticated')
  WITH CHECK (auth.role() = 'authenticated');
