import { create } from 'zustand';
import { ACTIVE_TENANT_ID } from '@/shared/lib/constants';
import type { RiskLibraryItem, CreateRiskInput, UpdateRiskInput } from './types';

interface RiskLibraryStore {
  risks: RiskLibraryItem[];
  selectedRisk: RiskLibraryItem | null;
  loading: boolean;
  error: string | null;

  setRisks: (risks: RiskLibraryItem[]) => void;
  setSelectedRisk: (risk: RiskLibraryItem | null) => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;

  addRisk: (input: CreateRiskInput) => RiskLibraryItem;
  updateRisk: (input: UpdateRiskInput) => void;
  deleteRisk: (id: string) => void;
  getRiskById: (id: string) => RiskLibraryItem | undefined;

  getStats: () => {
    total: number;
    critical: number;
    high: number;
    medium: number;
    low: number;
  };
}

const MOCK_TENANT_ID = ACTIVE_TENANT_ID;
const MOCK_USER_ID = '11111111-1111-1111-1111-000000000002';

export const useRiskLibraryStore = create<RiskLibraryStore>((set, get) => ({
  risks: [],
  selectedRisk: null,
  loading: false,
  error: null,

  setRisks: (risks) => set({ risks }),
  setSelectedRisk: (risk) => set({ selectedRisk: risk }),
  setLoading: (loading) => set({ loading }),
  setError: (error) => set({ error }),

  addRisk: (input) => {
    const inherentScore = calculateInherentScore(
      input.impact_score,
      input.likelihood_score
    );
    const residualScore = calculateResidualScore(
      inherentScore,
      input.control_effectiveness
    );

    const newRisk: RiskLibraryItem = {
      id: crypto.randomUUID(),
      tenant_id: MOCK_TENANT_ID,
      risk_code: input.risk_code,
      title: input.title,
      description: input.description,
      category: input.category,
      impact_score: input.impact_score,
      likelihood_score: input.likelihood_score,
      inherent_score: inherentScore,
      control_effectiveness: input.control_effectiveness,
      residual_score: residualScore,
      tags: input.tags || [],
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      created_by: MOCK_USER_ID,
    };

    set((state) => ({
      risks: [...state.risks, newRisk],
    }));

    return newRisk;
  },

  updateRisk: (input) => {
    set((state) => ({
      risks: state.risks.map((risk) => {
        if (risk.id !== input.id) return risk;

        const updatedRisk = { ...risk, ...input };

        const inherentScore = calculateInherentScore(
          updatedRisk.impact_score,
          updatedRisk.likelihood_score
        );
        const residualScore = calculateResidualScore(
          inherentScore,
          updatedRisk.control_effectiveness
        );

        return {
          ...updatedRisk,
          inherent_score: inherentScore,
          residual_score: residualScore,
          updated_at: new Date().toISOString(),
          updated_by: MOCK_USER_ID,
        };
      }),
    }));
  },

  deleteRisk: (id) => {
    set((state) => ({
      risks: state.risks.filter((risk) => risk.id !== id),
      selectedRisk:
        state.selectedRisk?.id === id ? null : state.selectedRisk,
    }));
  },

  getRiskById: (id) => {
    return get().risks.find((risk) => risk.id === id);
  },

  getStats: () => {
    const risks = get().risks;

    return {
      total: risks.length,
      critical: risks.filter((r) => r.inherent_score >= 85).length,
      high: risks.filter((r) => r.inherent_score >= 70 && r.inherent_score < 85)
        .length,
      medium: risks.filter((r) => r.inherent_score >= 50 && r.inherent_score < 70)
        .length,
      low: risks.filter((r) => r.inherent_score < 50).length,
    };
  },
}));

function calculateInherentScore(impact: number, likelihood: number): number {
  return Math.sqrt(impact * likelihood) * 10;
}

function calculateResidualScore(
  inherentScore: number,
  controlEffectiveness: number
): number {
  return inherentScore * (1 - controlEffectiveness);
}
