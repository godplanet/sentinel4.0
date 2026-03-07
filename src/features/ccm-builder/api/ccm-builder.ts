/**
 * Visual CCM Rule Builder — Veri Katmanı
 * features/ccm-builder/api/ccm-builder.ts  (Wave 52)
 *
 * Çökme Kalkanları:
 *   (nodes || []).map(...)    → boş dizi kalkanı
 *   (rules || []).map(...)
 *   42P01 → graceful boş dizi
 */

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/shared/api/supabase';
import toast from 'react-hot-toast';

// ─── Tipler ──────────────────────────────────────────────────────────────────

export interface RFNode {
  id: string;
  type: 'trigger' | 'condition' | 'aggregator' | 'action';
  position: { x: number; y: number };
  data: {
    label: string;
    subtype: string;
    config?: Record<string, unknown>;
    icon?: string;
    color?: string;
  };
}

export interface RFEdge {
  id: string;
  source: string;
  target: string;
  label?: string;
}

export interface VisualRule {
  id: string;
  rule_code: string;
  name: string;
  description: string | null;
  category: 'AML' | 'FRAUD' | 'OPERATIONAL' | 'REGULATORY' | 'BENFORD' | 'STRUCTURING';
  severity: 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW';
  is_active: boolean;
  nodes_json: RFNode[];
  edges_json: RFEdge[];
  compiled_logic: string | null;
  last_tested_at: string | null;
  last_test_result: 'PASS' | 'FAIL' | 'ERROR' | null;
  version: number;
  created_by: string | null;
  created_at: string;
  updated_at: string;
}

export interface RuleNodeCatalog {
  id: string;
  node_type: 'TRIGGER' | 'CONDITION' | 'AGGREGATOR' | 'ACTION';
  node_subtype: string;
  label: string;
  description: string | null;
  icon: string | null;
  color_scheme: string;
  config_schema: Record<string, unknown>;
  output_type: string;
  is_terminal: boolean;
  display_order: number;
}

// ─── Hook: useVisualRules ─────────────────────────────────────────────────────

export function useVisualRules(category?: VisualRule['category']) {
  return useQuery<VisualRule[]>({
    queryKey: ['visual-rules', category],
    queryFn: async () => {
      let q = supabase
        .from('ccm_visual_rules')
        .select('*')
        .order('severity', { ascending: true })  // CRITICAL önce
        .order('name',     { ascending: true });

      if (category) q = q.eq('category', category);

      const { data, error } = await q;
      if (error) {
        if (error.code === '42P01') return [];
        throw error;
      }

      // (rules || []) kalkanı + nodes/edges parse guard
      return (data || []).map((r: any): VisualRule => ({
        ...r,
        nodes_json: Array.isArray(r.nodes_json) ? r.nodes_json : [],
        edges_json: Array.isArray(r.edges_json) ? r.edges_json : [],
      })) as VisualRule[];
    },
    staleTime: 1000 * 60 * 2,
  });
}

// ─── Hook: useVisualRule (tekli) ──────────────────────────────────────────────

export function useVisualRule(ruleId?: string | null) {
  return useQuery<VisualRule | null>({
    queryKey: ['visual-rule', ruleId],
    enabled: !!ruleId,
    queryFn: async () => {
      if (!ruleId) return null;
      const { data, error } = await supabase
        .from('ccm_visual_rules')
        .select('*')
        .eq('id', ruleId)
        .maybeSingle();
      if (error) {
        if (error.code === '42P01') return null;
        throw error;
      }
      if (!data) return null;
      return {
        ...data,
        nodes_json: Array.isArray(data.nodes_json) ? data.nodes_json : [],
        edges_json: Array.isArray(data.edges_json) ? data.edges_json : [],
      } as VisualRule;
    },
  });
}

// ─── Hook: useNodeCatalog ─────────────────────────────────────────────────────

