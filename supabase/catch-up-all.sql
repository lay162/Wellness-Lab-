-- ============================================================
-- Wellness Lab — CATCH-UP ALL (one paste, safe to re-run)
-- ============================================================
-- Paste this ENTIRE file into Supabase → SQL Editor → Run once.
-- Re-run anytime: skips duplicates, won't wipe existing data.
--
-- Adds: site_pages, site_cards, faqs, reviews/stories seed data,
--       open shop, staff signup, storage buckets, column updates.
-- ============================================================

-- Helpers (safe to replace)
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION is_admin()
RETURNS BOOLEAN AS $$
  SELECT EXISTS (
    SELECT 1 FROM profiles
    WHERE id = auth.uid() AND role = 'admin' AND status = 'approved'
  );
$$ LANGUAGE sql SECURITY DEFINER STABLE;

CREATE OR REPLACE FUNCTION is_approved_customer()
RETURNS BOOLEAN AS $$
  SELECT EXISTS (
    SELECT 1 FROM profiles
    WHERE id = auth.uid() AND role = 'customer' AND status = 'approved'
  );
$$ LANGUAGE sql SECURITY DEFINER STABLE;

-- ============================================================
-- 1. Profile + signup (staff-admin + open registration)
-- ============================================================
ALTER TABLE profiles
ADD COLUMN IF NOT EXISTS must_change_password BOOLEAN NOT NULL DEFAULT false;

CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
DECLARE
  v_staff BOOLEAN;
BEGIN
  v_staff := COALESCE(NEW.raw_user_meta_data->>'is_staff_provisioned', 'false') = 'true';

  INSERT INTO public.profiles (
    id, full_name, email, phone, company_name, reason_for_access,
    terms_accepted, compliance_accepted, status, must_change_password
  )
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'full_name', ''),
    NEW.email,
    NEW.raw_user_meta_data->>'phone',
    NEW.raw_user_meta_data->>'company_name',
    COALESCE(NEW.raw_user_meta_data->>'reason_for_access', 'Self registration'),
    COALESCE((NEW.raw_user_meta_data->>'terms_accepted')::boolean, false),
    COALESCE((NEW.raw_user_meta_data->>'compliance_accepted')::boolean, false),
    CASE WHEN v_staff THEN 'pending' ELSE 'approved' END,
    v_staff
  );

  IF v_staff THEN
    UPDATE public.profiles
    SET role = 'admin', status = 'approved', must_change_password = true
    WHERE id = NEW.id;
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Remove old invite-only system (no-op if already gone)
DROP FUNCTION IF EXISTS validate_invite_token(TEXT);
DROP POLICY IF EXISTS "Admin full access to invites" ON invites;
DROP TABLE IF EXISTS invites;

-- ============================================================
-- 2. Product + blog column updates
-- ============================================================
ALTER TABLE products ADD COLUMN IF NOT EXISTS price_on_enquiry BOOLEAN DEFAULT false;
ALTER TABLE blog_posts ADD COLUMN IF NOT EXISTS seed_key TEXT UNIQUE;

