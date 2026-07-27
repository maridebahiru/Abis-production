import { createClient } from '@supabase/supabase-js';
import fs from 'fs';
import path from 'path';

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

async function checkStorage() {
  console.log('Checking Supabase Storage buckets on:', supabaseUrl);

  try {
    const { data: buckets, error } = await supabase.storage.listBuckets();
    if (error) {
      console.warn('List buckets warning:', error.message);
    } else {
      console.log('Existing storage buckets:', buckets.map((b) => b.name));
      const hasPortfolio = buckets.some((b) => b.name === 'portfolio');
      if (hasPortfolio) {
        console.log('✅ "portfolio" bucket exists!');
      } else {
        console.log('⚠️ "portfolio" bucket not found in buckets list.');
      }
    }
  } catch (e) {
    console.error('Storage check error:', e.message);
  }
}

checkStorage();
