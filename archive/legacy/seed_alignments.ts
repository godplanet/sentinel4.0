import { createClient } from '@supabase/supabase-js';

const supabase = createClient(process.env.VITE_SUPABASE_URL!, process.env.VITE_SUPABASE_ANON_KEY!);

async function run() {
  const { data, error } = await supabase.from('strategy_universe_alignment').insert([
    { goal_id: 'b1000000-0000-0000-0000-000000000001', universe_node_id: 'e0000000-0000-0000-0000-000000000012', alignment_score: 100 },
    { goal_id: 'b1000000-0000-0000-0000-000000000001', universe_node_id: 'e0000000-0000-0000-0000-000000000011', alignment_score: 80 },
    { goal_id: 'b1000000-0000-0000-0000-000000000002', universe_node_id: 'e0000000-0000-0000-0000-000000000100', alignment_score: 100 },
    { goal_id: 'b1000000-0000-0000-0000-000000000002', universe_node_id: 'e0000000-0000-0000-0000-000000000102', alignment_score: 90 },
    { goal_id: 'b1000000-0000-0000-0000-000000000006', universe_node_id: 'e0000000-0000-0000-0000-000000000100', alignment_score: 95 },
    { goal_id: 'b1000000-0000-0000-0000-000000000006', universe_node_id: 'e0000000-0000-0000-0000-000000000101', alignment_score: 85 },
    { goal_id: 'b1000000-0000-0000-0000-000000000007', universe_node_id: 'e0000000-0000-0000-0000-000000000103', alignment_score: 100 },
    { goal_id: 'b1000000-0000-0000-0000-000000000007', universe_node_id: 'e0000000-0000-0000-0000-000000000010', alignment_score: 80 }
  ]);

  if (error) {
    if (error.code === '23505') {
       console.log('Seed Success: records already exist (duplicate).');
    } else {
       console.error('Seed Error:', error);
    }
  } else {
    console.log('Seed Success: strategy_universe_alignment inserted');
  }
}

run();
