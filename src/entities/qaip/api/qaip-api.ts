/**
 * SENTINEL GRC v3.0 — Auto-QAIP Engine: Supabase API Katmanı
 * ============================================================
 * GIAS 2025 Standard 12.1 — Kalite Güvence ve İyileştirme Programı
 *
 * Bu katman entities/qaip/api/ altında yer alır (FSD mimarisi).
 * Tüm sorgular gerçek Supabase tablolarına karşı çalışır:
 *   - qaip_checklists
 *   - qaip_reviews
 *   - workpapers (kalite skoru hesabı)
 *   - audit_findings (reddedilen bulgular)
 *
 * AŞIRI SAVUNMACI PROGRAMLAMA: Her matematiksel işlemde (x || 1) bölme güvencesi kullanılır.
 */

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/shared/api/supabase';
import toast from 'react-hot-toast';

// ─── Tür Tanımları ─────────────────────────────────────────────────────────────

export interface QaipChecklist {
  id: string;
  title: string;
  description: string | null;
  criteria: QaipCriterion[];
  tenant_id: string;
  created_at: string;
  updated_at: string | null;
}

export interface QaipCriterion {
  id: string;
  label: string;
  weight: number;
  required: boolean;
  description?: string;
}

export interface QaipReview {
  id: string;
  engagement_id: string | null;
  reviewer_id: string | null;
  checklist_id: string | null;
  results: Record<string, number | boolean>;
  total_score: number;
  status: 'IN_PROGRESS' | 'COMPLETED' | 'ARCHIVED';
  notes: string | null;
  completed_at: string | null;
  created_at: string;
}

export interface QaipHealthScore {
  overall: number;                      // 0-100
  zone: 'GREEN' | 'YELLOW' | 'RED';   // 85+ GREEN, 70-84 YELLOW, <70 RED
  components: QaipHealthComponent[];
  passesGate: boolean;
  source: 'REALTIME' | 'CACHED';      // Supabase vs lokal hesap
  computed_at: string;
}

export interface QaipHealthComponent {
  key: string;
  label: string;
  score: number;               // 0-100
  weight: number;              // 0-1
  weighted: number;
  gap: string;
  raw_total: number;
  raw_passing: number;
}

export interface QaipStatsInput {
  engagement_id?: string;
  tenant_id?: string;
}

// ─── Query Keys ────────────────────────────────────────────────────────────────

export const QAIP_KEYS = {
  checklists: ['qaip-checklists'] as const,
  checklist: (id: string) => ['qaip-checklist', id] as const,
  reviews: (engagementId?: string) => ['qaip-reviews', engagementId ?? 'all'] as const,
  healthScore: (input: QaipStatsInput) => ['qaip-health', JSON.stringify(input)] as const,
};

// ─── QAIP Checklist: Sorgulama ────────────────────────────────────────────────

export async function fetchQaipChecklists(): Promise<QaipChecklist[]> {
  const { data, error } = await supabase
    .from('qaip_checklists')
    .select('*')
    .order('created_at', { ascending: false });

  if (error) {
    console.error('[SENTINEL][QAIP] Checklist sorgulama başarısız:', error);
    throw error;
  }
  return ((data ?? []) as QaipChecklist[]).map((c) => ({
    ...c,
    criteria: Array.isArray(c.criteria) ? c.criteria : [],
  }));
}

export function useQaipChecklists() {
  return useQuery({
    queryKey: QAIP_KEYS.checklists,
    queryFn: fetchQaipChecklists,
    staleTime: 60_000,
  });
}

// ─── QAIP Reviews: Sorgulama ──────────────────────────────────────────────────

export async function fetchQaipReviews(engagementId?: string): Promise<QaipReview[]> {
  let query = supabase
    .from('qaip_reviews')
    .select('*')
    .order('created_at', { ascending: false });

  if (engagementId) {
    query = query.eq('engagement_id', engagementId);
  }

  const { data, error } = await query;
  if (error) {
    console.error('[SENTINEL][QAIP] Review sorgulama başarısız:', error);
    throw error;
  }
  return (data ?? []) as QaipReview[];
}

export function useQaipReviews(engagementId?: string) {
  return useQuery({
    queryKey: QAIP_KEYS.reviews(engagementId),
    queryFn: () => fetchQaipReviews(engagementId),
    staleTime: 30_000,
  });
}

// ─── Auto-QAIP: Gerçek Supabase Verisiyle Sağlık Skoru ────────────────────────
// GIAS 2025 Standard 12.1 — Otomatik kalite ölçümü