-- ============================================================
-- 3. Site pages, cards, FAQs (missing from older setups)
-- ============================================================
CREATE TABLE IF NOT EXISTS site_pages (
  page_key TEXT PRIMARY KEY,
  hero_title TEXT,
  hero_subtitle TEXT,
  section_title TEXT,
  section_subtitle TEXT,
  body_html TEXT,
  note_html TEXT,
  badge_text TEXT,
  extra_title TEXT,
  extra_subtitle TEXT,
  cta_title TEXT,
  cta_subtitle TEXT,
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS site_cards (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  page_key TEXT NOT NULL,
  card_group TEXT NOT NULL DEFAULT 'default',
  title TEXT NOT NULL,
  description TEXT,
  icon TEXT,
  step_label TEXT,
  sort_order INT DEFAULT 0,
  seed_key TEXT UNIQUE,
  is_published BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_site_cards_page ON site_cards(page_key, card_group, sort_order);

CREATE TABLE IF NOT EXISTS faqs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  question TEXT NOT NULL,
  answer TEXT NOT NULL,
  sort_order INT DEFAULT 0,
  seed_key TEXT UNIQUE,
  is_published BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_faqs_sort ON faqs(sort_order);

DROP TRIGGER IF EXISTS site_pages_updated_at ON site_pages;
CREATE TRIGGER site_pages_updated_at
  BEFORE UPDATE ON site_pages
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

ALTER TABLE site_pages ENABLE ROW LEVEL SECURITY;
ALTER TABLE site_cards ENABLE ROW LEVEL SECURITY;
ALTER TABLE faqs ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Public read site pages" ON site_pages;
CREATE POLICY "Public read site pages"
  ON site_pages FOR SELECT USING (true);

DROP POLICY IF EXISTS "Admin manage site pages" ON site_pages;
CREATE POLICY "Admin manage site pages"
  ON site_pages FOR ALL USING (is_admin());

DROP POLICY IF EXISTS "Public read published site cards" ON site_cards;
CREATE POLICY "Public read published site cards"
  ON site_cards FOR SELECT USING (is_published = true);

DROP POLICY IF EXISTS "Admin manage site cards" ON site_cards;
CREATE POLICY "Admin manage site cards"
  ON site_cards FOR ALL USING (is_admin());

DROP POLICY IF EXISTS "Public read published faqs" ON faqs;
CREATE POLICY "Public read published faqs"
  ON faqs FOR SELECT USING (is_published = true);

DROP POLICY IF EXISTS "Admin manage faqs" ON faqs;
CREATE POLICY "Admin manage faqs"
  ON faqs FOR ALL USING (is_admin());

-- ============================================================
-- 4. Reviews + success stories columns + seed data
-- ============================================================
ALTER TABLE success_stories
ADD COLUMN IF NOT EXISTS before_image TEXT,
ADD COLUMN IF NOT EXISTS after_image TEXT,
ADD COLUMN IF NOT EXISTS seed_key TEXT UNIQUE,
ADD COLUMN IF NOT EXISTS content_private TEXT;

ALTER TABLE reviews
ADD COLUMN IF NOT EXISTS seed_key TEXT UNIQUE,
ADD COLUMN IF NOT EXISTS content_private TEXT;

INSERT INTO reviews (seed_key, author_name, content, content_private, rating, is_public, is_approved)
VALUES
  (
    'seed-verified-client-6weeks',
    'Verified client',
    'I felt uncomfortable and was struggling to lose weight — always feeling down about it. Just six weeks into my journey I''ve already seen a real difference. I''m so grateful for the support and getting my confidence back. I feel absolutely amazing and would recommend to anyone struggling. The team are so supportive and always there when I need advice.',
    'Started my journey on 6 May. First weigh-in was 103.8kg — I felt uncomfortable, was struggling to lose weight, and always felt down about it. Just six weeks later I reached 92.5kg, a loss of 1st 10lb. I''m so grateful for the support and getting my confidence back. I feel absolutely amazing and would recommend to anyone struggling. Shared with permission — name withheld for privacy.',
    5, true, true
  ),
  (
    'seed-jennifer',
    'Jennifer K.',
    'I wouldn''t have been brave enough to share this before, but I''m so proud of how far I''ve come. After struggling with my mental health and confidence, I finally found a path that worked for me. I''m no longer ashamed to be in photos with my children.',
    'After my son was born my mental health plummeted — depression, anxiety and PTSD. Medication and depression led to weight gain which made me more depressed. I tried so many diets without success until I found the right support. I''m no longer ashamed to be in photos with my children and I''m so proud of how far I''ve come.',
    5, true, true
  ),
  (
    'seed-chantelle-review',
    'Chantelle A.',
    'The support I received has genuinely changed my life. I have my energy back, my confidence back, and I''m finally present in moments with my family.',
    'I''ve lost 6 stone and feel like a completely new person. The team guided me every step of the way. I can''t recommend them enough — they changed my life for the absolute better.',
    5, true, true
  ),
  (
    'seed-steph-review',
    'Steph W.',
    'After years of yo-yo dieting I finally found something that works long-term. I''m running, going to the gym, and feel better physically and mentally than I ever have.',
    'Lost over 3 stone, running 3 5ks a week despite fibromyalgia, and finally feel like this is sustainable. Changed my life for the better — thank you Chantelle and Jourdy!',
    5, true, true
  )
ON CONFLICT (seed_key) DO NOTHING;

INSERT INTO success_stories (
  seed_key, title, author_name, excerpt, content, content_private,
  before_image, after_image, image_url, is_public, is_approved
)
VALUES
  (
    'seed-chantelle',
    'Finding confidence again',
    'Chantelle A.',
    'I finally feel happy in my own skin again — with more energy and the confidence to be in photos with my children.',
    '<p>I finally feel happy in my own skin again. I have so much more energy than I''ve had in years, and for the first time in a long time I''m confident being in photos and videos with my children — not hiding behind the camera.</p><p>The support I received made all the difference. I can''t thank the team enough for helping change my life for the better.</p>',
    '<p>I wasn''t sure about starting until I saw someone I trusted doing it. I''ve lost 6 stone and had to buy a whole new wardrobe because nothing fit anymore!</p><p>I have so much more energy than I''ve had in years. I''m happy within my body again and confident enough to be in photos and videos with my children — not always hiding behind the camera.</p><p>I can''t recommend the team enough. They have helped change my life for the absolute better. Thank you so much ❤️</p>',
    '/content/success-stories/chantelle-anita-rowland-before.jpg',
    '/content/success-stories/chantelle-anita-rowland-after.jpg',
    '/content/success-stories/chantelle-anita-rowland-after.jpg',
    true, true
  ),
  (
    'seed-steph',
    'A life-changing wellness journey',
    'Steph W.',
    'After years of yo-yo dieting, I''ve transformed my physical and mental wellbeing — now running 3 times a week and feeling better than ever.',
    '<p>For years it was the same cycle — dieting, losing weight, putting it all back on and more. In January I decided enough was enough and it was time to change for good.</p><p>I''ve transformed my physical and mental wellbeing. I''ve started at the gym, I''m running regularly, and I''ve honestly never felt better. For once I know the progress is going to stay.</p>',
    '<p>Looking back at my Facebook memories it''s the same old story — on a diet, losing weight, putting it all back on and more! In January I decided enough was enough.</p><p>I found Chantelle and Jourdy and started my journey. It''s honestly changed my life! I''ve lost just over 3 stone, started at the gym, and finally been able to start running without it affecting my fibromyalgia. I''m now running 3 5ks a week!</p><p>People say it''s cheating — I say I''ve changed my life for the better. Few more stone left to lose and for once I know it''s going to come off and stay off!</p>',
    '/content/success-stories/steph-wilcock-before.jpg',
    '/content/success-stories/steph-wilcock-after.jpg',
    '/content/success-stories/steph-wilcock-after.jpg',
    true, true
  )
ON CONFLICT (seed_key) DO NOTHING;

-- ============================================================
-- 5. Public shop policies
-- ============================================================
DROP POLICY IF EXISTS "Public can view active products" ON products;
CREATE POLICY "Public can view active products"
  ON products FOR SELECT
  USING (is_active = true);

DROP POLICY IF EXISTS "Approved customers create orders" ON orders;
DROP POLICY IF EXISTS "Customers create orders" ON orders;
CREATE POLICY "Customers create orders"
  ON orders FOR INSERT
  WITH CHECK (
    auth.uid() = user_id
    AND EXISTS (
      SELECT 1 FROM profiles
      WHERE id = auth.uid()
        AND role = 'customer'
        AND status IN ('pending', 'approved')
    )
  );

-- ============================================================
-- 6. Storage buckets (images for products, blog, reviews, etc.)
-- ============================================================
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES
  ('product-images', 'product-images', true, 5242880, ARRAY['image/jpeg', 'image/png', 'image/webp']),
  ('coa-files', 'coa-files', false, 10485760, ARRAY['application/pdf', 'image/jpeg', 'image/png']),
  ('blog-images', 'blog-images', true, 5242880, ARRAY['image/jpeg', 'image/png', 'image/webp']),
  ('review-images', 'review-images', true, 5242880, ARRAY['image/jpeg', 'image/png', 'image/webp']),
  ('success-story-images', 'success-story-images', true, 5242880, ARRAY['image/jpeg', 'image/png', 'image/webp']),
  ('branding', 'branding', true, 2097152, ARRAY['image/jpeg', 'image/png', 'image/webp', 'image/svg+xml'])
ON CONFLICT (id) DO NOTHING;

DROP POLICY IF EXISTS "Public read product images" ON storage.objects;
CREATE POLICY "Public read product images"
  ON storage.objects FOR SELECT USING (bucket_id = 'product-images');
DROP POLICY IF EXISTS "Admin upload product images" ON storage.objects;
CREATE POLICY "Admin upload product images"
  ON storage.objects FOR INSERT WITH CHECK (bucket_id = 'product-images' AND (SELECT is_admin()));
DROP POLICY IF EXISTS "Admin update product images" ON storage.objects;
CREATE POLICY "Admin update product images"
  ON storage.objects FOR UPDATE USING (bucket_id = 'product-images' AND (SELECT is_admin()));
DROP POLICY IF EXISTS "Admin delete product images" ON storage.objects;
CREATE POLICY "Admin delete product images"
  ON storage.objects FOR DELETE USING (bucket_id = 'product-images' AND (SELECT is_admin()));

DROP POLICY IF EXISTS "Approved customers read COA files" ON storage.objects;
CREATE POLICY "Approved customers read COA files"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'coa-files' AND ((SELECT is_approved_customer()) OR (SELECT is_admin())));
DROP POLICY IF EXISTS "Admin upload COA files" ON storage.objects;
CREATE POLICY "Admin upload COA files"
  ON storage.objects FOR INSERT WITH CHECK (bucket_id = 'coa-files' AND (SELECT is_admin()));
DROP POLICY IF EXISTS "Admin manage COA files" ON storage.objects;
CREATE POLICY "Admin manage COA files"
  ON storage.objects FOR ALL USING (bucket_id = 'coa-files' AND (SELECT is_admin()));

DROP POLICY IF EXISTS "Public read blog images" ON storage.objects;
CREATE POLICY "Public read blog images"
  ON storage.objects FOR SELECT USING (bucket_id = 'blog-images');
DROP POLICY IF EXISTS "Admin manage blog images" ON storage.objects;
CREATE POLICY "Admin manage blog images"
  ON storage.objects FOR ALL USING (bucket_id = 'blog-images' AND (SELECT is_admin()));

DROP POLICY IF EXISTS "Public read review images" ON storage.objects;
CREATE POLICY "Public read review images"
  ON storage.objects FOR SELECT USING (bucket_id = 'review-images');
DROP POLICY IF EXISTS "Admin manage review images" ON storage.objects;
CREATE POLICY "Admin manage review images"
  ON storage.objects FOR ALL USING (bucket_id = 'review-images' AND (SELECT is_admin()));

DROP POLICY IF EXISTS "Public read success story images" ON storage.objects;
CREATE POLICY "Public read success story images"
  ON storage.objects FOR SELECT USING (bucket_id = 'success-story-images');
DROP POLICY IF EXISTS "Admin manage success story images" ON storage.objects;
CREATE POLICY "Admin manage success story images"
  ON storage.objects FOR ALL USING (bucket_id = 'success-story-images' AND (SELECT is_admin()));

DROP POLICY IF EXISTS "Public read branding" ON storage.objects;
CREATE POLICY "Public read branding"
  ON storage.objects FOR SELECT USING (bucket_id = 'branding');
DROP POLICY IF EXISTS "Admin manage branding" ON storage.objects;
CREATE POLICY "Admin manage branding"
  ON storage.objects FOR ALL USING (bucket_id = 'branding' AND (SELECT is_admin()));

-- ============================================================
-- Done — refresh Table Editor and check:
--   • site_pages, site_cards, faqs (new tables)
--   • reviews = 4 rows, success_stories = 2 rows
--   • invites table removed
-- ============================================================
