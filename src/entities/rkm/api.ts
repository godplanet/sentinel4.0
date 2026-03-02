import { supabase } from '@/shared/api/supabase';
import type { RkmProcessRow, RkmRiskRow } from '@/shared/types/database.types';
import type { RKMExcelRow } from '@/shared/lib/excel-utils';

/** Master Grid için kullanılan satır tipi (RKMMasterGrid RkmRow ile uyumlu). */
export interface RkmGridRow {
  id: string;
  risk_code: string;
  risk_title: string;
  risk_owner: string;
  risk_status: string;
  risk_category: string;
  risk_subcategory: string;
  main_process: string;
  sub_process: string;
  inherent_impact: number;
  inherent_likelihood: number;
  inherent_score: number;
  inherent_rating: string;
  control_type: string;
  control_nature: string;
  control_effectiveness: number;
  residual_impact: number;
  residual_likelihood: number;
  residual_score: number;
  residual_rating: string;
  bddk_reference: string;
  iso27001_reference: string;
  risk_response_strategy: string;
  last_audit_date: string;
  audit_rating: string;
}

/** Tüm süreçleri getirir (level filtresi yok — seed'deki level 3 süreçler de gelir). */
export async function fetchRkmCategories(): Promise<RkmProcessRow[]> {
  const { data, error } = await supabase
    .from('rkm_processes')
    .select('*')
    .order('process_code');

  if (error) throw error;
  return data || [];
}

/** process_id ile risk sayısı ve residual_rating listesi (kategori kartları için). */
export async function fetchRkmRisksByProcessId(processId: string): Promise<{ residual_rating: string }[]> {
  const { data, error } = await supabase
    .from('rkm_risks')
    .select('residual_rating')
    .eq('process_id', processId);

  if (error) throw error;
  return data || [];
}

/** Süreç listesini risk sayıları ve kritik/yüksek sayılarıyla getirir (Genel Bakış kartları için). */
export async function fetchRkmCategoriesWithStats(): Promise<(RkmProcessRow & { risk_count: number; critical_risks: number; high_risks: number })[]> {
  const data = await fetchRkmCategories();
  const withStats = await Promise.all(
    data.map(async (cat) => {
      const riskList = await fetchRkmRisksByProcessId(cat.id);
      return {
        ...cat,
        risk_count: riskList.length,
        critical_risks: riskList.filter((r) => r.residual_rating === 'KRİTİK').length,
        high_risks: riskList.filter((r) => r.residual_rating === 'YÜKSEK').length,
      };
    })
  );
  return withStats;
}

export async function fetchRkmRisksByProcess(processName: string): Promise<RkmRiskRow[]> {
  const { data, error } = await supabase
    .from('rkm_risks')
    .select('residual_rating')
    .eq('main_process', processName);

  if (error) throw error;
  return data || [];
}

export async function fetchRkmTotalRiskCount(): Promise<number> {
  const { count, error } = await supabase
    .from('rkm_risks')
    .select('*', { count: 'exact', head: true });

  if (error) throw error;
  return count || 0;
}

/** Master Grid için tüm riskleri RkmGridRow formatında getirir (Supabase'den tek kaynak). */
export async function fetchRkmRisksForGrid(): Promise<RkmGridRow[]> {
  const { data, error } = await supabase
    .from('rkm_risks')
    .select(
      'id, risk_code, risk_title, risk_owner, risk_status, risk_category, risk_subcategory, main_process, sub_process, ' +
      'inherent_impact, inherent_likelihood, inherent_score, inherent_rating, control_type, control_nature, control_effectiveness, ' +
      'residual_impact, residual_likelihood, residual_score, residual_rating, bddk_reference, iso27001_reference, ' +
      'risk_response_strategy, last_audit_date, audit_rating'
    )
    .order('risk_code');

  if (error) throw error;

  const rows = (data || []).map((r) => ({
    id: r.id,
    risk_code: r.risk_code ?? '',
    risk_title: r.risk_title ?? '',
    risk_owner: r.risk_owner ?? '',
    risk_status: r.risk_status ?? 'ACTIVE',
    risk_category: r.risk_category ?? '',
    risk_subcategory: r.risk_subcategory ?? '',
    main_process: r.main_process ?? '',
    sub_process: r.sub_process ?? '',
    inherent_impact: Number(r.inherent_impact) ?? 1,
    inherent_likelihood: Number(r.inherent_likelihood) ?? 1,
    inherent_score: Number(r.inherent_score) ?? 0,
    inherent_rating: r.inherent_rating ?? '',
    control_type: r.control_type ?? '',
    control_nature: r.control_nature ?? '',
    control_effectiveness: Number(r.control_effectiveness) ?? 0,
    residual_impact: Number(r.residual_impact) ?? 1,
    residual_likelihood: Number(r.residual_likelihood) ?? 1,
    residual_score: Number(r.residual_score) ?? 0,
    residual_rating: r.residual_rating ?? '',
    bddk_reference: r.bddk_reference ?? '',
    iso27001_reference: r.iso27001_reference ?? '',
    risk_response_strategy: r.risk_response_strategy ?? '',
    last_audit_date: r.last_audit_date ? String(r.last_audit_date).slice(0, 10) : '',
    audit_rating: r.audit_rating ?? '',
  }));

  return rows;
}

