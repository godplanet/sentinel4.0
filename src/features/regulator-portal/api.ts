/**
 * External Regulator (Guest) Portal — Veri Katmanı
 * features/regulator-portal/api.ts  (Wave 86)
 *
 * KURAL KONTROLÜ: BU DOSYADA HİÇBİR MUTASYON (UPDATE/INSERT) KANCASI YOKTUR!
 * BDDK, TCMB, KPMG gibi regülatörler/denetçiler İZLEYİCİDİR. (Read-Only)
 *
 * Çökme Kalkanları:
 *   (data || [])  → boş dizi kalkanı
 *   42P01 → graceful boş dizi/null
 */

import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/shared/api/supabase';

// ─── Tipler ──────────────────────────────────────────────────────────────────

export type ReportCategory = 'CREDIT_RISK' | 'LIQUIDITY' | 'MARKET_RISK' | 'OPERATIONAL_RISK' | 'IT_SECURITY' | 'COMPLIANCE';
export type ReportStatus = 'GREEN' | 'AMBER' | 'RED';
export type DossierType = 'AUDIT_EVIDENCE' | 'POLICY_DOC' | 'REGULATORY_REPORT' | 'BOARD_MINUTES';
export type AccessLevel = 'PUBLIC' | 'CONFIDENTIAL' | 'STRICTLY_CONFIDENTIAL';

export interface ContinuousAssuranceReport {
  id: string;
  report_code: string;
  title: string;
  category: ReportCategory;
  assurance_score_pct: number;
  status: ReportStatus;
  findings_count: number;
  is_published: boolean;
  generated_at: string;
}

export interface SharedDossier {
  id: string;
  dossier_code: string;
  title: string;
  description: string | null;
  dossier_type: DossierType;
  file_url: string | null;
  shared_date: string;
  expires_at: string | null;
  access_level: AccessLevel;
}

export interface RegulatorAccessLog {
  id: string;
  regulator_name: string;
  regulator_agency: string;
  action_type: string;
  target_resource: string | null;
  ip_address: string | null;
  access_time: string;
  is_success: boolean;
}

// ─── Hook: useAssuranceReports (Read-Only) ────────────────────────────────────

export function useAssuranceReports(filters?: { category?: string }) {
  return useQuery<ContinuousAssuranceReport[]>({
    queryKey: ['assurance-reports', filters],
    queryFn: async () => {
      // SADECE DIŞARIYA YAYIMLANMIŞ RAPORLAR (is_published = true)
      let q = supabase
        .from('continuous_assurance_reports')
        .select('*')
        .eq('is_published', true)
        .order('generated_at', { ascending: false });

      if (filters?.category && filters.category !== 'ALL') {
        q = q.eq('category', filters.category);
      }

      const { data, error } = await q;
      if (error) {
        if (error.code === '42P01') return [];
        throw error;
      }

      return (data || []).map((row: any) => ({
        ...row,
        assurance_score_pct: Number(row.assurance_score_pct || 0),
        findings_count:      Number(row.findings_count || 0),
      })) as ContinuousAssuranceReport[];
    },
    staleTime: 1000 * 60 * 5,
  });
}

// ─── Hook: useSharedDossiers (Read-Only) ──────────────────────────────────────

export function useSharedDossiers(filters?: { accessLevel?: string }) {
  return useQuery<SharedDossier[]>({
    queryKey: ['shared-dossiers', filters],
    queryFn: async () => {
      let q = supabase
        .from('shared_dossiers')
        .select('*')
        .order('shared_date', { ascending: false });

      if (filters?.accessLevel && filters.accessLevel !== 'ALL') {
         q = q.eq('access_level', filters.accessLevel);
      }

      const { data, error } = await q;
      if (error) {
        if (error.code === '42P01') return [];
        throw error;
      }

      return (data || []) as SharedDossier[];
    },
    staleTime: 1000 * 60 * 5,
  });
}

// ─── Hook: useRegulatorLogs (Read-Only) ───────────────────────────────────────

export function useRegulatorLogs(limit = 100) {
  return useQuery<RegulatorAccessLog[]>({
    queryKey: ['regulator-logs', limit],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('regulator_access_logs')
        .select('*')
        .order('access_time', { ascending: false })
        .limit(limit);

      if (error) {
        if (error.code === '42P01') return [];
        throw error;
      }

      return (data || []) as RegulatorAccessLog[];
    },
    staleTime: 1000 * 30, // Logları daha sık yenileyebiliriz (Aktivite izleme)
  });
}

// ─── Hook: useRegulatorPortalKPI (Veri İşleme) ─────────────────────────────────

export function useRegulatorPortalKPI(reports: ContinuousAssuranceReport[], dossiers: SharedDossier[], logs: RegulatorAccessLog[]) {
  const safeReports  = reports || [];
  const safeDossiers = dossiers || [];
  const safeLogs     = logs || [];

  const totalPublishedReports = safeReports.length;
  // SIFIRA BÖLÜNMEYİ ENGELLE: (totalPublishedReports || 1)
  const avgAssuranceScore = totalPublishedReports > 0 
    ? Math.round(safeReports.reduce((s, r) => s + r.assurance_score_pct, 0) / (totalPublishedReports || 1)) 
    : 0;
  
  const totalFindings = safeReports.reduce((s, r) => s + r.findings_count, 0);
  
  const activeDossiers = safeDossiers.length;
  
  // Sadece son 24 saat logları
  const now = new Date();
  const yesterday = new Date(now.getTime() - 24 * 60 * 60 * 1000);
  const recentLogins = safeLogs.filter(l => l.action_type === 'LOGIN' && new Date(l.access_time) >= yesterday).length;

  return {
    totalPublishedReports,
    avgAssuranceScore,
    totalFindings,
    activeDossiers,
    recentLogins
  };
}
