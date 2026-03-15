import { supabase } from '@/shared/api/supabase';
import { ACTIVE_TENANT_ID } from '@/shared/lib/constants';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

const TENANT = ACTIVE_TENANT_ID;

export interface AuditEntityLive {
  id: string;
  name: string;
  type: string;
  path: string;
  weight: number;
  findings: {
    bordo: number;
    kizil: number;
    turuncu: number;
    sari: number;
    gozlem: number;
    shariah_systemic: number;
  };
  lastAudit: string;
}

export interface BulkEntityInput {
  name: string;
  type: string;
  path: string;
  risk_score?: number;
}

export function useAuditUniverseLive() {
  return useQuery<AuditEntityLive[]>({
    queryKey: ['audit-universe-live'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('audit_entities')
        .select('id, name, type, path, metadata, created_at')
        .order('path');

      if (error) throw error;

      type AuditEntityRow = {
        id: string;
        name: string;
        type: string | null;
        path: string | null;
        created_at: string | null;
        metadata: {
          weight?: number;
          lastAudit?: string;
          findings_summary?: {
            bordo?: number;
            kizil?: number;
            turuncu?: number;
            sari?: number;
            gozlem?: number;
            shariah_systemic?: number;
          };
        } | null;
      };

      return (data || []).map((row: AuditEntityRow) => ({
        id: row.id,
        name: row.name,
        type: row.type ?? 'UNIT',
        path: row.path ?? '',
        weight: Number(row.metadata?.weight ?? 1.0),
        findings: {
          bordo: Number(row.metadata?.findings_summary?.bordo ?? 0),
          kizil: Number(row.metadata?.findings_summary?.kizil ?? 0),
          turuncu: Number(row.metadata?.findings_summary?.turuncu ?? 0),
          sari: Number(row.metadata?.findings_summary?.sari ?? 0),
          gozlem: Number(row.metadata?.findings_summary?.gozlem ?? 0),
          shariah_systemic: Number(row.metadata?.findings_summary?.shariah_systemic ?? 0),
        },
        lastAudit: row.metadata?.lastAudit ?? (row.created_at ? String(row.created_at).slice(0, 10) : 'N/A'),
      }));
    },
    staleTime: 2 * 60 * 1000,
  });
}

export function useBulkCreateEntities() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (inputs: BulkEntityInput[]) => {
      const rows = inputs.map((input) => ({
        name: input.name,
        type: input.type || 'UNIT',
        path: input.path,
        risk_score: input.risk_score ?? 50,
        velocity_multiplier: 1.0,
        status: 'ACTIVE',
        tenant_id: TENANT,
      }));
      const { data, error } = await supabase
        .from('audit_entities')
        .insert(rows)
        .select();
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['audit-universe-live'] });
      qc.invalidateQueries({ queryKey: ['audit-entities'] });
    },
  });
}