export function useNodeCatalog() {
  return useQuery<RuleNodeCatalog[]>({
    queryKey: ['rule-node-catalog'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('rule_nodes')
        .select('*')
        .order('display_order', { ascending: true });
      if (error) {
        if (error.code === '42P01') return [];
        throw error;
      }
      // (nodes || []).map kalkanı
      return (data || []).map((n: any): RuleNodeCatalog => ({
        id:             n.id ?? '',
        node_type:      n.node_type ?? 'CONDITION',
        node_subtype:   n.node_subtype ?? '',
        label:          n.label ?? '',
        description:    n.description ?? null,
        icon:           n.icon ?? null,
        color_scheme:   n.color_scheme ?? 'blue',
        config_schema:  n.config_schema ?? {},
        output_type:    n.output_type ?? 'BOOLEAN',
        is_terminal:    n.is_terminal ?? false,
        display_order:  n.display_order ?? 0,
      }));
    },
    staleTime: 1000 * 60 * 30, // Katalog nadiren değişir
  });
}

// ─── Hook: useSaveRuleGraph ───────────────────────────────────────────────────

export interface SaveRuleGraphInput {
  /** Varsa güncelleme, yoksa yeni kural */
  ruleId?: string | null;
  rule_code: string;
  name: string;
  description?: string;
  category: VisualRule['category'];
  severity: VisualRule['severity'];
  nodes: RFNode[];
  edges: RFEdge[];
  compiled_logic?: string;
}

export function useSaveRuleGraph() {
  const qc = useQueryClient();

  return useMutation({
    mutationFn: async (input: SaveRuleGraphInput) => {
      const payload = {
        rule_code:       input.rule_code,
        name:            input.name,
        description:     input.description ?? null,
        category:        input.category,
        severity:        input.severity,
        // (nodes || []) ve (edges || []) kalkanı kaydetmeden önce
        nodes_json:      (input.nodes || []),
        edges_json:      (input.edges || []),
        compiled_logic:  input.compiled_logic ?? null,
        updated_at:      new Date().toISOString(),
      };

      if (input.ruleId) {
        // Güncelleme + versiyon artır
        const { data: existing } = await supabase
          .from('ccm_visual_rules')
          .select('version')
          .eq('id', input.ruleId)
          .maybeSingle();

        const { data, error } = await supabase
          .from('ccm_visual_rules')
          .update({ ...payload, version: ((existing as any)?.version ?? 0) + 1 })
          .eq('id', input.ruleId)
          .select()
          .single();
        if (error) throw error;
        return data as VisualRule;
      } else {
        const { data, error } = await supabase
          .from('ccm_visual_rules')
          .insert({ ...payload, version: 1 })
          .select()
          .single();
        if (error) throw error;
        return data as VisualRule;
      }
    },
    onSuccess: (saved) => {
      void qc.invalidateQueries({ queryKey: ['visual-rules'] });
      void qc.invalidateQueries({ queryKey: ['visual-rule', saved.id] });
      toast.success(`"${saved.name}" kuralı kaydedildi. (v${saved.version})`);
    },
    onError: (err: Error) => {
      toast.error(`Kural kaydedilemedi: ${err.message}`);
    },
  });
}

// ─── Hook: useToggleRule ──────────────────────────────────────────────────────

export function useToggleRule() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, is_active }: { id: string; is_active: boolean }) => {
      const { error } = await supabase
        .from('ccm_visual_rules')
        .update({ is_active, updated_at: new Date().toISOString() })
        .eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: ['visual-rules'] });
    },
    onError: (err: Error) => {
      toast.error(`Durum değiştirilemedi: ${err.message}`);
    },
  });
}

// ─── Hook: useRuleStats ───────────────────────────────────────────────────────

export interface RuleStats {
  total: number;
  active: number;
  critical: number;
  categoryBreakdown: Record<string, number>;
}

export function useRuleStats() {
  return useQuery<RuleStats>({
    queryKey: ['rule-stats'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('ccm_visual_rules')
        .select('is_active, severity, category');

      if (error) {
        if (error.code === '42P01') return { total: 0, active: 0, critical: 0, categoryBreakdown: {} };
        throw error;
      }

      const rows = data || [];
      const categoryBreakdown: Record<string, number> = {};
      // (rows || []) kalkanı
      (rows || []).forEach((r: any) => {
        if (r?.category) categoryBreakdown[r.category] = (categoryBreakdown[r.category] || 0) + 1;
      });

      return {
        total:    rows.length,
        active:   rows.filter((r: any) => r?.is_active).length,
        critical: rows.filter((r: any) => r?.severity === 'CRITICAL').length,
        categoryBreakdown,
      };
    },
    staleTime: 1000 * 60,
  });
}
