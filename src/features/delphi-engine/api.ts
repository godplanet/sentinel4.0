/**
 * Delphi Engine – RKM (rkm_risks) tablosu ile risk oylama ve konsensüs mühürleme.
 */

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/shared/api/supabase';
import type { DelphiRisk, Vote } from './types';

const QUERY_KEY = ['delphi-risks'] as const;

/** Supabase rkm_risks satırı (Delphi için gerekli alanlar) */
interface RkmRiskRow {
  id: string;
  risk_title: string;
  risk_description: string | null;
  risk_category: string | null;
  risk_status: string | null;
  inherent_impact: number | null;
  inherent_likelihood: number | null;
  inherent_volume: number | null;
}

function clampScore(v: number | null | undefined): number {
  if (v == null || Number.isNaN(v)) return 3;
  return Math.max(1, Math.min(5, Math.round(v)));
}

/**
 * rkm_risks tablosundan ACTIVE statülü ilk 10 riski çeker;
 * DelphiRisk + mevcut skorlar (currentVote) formatına map eder.
 */
export async function fetchDelphiRisks(): Promise<DelphiRisk[]> {
  const { data, error } = await supabase
    .from('rkm_risks')
    .select('id, risk_title, risk_description, risk_category, risk_status, inherent_impact, inherent_likelihood, inherent_volume')
    .eq('risk_status', 'ACTIVE')
    .order('risk_code', { ascending: true })
    .limit(10);

  if (error) throw error;
  const rows = (data ?? []) as RkmRiskRow[];

  return rows.map((r) => {
    const impact = clampScore(r.inherent_impact);
    const likelihood = clampScore(r.inherent_likelihood);
    const volume = clampScore(r.inherent_volume);
    return {
      id: r.id,
      title: r.risk_title ?? 'Başlıksız Risk',
      description: r.risk_description ?? '',
      category: r.risk_category ?? 'Genel',
      currentVote: {
        impact,
        likelihood,
        velocity: volume,
      },
    } as DelphiRisk;
  });
}

export function useDelphiRisks() {
  return useQuery({
    queryKey: QUERY_KEY,
    queryFn: fetchDelphiRisks,
  });
}

export interface DelphiConsensusUpdate {
  riskId: string;
  vote: Vote;
}

/**
 * Tek bir riskin inherent skorlarını günceller (rkm_risks UPDATE).
 */
async function updateRkmRiskScores(riskId: string, vote: Vote): Promise<void> {
  const { error } = await supabase
    .from('rkm_risks')
    .update({
      inherent_impact: Math.max(1, Math.min(5, vote.impact)),
      inherent_likelihood: Math.max(1, Math.min(5, vote.likelihood)),
      inherent_volume: Math.max(1, Math.min(5, vote.velocity)),
      updated_at: new Date().toISOString(),
    })
    .eq('id', riskId);

  if (error) throw error;
}

/**
 * Birden fazla riskin konsensüs skorlarını rkm_risks tablosuna yazar.
 */
export async function saveDelphiConsensus(updates: DelphiConsensusUpdate[]): Promise<void> {
  for (const { riskId, vote } of updates) {
    await updateRkmRiskScores(riskId, vote);
  }
}

export function useSaveDelphiConsensus() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (updates: DelphiConsensusUpdate[]) => saveDelphiConsensus(updates),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEY });
    },
  });
}
