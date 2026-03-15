import { useAISettingsStore } from '@/features/ai-agents/model/ai-settings-store';
import { clearEngineCache } from '@/shared/api/ai/engine';
import type { AIProviderType } from '@/shared/api/ai/types';
import {
  DEFAULT_MODELS,
  GEMINI_MODELS,
  GROQ_MODELS,
  PROVIDER_LABELS,
} from '@/shared/api/ai/types';
import { PageHeader } from '@/shared/ui';
import clsx from 'clsx';
import {
  AlertTriangle,
  Brain,
  CheckCircle2,
  Cpu,
  Eye, EyeOff,
  Globe,
  Loader2,
  Lock,
  RotateCcw,
  Server, Sparkles,
  Wifi, WifiOff,
  Zap,
  XCircle,
} from 'lucide-react';
import { useState } from 'react';

type SettingsTab = 'connection' | 'persona';

interface ProviderDef {
  id: AIProviderType;
  icon: typeof Globe;
  label: string;
  desc: string;
  color: string;
  bgColor: string;
  borderColor: string;
}

const PROVIDERS: ProviderDef[] = [
  {
    id: 'openai',
    icon: Globe,
    label: 'OpenAI',
    desc: 'GPT-4o · ChatGPT API',
    color: 'text-emerald-700',
    bgColor: 'bg-emerald-50',
    borderColor: 'border-emerald-400',
  },
  {
    id: 'gemini',
    icon: Sparkles,
    label: 'Google Gemini',
    desc: 'Gemini 1.5 Flash / Pro',
    color: 'text-blue-700',
    bgColor: 'bg-blue-50',
    borderColor: 'border-blue-400',
  },
  {
    id: 'groq',
    icon: Zap,
    label: 'Groq',
    desc: 'Ücretsiz Llama 3 · Hızlı',
    color: 'text-orange-700',
    bgColor: 'bg-orange-50',
    borderColor: 'border-orange-400',
  },
  {
    id: 'local',
    icon: Server,
    label: 'Kurumsal On-Premise',
    desc: 'Banka-İçi Yerel Sunucu',
    color: 'text-purple-700',
    bgColor: 'bg-purple-50',
    borderColor: 'border-purple-400',
  },
];

// --- Yardımcı bileşenler ---

function GlassCard({ children, className }: { children: React.ReactNode; className?: string }) {
  return (
    <div className={clsx(
      'bg-white/70 backdrop-blur-lg border border-white/60 rounded-2xl shadow-sm',
      className
    )}>
      {children}
    </div>
  );
}

function SectionLabel({ children }: { children: React.ReactNode }) {
  return (
    <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">
      {children}
    </label>
  );
}

function InputField({
  value, onChange, placeholder, type = 'text', mono = false,
}: {
  value: string;
  onChange: (v: string) => void;
  placeholder: string;
  type?: string;
  mono?: boolean;
}) {
  return (
    <input
      type={type}
      value={value}
      onChange={(e) => onChange(e.target.value)}
      placeholder={placeholder}
      className={clsx(
        'w-full px-4 py-3 border border-slate-200 rounded-xl text-sm bg-white/80',
        'focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent',
        'transition-all placeholder:text-slate-400',
        mono && 'font-mono',
      )}
    />
  );
}

function PasswordInput({
  value,
  onChange,
  placeholder,
}: {
  value: string;
  onChange: (v: string) => void;
  placeholder: string;
}) {
  const [show, setShow] = useState(false);
  return (
    <div className="relative">
      <input
        type={show ? 'text' : 'password'}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="w-full px-4 py-3 pr-12 border border-slate-200 rounded-xl text-sm bg-white/80
          focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent
          transition-all placeholder:text-slate-400 font-mono"
      />
      <button
        type="button"
        onClick={() => setShow((s) => !s)}
        className="absolute right-3 top-1/2 -translate-y-1/2 p-1 text-slate-400 hover:text-slate-600 transition-colors"
      >
        {show ? <EyeOff size={16} /> : <Eye size={16} />}
      </button>
    </div>
  );
}

function SaveButton({ onClick, label = 'Kaydet' }: { onClick: () => void; label?: string }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="px-5 py-2.5 rounded-xl text-sm font-semibold bg-slate-800 text-white
        hover:bg-slate-700 active:scale-95 transition-all shadow-sm"
    >
      {label}
    </button>
  );
}

// --- Ana Sayfa ---

