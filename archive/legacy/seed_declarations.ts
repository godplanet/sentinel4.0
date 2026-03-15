import { createClient } from '@supabase/supabase-js';

const supabase = createClient(process.env.VITE_SUPABASE_URL!, process.env.VITE_SUPABASE_ANON_KEY!);

async function run() {
  const { data, error } = await supabase.from('independence_declarations').upsert([
    {
      engagement_id: '42d72f07-e813-4cff-8218-4a64f7a3baab',
      auditor_id: '00000000-0000-0000-0000-000000000003',
      status: 'signed',
      signed_at: new Date(Date.now() - 15 * 86400000).toISOString(),
      ip_address: '192.168.1.100',
      declaration_text: 'GIAS 2025 Standart 2.1 uyarınca çıkar çatışmam bulunmamaktadır.'
    },
    {
      engagement_id: '42d72f07-e813-4cff-8218-4a64f7a3baac',
      auditor_id: '00000000-0000-0000-0000-000000000004',
      status: 'pending',
      signed_at: null,
      ip_address: null,
      declaration_text: null
    },
    {
      engagement_id: '42d72f07-e813-4cff-8218-4a64f7a3baae',
      auditor_id: '00000000-0000-0000-0000-000000000005',
      status: 'signed',
      signed_at: new Date(Date.now() - 2 * 86400000).toISOString(),
      ip_address: '192.168.1.104',
      declaration_text: 'GIAS 2025 Standart 2.1 uyarınca çıkar çatışmam bulunmamaktadır.'
    }
  ], { onConflict: 'engagement_id,auditor_id' });

  if (error) {
    console.error('Seed Error:', error);
  } else {
    console.log('Seed Success: independence_declarations inserted');
  }
}

run();
