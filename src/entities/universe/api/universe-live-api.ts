import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/shared/api/supabase';

const TENANT = '11111111-1111-1111-1111-111111111111';

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

export function useAuditUniverseLive() {
  return useQuery<AuditEntityLive[]>({
    queryKey: ['audit-universe-live'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('audit_entities')
        .select('id, name, type, path, metadata, last_audit_date')
        .eq('tenant_id', TENANT)
        .order('path');
        
      if (error) throw error;
      
      type AuditEntityRow = {
        id: string;
        name: string;
        type: string | null;
        path: string | null;
        last_audit_date: string | null;
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
        lastAudit: row.metadata?.lastAudit ?? (row.last_audit_date ? String(row.last_audit_date).slice(0, 10) : 'N/A'),
      }));
    },
    staleTime: 2 * 60 * 1000,
  });
}