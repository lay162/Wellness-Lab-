-- ============================================================
-- Fix shop admin profile — paste ALL of this, then Run
-- ============================================================

-- 1) Check auth user exists (should return 1 row)
SELECT id, email, created_at
FROM auth.users
WHERE email = 'support@thewellnesslab.uk';

-- 2) Create / promote profile (shows 1 row when it works)
INSERT INTO public.profiles (
  id,
  full_name,
  email,
  company_name,
  role,
  status,
  must_change_password,
  terms_accepted,
  compliance_accepted,
  reason_for_access
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
  full_name = 'Chan & Jordan — Wellness Lab',
  company_name = 'The Wellness Lab'
RETURNING id, email, role, status, must_change_password;

-- 3) If step 2 still shows nothing, run ONLY this block (uses your user UID):
/*
INSERT INTO public.profiles (
  id, full_name, email, company_name, role, status,
  must_change_password, terms_accepted, compliance_accepted, reason_for_access
)
VALUES (
  'cfcbd2d3-5915-4990-88cf-80327f4a5716',
  'Chan & Jordan — Wellness Lab',
  'support@thewellnesslab.uk',
  'The Wellness Lab',
  'admin',
  'approved',
  true,
  true,
  true,
  'Shop admin'
)
ON CONFLICT (id) DO UPDATE SET
  role = 'admin',
  status = 'approved',
  must_change_password = true,
  email = 'support@thewellnesslab.uk',
  full_name = 'Chan & Jordan — Wellness Lab',
  company_name = 'The Wellness Lab'
RETURNING id, email, role, status, must_change_password;
*/

-- 4) Final check
SELECT id, email, role, status, must_change_password
FROM public.profiles
WHERE email = 'support@thewellnesslab.uk';
