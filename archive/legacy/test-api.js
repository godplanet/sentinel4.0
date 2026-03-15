const { createClient } = require('@supabase/supabase-js');
const rootUrl = 'http://127.0.0.1:54321';
const anonKey = process.env.VITE_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...'; // need to grab from .env
const VITE_SUPABASE_URL = "https://zgygkehcysfhyhcrwnsw.supabase.co";
const VITE_SUPABASE_ANON_KEY = "sb_publishable_3Zs9LC7ClXekefxZuZrU0Q_Ps4Nv-L0";
const fs = require('fs');
const envStr = fs.readFileSync('/Users/hilmiduru/Documents/Sentinel v3.0 Cursor/sentinel_v3.0/.env', 'utf8');
const url = envStr.match(/VITE_SUPABASE_URL=(.*)/)[1];
const key = envStr.match(/VITE_SUPABASE_ANON_KEY=(.*)/)[1];
const sb = createClient(url, key);
async function run() {
  const { data, error } = await sb.from('culture_surveys').select('*').limit(5);
  console.log("Error:", error);
  console.log("Data length:", data?.length);
}
run();
