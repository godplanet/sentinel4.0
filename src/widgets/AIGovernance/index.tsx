/**
 * AIGovernance — Wave 57: AI & LLM Model Risk Management
 * %100 Light Mode | Apple Glassmorphism | Real Supabase
 */

import { useState } from 'react';
import {
  BrainCircuit, ShieldAlert, Activity, GitBranch,
  CheckCircle2, AlertTriangle, XCircle, RefreshCw,
  Eye, TrendingDown, Target, FileText
} from 'lucide-react';
import clsx from 'clsx';
import {
  useModels,
  useBiasTests,
  type AIModel,
  type ModelBiasTest,
  type RiskTier,
  type TestStatus,
} from '@/features/model-risk/api/model-risk';

// ─── Config ───────────────────────────────────────────────────────────────────

const RISK_CFG: Record<RiskTier, { label: string; color: string; dot: string }> = {
  critical: { label: 'Kritik Risk',  color: 'bg-red-50 text-red-700 border-red-200',    dot: 'bg-red-500' },
  high:     { label: 'Yüksek Risk',  color: 'bg-orange-50 text-orange-700 border-orange-200', dot: 'bg-orange-500' },
  medium:   { label: 'Orta Risk',    color: 'bg-amber-50 text-amber-700 border-amber-200',    dot: 'bg-amber-500' },
  low:      { label: 'Düşük Risk',   color: 'bg-slate-50 text-slate-600 border-slate-200',    dot: 'bg-slate-400' },
};

const TEST_STATUS_CFG: Record<TestStatus, { label: string; icon: typeof CheckCircle2; color: string }> = {
  pass:    { label: 'Başarılı', icon: CheckCircle2,  color: 'text-emerald-600' },
  fail:    { label: 'Başarısız',icon: XCircle,       color: 'text-red-600' },
  warning: { label: 'Uyarı',    icon: AlertTriangle, color: 'text-amber-500' },
  pending: { label: 'Bekliyor', icon: Activity,      color: 'text-blue-500' },
};

// ─── Main Component ───────────────────────────────────────────────────────────

