/**
 * Wave 43: Quantum Risk Graph — Supabase Data Layer
 *
 * TanStack React Query hooks for the RiskNetwork widget.
 * Replaces Math.random() link generation with real `risk_edges` table edges.
 *
 * Defensive programming:
 *   - All arrays guarded with (data ?? []) / ([] as fallback)
 *   - Optional chaining (?.) on all nested field access
 *   - Division by zero: (score || 1), (count || 0)
 */

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/shared/api/supabase';
import type { GraphData, GraphNode, GraphLink } from './utils/graphBuilder';

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------
export interface RiskEdge {
  id: string;
  tenant_id: string;
  source_id: string;
  target_id: string;
  relationship_type: 'CORRELATED' | 'CAUSAL' | 'MITIGATION' | 'ESCALATION' | 'DEPENDENCY';
  weight: number;
  description: string | null;
  is_active: boolean;
  created_at: string;
}

export interface RiskNetworkNode {
  id: string;
  risk_code: string;
  risk_name: string;
  risk_category: string | null;
  process_area: string | null;
  residual_rating: string | null;
  residual_score: number | null;
  inherent_score: number | null;
  is_active: boolean;
  outgoing_edges: Array<{
    edge_id: string;
    target_id: string;
    relationship_type: string;
    weight: number;
  }> | null;
  incoming_edge_count: number;
}

// ---------------------------------------------------------------------------
// Color mapping
// ---------------------------------------------------------------------------
function getRiskColor(rating: string | null): string {
  switch ((rating ?? '').toUpperCase()) {
    case 'KRITIK':
    case 'CRITICAL': return '#ef4444';
    case 'YUKSEK':
    case 'HIGH':     return '#f97316';
    case 'ORTA':
    case 'MEDIUM':   return '#eab308';
    case 'DUSUK':
    case 'LOW':      return '#22c55e';
    default:         return '#64748b';
  }
}

function getEdgeColor(type: string): string {
  switch (type) {
    case 'CAUSAL':      return '#ef4444';
    case 'ESCALATION':  return '#f97316';
    case 'MITIGATION':  return '#22c55e';
    case 'DEPENDENCY':  return '#8b5cf6';
    default:            return '#64748b';
  }
}

// ---------------------------------------------------------------------------
// HOOK: Full risk network (nodes + edges from risk_network_view + risk_edges)
// ---------------------------------------------------------------------------
export function useRiskNetwork(limit = 120) {
  return useQuery({
    queryKey: ['risk-network', limit],
    queryFn: async (): Promise<GraphData> => {
      // 1. Fetch nodes from risk_network_view (includes outgoing_edges JSON)
      const { data: rows, error: nodeErr } = await supabase
        .from('risk_network_view')
        .select('*')
        .limit(limit);

      if (nodeErr) {
        console.error('useRiskNetwork: node query failed', nodeErr.message);
        return { nodes: [], links: [] };
      }

      const rawNodes = (rows ?? []) as RiskNetworkNode[];

      if (rawNodes.length === 0) {
        return { nodes: [], links: [] };
      }

      // Build a set of valid node IDs for edge validation
      const validIds = new Set(rawNodes.map((r) => r.id));

      // 2. Map nodes to GraphData format
      const nodes: GraphNode[] = rawNodes.map((r) => ({
        id: r.id,
        label: r.risk_name ?? r.risk_code ?? r.id,
        type: 'risk' as const,
        path: `${r.process_area ?? 'Genel'}.${r.risk_category ?? 'Diğer'}`,
        color: getRiskColor(r.residual_rating),
        // Size proportional to score + incoming connections (defensive)
        size: 6 + Math.min((r.residual_score ?? 0) / 4, 14) + Math.min((r.incoming_edge_count ?? 0) * 2, 8),
        data: {
          description: `${r.risk_code ?? ''} — ${r.risk_category ?? 'Genel'}`,
          risk_rating: r.residual_rating ?? 'LOW',
          inherent_score: r.inherent_score ?? 0,
          residual_score: r.residual_score ?? 0,
        },
      }));

      // 3. Build links from outgoing_edges JSON embedded in view
      const links: GraphLink[] = [];
      rawNodes.forEach((r) => {
        (r.outgoing_edges ?? []).forEach((edge) => {
          // Guard: only add edge if both nodes are in the dataset
          if (validIds.has(edge.target_id)) {
            links.push({
              source: r.id,
              target: edge.target_id,
              value: edge.weight ?? 1,
              // optional: store relationship type for color coding
              // @ts-ignore — ForceGraph2D ignores unknown properties
              type: edge.relationship_type,
              // @ts-ignore
              color: getEdgeColor(edge.relationship_type),
            });
          }
        });
      });

      return { nodes, links };
    },
    staleTime: 60_000,
    retry: 1,
  });
}

// ---------------------------------------------------------------------------
// HOOK: Raw risk_edges list (for admin/inspection)
// ---------------------------------------------------------------------------
export function useRiskEdges() {
  return useQuery({
    queryKey: ['risk-edges'],
    queryFn: async (): Promise<RiskEdge[]> => {
      const { data, error } = await supabase
        .from('risk_edges')
        .select('*')
        .eq('is_active', true)
        .order('created_at', { ascending: false });
      if (error) {
        console.error('useRiskEdges: query failed', error.message);
        return [];
      }
      return (data ?? []) as RiskEdge[];
    },
    staleTime: 60_000,
  });
}

// ---------------------------------------------------------------------------
// MUTATION: Create a risk edge (from graph UI drag-connect)
// ---------------------------------------------------------------------------
export function useCreateRiskEdge() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (payload: {
      source_id: string;
      target_id: string;
      relationship_type: RiskEdge['relationship_type'];
      weight?: number;
      description?: string;
    }) => {
      const { data, error } = await supabase
        .from('risk_edges')
        .insert({
          source_id: payload.source_id,
          target_id: payload.target_id,
          relationship_type: payload.relationship_type,
          weight: payload.weight ?? 1.0,
          description: payload.description ?? null,
        })
        .select()
        .single();
      if (error) throw error;
      return data as RiskEdge;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['risk-network'] });
      qc.invalidateQueries({ queryKey: ['risk-edges'] });
    },
  });
}
