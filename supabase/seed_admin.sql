-- =========================================================
-- ABIS PRODUCTION - SEED ADMIN USER IN SUPABASE DATABASE
-- =========================================================
-- Run this SQL in your Supabase Dashboard -> SQL Editor
-- to register the admin user into Supabase Auth and public.admin_users table.

-- 1. Create public.admin_users Table
CREATE TABLE IF NOT EXISTS public.admin_users (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  email VARCHAR(150) UNIQUE NOT NULL,
  role VARCHAR(50) DEFAULT 'admin',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now())
);

ALTER TABLE public.admin_users ENABLE ROW LEVEL SECURITY;

DO $$ BEGIN
  CREATE POLICY "Allow public read admin_users" ON public.admin_users FOR SELECT USING (true);
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  CREATE POLICY "Allow authenticated manage admin_users" ON public.admin_users FOR ALL USING (auth.role() = 'authenticated');
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

-- 2. Seed Default Admin Email in public.admin_users
INSERT INTO public.admin_users (email, role)
VALUES ('admin@luxphotography.com', 'admin')
ON CONFLICT (email) DO NOTHING;

-- 3. Register & Confirm Admin User in Supabase Auth (auth.users)
-- Credentials:
-- Email: admin@luxphotography.com
-- Password: AdminPassword123!
DO $$
DECLARE
  new_user_id UUID := gen_random_uuid();
BEGIN
  IF NOT EXISTS (SELECT 1 FROM auth.users WHERE email = 'admin@luxphotography.com') THEN
    INSERT INTO auth.users (
      instance_id,
      id,
      aud,
      role,
      email,
      encrypted_password,
      email_confirmed_at,
      recovery_sent_at,
      last_sign_in_at,
      raw_app_meta_data,
      raw_user_meta_data,
      is_super_admin,
      created_at,
      updated_at,
      confirmation_token,
      email_change,
      email_change_token_new,
      recovery_token
    ) VALUES (
      '00000000-0000-0000-0000-000000000000',
      new_user_id,
      'authenticated',
      'authenticated',
      'admin@luxphotography.com',
      crypt('AdminPassword123!', gen_salt('bf')),
      now(),
      now(),
      now(),
      '{"provider":"email","providers":["email"]}',
      '{"name":"Abis Studio Admin"}',
      false,
      now(),
      now(),
      '',
      '',
      '',
      ''
    );

    -- Insert into auth.identities for email provider
    INSERT INTO auth.identities (
      id,
      user_id,
      identity_data,
      provider,
      last_sign_in_at,
      created_at,
      updated_at,
      provider_id
    ) VALUES (
      new_user_id,
      new_user_id,
      format('{"sub":"%s","email":"%s"}', new_user_id, 'admin@luxphotography.com')::jsonb,
      'email',
      now(),
      now(),
      now(),
      'admin@luxphotography.com'
    );
  END IF;
END $$;
