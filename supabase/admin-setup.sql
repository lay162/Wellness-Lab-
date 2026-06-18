-- Create your first admin user
-- 1. Register a user via /private-portal/register
-- 2. Find their UUID in Supabase Dashboard > Authentication > Users
-- 3. Run this SQL with their UUID:

-- UPDATE profiles
-- SET role = 'admin', status = 'approved'
-- WHERE id = 'YOUR-USER-UUID-HERE';

-- Or promote by email:
-- UPDATE profiles
-- SET role = 'admin', status = 'approved'
-- WHERE email = 'admin@yourdomain.com';
