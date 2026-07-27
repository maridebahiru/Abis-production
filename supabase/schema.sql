-- =========================================================
-- ABIS LUXURY PHOTO STUDIO DATABASE SCHEMA (SUPABASE)
-- =========================================================

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 1. Services Table
CREATE TABLE IF NOT EXISTS public.services (
  id VARCHAR(50) PRIMARY KEY,
  title VARCHAR(100) NOT NULL,
  category VARCHAR(50) NOT NULL,
  description TEXT NOT NULL,
  cover_image TEXT NOT NULL,
  starting_price NUMERIC(10,2) NOT NULL,
  estimated_duration VARCHAR(50) NOT NULL,
  is_enabled BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now())
);

-- 2. Service Packages Table
CREATE TABLE IF NOT EXISTS public.packages (
  id VARCHAR(50) PRIMARY KEY,
  service_id VARCHAR(50) REFERENCES public.services(id) ON DELETE CASCADE,
  name VARCHAR(100) NOT NULL,
  tagline VARCHAR(150),
  price NUMERIC(10,2) NOT NULL,
  duration VARCHAR(50) NOT NULL,
  photographers_count INT DEFAULT 1,
  features JSONB NOT NULL,
  is_popular BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now())
);

-- 3. Blocked Dates & Slots Table
CREATE TABLE IF NOT EXISTS public.blocked_dates (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  blocked_date DATE NOT NULL,
  time_slot VARCHAR(20), -- NULL means full day is blocked
  reason TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now())
);

-- 4. Bookings Table
CREATE TABLE IF NOT EXISTS public.bookings (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  reference_number VARCHAR(25) UNIQUE NOT NULL, -- e.g. PHOTO-260721-0012
  service_id VARCHAR(50) NOT NULL,
  service_name VARCHAR(100) NOT NULL,
  package_name VARCHAR(100) NOT NULL,
  booking_date DATE NOT NULL,
  booking_time VARCHAR(20) NOT NULL,
  total_price NUMERIC(10, 2) NOT NULL,
  
  -- Customer Details
  customer_name VARCHAR(150) NOT NULL,
  customer_phone VARCHAR(50) NOT NULL,
  customer_email VARCHAR(150) NOT NULL,
  event_address TEXT NOT NULL,
  event_type VARCHAR(100) NOT NULL,
  number_of_guests INT,
  additional_notes TEXT,
  
  -- Payment & Proof
  payment_method VARCHAR(50) NOT NULL,
  amount_paid NUMERIC(10, 2) NOT NULL,
  transaction_id VARCHAR(100),
  receipt_url TEXT,
  receipt_file_name VARCHAR(255),
  receipt_file_type VARCHAR(50),
  
  -- Statuses
  payment_status VARCHAR(50) DEFAULT 'Pending Review' CHECK (payment_status IN ('Pending Review', 'Verified', 'Rejected')),
  booking_status VARCHAR(50) DEFAULT 'Pending Payment Verification' CHECK (booking_status IN ('Pending Payment Verification', 'Payment Verified', 'Booking Confirmed', 'Completed', 'Cancelled')),
  
  -- Client Photo Gallery Access
  gallery_pin VARCHAR(6),
  gallery_photos JSONB DEFAULT '[]'::jsonb,
  
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 5. Portfolio Items Table
CREATE TABLE IF NOT EXISTS public.portfolio_items (
  id VARCHAR(50) PRIMARY KEY,
  title VARCHAR(150) NOT NULL,
  category VARCHAR(50) NOT NULL,
  image TEXT NOT NULL,
  client_name VARCHAR(100),
  date VARCHAR(50),
  description TEXT,
  bts_video_url TEXT,
  testimonial JSONB,
  is_featured BOOLEAN DEFAULT false,
  display_order INT DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now())
);

-- 6. Payment Settings Table
CREATE TABLE IF NOT EXISTS public.payment_settings (
  method VARCHAR(50) PRIMARY KEY,
  account_name VARCHAR(150) NOT NULL,
  account_number VARCHAR(100) NOT NULL,
  instructions TEXT NOT NULL,
  qr_code_url TEXT,
  color VARCHAR(100) DEFAULT 'from-gold-500 to-amber-600',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now())
);

-- 7. Website Content Settings Table
CREATE TABLE IF NOT EXISTS public.site_settings (
  key VARCHAR(50) PRIMARY KEY,
  value JSONB NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now())
);

-- 8. Admin Users Table
CREATE TABLE IF NOT EXISTS public.admin_users (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  email VARCHAR(150) UNIQUE NOT NULL,
  role VARCHAR(50) DEFAULT 'admin',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now())
);

-- Seed default admin user record
INSERT INTO public.admin_users (email, role)
VALUES ('admin@luxphotography.com', 'admin')
ON CONFLICT (email) DO NOTHING;

-- =========================================================
-- ROW LEVEL SECURITY (RLS) POLICIES
-- =========================================================

ALTER TABLE public.services ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.packages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.blocked_dates ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.bookings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.portfolio_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.payment_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.site_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.admin_users ENABLE ROW LEVEL SECURITY;

-- Public Read Policies
CREATE POLICY "Allow public read services" ON public.services FOR SELECT USING (true);
CREATE POLICY "Allow public read packages" ON public.packages FOR SELECT USING (true);
CREATE POLICY "Allow public read blocked dates" ON public.blocked_dates FOR SELECT USING (true);
CREATE POLICY "Allow public read portfolio" ON public.portfolio_items FOR SELECT USING (true);
CREATE POLICY "Allow public read payment settings" ON public.payment_settings FOR SELECT USING (true);
CREATE POLICY "Allow public read site settings" ON public.site_settings FOR SELECT USING (true);
CREATE POLICY "Allow public read admin users" ON public.admin_users FOR SELECT USING (true);

-- Booking Lookup & Public Insertion
CREATE POLICY "Allow public insert bookings" ON public.bookings FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow booking reference lookup" ON public.bookings FOR SELECT USING (true);

-- Admin Full Access Policies
CREATE POLICY "Allow admin full manage bookings" ON public.bookings FOR ALL USING (auth.role() = 'authenticated');
CREATE POLICY "Allow admin full manage blocked dates" ON public.blocked_dates FOR ALL USING (auth.role() = 'authenticated');
CREATE POLICY "Allow admin manage services" ON public.services FOR ALL USING (auth.role() = 'authenticated');
CREATE POLICY "Allow admin manage packages" ON public.packages FOR ALL USING (auth.role() = 'authenticated');
CREATE POLICY "Allow admin manage portfolio" ON public.portfolio_items FOR ALL USING (auth.role() = 'authenticated');
CREATE POLICY "Allow admin manage payment settings" ON public.payment_settings FOR ALL USING (auth.role() = 'authenticated');
CREATE POLICY "Allow admin manage site settings" ON public.site_settings FOR ALL USING (auth.role() = 'authenticated');
CREATE POLICY "Allow admin manage admin users" ON public.admin_users FOR ALL USING (auth.role() = 'authenticated');
