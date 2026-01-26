-- Tabla para configuración de la rifa
CREATE TABLE public.raffle_config (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL DEFAULT 'Gran Rifa del Año',
  description TEXT DEFAULT 'Participa y gana increíbles premios',
  prize TEXT NOT NULL DEFAULT 'Premio',
  prize_image TEXT DEFAULT '',
  banner_image TEXT DEFAULT '',
  draw_date DATE DEFAULT CURRENT_DATE,
  start_number INTEGER NOT NULL DEFAULT 1000,
  end_number INTEGER NOT NULL DEFAULT 9999,
  price_one NUMERIC(10,2) NOT NULL DEFAULT 10,
  price_two NUMERIC(10,2) NOT NULL DEFAULT 18,
  price_three NUMERIC(10,2) NOT NULL DEFAULT 25,
  currency TEXT NOT NULL DEFAULT 'USD',
  is_active BOOLEAN NOT NULL DEFAULT true,
  specifications TEXT[] DEFAULT ARRAY['Sorteo en vivo por Facebook Live', 'Se realizará con la Lotería Nacional'],
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Tabla para compras de boletas
CREATE TABLE public.ticket_purchases (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  raffle_id UUID REFERENCES public.raffle_config(id) ON DELETE CASCADE,
  buyer_name TEXT NOT NULL,
  buyer_email TEXT NOT NULL,
  buyer_phone TEXT NOT NULL,
  ticket_numbers INTEGER[] NOT NULL,
  quantity INTEGER NOT NULL,
  total_price NUMERIC(10,2) NOT NULL,
  payment_status TEXT NOT NULL DEFAULT 'pending' CHECK (payment_status IN ('pending', 'verified', 'cancelled')),
  payment_method TEXT DEFAULT 'pending',
  payment_image_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Habilitar RLS
ALTER TABLE public.raffle_config ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ticket_purchases ENABLE ROW LEVEL SECURITY;

-- Políticas para raffle_config: lectura pública, escritura solo admin
CREATE POLICY "Public can read raffle config"
  ON public.raffle_config FOR SELECT
  USING (true);

CREATE POLICY "Admins can manage raffle config"
  ON public.raffle_config FOR ALL
  TO authenticated
  USING (public.has_role(auth.uid(), 'admin'))
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

-- Políticas para ticket_purchases: inserción pública, gestión admin
CREATE POLICY "Public can insert purchases"
  ON public.ticket_purchases FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Public can view own purchases by email"
  ON public.ticket_purchases FOR SELECT
  USING (true);

CREATE POLICY "Admins can manage all purchases"
  ON public.ticket_purchases FOR ALL
  TO authenticated
  USING (public.has_role(auth.uid(), 'admin'))
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

-- Función para actualizar timestamps
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

-- Triggers para timestamps
CREATE TRIGGER update_raffle_config_updated_at
  BEFORE UPDATE ON public.raffle_config
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_ticket_purchases_updated_at
  BEFORE UPDATE ON public.ticket_purchases
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Insertar configuración por defecto
INSERT INTO public.raffle_config (title, description, prize, specifications)
VALUES (
  'Gran Rifa del Año',
  'Participa y gana increíbles premios',
  'iPhone 15 Pro Max + $1,000 USD',
  ARRAY['Sorteo en vivo por Facebook Live', 'Se realizará con la Lotería Nacional', 'El ganador será contactado por teléfono y correo', 'Premio entregado en 24-48 horas']
);

-- Crear bucket para imágenes de pago
INSERT INTO storage.buckets (id, name, public)
VALUES ('payment-proofs', 'payment-proofs', true)
ON CONFLICT (id) DO NOTHING;

-- Política para subir imágenes de pago (público)
CREATE POLICY "Anyone can upload payment proofs"
  ON storage.objects FOR INSERT
  WITH CHECK (bucket_id = 'payment-proofs');

CREATE POLICY "Anyone can view payment proofs"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'payment-proofs');

CREATE POLICY "Admins can delete payment proofs"
  ON storage.objects FOR DELETE
  TO authenticated
  USING (bucket_id = 'payment-proofs' AND public.has_role(auth.uid(), 'admin'));