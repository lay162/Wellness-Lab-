-- Wellness Lab — public shop (run once in Supabase SQL Editor)
-- Lets anyone browse products on the website; logged-in customers can place orders.

-- Products visible to everyone (website + app)
DROP POLICY IF EXISTS "Public can view active products" ON products;
CREATE POLICY "Public can view active products"
  ON products FOR SELECT
  USING (is_active = true);

-- Any logged-in customer can place an order (pending approval no longer blocks checkout)
DROP POLICY IF EXISTS "Approved customers create orders" ON orders;
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

-- New signups are approved immediately so they can shop on website and app
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