export async function computeQaipHealth(input: QaipStatsInput): Promise<QaipHealthScore> {
  const now = new Date().toISOString();

  // Paralel sorgular: workpapers, findings, qaip_reviews
  const [wpRes, findRes, reviewRes] = await Promise.all([
    supabase
      .from('workpapers')
      .select('id, status, assigned_to, due_date, approved_at, created_at')
      .eq(input.engagement_id ? 'engagement_id' : 'status', input.engagement_id ?? 'DRAFT')
      .order('created_at', { ascending: false })
      .limit(500),
    supabase
      .from('audit_findings')
      .select('id, status, risk_level, created_at')
      .eq('status', 'REJECTED')
      .limit(200),
    supabase
      .from('qaip_reviews')
      .select('id, total_score, status, completed_at')
      .order('created_at', { ascending: false })
      .limit(50),
  ]);

  // Hataları logla ama durma — savunmacı devam et
  if (wpRes.error)    console.error('[SENTINEL][QAIP] workpapers sorgusu hatası:', wpRes.error);
  if (findRes.error)  console.error('[SENTINEL][QAIP] findings sorgusu hatası:', findRes.error);
  if (reviewRes.error) console.error('[SENTINEL][QAIP] reviews sorgusu hatası:', reviewRes.error);

  const workpapers = wpRes.data ?? [];
  const rejectedFindings = findRes.data ?? [];
  const reviews = reviewRes.data ?? [];

  // ── Komponent 1: Çalışma Kağıdı Zamanında Kapanma ──────────────────────────
  const totalWp = (workpapers || []).length;
  const overdueWp = (workpapers || []).filter((w) => {
    if (!w?.due_date) return false;
    return new Date(w.due_date) < new Date() && w?.status !== 'APPROVED';
  }).length;
  const onTimeWp = totalWp - overdueWp;
  const wpScore = Math.round((onTimeWp / (totalWp || 1)) * 100);
  const wpGap = overdueWp > 0 ? `${overdueWp} çalışma kağıdı gecikmiş (${totalWp} toplamdan)` : '';

  const comp1: QaipHealthComponent = {
    key: 'workpaper_timeliness',
    label: 'Çalışma Kağıdı Zamanlılığı',
    score: wpScore,
    weight: 0.3,
    weighted: Math.round(wpScore * 0.3),
    gap: wpGap,
    raw_total: totalWp,
    raw_passing: onTimeWp,
  };

  // ── Komponent 2: Çalışma Kağıdı Onay Oranı ────────────────────────────────
  const approvedWp = (workpapers || []).filter((w) => w?.status === 'APPROVED').length;
  const approvalScore = Math.round((approvedWp / (totalWp || 1)) * 100);
  const approvalGap = totalWp - approvedWp > 0
    ? `${totalWp - approvedWp} çalışma kağıdı henüz onaylanmadı`
    : '';

  const comp2: QaipHealthComponent = {
    key: 'workpaper_approval',
    label: 'Çalışma Kağıdı Onay Oranı',
    score: approvalScore,
    weight: 0.25,
    weighted: Math.round(approvalScore * 0.25),
    gap: approvalGap,
    raw_total: totalWp,
    raw_passing: approvedWp,
  };

  // ── Komponent 3: Reddedilen Bulgular ─────────────────────────────────────
  // Hiç reddedilen bulgu yoksa 100 puan; fazlaysa azalır
  const totalReviewed = reviews.length;
  const rejectionRate = (rejectedFindings || []).length / ((totalReviewed || 1) + (rejectedFindings || []).length);
  const rejectionScore = Math.round(Math.max(0, (1 - rejectionRate) * 100));
  const rejectionGap = (rejectedFindings || []).length > 0
    ? `${(rejectedFindings || []).length} bulgu reddedildi`
    : '';

  const comp3: QaipHealthComponent = {
    key: 'finding_rejection',
    label: 'Bulgu Red Oranı',
    score: rejectionScore,
    weight: 0.25,
    weighted: Math.round(rejectionScore * 0.25),
    gap: rejectionGap,
    raw_total: (rejectedFindings || []).length + totalReviewed,
    raw_passing: totalReviewed,
  };

  // ── Komponent 4: QAIP Review Tamamlanma ───────────────────────────────────
  const completedReviews = (reviews || []).filter((r) => r?.status === 'COMPLETED').length;
  const reviewScore = totalReviewed === 0 ? 50 : Math.round((completedReviews / (totalReviewed || 1)) * 100);
  const reviewGap = totalReviewed - completedReviews > 0
    ? `${totalReviewed - completedReviews} QAIP incelemesi tamamlanmadı`
    : '';

  const comp4: QaipHealthComponent = {
    key: 'qaip_completion',
    label: 'QAIP İnceleme Tamamlanma',
    score: reviewScore,
    weight: 0.2,
    weighted: Math.round(reviewScore * 0.2),
    gap: reviewGap,
    raw_total: totalReviewed,
    raw_passing: completedReviews,
  };

  const components = [comp1, comp2, comp3, comp4];
  const overall = components.reduce((sum, c) => sum + (c?.weighted ?? 0), 0);
  const zone: QaipHealthScore['zone'] =
    overall >= 85 ? 'GREEN' : overall >= 70 ? 'YELLOW' : 'RED';

  return {
    overall,
    zone,
    components,
    passesGate: overall >= 85,
    source: 'REALTIME',
    computed_at: now,
  };
}

export function useQaipHealth(input: QaipStatsInput = {}) {
  return useQuery({
    queryKey: QAIP_KEYS.healthScore(input),
    queryFn: () => computeQaipHealth(input),
    staleTime: 120_000, // 2 dakika cache
    retry: 2,
  });
}

// ─── QAIP Review Oluşturma ────────────────────────────────────────────────────

export interface CreateQaipReviewInput {
  engagement_id?: string;
  reviewer_id?: string;
  checklist_id?: string;
  notes?: string;
}

export async function createQaipReview(input: CreateQaipReviewInput): Promise<QaipReview> {
  const { data, error } = await supabase
    .from('qaip_reviews')
    .insert({
      engagement_id: input?.engagement_id ?? null,
      reviewer_id: input?.reviewer_id ?? null,
      checklist_id: input?.checklist_id ?? null,
      results: {},
      total_score: 0,
      status: 'IN_PROGRESS',
      notes: input?.notes ?? null,
    })
    .select()
    .single();

  if (error) {
    console.error('[SENTINEL][QAIP] Review oluşturulamadı:', error);
    throw error;
  }
  return data as QaipReview;
}

export function useCreateQaipReview() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: createQaipReview,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['qaip-reviews'] });
      queryClient.invalidateQueries({ queryKey: ['qaip-health'] });
      toast.success('QAIP incelemesi oluşturuldu ✓');
    },
    onError: (err) => {
      const msg = err instanceof Error ? err.message : 'Bilinmeyen hata';
      toast.error(`QAIP review oluşturulamadı: ${msg}`);
    },
  });
}
