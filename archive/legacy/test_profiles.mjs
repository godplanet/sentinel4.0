import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://zgygkehcysfhyhcrwnsw.supabase.co';
const supabaseKey = 'sb_publishable_3Zs9LC7ClXekefxZuZrU0Q_Ps4Nv-L0';
const supabase = createClient(supabaseUrl, supabaseKey);

async function checkProfiles() {
  console.log('Fetching user_profiles...');
  const { data, error } = await supabase.from('user_profiles').select('*');
  if (error) {
    console.error('Error fetching user_profiles:', error);
  } else {
    console.log('Successfully fetched user_profiles:', data?.length, 'rows');
    if (data?.length > 0) {
      console.log('Sample row:', data[0]);
    }
  }
}

checkProfiles();