export function AIGovernance() {
  const [activeTab, setActiveTab] = useState<'inventory' | 'tests'>('inventory');

  const { data: models = [], isLoading: modelsLoading, refetch: refetchModels } = useModels();
  const { data: tests = [],  isLoading: testsLoading }  = useBiasTests();

  return (
    <div className="space-y-5">
      {/* KPI Stats Row (Client-Side Aggregation for UX) */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <StatCard
          icon={BrainCircuit}
          label="Aktif Model"
          value={String(models.filter(m => m.status === 'active').length)}
          sub="Envanterdeki yapay zeka sayısı"
          color="blue"
        />
        <StatCard
          icon={ShieldAlert}
          label="Kritik Riskli"
          value={String(models.filter(m => m.risk_tier === 'critical').length)}
          sub="Öncelikli gözetim altında"
          color="red"
        />
        <StatCard
          icon={AlertTriangle}
          label="Bias / Halüsinasyon"
          value={String(tests.filter(t => t.status === 'fail' || t.status === 'warning').length)}
          sub="Başarısız & Uyarı veren test"
          color="orange"
        />
        <StatCard
          icon={Activity}
          label="Test Kapsamı"
          value={`${models.length > 0 ? Math.round((tests.length / models.length) * 100) : 0}%`}
          sub="Envanterin test edilme oranı"
          color="emerald"
        />
      </div>

      {/* Main panel */}
      <div className="bg-white/80 backdrop-blur-lg border border-slate-200 shadow-sm rounded-2xl overflow-hidden">
        {/* Header */}
        <div className="px-5 py-4 bg-gradient-to-r from-blue-50 to-cyan-50 border-b border-slate-100 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 bg-blue-100 rounded-xl flex items-center justify-center">
              <BrainCircuit size={18} className="text-blue-600" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-slate-800">AI & LLM Model Yönetişimi</h3>
              <p className="text-[11px] text-slate-500 mt-0.5">Model Risk Yönetimi (MRM) — Wave 57</p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <div className="flex bg-slate-100 rounded-lg p-0.5">
              {(['inventory', 'tests'] as const).map(tab => (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  className={clsx(
                    'px-3 py-1.5 text-xs font-bold rounded-md transition-all',
                    activeTab === tab ? 'bg-white text-slate-800 shadow-sm' : 'text-slate-500 hover:text-slate-700'
                  )}
                >
                  {tab === 'inventory' ? 'Model Envanteri' : 'Önyargı & Halüsinasyon Testleri'}
                </button>
              ))}
            </div>
            <button onClick={() => refetchModels()} className="p-1.5 rounded-lg hover:bg-slate-100 text-slate-400 transition-colors">
              <RefreshCw size={14} />
            </button>
          </div>
        </div>

        {/* Inventory tab */}
        {activeTab === 'inventory' && (
          <div className="divide-y divide-slate-100">
            {modelsLoading ? (
              <LoadingState label="Modeller yükleniyor..." />
            ) : models.length === 0 ? (
              <EmptyState icon={BrainCircuit} label="Model envanteri boş" sub="Henüz yapay zeka modeli kaydedilmemiş." />
            ) : (
              models.map(model => <ModelRow key={model.id} model={model} />)
            )}
          </div>
        )}

        {/* Tests tab */}
        {activeTab === 'tests' && (
          <div className="divide-y divide-slate-100 bg-slate-50/30">
            {testsLoading ? (
              <LoadingState label="Test sonuçları yükleniyor..." />
            ) : tests.length === 0 ? (
              <EmptyState icon={Target} label="Test sonucu yok" sub="Sistemde önyargı veya halüsinasyon testi bulunmuyor." />
            ) : (
              tests.map(test => <TestRow key={test.id} test={test as any} />)
            )}
          </div>
        )}
      </div>
    </div>
  );
}

// ─── Sub Components ───────────────────────────────────────────────────────────

function ModelRow({ model: m }: { model: AIModel }) {
  const rCfg = RISK_CFG[m.risk_tier] ?? RISK_CFG.medium;

  return (
    <div className="px-5 py-4 flex items-start gap-4 hover:bg-slate-50/80 transition-colors">
      <div className={clsx('w-2.5 h-2.5 rounded-full mt-1.5 shrink-0', rCfg.dot)} />

      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 flex-wrap mb-1">
          <span className={clsx('text-[10px] font-bold border px-2 py-0.5 rounded-full', rCfg.color)}>
             {rCfg.label}
          </span>
          <span className="text-[10px] font-black bg-slate-800 text-white px-2 py-0.5 rounded font-mono">
            {m.model_type}
          </span>
          <span className="text-[10px] text-slate-500 px-1.5 bg-slate-100 rounded">
            {m.vendor ?? 'In-House'}
          </span>
          <span className={clsx(
            'ml-auto text-[10px] font-bold',
            m.status === 'active' ? 'text-emerald-500' : 'text-slate-400'
          )}>
            {m.status.toUpperCase()}
          </span>
        </div>
        <p className="text-sm font-bold text-slate-800">{m.model_name}</p>
        <p className="text-xs text-slate-500 mt-0.5">{m.use_case}</p>
        
        <div className="flex items-center gap-4 mt-2 text-[10px] text-slate-400">
          <span className="flex items-center gap-1"><ShieldAlert size={10} /> {m.business_owner ?? 'Sahipsiz'}</span>
          <span className="flex items-center gap-1"><Activity size={10} /> Son Derleme: {new Date(m.last_review_at ?? m.created_at).toLocaleDateString('tr-TR')}</span>
        </div>
      </div>
    </div>
  );
}

function TestRow({ test: t }: { test: ModelBiasTest & { model_name?: string; failure_rate: number } }) {
  const sCfg = TEST_STATUS_CFG[t.status] ?? TEST_STATUS_CFG.pending;
  const StatusIcon = sCfg.icon;

  return (
    <div className="px-5 py-4 flex flex-col gap-3 hover:bg-white transition-colors">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className={clsx(
            'flex items-center justify-center p-1.5 rounded-lg border',
            t.test_type === 'BIAS' ? 'bg-violet-50 border-violet-200 text-violet-600' : 'bg-pink-50 border-pink-200 text-pink-600'
          )}>
            {t.test_type === 'BIAS' ? <GitBranch size={14} /> : <Eye size={14} />}
          </div>
          <div>
            <span className="text-xs font-bold text-slate-800 block">{t.model_name ?? 'Bilinmeyen Model'}</span>
            <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">{t.test_type} TEST</span>
          </div>
        </div>
        <div className={clsx('flex items-center gap-1.5 text-[11px] font-bold', sCfg.color)}>
          <StatusIcon size={14} /> {sCfg.label}
        </div>
      </div>

      <div className="flex items-stretch gap-3">
        {/* KPI Box */}
        <div className="shrink-0 w-32 bg-slate-50 border border-slate-100 rounded-xl p-3 text-center flex flex-col justify-center">
          <p className="text-[10px] font-bold text-slate-500 uppercase">Hata / Sapma</p>
          <div className="flex items-end justify-center gap-1 mt-1">
            <span className={clsx(
              'text-2xl font-black tabular-nums',
              t.failure_rate > 5 ? 'text-red-600' : t.failure_rate > 0 ? 'text-amber-600' : 'text-emerald-600'
            )}>
              {t.failure_rate.toFixed(1)}%
            </span>
          </div>
          <p className="text-[9px] text-slate-400 mt-1">{t.failed_prompts} / {t.total_prompts} Prompt</p>
        </div>

        {/* Findings Box */}
        <div className="flex-1 bg-blue-50/50 border border-blue-100 rounded-xl p-3">
          <div className="flex items-center gap-1.5 mb-1.5 text-blue-800">
            <FileText size={12} />
            <span className="text-[10px] font-black uppercase tracking-widest">Test Bulguları</span>
          </div>
          <p className="text-xs text-slate-600 leading-relaxed">
            {t.findings ?? 'Bulgu veya açıklama girilmemiş.'}
          </p>

          {/* Metrics JSON display */}
          {t.metrics && Object.keys(t.metrics).length > 0 && (
            <div className="mt-3 flex flex-wrap gap-2">
              {Object.entries(t.metrics).map(([key, val]) => (
                <span key={key} className="inline-flex items-center gap-1 bg-white border border-slate-200 text-slate-600 text-[10px] px-2 py-0.5 rounded font-mono">
                  <TrendingDown size={10} className="text-slate-400" />
                  {key}: <strong className="text-slate-800">{String(val)}</strong>
                </span>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function StatCard({ icon: Icon, label, value, sub, color }: any) {
  const map: Record<string, string> = {
    blue:    'bg-blue-50 border-blue-100 text-blue-600',
    red:     'bg-red-50 border-red-100 text-red-600',
    orange:  'bg-orange-50 border-orange-100 text-orange-600',
    emerald: 'bg-emerald-50 border-emerald-100 text-emerald-600',
  };
  return (
    <div className={clsx('rounded-xl border p-4', map[color])}>
      <div className="flex items-center gap-2 mb-2">
        <Icon size={14} />
        <span className="text-[10px] font-bold uppercase tracking-widest opacity-80">{label}</span>
      </div>
      <p className="text-2xl font-black tabular-nums">{value}</p>
      <p className="text-[10px] opacity-70 mt-1">{sub}</p>
    </div>
  );
}

function LoadingState({ label }: { label: string }) {
  return (
    <div className="flex items-center justify-center py-16 gap-2 text-sm text-slate-400">
      <RefreshCw size={16} className="animate-spin text-blue-400" />{label}
    </div>
  );
}

function EmptyState({ icon: Icon, label, sub }: { icon: any; label: string; sub: string }) {
  return (
    <div className="flex flex-col items-center justify-center py-16 text-center">
      <Icon size={36} className="text-slate-200 mb-3" />
      <p className="text-sm font-semibold text-slate-600">{label}</p>
      <p className="text-xs text-slate-400 mt-1">{sub}</p>
    </div>
  );
}
