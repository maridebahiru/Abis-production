-- =========================================================
-- SECURITY HARDENING MIGRATION SCRIPT FOR SUPABASE
-- Abis Production Luxury Photo Studio
-- Safe to execute directly in Supabase SQL Editor
-- =========================================================

-- Enable pgcrypto for password & PIN hashing
CREATE EXTENSION IF NOT EXISTS pgcrypto;

-- 1. CREATE AUDIT LOGS TABLE
CREATE TABLE IF NOT EXISTS public.audit_logs (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  actor_email VARCHAR(150) NOT NULL,
  action VARCHAR(100) NOT NULL,
  target_table VARCHAR(100) NOT NULL,
  target_id VARCHAR(150),
  details JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

ALTER TABLE public.audit_logs ENABLE ROW LEVEL SECURITY;

-- 2. HARDEN RLS ON ALL TABLES

-- 2A. AUDIT LOGS POLICIES
DROP POLICY IF EXISTS "Super admin view audit logs" ON public.audit_logs;
CREATE POLICY "Super admin view audit logs" ON public.audit_logs
  FOR SELECT USING (
    auth.jwt() ->> 'email' IN (
      SELECT email FROM public.admin_users WHERE role = 'super_admin'
    )
  );

DROP POLICY IF EXISTS "Admins insert audit logs" ON public.audit_logs;
CREATE POLICY "Admins insert audit logs" ON public.audit_logs
  FOR INSERT WITH CHECK (
    auth.role() = 'authenticated'
  );

-- 2B. ADMIN USERS TABLE RLS (SUPER_ADMIN ONLY WRITE)
ALTER TABLE public.admin_users ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Allow public read admin users" ON public.admin_users;
DROP POLICY IF EXISTS "Allow admin read admin users" ON public.admin_users;
DROP POLICY IF EXISTS "Allow admin manage admin users" ON public.admin_users;

-- Admin users readable by authenticated admins or user self-check
CREATE POLICY "Allow admin read admin users" ON public.admin_users
  FOR SELECT USING (
    auth.role() = 'authenticated' AND
    auth.jwt() ->> 'email' IN (SELECT email FROM public.admin_users)
  );

-- Only super_admin can insert, update, or delete admin users
CREATE POLICY "Super admin manage admin users" ON public.admin_users
  FOR ALL USING (
    auth.jwt() ->> 'email' IN (
      SELECT email FROM public.admin_users WHERE role = 'super_admin'
    )
  );

-- 2C. PAYMENT SETTINGS TABLE RLS (SUPER_ADMIN ONLY EDIT)
ALTER TABLE public.payment_settings ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Allow public read payment settings" ON public.payment_settings;
DROP POLICY IF EXISTS "Allow admin manage payment settings" ON public.payment_settings;

CREATE POLICY "Allow public read payment settings" ON public.payment_settings
  FOR SELECT USING (true);

CREATE POLICY "Super admin edit payment settings" ON public.payment_settings
  FOR ALL USING (
    auth.jwt() ->> 'email' IN (
      SELECT email FROM public.admin_users WHERE role = 'super_admin'
    )
  );

-- 2D. BOOKINGS TABLE RLS (PREVENT PUBLIC DUMP OF CUSTOMER PII)
ALTER TABLE public.bookings ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Allow public insert bookings" ON public.bookings;
DROP POLICY IF EXISTS "Allow booking reference lookup" ON public.bookings;
DROP POLICY IF EXISTS "Allow admin full manage bookings" ON public.bookings;

-- Public can ONLY insert new bookings (with validation check)
CREATE POLICY "Allow public insert bookings" ON public.bookings
  FOR INSERT WITH CHECK (
    customer_name IS NOT NULL AND
    customer_email IS NOT NULL AND
    customer_phone IS NOT NULL
  );

-- Authenticated admins can view, update, delete bookings
CREATE POLICY "Allow admin full manage bookings" ON public.bookings
  FOR ALL USING (
    auth.jwt() ->> 'email' IN (SELECT email FROM public.admin_users)
  );

-- 3. SECURE CLIENT BOOKING LOOKUP FUNCTION (PREVENTS PUBLIC TABLE DUMP)
CREATE OR REPLACE FUNCTION public.lookup_client_booking(
  p_ref_number TEXT,
  p_email TEXT
)
RETURNS SETOF public.bookings
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  RETURN QUERY
  SELECT *
  FROM public.bookings
  WHERE UPPER(reference_number) = UPPER(TRIM(p_ref_number))
    AND LOWER(customer_email) = LOWER(TRIM(p_email));
END;
$$;

-- 4. SECURE PIN VERIFICATION FUNCTION (SALTED BCRYPT / CRYPT COMPARISON)
CREATE OR REPLACE FUNCTION public.verify_client_gallery_pin(
  p_ref_number TEXT,
  p_pin TEXT
)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_stored_pin TEXT;
BEGIN
  SELECT gallery_pin INTO v_stored_pin
  FROM public.bookings
  WHERE UPPER(reference_number) = UPPER(TRIM(p_ref_number));

  IF v_stored_pin IS NULL THEN
    RETURN FALSE;
  END IF;

  -- Check if stored pin is hashed or legacy plaintext
  IF v_stored_pin LIKE '$2%' OR v_stored_pin LIKE '$1%' THEN
    RETURN (v_stored_pin = crypt(p_pin, v_stored_pin));
  ELSE
    RETURN (v_stored_pin = TRIM(p_pin));
  END IF;
END;
$$;

-- 5. AUTOMATIC AUDIT LOGGING TRIGGERS FOR ADMIN USERS & PAYMENT SETTINGS
CREATE OR REPLACE FUNCTION public.log_admin_user_changes()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  IF (TG_OP = 'INSERT') THEN
    INSERT INTO public.audit_logs(actor_email, action, target_table, target_id, details)
    VALUES (
      COALESCE(auth.jwt() ->> 'email', 'system'),
      'CREATE_ADMIN_USER',
      'admin_users',
      NEW.id::text,
      jsonb_build_object('email', NEW.email, 'role', NEW.role)
    );
  ELSIF (TG_OP = 'UPDATE') THEN
    INSERT INTO public.audit_logs(actor_email, action, target_table, target_id, details)
    VALUES (
      COALESCE(auth.jwt() ->> 'email', 'system'),
      'UPDATE_ADMIN_ROLE',
      'admin_users',
      NEW.id::text,
      jsonb_build_object('email', NEW.email, 'old_role', OLD.role, 'new_role', NEW.role)
    );
  ELSIF (TG_OP = 'DELETE') THEN
    INSERT INTO public.audit_logs(actor_email, action, target_table, target_id, details)
    VALUES (
      COALESCE(auth.jwt() ->> 'email', 'system'),
      'REVOKE_ADMIN_USER',
      'admin_users',
      OLD.id::text,
      jsonb_build_object('email', OLD.email, 'role', OLD.role)
    );
  END IF;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_audit_admin_users ON public.admin_users;
CREATE TRIGGER trg_audit_admin_users
AFTER INSERT OR UPDATE OR DELETE ON public.admin_users
FOR EACH ROW EXECUTE FUNCTION public.log_admin_user_changes();

CREATE OR REPLACE FUNCTION public.log_payment_setting_changes()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  INSERT INTO public.audit_logs(actor_email, action, target_table, target_id, details)
  VALUES (
    COALESCE(auth.jwt() ->> 'email', 'system'),
    'UPDATE_PAYMENT_SETTING',
    'payment_settings',
    NEW.method,
    jsonb_build_object('method', NEW.method, 'account_name', NEW.account_name, 'account_number', NEW.account_number)
  );
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_audit_payment_settings ON public.payment_settings;
CREATE TRIGGER trg_audit_payment_settings
AFTER INSERT OR UPDATE OR DELETE ON public.payment_settings
FOR EACH ROW EXECUTE FUNCTION public.log_payment_setting_changes();
