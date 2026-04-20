import { createClient } from '@supabase/supabase-js';
import fs from 'fs';

const env = fs.readFileSync('.env', 'utf8');
const getEnv = (key) => {
  const match = env.match(new RegExp(`${key}=(.*)`));
  return match ? match[1].trim() : '';
};

const supabaseUrl = getEnv('VITE_SUPABASE_URL');
const supabaseKey = getEnv('VITE_SUPABASE_ANON_KEY');

if (!supabaseUrl || !supabaseKey) {
  console.error('Missing Supabase credentials');
  console.log('ENV keys found:', !!supabaseUrl, !!supabaseKey);
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function checkData() {
  const { data: activityClasses } = await supabase.from('activity_classes').select('id, name, code');
  const { data: certificateClasses } = await supabase.from('certificate_classes').select('id, name, code');
  
  console.log('--- ACTIVITY CLASSES ---');
  console.log(JSON.stringify(activityClasses, null, 2));
  console.log('--- CERTIFICATE CLASSES ---');
  console.log(JSON.stringify(certificateClasses, null, 2));
}

checkData();
