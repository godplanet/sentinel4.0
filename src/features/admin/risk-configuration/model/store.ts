import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface RiskConfigState {
  weights: {
    impact: number;
    volume: number;
    control: number;
  };

  thresholds: {
    critical: number;
    high: number;
    medium: number;
  };

  useLogarithmicScale: boolean;
  autoCalculate: boolean;

  updateWeight: (key: keyof RiskConfigState['weights'], value: number) => void;
  updateThreshold: (key: keyof RiskConfigState['thresholds'], value: number) => void;
  toggleLogarithmic: () => void;
}

export const useRiskConfigStore = create<RiskConfigState>()(
  persist(
    (set) => ({
      weights: {
        impact: 1.5,
        volume: 1.0,
        control: 1.0,
      },
      thresholds: {
        critical: 12,
        high: 8,
        medium: 4,
      },
      useLogarithmicScale: true,
      autoCalculate: true,

      updateWeight: (key, value) =>
        set((state) => ({ weights: { ...state.weights, [key]: value } })),

      updateThreshold: (key, value) =>
        set((state) => ({ thresholds: { ...state.thresholds, [key]: value } })),

      toggleLogarithmic: () =>
        set((state) => ({ useLogarithmicScale: !state.useLogarithmicScale })),
    }),
    { name: 'sentinel-risk-config' }
  )
);
