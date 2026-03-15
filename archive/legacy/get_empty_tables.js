import dotenv from 'dotenv';
import { createClient } from '@supabase/supabase-js';
import fs from 'fs';

dotenv.config();

const supabaseUrl = process.env.VITE_SUPABASE_URL;
// We need the service role key to bypass RLS to check actual counts
const supabaseKey = process.env.VITE_SUPABASE_SERVICE_ROLE_KEY || process.env.VITE_SUPABASE_ANON_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

async function checkTables() {
  const allTables = fs.readFileSync('all_tables.txt', 'utf8').split('\n').filter(t => t.trim() !== '');
  const emptyTables = [];
  
  for (const table of allTables) {
    try {
      const { count, error } = await supabase
        .from(table)
        .select('*', { count: 'exact', head: true });
        
      if (error) {
         continue;
      }
      
      if (count === 0) {
        emptyTables.push(table);
      }
    } catch (err) {
      // ignore
    }
  }
  
  console.log("=== EMPTY TABLES ===");
  emptyTables.forEach(t => console.log(t));
}

checkTables();