/** Excel/CSV'den gelen satırları rkm_risks tablosuna ekler (geri yükleme için). */
const DEFAULT_TENANT = '11111111-1111-1111-1111-111111111111';

export async function importRisksFromExcel(rows: RKMExcelRow[]): Promise<{ inserted: number; errors: string[] }> {
  const errors: string[] = [];
  const payloads = rows
    .map((r, idx) => {
      const impact = Number(r.inherent_impact) || 1;
      const likelihood = Number(r.inherent_likelihood) || 1;
      const volume = Number(r.inherent_volume) || 1;
      const resImpact = Number(r.residual_impact) || 1;
      const resLikelihood = Number(r.residual_likelihood) || 1;
      const designRating = Number(r.control_design_rating) || 4;
      const operatingRating = Number(r.control_operating_rating) || 4;
      if (!r.risk_code?.trim()) {
        errors.push(`Satır ${idx + 2}: risk_code boş`);
        return null;
      }
      return {
        tenant_id: DEFAULT_TENANT,
        process_id: null,
        risk_code: String(r.risk_code).trim(),
        risk_title: String(r.risk_title || '').trim() || 'Başlıksız',
        risk_description: String(r.risk_description || '').trim() || '',
        risk_owner: String(r.risk_owner || '').trim() || null,
        risk_status: (r.risk_status && ['ACTIVE', 'MITIGATED', 'ACCEPTED', 'TRANSFERRED', 'ARCHIVED'].includes(r.risk_status)) ? r.risk_status : 'ACTIVE',
        main_process: String(r.main_process || '').trim() || null,
        sub_process: String(r.sub_process || '').trim() || null,
        risk_category: String(r.risk_category || '').trim() || null,
        risk_subcategory: String(r.risk_subcategory || '').trim() || null,
        inherent_impact: Math.min(5, Math.max(1, impact)),
        inherent_likelihood: Math.min(5, Math.max(1, likelihood)),
        inherent_volume: Math.min(5, Math.max(1, volume)),
        control_type: (r.control_type && ['PREVENTIVE', 'DETECTIVE', 'CORRECTIVE', 'DIRECTIVE'].includes(r.control_type)) ? r.control_type : 'PREVENTIVE',
        control_nature: (r.control_nature && ['MANUAL', 'AUTOMATED', 'HYBRID'].includes(r.control_nature)) ? r.control_nature : 'MANUAL',
        control_design_rating: Math.min(5, Math.max(1, designRating)),
        control_operating_rating: Math.min(5, Math.max(1, operatingRating)),
        residual_impact: Math.min(5, Math.max(1, resImpact)),
        residual_likelihood: Math.min(5, Math.max(1, resLikelihood)),
        bddk_reference: String(r.bddk_reference || '').trim() || null,
        iso27001_reference: String(r.iso27001_reference || '').trim() || null,
        risk_response_strategy: (r.risk_response_strategy && ['AVOID', 'MITIGATE', 'TRANSFER', 'ACCEPT'].includes(r.risk_response_strategy)) ? r.risk_response_strategy : 'MITIGATE',
        last_audit_date: r.last_audit_date || null,
        audit_rating: (r.audit_rating && ['SATISFACTORY', 'NEEDS_IMPROVEMENT', 'UNSATISFACTORY'].includes(r.audit_rating)) ? r.audit_rating : null,
      };
    })
    .filter((p): p is NonNullable<typeof p> => p !== null);

  if (payloads.length === 0) {
    return { inserted: 0, errors };
  }

  const { data, error } = await supabase.from('rkm_risks').insert(payloads).select('id');

  if (error) {
    errors.push(error.message);
    return { inserted: 0, errors };
  }
  return { inserted: data?.length ?? 0, errors };
}
