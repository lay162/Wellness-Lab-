-- Wellness Lab Platform — Storage Buckets
-- Run in Supabase SQL Editor

INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES
  ('product-images', 'product-images', true, 5242880, ARRAY['image/jpeg', 'image/png', 'image/webp']),
  ('coa-files', 'coa-files', false, 10485760, ARRAY['application/pdf', 'image/jpeg', 'image/png']),
  ('blog-images', 'blog-images', true, 5242880, ARRAY['image/jpeg', 'image/png', 'image/webp']),
  ('review-images', 'review-images', true, 5242880, ARRAY['image/jpeg', 'image/png', 'image/webp']),
  ('success-story-images', 'success-story-images', true, 5242880, ARRAY['image/jpeg', 'image/png', 'image/webp']),
  ('branding', 'branding', true, 2097152, ARRAY['image/jpeg', 'image/png', 'image/webp', 'image/svg+xml'])
ON CONFLICT (id) DO NOTHING;

-- Storage RLS Policies

-- Product images: public read, admin write
CREATE POLICY "Public read product images"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'product-images');

CREATE POLICY "Admin upload product images"
  ON storage.objects FOR INSERT
  WITH CHECK (bucket_id = 'product-images' AND (SELECT is_admin()));

CREATE POLICY "Admin update product images"
  ON storage.objects FOR UPDATE
  USING (bucket_id = 'product-images' AND (SELECT is_admin()));

CREATE POLICY "Admin delete product images"
  ON storage.objects FOR DELETE
  USING (bucket_id = 'product-images' AND (SELECT is_admin()));

-- COA files: approved customers and admin read, admin write
CREATE POLICY "Approved customers read COA files"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'coa-files' AND ((SELECT is_approved_customer()) OR (SELECT is_admin())));

CREATE POLICY "Admin upload COA files"
  ON storage.objects FOR INSERT
  WITH CHECK (bucket_id = 'coa-files' AND (SELECT is_admin()));

CREATE POLICY "Admin manage COA files"
  ON storage.objects FOR ALL
  USING (bucket_id = 'coa-files' AND (SELECT is_admin()));

-- Blog images: public read, admin write
CREATE POLICY "Public read blog images"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'blog-images');

CREATE POLICY "Admin manage blog images"
  ON storage.objects FOR ALL
  USING (bucket_id = 'blog-images' AND (SELECT is_admin()));

-- Review images: public read, admin write
CREATE POLICY "Public read review images"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'review-images');

CREATE POLICY "Admin manage review images"
  ON storage.objects FOR ALL
  USING (bucket_id = 'review-images' AND (SELECT is_admin()));

-- Success story images: public read, admin write
CREATE POLICY "Public read success story images"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'success-story-images');

CREATE POLICY "Admin manage success story images"
  ON storage.objects FOR ALL
  USING (bucket_id = 'success-story-images' AND (SELECT is_admin()));

-- Branding: public read, admin write
CREATE POLICY "Public read branding"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'branding');

CREATE POLICY "Admin manage branding"
  ON storage.objects FOR ALL
  USING (bucket_id = 'branding' AND (SELECT is_admin()));
