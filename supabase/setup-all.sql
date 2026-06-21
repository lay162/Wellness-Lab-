-- Wellness Lab — ONE-FILE SETUP
-- Paste this entire file into Supabase → SQL Editor → Run once.
-- (Same as running schema.sql + rls.sql + storage.sql in order.)

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================================
-- PROFILES
-- ============================================================
CREATE TABLE IF NOT EXISTS profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name TEXT NOT NULL,
  email TEXT NOT NULL,
  phone TEXT,
  company_name TEXT,
  reason_for_access TEXT,
  role TEXT NOT NULL DEFAULT 'customer' CHECK (role IN ('customer', 'admin')),
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected', 'suspended')),
  terms_accepted BOOLEAN DEFAULT false,
  compliance_accepted BOOLEAN DEFAULT false,
  must_change_password BOOLEAN NOT NULL DEFAULT false,
  avatar_url TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_profiles_status ON profiles(status);
CREATE INDEX IF NOT EXISTS idx_profiles_role ON profiles(role);
CREATE INDEX IF NOT EXISTS idx_profiles_email ON profiles(email);

-- ============================================================
-- PRODUCTS
-- ============================================================
CREATE TABLE IF NOT EXISTS products (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  description TEXT,
  price DECIMAL(10,2) NOT NULL DEFAULT 0,
  price_on_enquiry BOOLEAN DEFAULT false,
  stock INTEGER DEFAULT 0,
  image_url TEXT,
  coa_url TEXT,
  sku TEXT,
  category TEXT,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_products_active ON products(is_active);

-- ============================================================
-- ORDERS
-- ============================================================
CREATE TABLE IF NOT EXISTS orders (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  status TEXT NOT NULL DEFAULT 'requested' CHECK (status IN (
    'requested', 'awaiting_payment', 'payment_received', 'processing',
    'shipped', 'completed', 'cancelled', 'rejected'
  )),
  payment_status TEXT NOT NULL DEFAULT 'pending' CHECK (payment_status IN (
    'pending', 'awaiting_payment', 'paid', 'cash_due_on_delivery',
    'completed', 'cancelled'
  )),
  payment_method TEXT CHECK (payment_method IN (
    'bank_transfer', 'cash_on_collection', 'cash_on_delivery',
    'sumup_link', 'manual'
  )),
  payment_link TEXT,
  shipping_notes TEXT,
  admin_notes TEXT,
  total_amount DECIMAL(10,2) NOT NULL DEFAULT 0,
  customer_notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_orders_user ON orders(user_id);
CREATE INDEX IF NOT EXISTS idx_orders_status ON orders(status);

-- ============================================================
-- ORDER ITEMS
-- ============================================================
CREATE TABLE IF NOT EXISTS order_items (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  order_id UUID NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
  product_id UUID NOT NULL REFERENCES products(id),
  product_name TEXT NOT NULL,
  quantity INTEGER NOT NULL CHECK (quantity > 0),
  unit_price DECIMAL(10,2) NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_order_items_order ON order_items(order_id);

-- ============================================================
-- BLOG POSTS
-- ============================================================
CREATE TABLE IF NOT EXISTS blog_posts (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  title TEXT NOT NULL,
  slug TEXT NOT NULL UNIQUE,
  excerpt TEXT,
  content TEXT,
  category TEXT,
  featured BOOLEAN DEFAULT false,
  image_url TEXT,
  is_published BOOLEAN DEFAULT false,
  seed_key TEXT UNIQUE,
  author_id UUID REFERENCES profiles(id),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_blog_published ON blog_posts(is_published);
CREATE INDEX IF NOT EXISTS idx_blog_slug ON blog_posts(slug);

-- ============================================================
-- REVIEWS
-- ============================================================
CREATE TABLE IF NOT EXISTS reviews (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  author_name TEXT NOT NULL,
  content TEXT NOT NULL,
  rating INTEGER CHECK (rating >= 1 AND rating <= 5),
  image_url TEXT,
  content_private TEXT,
  seed_key TEXT UNIQUE,
  is_public BOOLEAN DEFAULT false,
  is_approved BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================
-- SUCCESS STORIES
-- ============================================================
CREATE TABLE IF NOT EXISTS success_stories (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  title TEXT NOT NULL,
  content TEXT NOT NULL,
  author_name TEXT,
  excerpt TEXT,
  image_url TEXT,
  before_image TEXT,
  after_image TEXT,
  content_private TEXT,
  seed_key TEXT UNIQUE,
  is_public BOOLEAN DEFAULT false,
  is_approved BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================
-- AFTERCARE POSTS
-- ============================================================
CREATE TABLE IF NOT EXISTS aftercare_posts (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  title TEXT NOT NULL,
  content TEXT NOT NULL,
  category TEXT,
  is_public BOOLEAN DEFAULT false,
  is_published BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================
-- WELLNESS ADVICE (private portal only)
-- ============================================================
CREATE TABLE IF NOT EXISTS wellness_advice (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  title TEXT NOT NULL,
  content TEXT NOT NULL,
  category TEXT,
  is_published BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================
-- LEGAL PAGES
-- ============================================================
CREATE TABLE IF NOT EXISTS legal_pages (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  slug TEXT NOT NULL UNIQUE,
  title TEXT NOT NULL,
  content TEXT,
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================
-- AUTO-CREATE PROFILE ON SIGNUP (open registration)
-- ============================================================
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

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION handle_new_user();

-- ============================================================
-- UPDATED_AT TRIGGER
-- ============================================================
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER profiles_updated_at BEFORE UPDATE ON profiles FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER products_updated_at BEFORE UPDATE ON products FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER orders_updated_at BEFORE UPDATE ON orders FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER blog_posts_updated_at BEFORE UPDATE ON blog_posts FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER aftercare_posts_updated_at BEFORE UPDATE ON aftercare_posts FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER wellness_advice_updated_at BEFORE UPDATE ON wellness_advice FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER legal_pages_updated_at BEFORE UPDATE ON legal_pages FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- ============================================================
-- SEED LEGAL PAGES
-- ============================================================
INSERT INTO legal_pages (slug, title, content) VALUES
  ('privacy-policy', 'Privacy Policy', '<p>Your privacy is important to us. This policy explains how we collect, use, and protect your personal information.</p>'),
  ('terms-and-conditions', 'Terms and Conditions', '<p>These terms govern your use of our services. By accessing our platform, you agree to these terms.</p>'),
  ('cookies', 'Cookie Policy', '<p>We use cookies to improve your experience. This policy explains what cookies we use and why.</p>'),
  ('legal-disclaimer', 'Legal Disclaimer', '<p>The information provided on this website is for general wellness and educational purposes only.</p>'),
  ('compliance', 'Compliance Information', '<p>We are committed to operating with full regulatory compliance and transparency.</p>')
ON CONFLICT (slug) DO NOTHING;
-- Wellness Lab Platform — Row Level Security Policies
-- Run AFTER schema.sql in Supabase SQL Editor

-- ============================================================
-- HELPER FUNCTIONS
-- ============================================================
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

CREATE OR REPLACE FUNCTION get_user_status()
RETURNS TEXT AS $$
  SELECT status FROM profiles WHERE id = auth.uid();
$$ LANGUAGE sql SECURITY DEFINER STABLE;

-- ============================================================
-- ENABLE RLS
-- ============================================================
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE products ENABLE ROW LEVEL SECURITY;
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE order_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE blog_posts ENABLE ROW LEVEL SECURITY;
ALTER TABLE reviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE success_stories ENABLE ROW LEVEL SECURITY;
ALTER TABLE aftercare_posts ENABLE ROW LEVEL SECURITY;
ALTER TABLE wellness_advice ENABLE ROW LEVEL SECURITY;
ALTER TABLE legal_pages ENABLE ROW LEVEL SECURITY;
-- ============================================================
-- PROFILES
-- ============================================================
CREATE POLICY "Users can view own profile"
  ON profiles FOR SELECT
  USING (auth.uid() = id OR is_admin());

CREATE POLICY "Users can update own profile"
  ON profiles FOR UPDATE
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id AND role = (SELECT role FROM profiles WHERE id = auth.uid()));

CREATE POLICY "Admin can update all profiles"
  ON profiles FOR UPDATE
  USING (is_admin());

CREATE POLICY "Admin can view all profiles"
  ON profiles FOR SELECT
  USING (is_admin());

-- ============================================================
-- PRODUCTS — public catalogue + admin
-- ============================================================
CREATE POLICY "Public can view active products"
  ON products FOR SELECT
  USING (is_active = true);

CREATE POLICY "Admin full access to products"
  ON products FOR ALL
  USING (is_admin());

-- ============================================================
-- ORDERS
-- ============================================================
CREATE POLICY "Customers view own orders"
  ON orders FOR SELECT
  USING (auth.uid() = user_id OR is_admin());

CREATE POLICY "Customers create orders"
  ON orders FOR INSERT
  WITH CHECK (
    auth.uid() = user_id
    AND EXISTS (
      SELECT 1 FROM profiles
      WHERE id = auth.uid() AND role = 'customer' AND status IN ('pending', 'approved')
    )
  );

CREATE POLICY "Admin manage orders"
  ON orders FOR ALL
  USING (is_admin());

CREATE POLICY "Customers update own pending orders"
  ON orders FOR UPDATE
  USING (auth.uid() = user_id AND status = 'requested')
  WITH CHECK (auth.uid() = user_id);

-- ============================================================
-- ORDER ITEMS
-- ============================================================
CREATE POLICY "View order items for own orders"
  ON order_items FOR SELECT
  USING (
    EXISTS (SELECT 1 FROM orders WHERE orders.id = order_items.order_id AND (orders.user_id = auth.uid() OR is_admin()))
  );

CREATE POLICY "Insert order items for own orders"
  ON order_items FOR INSERT
  WITH CHECK (
    EXISTS (SELECT 1 FROM orders WHERE orders.id = order_items.order_id AND orders.user_id = auth.uid())
  );

CREATE POLICY "Admin manage order items"
  ON order_items FOR ALL
  USING (is_admin());

-- ============================================================
-- BLOG POSTS — public published OR admin
-- ============================================================
CREATE POLICY "Public can view published blog posts"
  ON blog_posts FOR SELECT
  USING (is_published = true);

CREATE POLICY "Admin full access to blog"
  ON blog_posts FOR ALL
  USING (is_admin());

-- ============================================================
-- REVIEWS
-- ============================================================
CREATE POLICY "Public can view approved public reviews"
  ON reviews FOR SELECT
  USING (is_public = true AND is_approved = true);

CREATE POLICY "Approved customers view all approved reviews"
  ON reviews FOR SELECT
  USING (is_approved_customer() AND is_approved = true);

CREATE POLICY "Admin full access to reviews"
  ON reviews FOR ALL
  USING (is_admin());

-- ============================================================
-- SUCCESS STORIES
-- ============================================================
CREATE POLICY "Public can view approved public success stories"
  ON success_stories FOR SELECT
  USING (is_public = true AND is_approved = true);

CREATE POLICY "Approved customers view all approved success stories"
  ON success_stories FOR SELECT
  USING (is_approved_customer() AND is_approved = true);

CREATE POLICY "Admin full access to success stories"
  ON success_stories FOR ALL
  USING (is_admin());

-- ============================================================
-- AFTERCARE POSTS
-- ============================================================
CREATE POLICY "Public can view public published aftercare"
  ON aftercare_posts FOR SELECT
  USING (is_public = true AND is_published = true);

CREATE POLICY "Approved customers view all published aftercare"
  ON aftercare_posts FOR SELECT
  USING (is_approved_customer() AND is_published = true);

CREATE POLICY "Admin full access to aftercare"
  ON aftercare_posts FOR ALL
  USING (is_admin());

-- ============================================================
-- WELLNESS ADVICE — private portal only
-- ============================================================
CREATE POLICY "Approved customers view published advice"
  ON wellness_advice FOR SELECT
  USING (is_approved_customer() AND is_published = true);

CREATE POLICY "Admin full access to wellness advice"
  ON wellness_advice FOR ALL
  USING (is_admin());

-- ============================================================
-- LEGAL PAGES — public read, admin write
-- ============================================================
CREATE POLICY "Public can view legal pages"
  ON legal_pages FOR SELECT
  USING (true);

CREATE POLICY "Admin manage legal pages"
  ON legal_pages FOR ALL
  USING (is_admin());

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

-- ============================================================
-- SITE PAGE CONTENT (homepage, about, FAQs, etc.)
-- See also: supabase/site-pages.sql
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
