/*
  DDL GEREKSİNİMİ (Backend / Migration):
  Bu modül şu an process_maps tablosunu kullanıyor (nodes_json, edges_json JSONB).
  İleride normalise edilirse aşağıdaki tablolar eklenabilir:

  CREATE TABLE IF NOT EXISTS process_nodes (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    entity_id uuid NOT NULL REFERENCES audit_entities(id) ON DELETE CASCADE,
    flow_node_id text NOT NULL,
    node_type text NOT NULL,
    position_x float NOT NULL,
    position_y float NOT NULL,
    data jsonb NOT NULL DEFAULT '{}'::jsonb,
    created_at timestamptz NOT NULL DEFAULT now(),
    updated_at timestamptz NOT NULL DEFAULT now(),
    UNIQUE(entity_id, flow_node_id)
  );

  CREATE TABLE IF NOT EXISTS process_edges (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    entity_id uuid NOT NULL REFERENCES audit_entities(id) ON DELETE CASCADE,
    flow_edge_id text NOT NULL,
    source_id text NOT NULL,
    target_id text NOT NULL,
    edge_type text,
    style jsonb DEFAULT '{}'::jsonb,
    created_at timestamptz NOT NULL DEFAULT now(),
    UNIQUE(entity_id, flow_edge_id)
  );

  CREATE INDEX IF NOT EXISTS idx_process_nodes_entity ON process_nodes(entity_id);
  CREATE INDEX IF NOT EXISTS idx_process_edges_entity ON process_edges(entity_id);
*/

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/shared/api/supabase';
import type { Node, Edge } from '@xyflow/react';
import type { ProcessMap, RiskMapping } from './types';

const QUERY_KEYS = {
  processGraph: (entityId: string | null) => ['process-graph', entityId ?? 'default'] as const,
  processMaps: () => ['process-maps'] as const,
  processMap: (id: string) => ['process-map', id] as const,
};

// ─── React Flow ↔ DB mapping (tip güvenliği: any yok) ─────────────────────────

interface DbNodeRow {
  id: string;
  type?: string;
  data?: Record<string, unknown> & { label?: string };
  position?: { x: number; y: number };
}

interface DbEdgeRow {
  id: string;
  source: string;
  target: string;
  type?: string;
  style?: Record<string, unknown>;
}

function mapDbNodesToFlow(nodesJson: unknown): Node[] {
  if (!Array.isArray(nodesJson)) return [];
  return nodesJson.map((row: DbNodeRow) => ({
    id: String(row.id),
    type: row.type ?? 'processNode',
    data: (row.data && typeof row.data === 'object' ? { ...row.data } : { label: '' }) as Record<string, unknown> & { label: string },
    position: row.position && typeof row.position === 'object' && typeof row.position.x === 'number' && typeof row.position.y === 'number'
      ? { x: row.position.x, y: row.position.y }
      : { x: 0, y: 0 },
  })) as Node[];
}

function mapDbEdgesToFlow(edgesJson: unknown): Edge[] {
  if (!Array.isArray(edgesJson)) return [];
  return edgesJson.map((row: DbEdgeRow) => ({
    id: String(row.id),
    source: String(row.source),
    target: String(row.target),
    type: row.type ?? 'smoothstep',
    style: row.style && typeof row.style === 'object' ? row.style : undefined,
  })) as Edge[];
}

function mapFlowNodesToDb(nodes: Node[]): Record<string, unknown>[] {
  return nodes.map((n) => ({
    id: n.id,
    type: n.type,
    data: n.data ?? {},
    position: n.position ?? { x: 0, y: 0 },
  }));
}

function mapFlowEdgesToDb(edges: Edge[]): Record<string, unknown>[] {
  return edges.map((e) => ({
    id: e.id,
    source: e.source,
    target: e.target,
    type: e.type ?? 'smoothstep',
    style: e.style ?? {},
  }));
}

// ─── Fetch by entity (department_id) or default first map ─────────────────────

