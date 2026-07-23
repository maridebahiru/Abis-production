import { createBrowserClient } from '@supabase/ssr';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://lhhpioouvvbyhbiapaqh.supabase.co';
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'sb_publishable_xFLs7m2FD5fm9Hl4FMP-8Q_NkNfXZ5I';

export const createClient = () =>
  createBrowserClient(
    supabaseUrl,
    supabaseKey
  );
