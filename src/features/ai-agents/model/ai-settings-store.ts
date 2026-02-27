import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { AIProviderType, AIProviderConfig } from '@/shared/api/ai/types';
import { DEFAULT_MODELS } from '@/shared/api/ai/types';

const DEFAULT_PERSONA = `Sen Sentinel Prime adinda, BDDK mevzuatina hakim, supheci ve detayci bir Ic Denetim asistanisin.
Kanit olmadan varsayim yapma. Her zaman kaynak goster.
Turk bankacilik sektorune ozgu riskleri, regülasyonlari ve iyi uygulamalari biliyorsun.
Yanitlarini yapilandirilmis sekilde ver: Tespitler, Riskler, Oneriler.
Turkce yanit ver.`;

interface AISettingsState {
  provider: AIProviderType;
  apiKey: string;
  baseUrl: string;
  model: string;
  persona: string;
  includeContext: boolean;
  connectionStatus: 'unknown' | 'connected' | 'failed';

  setProvider: (provider: AIProviderType) => void;
  setApiKey: (key: string) => void;
  setBaseUrl: (url: string) => void;
  setModel: (model: string) => void;
  setPersona: (persona: string) => void;
  setIncludeContext: (include: boolean) => void;
  setConnectionStatus: (status: 'unknown' | 'connected' | 'failed') => void;
  getConfig: () => AIProviderConfig;
  isConfigured: () => boolean;
  resetPersona: () => void;
}

export const useAISettingsStore = create<AISettingsState>()(
  persist(
    (set, get) => ({
      provider: 'gemini',
      apiKey: '',
      baseUrl: '',
      model: DEFAULT_MODELS.gemini,
      persona: DEFAULT_PERSONA,
      includeContext: true,
      connectionStatus: 'unknown',

      setProvider: (provider) => set({
        provider,
        model: DEFAULT_MODELS[provider],
        connectionStatus: 'unknown',
      }),
      setApiKey: (apiKey) => set({ apiKey, connectionStatus: 'unknown' }),
      setBaseUrl: (baseUrl) => set({ baseUrl, connectionStatus: 'unknown' }),
      setModel: (model) => set({ model }),
      setPersona: (persona) => set({ persona }),
      setIncludeContext: (includeContext) => set({ includeContext }),
      setConnectionStatus: (connectionStatus) => set({ connectionStatus }),

      getConfig: () => {
        const s = get();
        return { provider: s.provider, apiKey: s.apiKey, baseUrl: s.baseUrl, model: s.model };
      },

      isConfigured: () => {
        const s = get();
        if (s.provider === 'local') return !!s.baseUrl;
        return !!s.apiKey;
      },

      resetPersona: () => set({ persona: DEFAULT_PERSONA }),
    }),
    {
      name: 'sentinel-ai-settings',
      partialize: (state) => ({
        provider: state.provider,
        apiKey: state.apiKey,
        baseUrl: state.baseUrl,
        model: state.model,
        persona: state.persona,
        includeContext: state.includeContext,
      }),
    }
  )
);
