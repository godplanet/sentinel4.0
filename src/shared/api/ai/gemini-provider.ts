import type { IAIEngine, PingResult } from './types';
import { GEMINI_FALLBACK_MODEL } from './types';

const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL;
const SUPABASE_ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY;
const EDGE_FN_URL = `${SUPABASE_URL}/functions/v1/sentinel-ai`;

function sanitizeModelName(raw: string): string {
  let name = raw.trim();
  if (name.startsWith('models/')) {
    name = name.slice(7);
  }
  return name || GEMINI_FALLBACK_MODEL;
}

function parseGeminiError(status: number, message: string): string {
  if (status === 404 || message.includes('not found')) {
    return 'Model Bulunamadi. Lutfen model secimini degistirin veya "gemini-1.5-flash" deneyin.';
  }
  if (status === 429 || message.includes('Resource has been exhausted') || message.includes('RESOURCE_EXHAUSTED')) {
    return 'API kotasi doldu (429). Ucretsiz plan limiti asilmis olabilir. Daha dusuk bir model deneyin veya bekleyin.';
  }
  if (status === 400 && message.includes('API key')) {
    return 'Gecersiz API anahtari. Lutfen Google AI Studio\'dan anahtarinizi kontrol edin.';
  }
  if (status === 403) {
    return 'Erisim reddedildi. API anahtarinizin bu modele erisim yetkisi yok.';
  }
  return message || `Gemini API hatasi: ${status}`;
}

export class GeminiProvider implements IAIEngine {
  private apiKey: string;
  private modelName: string;

  constructor(apiKey: string, model: string) {
    this.apiKey = apiKey;
    this.modelName = sanitizeModelName(model);
  }

  private async callEdge(payload: Record<string, unknown>): Promise<Response> {
    return fetch(EDGE_FN_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${SUPABASE_ANON_KEY}`,
      },
      body: JSON.stringify(payload),
    });
  }

  async generateText(prompt: string, systemPrompt?: string, contextData?: string): Promise<string> {
    const resp = await this.callEdge({
      action: 'generate',
      provider: 'gemini',
      apiKey: this.apiKey,
      model: this.modelName,
      prompt,
      systemPrompt,
      contextData,
    });

    if (!resp.ok) {
      const err = await resp.json().catch(() => ({ message: resp.statusText }));
      const friendlyMsg = parseGeminiError(resp.status, err.message || '');

      if (resp.status === 404 && this.modelName !== GEMINI_FALLBACK_MODEL) {
        const fallbackResp = await this.callEdge({
          action: 'generate',
          provider: 'gemini',
          apiKey: this.apiKey,
          model: GEMINI_FALLBACK_MODEL,
          prompt,
          systemPrompt,
          contextData,
        });
        if (fallbackResp.ok) {
          const data = await fallbackResp.json();
          if (!data.error) return data.text || '';
        }
      }

      throw new Error(friendlyMsg);
    }

    const data = await resp.json();
    if (data.error) throw new Error(parseGeminiError(0, data.message || 'Gemini hatasi'));
    return data.text || '';
  }

  async *streamText(prompt: string, systemPrompt?: string, contextData?: string): AsyncGenerator<string> {
    const resp = await this.callEdge({
      action: 'stream',
      provider: 'gemini',
      apiKey: this.apiKey,
      model: this.modelName,
      prompt,
      systemPrompt,
      contextData,
    });

    if (!resp.ok) {
      const err = await resp.json().catch(() => ({ message: resp.statusText }));
      throw new Error(parseGeminiError(resp.status, err.message || ''));
    }

    const reader = resp.body?.getReader();
    if (!reader) throw new Error('Stream okunamiyor');

    const decoder = new TextDecoder();
    let buffer = '';

    while (true) {
      const { done, value } = await reader.read();
      if (done) break;

      buffer += decoder.decode(value, { stream: true });
      const lines = buffer.split('\n');
      buffer = lines.pop() || '';

      for (const line of lines) {
        if (line.startsWith('data: ')) {
          const raw = line.slice(6).trim();
          if (!raw || raw === '[DONE]') continue;
          try {
            const parsed = JSON.parse(raw);
            const text = parsed?.candidates?.[0]?.content?.parts?.[0]?.text;
            if (text) yield text;
          } catch {
            /* skip */
          }
        }
      }
    }

    if (buffer.startsWith('data: ')) {
      const raw = buffer.slice(6).trim();
      if (raw && raw !== '[DONE]') {
        try {
          const parsed = JSON.parse(raw);
          const text = parsed?.candidates?.[0]?.content?.parts?.[0]?.text;
          if (text) yield text;
        } catch {
          /* skip */
        }
      }
    }
  }

  async ping(): Promise<PingResult> {
    try {
      const resp = await this.callEdge({
        action: 'ping',
        provider: 'gemini',
        apiKey: this.apiKey,
        model: this.modelName,
        prompt: '',
      });

      const data = await resp.json();

      if (data.ok) return { ok: true };

      if (!data.ok && data.error && this.modelName !== GEMINI_FALLBACK_MODEL) {
        const isModelError = typeof data.error === 'string' &&
          (data.error.includes('not found') || data.error.includes('404') || data.error.includes('RESOURCE_EXHAUSTED'));

        if (isModelError) {
          const fallbackResp = await this.callEdge({
            action: 'ping',
            provider: 'gemini',
            apiKey: this.apiKey,
            model: GEMINI_FALLBACK_MODEL,
            prompt: '',
          });
          const fallbackData = await fallbackResp.json();
          if (fallbackData.ok) {
            return {
              ok: true,
              error: `"${this.modelName}" bulunamadi, "${GEMINI_FALLBACK_MODEL}" ile baglanti kuruldu. Model secimini degistirmenizi oneririz.`,
            };
          }
        }
      }

      const errorMsg = parseGeminiError(0, data.error || 'Bilinmeyen hata');
      return { ok: false, error: errorMsg };
    } catch (err: any) {
      return { ok: false, error: err.message };
    }
  }
}
