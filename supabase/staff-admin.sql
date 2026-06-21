-- Wellness Lab — Staff admin + forced password change (run once in SQL Editor)

-- ============================================================
-- PROFILE: force password change on first login
-- ============================================================
ALTER TABLE profiles
ADD COLUMN IF NOT EXISTS must_change_password BOOLEAN NOT NULL DEFAULT false;

-- ============================================================
-- SIGNUP: staff provisioned by admin (temp password flow)
-- Open registration for customers (pending until admin approves)
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
