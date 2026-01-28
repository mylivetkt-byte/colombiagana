-- Create storage bucket for raffle images
INSERT INTO storage.buckets (id, name, public)
VALUES ('raffle-images', 'raffle-images', true)
ON CONFLICT (id) DO NOTHING;

-- Allow public read access to raffle images
CREATE POLICY "Public can view raffle images"
ON storage.objects FOR SELECT
USING (bucket_id = 'raffle-images');

-- Allow authenticated admins to upload raffle images
CREATE POLICY "Admins can upload raffle images"
ON storage.objects FOR INSERT
WITH CHECK (
  bucket_id = 'raffle-images' 
  AND public.has_role(auth.uid(), 'admin')
);

-- Allow authenticated admins to update raffle images
CREATE POLICY "Admins can update raffle images"
ON storage.objects FOR UPDATE
USING (
  bucket_id = 'raffle-images' 
  AND public.has_role(auth.uid(), 'admin')
);

-- Allow authenticated admins to delete raffle images
CREATE POLICY "Admins can delete raffle images"
ON storage.objects FOR DELETE
USING (
  bucket_id = 'raffle-images' 
  AND public.has_role(auth.uid(), 'admin')
);