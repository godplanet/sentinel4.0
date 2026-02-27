import type { IAIEngine, PingResult } from './types';

const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL;
const SUPABASE_ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY;
const EDGE_FN_URL = `${SUPABASE_URL}/functions/v1/sentinel-ai`;

export class OpenAIProvider implements IAIEngine {
  private apiKey: string;
  private modelName: string;

  constructor(apiKey: string, model: string, _baseUrl?: string) {
    this.apiKey = apiKey;
    this.modelName = model;
  }

  async generateText(prompt: string, systemPrompt?: string, contextData?: string): Promise<string> {
    const resp = await fetch(EDGE_FN_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${SUPABASE_ANON_KEY}`,
      },
      body: JSON.stringify({
        action: 'generate',
        provider: 'openai',
        apiKey: this.apiKey,
        model: this.modelName,
        prompt,
        systemPrompt,
        contextData,
      }),
    });

    if (!resp.ok) {
      const err = await resp.json().catch(() => ({ message: resp.statusText }));
      throw new Error(err.message || `OpenAI API hatasi: ${resp.status}`);
    }

    const data = await resp.json();
    if (data.error) throw new Error(data.message || 'OpenAI hatasi');
    return data.text || '';
  }

  async *streamText(prompt: string, systemPrompt?: string, contextData?: string): AsyncGenerator<string> {
    const resp = await fetch(EDGE_FN_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${SUPABASE_ANON_KEY}`,
      },
      body: JSON.stringify({
        action: 'stream',
        provider: 'openai',
        apiKey: this.apiKey,
        model: this.modelName,
        prompt,
        systemPrompt,
        contextData,
      }),
    });

    if (!resp.ok) {
      const err = await resp.json().catch(() => ({ message: resp.statusText }));
      throw new Error(err.message || `OpenAI stream hatasi: ${resp.status}`);
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
            const delta = parsed?.choices?.[0]?.delta?.content;
            if (delta) yield delta;
          } catch {
            /* skip */
          }
        }
      }
    }
  }

  async ping(): Promise<PingResult> {
    try {
      const resp = await fetch(EDGE_FN_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${SUPABASE_ANON_KEY}`,
        },
        body: JSON.stringify({
          action: 'ping',
          provider: 'openai',
          apiKey: this.apiKey,
          model: this.modelName,
          prompt: '',
        }),
      });

      const data = await resp.json();
      return { ok: !!data.ok, error: data.error || undefined };
    } catch (err: any) {
      return { ok: false, error: err.message };
    }
  }
}
