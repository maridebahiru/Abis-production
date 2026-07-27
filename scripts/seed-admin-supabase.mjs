import { createClient } from '@supabase/supabase-js';
import fs from 'fs';
import path from 'path';

// Parse .env.local manually if dotenv is not installed
function loadEnvLocal() {
  const envPath = path.resolve(process.cwd(), '.env.local');
  if (fs.existsSync(envPath)) {
    const content = fs.readFileSync(envPath, 'utf8');
    content.split('\n').forEach((line) => {
      const match = line.match(/^\s*([\w.-]+)\s*=\s*(.*)?\s*$/);
      if (match) {
        const key = match[1];
        let value = match[2] || '';
        if (value.startsWith('"') && value.endsWith('"')) value = value.slice(1, -1);
        if (value.startsWith("'") && value.endsWith("'")) value = value.slice(1, -1);
        process.env[key] = value;
      }
    });
  }
}

loadEnvLocal();

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('Supabase credentials missing in .env.local');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function seedAdmin() {
  console.log('Seeding admin user to Supabase:', supabaseUrl);

  try {
    // 1. Register in public.admin_users
    const { error: adminErr } = await supabase
      .from('admin_users')
      .upsert([{ email: 'admin@abisproduction.com', role: 'admin' }], { onConflict: 'email' });

    if (adminErr) {
      console.warn('public.admin_users upsert warning:', adminErr.message);
    } else {
      console.log('✅ Registered in public.admin_users table!');
    }
  } catch (e) {
    console.warn('public.admin_users exception:', e.message);
  }

  try {
    // 2. Sign up in Supabase Auth
    const { data: authData, error: authErr } = await supabase.auth.signUp({
      email: 'admin@abisproduction.com',
      password: 'AdminPassword123!',
      options: {
        data: { name: 'Abis Studio Admin' }
      }
    });

    if (authErr) {
      console.log('Supabase Auth status:', authErr.message);
    } else if (authData.user) {
      console.log('✅ Registered in Supabase Auth (auth.users)! User ID:', authData.user.id);
    }
  } catch (e) {
    console.warn('Supabase Auth exception:', e.message);
  }
}

seedAdmin();
