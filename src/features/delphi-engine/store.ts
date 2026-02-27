import { create } from 'zustand';
import type { DelphiRisk, Vote } from './types';

const MOCK_RISKS: DelphiRisk[] = [
  {
    id: 'risk-1',
    title: 'AI Model Data Poisoning',
    description:
      'Adversarial manipulation of training data compromising the integrity of AI-driven credit scoring and fraud detection models.',
    category: 'Teknoloji & Siber',
  },
  {
    id: 'risk-2',
    title: 'Makroekonomik Likidite Şoku',
    description:
      'Küresel likidite koşullarının ani sıkılaşması, mevduat çıkışlarını tetikleyerek bankanın kısa vadeli yükümlülüklerini yerine getirme kapasitesini zayıflatıyor.',
    category: 'Finansal & Piyasa',
  },
  {
    id: 'risk-3',
    title: 'Dijital Şeriat Uyumsuzluğu',
    description:
      'Algoritmik ürün fiyatlaması veya dijital sözleşme yapılarının AAOIFI Şeriat standartlarını ihlal etmesi; itibar ve düzenleyici risk yaratması.',
    category: 'Şeriat & Uyum',
  },
];

interface DelphiState {
  risks: DelphiRisk[];
  currentRiskIndex: number;
  round: number;
  votes: Record<string, Vote>;
  isComplete: boolean;
  submitVote: (riskId: string, vote: Vote) => void;
  nextRisk: () => void;
  reset: () => void;
}

export const useDelphiStore = create<DelphiState>((set, get) => ({
  risks: MOCK_RISKS,
  currentRiskIndex: 0,
  round: 1,
  votes: {},
  isComplete: false,

  submitVote: (riskId, vote) => {
    set(state => ({ votes: { ...state.votes, [riskId]: vote } }));
    get().nextRisk();
  },

  nextRisk: () => {
    set(state => {
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
