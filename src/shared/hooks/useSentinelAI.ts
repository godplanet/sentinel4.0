import { useState, useCallback } from 'react';
import { useAISettingsStore } from '@/features/ai-agents/model/ai-settings-store';
import { createEngine } from '@/shared/api/ai';

interface UseSentinelAIReturn {
  loading: boolean;
  result: string | null;
  error: string | null;
  configured: boolean;
  generate: (prompt: string, systemPrompt?: string, contextData?: string) => Promise<string | null>;
  reset: () => void;
}

const SYSTEM_PROMPT = `Sen Sentinel Prime adinda, BDDK mevzuatina hakim, supheci ve detayci bir Ic Denetim yapay zeka asistanisin.
Kanit olmadan varsayim yapma. Her zaman kaynak goster.
Turk bankacilik sektorune ozgu riskleri, regulasyonlari ve iyi uygulamalari biliyorsun.
Yanitlarini yapilandirilmis sekilde ver. Turkce yanit ver. Kisa ve oz cevapla.`;

export function useSentinelAI(): UseSentinelAIReturn {
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const isConfigured = useAISettingsStore((s) => s.isConfigured());
  const getConfig = useAISettingsStore((s) => s.getConfig);
  const persona = useAISettingsStore((s) => s.persona);

  const generate = useCallback(
    async (prompt: string, systemPrompt?: string, contextData?: string): Promise<string | null> => {
      if (!isConfigured) {
        setError('AI motoru yapilandirilmamis. Ayarlar > Cognitive Engine sayfasindan API anahtarinizi girin.');
        return null;
      }

      setLoading(true);
      setError(null);
      setResult(null);

      try {
        const config = getConfig();
        const engine = createEngine(config);
        const text = await engine.generateText(
          prompt,
          systemPrompt || persona || SYSTEM_PROMPT,
          contextData,
        );
        setResult(text);
        return text;
      } catch (err: any) {
        const msg = err?.message || 'AI analiz sirasinda hata olustu';
        setError(msg);
        return null;
      } finally {
        setLoading(false);
      }
    },
    [isConfigured, getConfig, persona],
  );

  const reset = useCallback(() => {
    setResult(null);
    setError(null);
    setLoading(false);
  }, []);

  return { loading, result, error, configured: isConfigured, generate, reset };
}
