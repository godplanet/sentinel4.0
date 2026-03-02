import { create } from 'zustand';
import type { DelphiRisk, Vote } from './types';

interface DelphiState {
  risks: DelphiRisk[];
  currentRiskIndex: number;
  round: number;
  votes: Record<string, Vote>;
  isComplete: boolean;
  setRisks: (risks: DelphiRisk[]) => void;
  submitVote: (riskId: string, vote: Vote) => void;
  nextRisk: () => void;
  reset: () => void;
}

export const useDelphiStore = create<DelphiState>((set, get) => ({
  risks: [],
  currentRiskIndex: 0,
  round: 1,
  votes: {},
  isComplete: false,

  setRisks: (risks) =>
    set({
      risks,
      currentRiskIndex: 0,
      round: 1,
      votes: {},
      isComplete: false,
    }),

  submitVote: (riskId, vote) => {
    set((state) => ({ votes: { ...state.votes, [riskId]: vote } }));
    get().nextRisk();
  },

  nextRisk: () => {
    set((state) => {
      const next = state.currentRiskIndex + 1;
      if (next >= state.risks.length) {
        return { isComplete: true };
      }
      return { currentRiskIndex: next };
    });
  },

  reset: () =>
    set({
      currentRiskIndex: 0,
      round: 1,
      votes: {},
      isComplete: false,
    }),
}));
