DROP POLICY IF EXISTS "Public can view own purchases by email" ON public.ticket_purchases;

CREATE OR REPLACE FUNCTION public.get_sold_numbers()
RETURNS integer[]
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path = public
AS $$
  SELECT COALESCE(array_agg(n), ARRAY[]::integer[])
  FROM (
    SELECT DISTINCT unnest(ticket_numbers) AS n
    FROM public.ticket_purchases
    WHERE payment_status <> 'cancelled'
  ) s;
$$;

GRANT EXECUTE ON FUNCTION public.get_sold_numbers() TO anon, authenticated;