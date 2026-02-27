import { supabase } from '@/shared/api/supabase';
import type { ProcessMap, RiskMapping } from './types';

export async function fetchProcessMaps(): Promise<ProcessMap[]> {
  const { data, error } = await supabase
    .from('process_maps')
    .select('*')
    .order('updated_at', { ascending: false });

  if (error) throw error;
  return (data || []) as ProcessMap[];
}

export async function fetchProcessMap(id: string): Promise<ProcessMap | null> {
  const { data, error } = await supabase
    .from('process_maps')
    .select('*')
    .eq('id', id)
    .maybeSingle();

  if (error) throw error;
  return data as ProcessMap | null;
}

export async function createProcessMap(title: string): Promise<ProcessMap> {
  const defaultNodes = [
    { id: '1', type: 'input', data: { label: 'Baslangic' }, position: { x: 250, y: 0 } },
    { id: '2', data: { label: 'Islem Adimi' }, position: { x: 250, y: 120 } },
    { id: '3', type: 'output', data: { label: 'Sonuc' }, position: { x: 250, y: 240 } },
  ];
  const defaultEdges = [
    { id: 'e1-2', source: '1', target: '2' },
    { id: 'e2-3', source: '2', target: '3' },
  ];

  const { data, error } = await supabase
    .from('process_maps')
    .insert({
      title,
      nodes_json: defaultNodes,
      edges_json: defaultEdges,
      risk_mappings: [],
    })
    .select()
    .maybeSingle();

  if (error) throw error;
  if (!data) throw new Error('Failed to create process map');
  return data as ProcessMap;
}

export async function saveProcessMap(
  id: string,
  nodes: unknown[],
  edges: unknown[],
  riskMappings?: RiskMapping[],
) {
  const update: Record<string, unknown> = {
    nodes_json: nodes,
    edges_json: edges,
    updated_at: new Date().toISOString(),
    version_hash: `v-${Date.now().toString(36)}`,
  };
  if (riskMappings) update.risk_mappings = riskMappings;

  const { error } = await supabase
    .from('process_maps')
    .update(update)
    .eq('id', id);

  if (error) throw error;
}

export async function deleteProcessMap(id: string) {
  const { error } = await supabase
    .from('process_maps')
    .delete()
    .eq('id', id);

  if (error) throw error;
}