export interface ProcessGraphResult {
  nodes: Node[];
  edges: Edge[];
  mapId: string | null;
  riskMappings: RiskMapping[];
}

export async function fetchProcessGraphByEntity(entityId: string | null): Promise<ProcessGraphResult> {
  if (entityId) {
    const { data, error } = await supabase
      .from('process_maps')
      .select('id, nodes_json, edges_json, risk_mappings')
      .eq('department_id', entityId)
      .limit(1)
      .maybeSingle();

    if (error) throw error;
    if (data) {
      const row = data as { id: string; nodes_json: unknown; edges_json: unknown; risk_mappings: unknown };
      return {
        mapId: row.id,
        nodes: mapDbNodesToFlow(row.nodes_json),
        edges: mapDbEdgesToFlow(row.edges_json),
        riskMappings: Array.isArray(row.risk_mappings) ? (row.risk_mappings as RiskMapping[]) : [],
      };
    }
  }

  const { data, error } = await supabase
    .from('process_maps')
    .select('id, nodes_json, edges_json, risk_mappings')
    .order('updated_at', { ascending: false })
    .limit(1)
    .maybeSingle();

  if (error) throw error;
  if (data) {
    const row = data as { id: string; nodes_json: unknown; edges_json: unknown; risk_mappings: unknown };
    return {
      mapId: row.id,
      nodes: mapDbNodesToFlow(row.nodes_json),
      edges: mapDbEdgesToFlow(row.edges_json),
      riskMappings: Array.isArray(row.risk_mappings) ? (row.risk_mappings as RiskMapping[]) : [],
    };
  }

  return { mapId: null, nodes: [], edges: [], riskMappings: [] };
}

export function useProcessGraph(entityId: string | null) {
  return useQuery({
    queryKey: QUERY_KEYS.processGraph(entityId),
    queryFn: () => fetchProcessGraphByEntity(entityId),
  });
}

export interface SaveProcessGraphInput {
  mapId: string | null;
  entityId: string | null;
  nodes: Node[];
  edges: Edge[];
  riskMappings?: RiskMapping[];
}

export async function saveProcessGraphToDb(input: SaveProcessGraphInput): Promise<string> {
  const { mapId, entityId, nodes, edges, riskMappings } = input;
  const nodesJson = mapFlowNodesToDb(nodes);
  const edgesJson = mapFlowEdgesToDb(edges);
  const payload = {
    nodes_json: nodesJson,
    edges_json: edgesJson,
    risk_mappings: riskMappings ?? [],
    updated_at: new Date().toISOString(),
    version_hash: `v-${Date.now().toString(36)}`,
    ...(entityId ? { department_id: entityId } : {}),
  };

  if (mapId) {
    const { error } = await supabase
      .from('process_maps')
      .update(payload)
      .eq('id', mapId);
    if (error) throw error;
    return mapId;
  }

  const { data, error } = await supabase
    .from('process_maps')
    .insert({
      title: entityId ? 'Süreç Haritası' : 'Süreç ve Risk Haritası',
      department_id: entityId ?? null,
      ...payload,
    })
    .select('id')
    .single();

  if (error) throw error;
  if (!data?.id) throw new Error('Process map create returned no id');
  return data.id as string;
}

export function useSaveProcessGraph(entityId: string | null) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (input: { mapId: string | null; nodes: Node[]; edges: Edge[]; riskMappings?: RiskMapping[] }) =>
      saveProcessGraphToDb({
        mapId: input.mapId,
        entityId,
        nodes: input.nodes,
        edges: input.edges,
        riskMappings: input.riskMappings,
      }),
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.processGraph(entityId) });
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.processMaps() });
      if (variables.mapId) {
        queryClient.invalidateQueries({ queryKey: QUERY_KEYS.processMap(variables.mapId) });
      }
    },
  });
}

// ─── Legacy API (process_maps list/detail/create/delete) ─────────────────────

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
    .single();

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