export default function CognitiveEnginePage() {
  const [tab, setTab] = useState<SettingsTab>('connection');
  const [pinging, setPinging] = useState(false);
  const [pingError, setPingError] = useState<string | null>(null);
  const [pingWarning, setPingWarning] = useState<string | null>(null);

  // Yerel (controlled) input state'leri — "Kaydet"e basınca store'a yaz
  const store = useAISettingsStore();
  const [localApiKey, setLocalApiKey] = useState(store.apiKey);
  const [localGroqKey, setLocalGroqKey] = useState(store.groqApiKey);
  const [localBaseUrl, setLocalBaseUrlState] = useState(store.localBaseUrl);
  const [localModel, setLocalModel] = useState(store.model);

  const handleProviderChange = (id: AIProviderType) => {
    store.setProvider(id);
    setLocalModel(DEFAULT_MODELS[id]);
    setPingError(null);
    setPingWarning(null);
    clearEngineCache();
  };

  const handleSave = () => {
    if (store.provider === 'openai' || store.provider === 'gemini') {
      store.setApiKey(localApiKey);
    }
    if (store.provider === 'groq') {
      store.setGroqKey(localGroqKey);
    }
    if (store.provider === 'local') {
      store.setLocalBaseUrl(localBaseUrl);
    }
    store.setModel(localModel);
    clearEngineCache();
    setPingError(null);
    setPingWarning(null);
  };

  const handlePing = async () => {
    // Local state'ten doğrudan config inşa et (store'a yazma gecikmesinden bağımsız)
    const provider = store.provider;
    let resolvedKey = '';
    let resolvedBaseUrl = '';
    let resolvedModel = localModel || DEFAULT_MODELS[provider];

    if (provider === 'groq') {
      resolvedKey = localGroqKey;
    } else if (provider === 'local') {
      resolvedKey = 'local-auth';
      resolvedBaseUrl = localBaseUrl || 'http://localhost:1234/v1';
    } else {
      resolvedKey = localApiKey;
    }

    // Önce store'a kaydet
    handleSave();

    // Temel validasyon
    if (provider !== 'local' && !resolvedKey) {
      setPingError('API Key girilmedi. Önce anahtarı giritip Kaydet\'e basın.');
      return;
    }
    if (provider === 'local' && !resolvedBaseUrl) {
      setPingError('Base URL girilmedi.');
      return;
    }

    setPinging(true);
    setPingError(null);
    setPingWarning(null);
    store.setConnectionStatus('unknown');
    clearEngineCache();

    try {
      // Config'i local state'ten doğrudan oluştur (store güncellemesini beklemeden)
      const { createEngine: _createEngine } = await import('@/shared/api/ai/engine');
      const engine = _createEngine({
        provider,
        apiKey: resolvedKey,
        baseUrl: resolvedBaseUrl,
        model: resolvedModel,
      });
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

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-100 via-blue-50/30 to-slate-100">
      <PageHeader
        title="Sentinel Cognitive Engine"
        description="Yapay Zeka Motor Konfigürasyonu"
        icon={Brain}
      />

      {/* Tab Navigasyon */}
      <div className="px-4 pb-2">
        <div className="inline-flex gap-1 bg-white/60 backdrop-blur-md rounded-xl p-1 border border-white/60 shadow-sm">
          {([
            { key: 'connection', icon: Wifi, label: 'Bağlantı' },
            { key: 'persona', icon: Cpu, label: 'Persona' },
          ] as const).map(({ key, icon: Icon, label }) => (
            <button
              key={key}
              onClick={() => setTab(key)}
              className={clsx(
                'flex items-center gap-2 px-5 py-2 rounded-lg text-sm font-semibold transition-all',
                tab === key
                  ? 'bg-white text-slate-800 shadow-sm'
                  : 'text-slate-500 hover:text-slate-700',
              )}
            >
              <Icon size={15} />
              {label}
            </button>
          ))}
        </div>
      </div>

      <div className="p-4 space-y-5">
        {tab === 'connection' && (
          <>
            {/* Provider Seçimi */}
            <GlassCard className="p-5">
              <SectionLabel>Sağlayıcı Seçimi</SectionLabel>
              <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
                {PROVIDERS.map((p) => {
                  const Icon = p.icon;
                  const active = store.provider === p.id;
                  return (
                    <button
                      key={p.id}
                      onClick={() => handleProviderChange(p.id)}
                      className={clsx(
                        'flex flex-col items-center gap-2.5 p-4 rounded-xl border-2 transition-all text-center',
                        active
                          ? `${p.borderColor} ${p.bgColor} shadow-md`
                          : 'border-slate-200 bg-white/50 hover:border-slate-300 hover:bg-white',
                      )}
                    >
                      <div className={clsx(
                        'w-10 h-10 rounded-full flex items-center justify-center',
                        active ? `${p.bgColor} ${p.color}` : 'bg-slate-100 text-slate-400',
                      )}>
                        <Icon size={20} />
                      </div>
                      <div>
                        <p className={clsx('text-sm font-bold', active ? p.color : 'text-slate-700')}>
                          {p.label}
                        </p>
                        <p className="text-[11px] text-slate-500 mt-0.5">{p.desc}</p>
                      </div>
                      {active && (
                        <span className={clsx(
                          'text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full',
                          p.bgColor, p.color,
                        )}>
                          Aktif
                        </span>
                      )}
                    </button>
                  );
                })}
              </div>
            </GlassCard>

            {/* OpenAI Ayarları */}
            {store.provider === 'openai' && (
              <GlassCard className="p-5 space-y-4">
                <div className="flex items-center gap-2 mb-1">
                  <Globe size={16} className="text-emerald-600" />
                  <h3 className="text-sm font-bold text-slate-700">OpenAI Ayarları</h3>
                </div>
                <div>
                  <SectionLabel>API Key</SectionLabel>
                  <PasswordInput
                    value={localApiKey}
                    onChange={setLocalApiKey}
                    placeholder="sk-..."
                  />
                  <p className="text-[11px] text-slate-400 mt-1">
                    <Lock size={10} className="inline mr-1" />
                    Anahtar yalnızca tarayıcı localStorage'ında saklanır.
                  </p>
                </div>
                <div>
                  <SectionLabel>Model</SectionLabel>
                  <InputField
                    value={localModel}
                    onChange={setLocalModel}
                    placeholder={DEFAULT_MODELS.openai}
                    mono
                  />
                </div>
                <div className="flex justify-end">
                  <SaveButton onClick={handleSave} />
                </div>
              </GlassCard>
            )}

            {/* Gemini Ayarları */}
            {store.provider === 'gemini' && (
              <GlassCard className="p-5 space-y-4">
                <div className="flex items-center gap-2 mb-1">
                  <Sparkles size={16} className="text-blue-600" />
                  <h3 className="text-sm font-bold text-slate-700">Google Gemini Ayarları</h3>
                </div>
                <div>
                  <SectionLabel>API Key</SectionLabel>
                  <PasswordInput
                    value={localApiKey}
                    onChange={setLocalApiKey}
                    placeholder="AIza..."
                  />
                  <p className="text-[11px] text-slate-400 mt-1">
                    <Lock size={10} className="inline mr-1" />
                    Google AI Studio'dan ücretsiz edinebilirsiniz.
                  </p>
                </div>
                <div>
                  <SectionLabel>Model</SectionLabel>
                  <InputField
                    value={localModel}
                    onChange={setLocalModel}
                    placeholder={DEFAULT_MODELS.gemini}
                    mono
                  />
                  <div className="grid grid-cols-2 gap-2 mt-2">
                    {(GEMINI_MODELS || []).map((m) => (
                      <button
                        key={m.id}
                        type="button"
                        onClick={() => setLocalModel(m.id)}
                        className={clsx(
                          'px-3 py-2 text-left rounded-lg border text-sm transition-all',
                          localModel === m.id
                            ? 'border-blue-400 bg-blue-50 text-blue-700 font-semibold'
                            : 'border-slate-200 bg-white text-slate-600 hover:border-blue-200 hover:bg-blue-50/50',
                        )}
                      >
                        <div className="font-medium text-xs">{m.label}</div>
                        <div className="text-[11px] opacity-70">{m.desc}</div>
                      </button>
                    ))}
                  </div>
                </div>
                <div className="flex justify-end">
                  <SaveButton onClick={handleSave} />
                </div>
              </GlassCard>
            )}

            {/* Groq Ayarları */}
            {store.provider === 'groq' && (
              <GlassCard className="p-5 space-y-4">
                <div className="flex items-center gap-2 mb-1">
                  <Zap size={16} className="text-orange-600" />
                  <h3 className="text-sm font-bold text-slate-700">Groq Ayarları</h3>
                  <span className="ml-auto text-[11px] font-bold text-orange-600 bg-orange-50 border border-orange-200 px-2 py-0.5 rounded-full">
                    Ücretsiz
                  </span>
                </div>
                <div className="p-3 bg-orange-50 border border-orange-200 rounded-xl">
                  <p className="text-xs text-orange-800">
                    Groq, Llama 3 ve Mixtral modellerini <strong>ücretsiz</strong> sunar.
                    API key için <strong>console.groq.com</strong> adresine gidin.
                    Endpoint: <code className="font-mono">https://api.groq.com/openai/v1</code>
                  </p>
                </div>
                <div>
                  <SectionLabel>Groq API Key</SectionLabel>
                  <PasswordInput
                    value={localGroqKey}
                    onChange={setLocalGroqKey}
                    placeholder="gsk_..."
                  />
                  <p className="text-[11px] text-slate-400 mt-1">
                    <Lock size={10} className="inline mr-1" />
                    Anahtar yalnızca tarayıcı localStorage'ında saklanır.
                  </p>
                </div>
                <div>
                  <SectionLabel>Model</SectionLabel>
                  <InputField
                    value={localModel}
                    onChange={setLocalModel}
                    placeholder={DEFAULT_MODELS.groq}
                    mono
                  />
                  <div className="grid grid-cols-2 gap-2 mt-2">
                    {(GROQ_MODELS || []).map((m) => (
                      <button
                        key={m.id}
                        type="button"
                        onClick={() => setLocalModel(m.id)}
                        className={clsx(
                          'px-3 py-2 text-left rounded-lg border text-sm transition-all',
                          localModel === m.id
                            ? 'border-orange-400 bg-orange-50 text-orange-700 font-semibold'
                            : 'border-slate-200 bg-white text-slate-600 hover:border-orange-200 hover:bg-orange-50/50',
                        )}
                      >
                        <div className="font-medium text-xs">{m.label}</div>
                        <div className="text-[11px] opacity-70">{m.desc}</div>
                      </button>
                    ))}
                  </div>
                </div>
                <div className="flex justify-end">
                  <SaveButton onClick={handleSave} />
                </div>
              </GlassCard>
            )}

            {/* On-Premise Ayarları */}
            {store.provider === 'local' && (
              <GlassCard className="p-5 space-y-4">
                <div className="flex items-center gap-2 mb-1">
                  <Server size={16} className="text-purple-600" />
                  <h3 className="text-sm font-bold text-slate-700">Kurumsal On-Premise / Local LLM</h3>
                </div>
                <div className="p-3 bg-purple-50 border border-purple-200 rounded-xl">
                  <p className="text-xs text-purple-800">
                    Bu, bankanın kendi sunucusundaki LLM'e bağlanır.
                    Sunucunuzun <strong>OpenAI-uyumlu</strong> bir endpoint sunması gerekir
                    (LM Studio, Ollama, vLLM, TGI).
                    API key gerekmez.
                  </p>
                </div>
                <div>
                  <SectionLabel>Sunucu Base URL</SectionLabel>
                  <InputField
                    value={localBaseUrl}
                    onChange={setLocalBaseUrlState}
                    placeholder="http://192.168.1.100:1234/v1"
                    mono
                  />
                  <p className="text-[11px] text-slate-400 mt-1">
                    Banka ağı içindeki LLM sunucusunun adresi. Örn: http://localhost:1234/v1
                  </p>
                </div>
                <div>
                  <SectionLabel>Model Adı</SectionLabel>
                  <InputField
                    value={localModel}
                    onChange={setLocalModel}
                    placeholder="llama-3-8b-instruct"
                    mono
                  />
                  <p className="text-[11px] text-slate-400 mt-1">
                    Sunucuda yüklü olan modelin adını girin (sunucu konfigürasyonuna göre).
                  </p>
                </div>
                <div className="flex justify-end">
                  <SaveButton onClick={handleSave} />
                </div>
              </GlassCard>
            )}

            {/* Bağlantı Test Paneli */}
            <GlassCard className="p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className={clsx(
                    'w-3 h-3 rounded-full transition-colors',
                    store.connectionStatus === 'connected' && 'bg-emerald-500 shadow-sm shadow-emerald-300',
                    store.connectionStatus === 'failed' && 'bg-red-500',
                    store.connectionStatus === 'unknown' && 'bg-slate-300',
                  )} />
                  <div>
                    <p className="text-sm font-bold text-slate-700">
                      {store.connectionStatus === 'connected' && 'Bağlantı Başarılı'}
                      {store.connectionStatus === 'failed' && 'Bağlantı Başarısız'}
                      {store.connectionStatus === 'unknown' && 'Bağlantı Test Edilmedi'}
                    </p>
                    <p className="text-[11px] text-slate-500">
                      {store.connectionStatus === 'connected' && `${PROVIDER_LABELS[store.provider]} motoru hazır.`}
                      {store.connectionStatus === 'failed' && 'Hata detaylarını aşağıda inceleyin.'}
                      {store.connectionStatus === 'unknown' && 'Test Ping ile bağlantıyı doğrulayın.'}
                    </p>
                  </div>
                </div>
                <button
                  onClick={handlePing}
                  disabled={pinging}
                  className={clsx(
                    'flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold transition-all',
                    !pinging
                      ? 'bg-slate-800 text-white hover:bg-slate-700 active:scale-95 shadow-sm'
                      : 'bg-slate-200 text-slate-400 cursor-not-allowed',
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
            </GlassCard>

            {/* Durum Mesajları */}
            {store.connectionStatus === 'connected' && !pingWarning && (
              <div className="flex items-center gap-2 p-3 bg-emerald-50 border border-emerald-200 rounded-xl">
                <CheckCircle2 size={16} className="text-emerald-600 flex-shrink-0" />
                <p className="text-sm text-emerald-800 font-medium">
                  {PROVIDER_LABELS[store.provider]} motoru aktif. Oracle sayfasından kullanabilirsiniz.
                </p>
              </div>
            )}

            {store.connectionStatus === 'connected' && pingWarning && (
              <div className="p-3 bg-amber-50 border border-amber-200 rounded-xl space-y-1">
                <div className="flex items-center gap-2">
                  <AlertTriangle size={16} className="text-amber-600 flex-shrink-0" />
                  <p className="text-sm text-amber-800 font-medium">Bağlantı kuruldu (fallback model ile)</p>
                </div>
                <p className="text-xs text-amber-700 ml-3">{pingWarning}</p>
              </div>
            )}

            {store.connectionStatus === 'failed' && pingError && (
              <div className="p-3 bg-red-50 border border-red-200 rounded-xl space-y-2">
                <div className="flex items-center gap-2">
                  <WifiOff size={16} className="text-red-600 flex-shrink-0" />
                  <p className="text-sm text-red-800 font-medium">Bağlantı kurulamadı</p>
                </div>
                <p className="text-xs text-red-700 ml-3 leading-relaxed">{pingError}</p>
                {store.provider === 'gemini' && store.model !== 'gemini-1.5-flash' && (
                  <button
                    onClick={() => {
                      store.setModel('gemini-1.5-flash');
                      setLocalModel('gemini-1.5-flash');
                      store.setConnectionStatus('unknown');
                      setPingError(null);
                    }}
                    className="ml-3 mt-1 flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold
                      text-blue-700 bg-blue-50 hover:bg-blue-100 border border-blue-200 rounded-lg transition-colors"
                  >
                    <RotateCcw size={12} />
                    gemini-1.5-flash ile tekrar dene
                  </button>
                )}
              </div>
            )}
          </>
        )}

        {tab === 'persona' && (
          <GlassCard className="p-5 space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-sm font-bold text-slate-700">System Prompt (Persona)</h3>
                <p className="text-[11px] text-slate-500 mt-0.5">
                  Bu metin her AI çağrısında "system instruction" olarak gönderilir.
                </p>
              </div>
              <button
                onClick={store.resetPersona}
                className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold
                  text-slate-600 bg-slate-100 hover:bg-slate-200 border border-slate-200 rounded-lg transition-colors"
              >
                <RotateCcw size={12} />
                Varsayılana Dön
              </button>
            </div>
            <textarea
              value={store.persona}
              onChange={(e) => store.setPersona(e.target.value)}
              rows={10}
              className="w-full px-4 py-3 border border-slate-200 rounded-xl text-sm bg-white/80
                focus:outline-none focus:ring-2 focus:ring-blue-500 leading-relaxed resize-y"
            />
            <div className="p-4 bg-blue-50 border border-blue-200 rounded-xl">
              <div className="flex items-center gap-2 mb-2">
                <Brain size={14} className="text-blue-600" />
                <span className="text-sm font-bold text-blue-800">İpucu</span>
              </div>
              <ul className="text-xs text-blue-700 space-y-1 list-disc list-inside">
                <li>Persona ne kadar spesifik olursa, yanıtlar o kadar kaliteli olur.</li>
                <li>Sektöre özgü terminoloji ekleyin (BDDK, MASAK, COSO, GIAS).</li>
                <li>"Kanıt olmadan varsayım yapma" gibi sınırlamalar ekleyin.</li>
                <li>Çıktı formatını belirtin: "Maddeler halinde, Türkçe yanıt ver."</li>
              </ul>
            </div>
          </GlassCard>
        )}
      </div>
    </div>
  );
}
