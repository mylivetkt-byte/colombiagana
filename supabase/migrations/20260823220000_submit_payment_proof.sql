-- Permite al comprador (usuario anónimo) registrar el comprobante de pago
-- sin exponer una política UPDATE pública sobre ticket_purchases.
-- Se usa SECURITY DEFINER para sortear el RLS de UPDATE para usuarios no autenticados.
CREATE OR REPLACE FUNCTION public.submit_payment_proof(
  p_purchase_id uuid,
  p_image_url text
)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  UPDATE public.ticket_purchases
  SET payment_image_url = p_image_url,
      payment_method = 'comprobante_enviado'
  WHERE id = p_purchase_id
    AND payment_status = 'pending';
END;
$$;

GRANT EXECUTE ON FUNCTION public.submit_payment_proof(uuid, text) TO anon, authenticated;
