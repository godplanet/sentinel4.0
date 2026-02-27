import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/shared/api/supabase';
import type {
  EsgFramework, EsgMetricDefinition, EsgDataPoint,
  EsgSocialMetric, EsgGreenAsset, EnrichedDataPoint, EsgPillarSummary,
} from './types';

export function useEsgFrameworks() {
  return useQuery({
    queryKey: ['esg-frameworks'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('esg_frameworks')
        .select('*')
        .eq('is_active', true)
        .order('name');
      if (error) throw error;
      return (data || []) as EsgFramework[];
    },
  });
}

export function useEsgMetrics() {
  return useQuery({
    queryKey: ['esg-metrics'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('esg_metric_definitions')
        .select('*')
        .order('pillar, code');
      if (error) throw error;
      return (data || []) as EsgMetricDefinition[];
    },
  });
}

export function useEsgDataPoints(period?: string) {
  return useQuery({
    queryKey: ['esg-data-points', period],
    queryFn: async () => {
      let q = supabase.from('esg_data_points').select('*').order('created_at', { ascending: false });
      if (period) q = q.eq('period', period);
      const { data, error } = await q;
      if (error) throw error;
      return (data || []) as EsgDataPoint[];
    },
  });
}

export function useEnrichedDataPoints(period?: string) {
  const { data: metrics } = useEsgMetrics();
  const { data: points } = useEsgDataPoints(period);

  return useQuery({
    queryKey: ['esg-enriched', period, metrics?.length, points?.length],
    enabled: !!metrics && !!points,
    queryFn: (): EnrichedDataPoint[] => {
      const metricMap = new Map<string, EsgMetricDefinition>();
      for (const m of metrics!) metricMap.set(m.id, m);
      return (points || [])
        .filter((p) => metricMap.has(p.metric_id))
        .map((p) => ({ ...p, metric: metricMap.get(p.metric_id)! }));
    },
  });
}

export function useEsgPillarSummary(period?: string) {
  const { data: enriched } = useEnrichedDataPoints(period);

  return useQuery({
    queryKey: ['esg-pillar-summary', period, enriched?.length],
    enabled: !!enriched,
    queryFn: (): EsgPillarSummary[] => {
      const map: Record<string, EsgPillarSummary> = {};
      for (const pillar of ['E', 'S', 'G'] as const) {
        map[pillar] = { pillar, totalMetrics: 0, validated: 0, flagged: 0, pending: 0, avgConfidence: 0, onTarget: 0 };
      }
      const confSums: Record<string, number[]> = { E: [], S: [], G: [] };

      for (const dp of enriched!) {
        const p = dp.metric.pillar;
        map[p].totalMetrics++;
        if (dp.ai_validation_status === 'Validated') map[p].validated++;
        else if (dp.ai_validation_status === 'Flagged') map[p].flagged++;
        else map[p].pending++;
        if (dp.ai_confidence != null) confSums[p].push(dp.ai_confidence);

        const m = dp.metric;
        if (m.target_value != null && m.target_direction) {
          const onTarget =
            m.target_direction === 'below' ? dp.value <= m.target_value :
            m.target_direction === 'above' ? dp.value >= m.target_value :
            dp.value === m.target_value;
          if (onTarget) map[p].onTarget++;
        }
      }

      for (const pillar of ['E', 'S', 'G'] as const) {
        const arr = confSums[pillar];
        map[pillar].avgConfidence = arr.length > 0 ? Math.round(arr.reduce((s, v) => s + v, 0) / arr.length) : 0;
      }

      return Object.values(map);
    },
  });
}

export function useEsgSocialMetrics() {
  return useQuery({
    queryKey: ['esg-social-metrics'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('esg_social_metrics')
        .select('*')
        .order('period');
      if (error) throw error;
      return (data || []) as EsgSocialMetric[];
    },
  });
}

export function useEsgGreenAssets() {
  return useQuery({
    queryKey: ['esg-green-assets'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('esg_green_assets')
        .select('*')
        .order('period');
      if (error) throw error;
      return (data || []) as EsgGreenAsset[];
    },
  });
}

export function useSubmitEsgDataPoint() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (input: Omit<EsgDataPoint, 'id' | 'tenant_id' | 'created_at'>) => {
      const { data, error } = await supabase
        .from('esg_data_points')
        .insert(input)
        .select()
        .single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['esg-data-points'] });
      qc.invalidateQueries({ queryKey: ['esg-enriched'] });
      qc.invalidateQueries({ queryKey: ['esg-pillar-summary'] });
    },
  });
}
