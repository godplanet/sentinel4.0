import { supabase } from '@/shared/api/supabase';
import { ACTIVE_TENANT_ID } from '@/shared/lib/constants';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

const TENANT = ACTIVE_TENANT_ID;

// IT anahtar kelimelerine göre otomatik kategori tespiti
export function inferEntityCategory(name: string, type: string): 'IT' | 'İdari' {
  if (type === 'IT_ASSET') return 'IT';
  const lower = (' ' + name.toLowerCase()
    .replace(/ğ/g, 'g').replace(/ü/g, 'u').replace(/ş/g, 's')
    .replace(/ı/g, 'i').replace(/ö/g, 'o').replace(/ç/g, 'c') + ' ');
  const IT_KEYWORDS = [
    'siber', 'bilgi teknoloji', ' bt ', 'yazilim', 'donanim',
    'dijital bankac', 'veri yonet', 'veri merkez', 'data',
    'network', 'altyapi ve sistem', 'altyapi yonet',
    'core banking', 'swift', 'mobil', 'internet bankac',
    ' it ', 'teknoloji', 'server', 'veritabani',
    ' api ', 'entegrasyon', 'kartli odeme', 'odeme sistemleri',
    'yazilim gelistir', 'bt surec', 'bt yonetisim', 'bt operasyon',
    'kimlik ve erisim', 'bilgi guvenligi', 'is surekliligi',
    'felaket kurtarma', 'olay ve problem', 'bulut yonetim',
    'elektronik bankac', 'ag ve sistem', 'log yonetim',
  ];
  return IT_KEYWORDS.some(kw => lower.includes(kw)) ? 'IT' : 'İdari';
}

export interface AuditEntityLive {
  id: string;
  name: string;
  type: string;
  path: string;
  weight: number;
  risk_score: number;
  rotation_type: 'MANDATORY' | 'ROTATION';
  entity_category: 'IT' | 'İdari';
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
  rotation_type?: 'MANDATORY' | 'ROTATION';
}

export function useAuditUniverseLive() {
  return useQuery<AuditEntityLive[]>({
    queryKey: ['audit-universe-live'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('audit_entities')
        .select('id, name, type, path, status, metadata, created_at, risk_score')
        .order('path');

      if (error) throw error;

      type AuditEntityRow = {
        id: string;
        name: string;
        type: string | null;
        path: string | null;
        status: string | null;
        created_at: string | null;
        risk_score: number | null;
        metadata: {
          weight?: number;
          lastAudit?: string;
          rotation_type?: 'MANDATORY' | 'ROTATION';
          entity_category?: 'IT' | 'İdari';
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

      return (data || [])
        .filter((row: AuditEntityRow) => (row.status ?? '').toUpperCase() === 'ACTIVE')
        .map((row: AuditEntityRow) => ({
        id: row.id,
        name: row.name,
        type: row.type ?? 'UNIT',
        path: row.path ?? '',
        weight: Number(row.metadata?.weight ?? 1.0),
        rotation_type: (row.metadata?.rotation_type ?? ((row.path ?? '').startsWith('proc') ? 'MANDATORY' : 'ROTATION')) as 'MANDATORY' | 'ROTATION',
        entity_category: row.metadata?.entity_category ?? inferEntityCategory(row.name, row.type ?? 'UNIT'),
        risk_score: Number(row.risk_score ?? 50),
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
        metadata: {
          rotation_type: input.rotation_type ?? (input.path.startsWith('proc') ? 'MANDATORY' : 'ROTATION'),
        },
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
