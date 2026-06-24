-- ============================================================
-- Wellness Lab — Shop admin + Auth / SMTP checklist
-- Run in Supabase SQL Editor AFTER creating the auth user.
-- ============================================================

-- Promote support@ mailbox login (Chan & Jordan shared shop admin)
-- Run AFTER creating the user in Authentication → Users.
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION handle_new_user();

INSERT INTO public.profiles (
  id, full_name, email, company_name, role, status,
  must_change_password, terms_accepted, compliance_accepted, reason_for_access
)
SELECT
  u.id,
  'Chan & Jordan — Wellness Lab',
  u.email,
  'The Wellness Lab',
  'admin',
  'approved',
  true,
  true,
  true,
  'Shop admin'
FROM auth.users u
WHERE u.email = 'support@thewellnesslab.uk'
ON CONFLICT (id) DO UPDATE SET
  role = 'admin',
  status = 'approved',
  must_change_password = true,
  email = EXCLUDED.email,
  full_name = CASE
    WHEN profiles.full_name IS NULL OR profiles.full_name = '' THEN EXCLUDED.full_name
    ELSE profiles.full_name
  END,
  company_name = CASE
    WHEN profiles.company_name IS NULL OR profiles.company_name = '' THEN EXCLUDED.company_name
    ELSE profiles.company_name
  END;

-- Or run from your machine (recommended — sets password too):
--   node scripts/provision-shop-admin.mjs
-- Requires SUPABASE_SERVICE_ROLE_KEY in .env (remove after use).

-- ============================================================
-- A. Supabase → Authentication → URL configuration
-- ============================================================
-- Site URL:
--   https://thewellnesslab.uk
--
-- Redirect URLs (add all):
--   https://thewellnesslab.uk/**
--   http://localhost:5173/**

-- ============================================================
-- B. Supabase → Authentication → SMTP Settings (custom SMTP)
-- ============================================================
-- Enable custom SMTP, then use GoDaddy Microsoft 365 settings:
--
--   Host:         smtp.office365.com
--   Port:         587
--   Username:     support@thewellnesslab.uk
--   Password:     (mailbox password — same as webmail login)
--   Sender email: support@thewellnesslab.uk
--   Sender name:  Wellness Lab
--
-- In GoDaddy Email & Office → support@ → Manage → Account information
-- → Advanced settings → turn ON "SMTP Authentication".
--
-- Send a test from Supabase SMTP settings after saving.

-- ============================================================
-- C. Login details for Chan & Jordan (shared admin account)
-- ============================================================
-- URL:      https://thewellnesslab.uk/private-portal/login?mode=admin
-- Email:    support@thewellnesslab.uk
-- Password: WellnessLab26  (temporary — must change on first login)
--
-- One mailbox = one login. Both can use the same credentials.
-- For separate logins later, add mailboxes e.g. chan@ / jordan@ and
-- create extra staff users from Admin → Shop Team.

-- ============================================================
-- D. GoDaddy DNS recheck email
-- ============================================================
-- The "Recheck DNS" test email goes TO support@thewellnesslab.uk.
-- Only Chan/Jordan (or anyone with that mailbox password) can see it.
-- DNS is already correct if inbound mail works (MX → Outlook protection).
