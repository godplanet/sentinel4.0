/**
 * Risk Scenario API — Wave 22
 * FSD: entities/risk/api/scenario-api.ts
 *
 * Supabase kancaları: simulation_scenarios ve scenario_impacts tablolarından
 * bankacılık stres testi senaryolarını çeker.
 * 
 * KRİTİK: Tüm bölmeler (division) sıfıra-bölünme karşı korunmuştur:
 *   (total_assets || 1), (base_score_delta || 0)
 */

import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/shared/api/supabase';

// ─── Tipler ────────────────────────────────────────────────────────────────

export interface SimulationScenario {
  id: string;
  title: string;
  description: string | null;
  type: 'MACRO' | 'REGULATORY' | 'CREDIT' | 'LIQUIDITY';
  severity: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  /** 0.0 = Q1 2025 ... 1.0 = Q1 2026 */
  quarter_slot: number;
  parameters: {
    inflation_rate?: number;
    interest_rate_shock?: number;
    gdp_impact?: number;
    capital_adequacy_min?: number;
    credit_growth_cap?: number;
    provision_increase?: number;
    liquidity_coverage_ratio?: number;
    short_term_funding_stress?: number;
    npl_ratio?: number;
    loan_loss_rate?: number;
    usd_try_shock?: number;
    [key: string]: number | undefined;
  };
  is_active: boolean;
  created_at: string;
}

export interface ScenarioImpact {
  id: string;
  scenario_id: string;
  entity_type: string;
  /** Risk skoru artışı (pozitif = kötüleşme) */
  base_score_delta: number;
  /** Toplam varlık etkisi (yüzde kaybı) — (total_assets || 1) ile korunmuştur */
  total_assets_delta: number;
  notes: string | null;
}

export interface ScenarioImpactSummary {
  scenarioId: string;
  scenarioTitle: string;
  severity: SimulationScenario['severity'];
  /** Ağırlıklı risk skoru artışı */
  weightedScoreDelta: number;
  /** Toplam varlık kaybı yüzdesi */
  totalAssetsImpactPct: number;
  entityImpacts: ScenarioImpact[];
}

// ─── Hook: useRiskScenarios ────────────────────────────────────────────────

export function useRiskScenarios() {
  return useQuery<SimulationScenario[]>({
    queryKey: ['risk-scenarios'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('simulation_scenarios')
        .select('*')
        .eq('is_active', true)
        .order('quarter_slot', { ascending: true });

      if (error) {
        // Tablo henüz migrate edilmediyse graceful fallback
        if (error.code === '42P01') return getHardcodedScenariosFallback();
        throw error;
      }

      return (data ?? []) as SimulationScenario[];
    },
    staleTime: 1000 * 60 * 10, // 10 dakika
  });
}

// ─── Hook: useScenarioImpact ───────────────────────────────────────────────

export function useScenarioImpact(scenarioId: string | null) {
  return useQuery<ScenarioImpactSummary | null>({
    queryKey: ['scenario-impact', scenarioId],
    enabled: !!scenarioId,
    queryFn: async () => {
      if (!scenarioId) return null;

      const [scenarioRes, impactsRes] = await Promise.all([
        supabase
          .from('simulation_scenarios')
          .select('id, title, severity')
          .eq('id', scenarioId)
          .single(),
        supabase
          .from('scenario_impacts')
          .select('*')
          .eq('scenario_id', scenarioId),
      ]);

      if (scenarioRes.error) throw scenarioRes.error;
      if (impactsRes.error) throw impactsRes.error;

      const scenario = scenarioRes.data;
      const impacts = (impactsRes.data ?? []) as ScenarioImpact[];

      // Ağırlıklı skor deltası — SIFIRA BÖLÜNME KORUNMASI
      const totalWeight = impacts.length || 1;
      const weightedScoreDelta =
        impacts.reduce((sum, i) => sum + (i.base_score_delta || 0), 0) / totalWeight;

      // Toplam varlık etkisi yüzdesi — SIFIRA BÖLÜNME KORUNMASI
      const totalAssetsImpactPct =
        impacts.reduce((sum, i) => sum + Math.abs(i.total_assets_delta || 0), 0) /
        (impacts.length || 1) *
        100;

      return {
        scenarioId: scenario.id,
        scenarioTitle: scenario.title,
        severity: scenario.severity as SimulationScenario['severity'],
        weightedScoreDelta: Number(weightedScoreDelta.toFixed(2)),
        totalAssetsImpactPct: Number(totalAssetsImpactPct.toFixed(2)),
        entityImpacts: impacts,
      };
    },
    staleTime: 1000 * 60 * 5,
  });
}

// ─── Yardımcı: Aktif Senaryoyu Quarter'dan Bul ────────────────────────────

/**
 * timeProgress (0.0 → 1.0) değerine göre en yakın senaryo döndürür.
 * Eğer senaryo yoksa null döner.
 */
export function getActiveScenario(
  scenarios: SimulationScenario[],
  timeProgress: number
): SimulationScenario | null {
  if (!scenarios || scenarios.length === 0) return null;
  return scenarios.reduce((prev, curr) =>
    Math.abs(curr.quarter_slot - timeProgress) < Math.abs(prev.quarter_slot - timeProgress)
      ? curr
      : prev
  );
}

// ─── Fallback (DB tablolar henüz oluşturulmadıysa) ────────────────────────

function getHardcodedScenariosFallback(): SimulationScenario[] {
  return [
    {
      id: '11111111-2200-0000-0000-000000000001',
      title: 'Enflasyon Şoku',
      description: 'TCMB faiz koridoru 500bps artışı — kredi maliyeti baskısı',
      type: 'MACRO',
      severity: 'HIGH',
      quarter_slot: 0.25,
      parameters: { inflation_rate: 0.62, interest_rate_shock: 5.0 },
      is_active: true,
      created_at: new Date().toISOString(),
    },
    {
      id: '11111111-2200-0000-0000-000000000002',
      title: 'BDDK Regülasyon Daralması',
      description: 'SYO minimumu %12 → %16 zorunluluğu',
      type: 'REGULATORY',
      severity: 'CRITICAL',
      quarter_slot: 0.5,
      parameters: { capital_adequacy_min: 0.16 },
      is_active: true,
      created_at: new Date().toISOString(),
    },
    {
      id: '11111111-2200-0000-0000-000000000004',
      title: 'Döviz Kuru Baskısı',
      description: 'USD/TRY +%30 şok senaryosu',
      type: 'MACRO',
      severity: 'HIGH',
      quarter_slot: 0.75,
      parameters: { usd_try_shock: 0.30 },
      is_active: true,
      created_at: new Date().toISOString(),
    },
    {
      id: '11111111-2200-0000-0000-000000000005',
      title: 'Kredi Temerrüt Dalgası',
      description: 'NPL oranı %3.5 → %9.2 stres testi',
      type: 'CREDIT',
      severity: 'CRITICAL',
      quarter_slot: 1.0,
      parameters: { npl_ratio: 0.092 },
      is_active: true,
      created_at: new Date().toISOString(),
    },
  ];
}
