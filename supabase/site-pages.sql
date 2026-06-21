-- Wellness Lab — editable page content (run once in Supabase SQL Editor)
-- Lets owners edit homepage, about, wellness, how-it-works, FAQs heroes, and card sections.

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

-- Triggers
DROP TRIGGER IF EXISTS site_pages_updated_at ON site_pages;
CREATE TRIGGER site_pages_updated_at
  BEFORE UPDATE ON site_pages
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- RLS
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
