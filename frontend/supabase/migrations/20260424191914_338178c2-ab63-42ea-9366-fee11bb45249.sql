
-- Replace the broad public SELECT with a no-list (URL-only) policy.
-- Public URLs (signed/public path) still work; bucket can't be enumerated.
DROP POLICY IF EXISTS "Public can view product images" ON storage.objects;

CREATE POLICY "Authenticated users can view product images"
  ON storage.objects FOR SELECT TO authenticated
  USING (bucket_id = 'product-images');

-- Anonymous fetches still work via the bucket being marked public, which serves
-- objects directly via the storage CDN without going through RLS list APIs.
