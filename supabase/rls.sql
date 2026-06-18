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
-- PRODUCTS — approved customers and admin only
-- ============================================================
CREATE POLICY "Approved customers can view active products"
  ON products FOR SELECT
  USING (is_approved_customer() AND is_active = true);

CREATE POLICY "Admin full access to products"
  ON products FOR ALL
  USING (is_admin());

-- ============================================================
-- ORDERS
-- ============================================================
CREATE POLICY "Customers view own orders"
  ON orders FOR SELECT
  USING (auth.uid() = user_id OR is_admin());

CREATE POLICY "Approved customers create orders"
  ON orders FOR INSERT
  WITH CHECK (auth.uid() = user_id AND is_approved_customer());

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
