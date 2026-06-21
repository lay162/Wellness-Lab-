-- Bootstrap Chan & Jordan as shop admins (developer runs this once)

-- No invite link needed — create accounts manually in Supabase Auth first.



-- ============================================================

-- STEP 1: Supabase Dashboard → Authentication → Users → Add user

-- Create Chan and Jordan with their emails + temporary passwords

-- ============================================================



-- STEP 2: Promote both and require password change on first login

UPDATE profiles

SET role = 'admin', status = 'approved', must_change_password = true

WHERE email IN ('chan@email.com', 'jordan@email.com');



-- STEP 3: Send them login details (WhatsApp):

-- URL:  https://your-portal-url/private-portal/login?mode=admin

-- Email + temporary password you set in Step 1

-- They MUST set a new password on first sign-in



-- STEP 4: After first login, they manage everything from the dashboard:

--   Admin → Shop Team   — add more staff (same temp password flow)

--   Admin → Customers   — approve new registrations from the website

--   Admin → Orders      — manage orders



-- To deploy staff creation from dashboard (Shop Team → Add team member):

-- Developer deploys edge function once:

--   supabase functions deploy create-staff-user

