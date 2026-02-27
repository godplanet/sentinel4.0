import { useState } from 'react';
import {
  Brain, Wifi, WifiOff, Eye, EyeOff, Loader2, CheckCircle2, XCircle,
  RotateCcw, Cpu, Globe, Server, Sparkles, AlertTriangle,
} from 'lucide-react';
import clsx from 'clsx';
import { PageHeader } from '@/shared/ui';
import { useAISettingsStore } from '@/features/ai-agents/model/ai-settings-store';
import { createEngine, clearEngineCache } from '@/shared/api/ai/engine';
import type { AIProviderType } from '@/shared/api/ai/types';
import { PROVIDER_LABELS, DEFAULT_MODELS, GEMINI_MODELS } from '@/shared/api/ai/types';

type SettingsTab = 'connection' | 'persona';

const PROVIDERS: { id: AIProviderType; icon: typeof Globe; desc: string }[] = [
  { id: 'gemini', icon: Sparkles, desc: 'Google Gemini API' },
  { id: 'openai', icon: Globe, desc: 'OpenAI ChatGPT API' },
  { id: 'local', icon: Server, desc: 'LM Studio / Ollama' },
];

export default function CognitiveEnginePage() {
  const [tab, setTab] = useState<SettingsTab>('connection');
  const [showKey, setShowKey] = useState(false);
  const [pinging, setPinging] = useState(false);
  const [pingError, setPingError] = useState<string | null>(null);
  const [pingWarning, setPingWarning] = useState<string | null>(null);

  const store = useAISettingsStore();

  const handlePing = async () => {
    if (!store.isConfigured()) return;
    setPinging(true);
    setPingError(null);
    setPingWarning(null);
    store.setConnectionStatus('unknown');
    clearEngineCache();
    try {
      const engine = createEngine(store.getConfig());
      const result = await engine.ping();
      store.setConnectionStatus(result.ok ? 'connected' : 'failed');
      if (result.ok && result.error) {
        setPingWarning(result.error);
      } else if (!result.ok && result.error) {
        setPingError(result.error);
      }
    } catch (err: any) {
      store.setConnectionStatus('failed');
      setPingError(err.message || 'Bilinmeyen hata');
    } finally {
      setPinging(false);
    }
  };

  const maskedKey = store.apiKey
    ? store.apiKey.slice(0, 6) + '*'.repeat(Math.max(0, store.apiKey.length - 10)) + store.apiKey.slice(-4)
    : '';

  return (
    <div className="min-h-screen bg-slate-50">
      <PageHeader
        title="Sentinel Cognitive Engine"
        description="Yapay Zeka Motor Konfigurasyonu"
        icon={Brain}
      />

      <div>
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
          <div className="flex border-b border-slate-200">
            <button
              onClick={() => setTab('connection')}
              className={clsx(
                'flex-1 flex items-center justify-center gap-2 px-4 py-3.5 text-sm font-semibold transition-colors',
                tab === 'connection'
                  ? 'text-blue-700 border-b-2 border-blue-600 bg-blue-50/50'
                  : 'text-slate-500 hover:text-slate-700'
              )}
            >
              <Wifi size={16} />
              Baglanti
            </button>
            <button
              onClick={() => setTab('persona')}
              className={clsx(
                'flex-1 flex items-center justify-center gap-2 px-4 py-3.5 text-sm font-semibold transition-colors',
                tab === 'persona'
                  ? 'text-blue-700 border-b-2 border-blue-600 bg-blue-50/50'
                  : 'text-slate-500 hover:text-slate-700'
              )}
            >
              <Cpu size={16} />
              Persona (System Prompt)
            </button>
          </div>

          <div className="p-6">
            {tab === 'connection' && (
              <div className="space-y-6">
                <div>
                  <label className="block text-sm font-bold text-slate-700 mb-3">
                    Saglayici Secimi
                  </label>
                  <div className="grid grid-cols-3 gap-3">
                    {PROVIDERS.map((p) => {
                      const Icon = p.icon;
                      const active = store.provider === p.id;
                      return (
                        <button
                          key={p.id}
                          onClick={() => {
                            store.setProvider(p.id);
                            setPingError(null);
                            setPingWarning(null);
                          }}
                          className={clsx(
                            'flex flex-col items-center gap-2 p-4 rounded-xl border-2 transition-all text-center',
                            active
                              ? 'border-blue-500 bg-blue-50 shadow-sm'
                              : 'border-slate-200 hover:border-slate-300 bg-white'
                          )}
                        >
                          <div className={clsx(
                            'w-10 h-10 rounded-full flex items-center justify-center',
                            active ? 'bg-blue-600 text-white' : 'bg-slate-100 text-slate-500'
                          )}>
                            <Icon size={20} />
                          </div>
                          <span className={clsx('text-sm font-bold', active ? 'text-blue-800' : 'text-slate-700')}>
                            {PROVIDER_LABELS[p.id]}
                          </span>
                          <span className="text-[11px] text-slate-500">{p.desc}</span>
                        </button>
                      );
                    })}
                  </div>
                </div>

                {store.provider !== 'local' && (
                  <div>
                    <label className="block text-sm font-bold text-slate-700 mb-1.5">
                      API Key
                    </label>
                    <div className="relative">
                      <input
                        type={showKey ? 'text' : 'password'}
                        value={showKey ? store.apiKey : maskedKey}
                        onChange={(e) => store.setApiKey(e.target.value)}
                        onFocus={() => setShowKey(true)}
                        placeholder={`${PROVIDER_LABELS[store.provider]} API anahtarinizi girin`}
                        className="w-full px-4 py-3 pr-12 border border-slate-200 rounded-xl text-sm bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 font-mono"
                      />
                      <button
                        onClick={() => setShowKey(!showKey)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 p-1 text-slate-400 hover:text-slate-600"
                      >
                        {showKey ? <EyeOff size={16} /> : <Eye size={16} />}
                      </button>
                    </div>
                    <p className="text-[11px] text-slate-400 mt-1">
                      Anahtar sadece tarayicinizin localStorage'inda saklanir.
                    </p>
                  </div>
                )}

                {store.provider === 'local' && (
                  <div>
                    <label className="block text-sm font-bold text-slate-700 mb-1.5">
                      Base URL
                    </label>
                    <input
                      type="text"
                      value={store.baseUrl}
                      onChange={(e) => store.setBaseUrl(e.target.value)}
                      placeholder="http://localhost:1234/v1"
                      className="w-full px-4 py-3 border border-slate-200 rounded-xl text-sm bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 font-mono"
                    />
                    <p className="text-[11px] text-slate-400 mt-1">
                      LM Studio veya Ollama sunucu adresi (OpenAI uyumlu endpoint).
                    </p>
                  </div>
                )}

                <div>
                  <label className="block text-sm font-bold text-slate-700 mb-1.5">
                    Model
                  </label>
                  <input
                    type="text"
                    value={store.model}
                    onChange={(e) => {
                      store.setModel(e.target.value);
                      store.setConnectionStatus('unknown');
                      setPingError(null);
                      setPingWarning(null);
                    }}
                    placeholder={DEFAULT_MODELS[store.provider]}
                    className="w-full px-4 py-3 border border-slate-200 rounded-xl text-sm bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 font-mono"
                  />
                  {store.provider === 'gemini' && (
                    <div className="mt-3 space-y-2">
                      <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide">Hizli Secim</p>
                      <div className="grid grid-cols-2 gap-2">
                        {GEMINI_MODELS.map((m) => (
                          <button
                            key={m.id}
                            onClick={() => {
                              store.setModel(m.id);
                              store.setConnectionStatus('unknown');
                              setPingError(null);
                              setPingWarning(null);
                            }}
                            className={clsx(
                              'px-3 py-2 text-left rounded-lg border text-sm transition-all',
                              store.model === m.id
                                ? 'border-blue-500 bg-blue-50 text-blue-700 font-semibold'
                                : 'border-slate-200 bg-white text-slate-600 hover:border-blue-300 hover:bg-slate-50'
                            )}
                          >
                            <div className="font-medium">{m.label}</div>
                            <div className="text-xs opacity-70">{m.desc}</div>
                          </button>
                        ))}
                      </div>
                      <p className="text-[11px] text-slate-400">
                        Baglanti basarisiz olursa "Gemini 1.5 Flash" veya "Gemini Pro" seceneklerini deneyin.
                      </p>
                    </div>
                  )}
                </div>

                <div className="flex items-center justify-between p-4 bg-slate-50 rounded-xl border border-slate-200">
                  <div className="flex items-center gap-3">
                    <div className={clsx(
                      'w-3 h-3 rounded-full',
                      store.connectionStatus === 'connected' && 'bg-emerald-500',
                      store.connectionStatus === 'failed' && 'bg-red-500',
                      store.connectionStatus === 'unknown' && 'bg-slate-300',
                    )} />
                    <div>
                      <p className="text-sm font-bold text-slate-700">
                        {store.connectionStatus === 'connected' && 'Baglanti Basarili'}
                        {store.connectionStatus === 'failed' && 'Baglanti Basarisiz'}
                        {store.connectionStatus === 'unknown' && 'Baglanti Test Edilmedi'}
                      </p>
                      <p className="text-[11px] text-slate-500">
                        {store.connectionStatus === 'connected' && 'AI motoru hazir.'}
                        {store.connectionStatus === 'failed' && 'Asagidaki hata detaylarini inceleyin.'}
                        {store.connectionStatus === 'unknown' && 'Test Ping ile baglantiyi dogrulayin.'}
                      </p>
                    </div>
                  </div>
                  <button
                    onClick={handlePing}
                    disabled={!store.isConfigured() || pinging}
                    className={clsx(
                      'flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold transition-colors',
                      store.isConfigured()
                        ? 'bg-blue-600 text-white hover:bg-blue-700'
                        : 'bg-slate-200 text-slate-400 cursor-not-allowed'
                    )}
                  >
                    {pinging ? (
                      <Loader2 size={14} className="animate-spin" />
                    ) : store.connectionStatus === 'connected' ? (
                      <CheckCircle2 size={14} />
                    ) : store.connectionStatus === 'failed' ? (
                      <XCircle size={14} />
                    ) : (
                      <Wifi size={14} />
                    )}
                    Test Ping
                  </button>
                </div>

                {store.connectionStatus === 'connected' && !pingWarning && (
                  <div className="flex items-center gap-2 p-3 bg-emerald-50 border border-emerald-200 rounded-xl">
                    <CheckCircle2 size={16} className="text-emerald-600 flex-shrink-0" />
                    <p className="text-sm text-emerald-800 font-medium">
                      {PROVIDER_LABELS[store.provider]} motoru aktif. Oracle sayfasindan kullanabilirsiniz.
                    </p>
                  </div>
                )}

                {store.connectionStatus === 'connected' && pingWarning && (
                  <div className="p-3 bg-amber-50 border border-amber-200 rounded-xl space-y-1">
                    <div className="flex items-center gap-2">
                      <AlertTriangle size={16} className="text-amber-600 flex-shrink-0" />
                      <p className="text-sm text-amber-800 font-medium">
                        Baglanti kuruldu (fallback model ile)
                      </p>
                    </div>
                    <p className="text-xs text-amber-700 ml-6">{pingWarning}</p>
                  </div>
                )}

                {store.connectionStatus === 'failed' && pingError && (
                  <div className="p-3 bg-red-50 border border-red-200 rounded-xl space-y-2">
                    <div className="flex items-center gap-2">
                      <WifiOff size={16} className="text-red-600 flex-shrink-0" />
                      <p className="text-sm text-red-800 font-medium">
                        Baglanti kurulamadi
                      </p>
                    </div>
                    <p className="text-xs text-red-700 ml-6 leading-relaxed">
                      {pingError}
                    </p>
                    {store.provider === 'gemini' && store.model !== 'gemini-1.5-flash' && (
                      <button
                        onClick={() => {
                          store.setModel('gemini-1.5-flash');
                          store.setConnectionStatus('unknown');
                          setPingError(null);
                        }}
                        className="ml-6 mt-1 flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-blue-700 bg-blue-50 hover:bg-blue-100 border border-blue-200 rounded-lg transition-colors"
                      >
                        <RotateCcw size={12} />
                        gemini-1.5-flash ile tekrar dene
                      </button>
                    )}
                  </div>
                )}
              </div>
            )}

            {tab === 'persona' && (
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-sm font-bold text-slate-700">System Prompt (Persona)</h3>
                    <p className="text-[11px] text-slate-500 mt-0.5">
                      Bu metin her AI cagrisinda "system instruction" olarak gonderilir.
                    </p>
                  </div>
                  <button
                    onClick={store.resetPersona}
                    className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-slate-600 bg-slate-100 hover:bg-slate-200 border border-slate-200 rounded-lg transition-colors"
                  >
                    <RotateCcw size={12} />
                    Varsayilana Don
                  </button>
                </div>
                <textarea
                  value={store.persona}
                  onChange={(e) => store.setPersona(e.target.value)}
                  rows={10}
                  className="w-full px-4 py-3 border border-slate-200 rounded-xl text-sm bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 leading-relaxed resize-y"
                />
                <div className="p-4 bg-blue-50 border border-blue-200 rounded-xl">
                  <div className="flex items-center gap-2 mb-2">
                    <Brain size={14} className="text-blue-600" />
                    <span className="text-sm font-bold text-blue-800">Ipucu</span>
                  </div>
                  <ul className="text-xs text-blue-700 space-y-1 list-disc list-inside">
                    <li>Persona ne kadar spesifik olursa, yanitlar o kadar kaliteli olur.</li>
                    <li>Sektore ozgu terminoloji ekleyin (BDDK, MASAK, COSO, GIAS).</li>
                    <li>"Kanit olmadan varsayim yapma" gibi sinirlamalar ekleyin.</li>
                    <li>Cikti formatini belirtin: "Maddeler halinde, Turkce yanit ver."</li>
                  </ul>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
