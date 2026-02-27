import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  ArrowLeft,
  Eye,
  EyeOff,
  Shield,
  AlertTriangle,
  FileSearch,
  Zap,
  Lightbulb,
  Loader2,
} from 'lucide-react';
import clsx from 'clsx';
import {
  useFinding,
  useFindingSecret,
} from '@/features/finding-hub';
import { FindingWorkflowProgress } from '@/widgets/FindingWorkflow';
import { FindingRightSidebar } from '@/widgets/FindingRightSidebar';
import type { ComprehensiveFinding, FindingSecret } from '@/entities/finding/model/types';

type LeftTab = 'tespit' | 'risk' | 'oneri';

const LEFT_TABS: { key: LeftTab; label: string; icon: typeof FileSearch; color: string }[] = [
  { key: 'tespit', label: 'Tespit', icon: FileSearch, color: 'bg-blue-600' },
  { key: 'risk', label: 'Risk & Etki', icon: Zap, color: 'bg-orange-600' },
  { key: 'oneri', label: 'Oneri', icon: Lightbulb, color: 'bg-emerald-600' },
];

export function FindingDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [spyMode, setSpyMode] = useState(false);
  const [activeLeftTab, setActiveLeftTab] = useState<LeftTab>('tespit');
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const { data: finding, isLoading } = useFinding(id!);
  const { data: secret } = useFindingSecret(id!, spyMode);

  if (isLoading) {
    return (
      <div className="h-full flex items-center justify-center bg-slate-50">
        <Loader2 className="w-10 h-10 animate-spin text-slate-400" />
      </div>
    );
  }

  if (!finding) {
    return (
      <div className="h-full flex items-center justify-center bg-slate-50">
        <div className="text-center">
          <AlertTriangle className="h-12 w-12 text-slate-300 mx-auto mb-4" />
          <p className="text-slate-600 text-lg font-semibold">Bulgu bulunamadi</p>
          <button
            onClick={() => navigate('/findings')}
            className="mt-4 px-6 py-2 bg-slate-800 text-white rounded-lg hover:bg-slate-700 transition-colors text-sm font-bold"
          >
            Bulgu Merkezine Don
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col bg-slate-50 overflow-hidden">
      <div className="shrink-0 border-b border-slate-200 bg-white px-6 py-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button
              onClick={() => navigate('/findings')}
              className="flex items-center gap-1.5 text-slate-500 hover:text-slate-800 transition-colors text-sm font-medium"
            >
              <ArrowLeft size={16} />
              Geri
            </button>
            <div className="h-5 w-px bg-slate-200" />
            <span className="text-xs font-mono font-bold text-blue-600">
              {finding.finding_code || finding.code}
            </span>
            <SeverityBadge severity={finding.severity} />
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={() => setSpyMode(!spyMode)}
              className={clsx(
                'flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-bold transition-all border',
                spyMode
                  ? 'bg-red-50 text-red-700 border-red-200 shadow-sm'
                  : 'bg-white text-slate-500 border-slate-200 hover:border-slate-300'
              )}
            >
              {spyMode ? <Eye size={14} /> : <EyeOff size={14} />}
              Spy Mode {spyMode ? 'ON' : 'OFF'}
            </button>
            <button
              onClick={() => setSidebarOpen(true)}
              className="px-4 py-1.5 bg-slate-800 text-white text-xs font-bold rounded-lg hover:bg-slate-700 transition-colors"
            >
              Detay Paneli
            </button>
          </div>
        </div>
      </div>

      <div className="shrink-0 px-6 pt-4 pb-3">
        <h1 className="text-xl font-bold text-slate-800 mb-2">{finding.title}</h1>
        <FindingWorkflowProgress
          currentStage={(finding.state || finding.status || 'DRAFT') as any}
          dueDate={finding.agreement_date}
        />
      </div>

      <div className="shrink-0 border-b border-slate-200 bg-white px-6">
        <div className="flex gap-1">
          {LEFT_TABS.map((tab) => (
            <button
              key={tab.key}
              onClick={() => setActiveLeftTab(tab.key)}
              className={clsx(
                'flex items-center gap-2 px-5 py-2.5 text-sm font-bold transition-all relative',
                activeLeftTab === tab.key
                  ? 'text-slate-800 border-b-2 border-slate-800'
                  : 'text-slate-500 hover:text-slate-700 hover:bg-slate-50'
              )}
            >
              <div className={clsx('w-5 h-5 rounded flex items-center justify-center', activeLeftTab === tab.key ? tab.color : 'bg-slate-200')}>
                <tab.icon size={12} className="text-white" />
              </div>
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-6">
        {activeLeftTab === 'tespit' && <TespitTab finding={finding} />}
        {activeLeftTab === 'risk' && <RiskTab finding={finding} secret={spyMode ? secret : null} />}
        {activeLeftTab === 'oneri' && <OneriTab finding={finding} />}

        {spyMode && secret && <IronCurtainPanel secret={secret} />}
      </div>

      <FindingRightSidebar
        finding={finding as ComprehensiveFinding}
        isOpen={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
      />
    </div>
  );
}

function SeverityBadge({ severity }: { severity: string }) {
  const config: Record<string, { bg: string; text: string; label: string }> = {
    CRITICAL: { bg: 'bg-red-100', text: 'text-red-800', label: 'Kritik' },
    HIGH: { bg: 'bg-orange-100', text: 'text-orange-800', label: 'Yuksek' },
    MEDIUM: { bg: 'bg-yellow-100', text: 'text-yellow-800', label: 'Orta' },
    LOW: { bg: 'bg-emerald-100', text: 'text-emerald-800', label: 'Dusuk' },
    OBSERVATION: { bg: 'bg-slate-100', text: 'text-slate-700', label: 'Gozlem' },
  };
  const c = config[severity] ?? config.MEDIUM;
  return (
    <span className={clsx('px-2.5 py-0.5 rounded-full text-[10px] font-black', c.bg, c.text)}>
      {c.label}
    </span>
  );
}

function TespitTab({ finding }: { finding: any }) {
  return (
    <div className="max-w-4xl space-y-6">
      <div className="bg-blue-50 border border-blue-200 rounded-xl p-5">
        <h3 className="text-xs font-black text-blue-800 uppercase tracking-wider mb-3">
          Yonetici Ozeti
        </h3>
        <p className="text-sm text-blue-900 leading-relaxed">
          {finding.description_public || finding.description || 'Yonetici ozeti henuz eklenmedi.'}
        </p>
      </div>

      <div className="bg-white rounded-xl border border-slate-200 p-5">
        <h3 className="text-xs font-black text-slate-600 uppercase tracking-wider mb-3">
          Detayli Tespit
        </h3>
        {finding.detection_html ? (
          <div
            className="prose prose-sm max-w-none text-slate-700"
            dangerouslySetInnerHTML={{ __html: finding.detection_html }}
          />
        ) : (
          <p className="text-sm text-slate-600 leading-relaxed">
            {finding.description || 'Detayli tespit metni henuz eklenmedi.'}
          </p>
        )}
      </div>

      {finding.criteria_json && finding.criteria_json.length > 0 && (
        <div className="bg-white rounded-xl border border-slate-200 p-5">
          <h3 className="text-xs font-black text-slate-600 uppercase tracking-wider mb-3">
            Denetim Kriterleri
          </h3>
          <div className="space-y-2">
            {finding.criteria_json.map((criteria: any, idx: number) => (
              <div key={idx} className="flex items-start gap-3 p-3 bg-slate-50 rounded-lg">
                <div className="w-6 h-6 rounded-full bg-blue-100 text-blue-700 flex items-center justify-center text-xs font-bold shrink-0">
                  {idx + 1}
                </div>
                <p className="text-sm text-slate-700">{criteria.text || criteria}</p>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

function RiskTab({ finding, secret }: { finding: any; secret: FindingSecret | null | undefined }) {
  return (
    <div className="max-w-4xl space-y-6">
      <div className="grid grid-cols-2 gap-4">
        <ScoreCard label="Etki Skoru" value={finding.impact_score ?? '-'} max={5} color="bg-orange-500" />
        <ScoreCard label="Olasilik Skoru" value={finding.likelihood_score ?? '-'} max={5} color="bg-blue-500" />
        <ScoreCard label="Risk Puani" value={finding.risk_score ?? '-'} max={25} color="bg-red-500" />
        <ScoreCard
          label="Finansal Etki"
          value={finding.financial_impact ? `${(finding.financial_impact / 1000000).toFixed(2)}M TL` : '-'}
          color="bg-emerald-500"
        />
      </div>

      {finding.impact_html && (
        <div className="bg-white rounded-xl border border-slate-200 p-5">
          <h3 className="text-xs font-black text-slate-600 uppercase tracking-wider mb-3">
            Etki Analizi
          </h3>
          <div
            className="prose prose-sm max-w-none text-slate-700"
            dangerouslySetInnerHTML={{ __html: finding.impact_html }}
          />
        </div>
      )}

      {secret && (secret.why_1 || secret.root_cause_summary) && (
        <div className="bg-white rounded-xl border border-slate-200 p-5">
          <h3 className="text-xs font-black text-slate-600 uppercase tracking-wider mb-3">
            5-Neden Analizi (Kok Neden)
          </h3>
          <div className="space-y-3">
            {[secret.why_1, secret.why_2, secret.why_3, secret.why_4, secret.why_5]
              .filter(Boolean)
              .map((why, idx) => (
                <div key={idx} className="flex items-start gap-3">
                  <div className="w-8 h-8 rounded-full bg-red-100 text-red-700 flex items-center justify-center text-xs font-black shrink-0">
                    N{idx + 1}
                  </div>
                  <div className="flex-1 bg-red-50 rounded-lg p-3 text-sm text-red-900">
                    {why}
                  </div>
                </div>
              ))}
          </div>
          {secret.root_cause_summary && (
            <div className="mt-4 bg-red-100 border border-red-200 rounded-lg p-4">
              <h4 className="text-xs font-black text-red-800 uppercase mb-2">Kok Neden Ozeti</h4>
              <p className="text-sm text-red-900">{secret.root_cause_summary}</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

function OneriTab({ finding }: { finding: any }) {
  return (
    <div className="max-w-4xl space-y-6">
      <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-5">
        <h3 className="text-xs font-black text-emerald-800 uppercase tracking-wider mb-3">
          Iyilestirme Onerileri
        </h3>
        {finding.recommendation_html ? (
          <div
            className="prose prose-sm max-w-none text-emerald-900"
            dangerouslySetInnerHTML={{ __html: finding.recommendation_html }}
          />
        ) : (
          <p className="text-sm text-emerald-900 leading-relaxed">
            Denetim ekibinin iyilestirme onerileri bu bolumdedir.
            Bulgu henuz oneri asamasina gelmemistir.
          </p>
        )}
      </div>

      {finding.action_plans && finding.action_plans.length > 0 && (
        <div className="bg-white rounded-xl border border-slate-200 p-5">
          <h3 className="text-xs font-black text-slate-600 uppercase tracking-wider mb-4">
            Aksiyon Planlari ({finding.action_plans.length})
          </h3>
          <div className="space-y-3">
            {finding.action_plans.map((plan: any) => (
              <div key={plan.id} className="border border-slate-200 rounded-lg p-4 hover:shadow-sm transition-shadow">
                <div className="flex items-start justify-between mb-2">
                  <h4 className="text-sm font-bold text-slate-800">{plan.title}</h4>
                  <StatusBadge status={plan.status} />
                </div>
                <p className="text-xs text-slate-600 mb-3">{plan.description}</p>
                <div className="flex items-center gap-4 text-xs text-slate-500">
                  <span>Sorumlu: <strong className="text-slate-700">{plan.responsible_person}</strong></span>
                  <span>Hedef: <strong className="text-slate-700">{new Date(plan.target_date).toLocaleDateString('tr-TR')}</strong></span>
                </div>
                {plan.progress_percentage > 0 && (
                  <div className="mt-3">
                    <div className="flex justify-between text-[10px] font-bold text-slate-500 mb-1">
                      <span>Ilerleme</span>
                      <span>{plan.progress_percentage}%</span>
                    </div>
                    <div className="h-1.5 bg-slate-100 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-blue-500 rounded-full transition-all"
                        style={{ width: `${plan.progress_percentage}%` }}
                      />
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

function IronCurtainPanel({ secret }: { secret: FindingSecret }) {
  return (
    <div className="max-w-4xl mt-6 bg-red-50 border-2 border-red-200 rounded-xl p-5">
      <div className="flex items-center gap-2 mb-4">
        <Shield size={18} className="text-red-600" />
        <h2 className="text-sm font-black text-red-700 uppercase">
          Gizli - Demir Perde
        </h2>
      </div>
      <div className="space-y-4">
        {secret.root_cause_analysis_internal && (
          <div>
            <h3 className="text-xs font-bold text-red-600 mb-1">Ic Kok Neden Analizi</h3>
            <p className="text-sm text-red-900 bg-white rounded-lg p-3 border border-red-100">
              {secret.root_cause_analysis_internal}
            </p>
          </div>
        )}
        {secret.detection_methodology && (
          <div>
            <h3 className="text-xs font-bold text-red-600 mb-1">Tespit Metodolojisi</h3>
            <p className="text-sm text-red-900 bg-white rounded-lg p-3 border border-red-100">
              {secret.detection_methodology}
            </p>
          </div>
        )}
        {secret.internal_notes && (
          <div>
            <h3 className="text-xs font-bold text-red-600 mb-1">Mufettis Ic Notlari</h3>
            <p className="text-sm text-red-900 bg-white rounded-lg p-3 border border-red-100">
              {secret.internal_notes}
            </p>
          </div>
        )}
      </div>
    </div>
  );
}

function ScoreCard({ label, value, max, color }: { label: string; value: string | number; max?: number; color: string }) {
  return (
    <div className="bg-white rounded-xl border border-slate-200 p-4">
      <p className="text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">{label}</p>
      <div className="flex items-end gap-1">
        <span className="text-2xl font-black text-slate-800">{value}</span>
        {max && typeof value === 'number' && (
          <span className="text-xs text-slate-400 mb-1">/ {max}</span>
        )}
      </div>
      {max && typeof value === 'number' && (
        <div className="mt-2 h-1.5 bg-slate-100 rounded-full overflow-hidden">
          <div
            className={clsx('h-full rounded-full transition-all', color)}
            style={{ width: `${Math.min(100, (value / max) * 100)}%` }}
          />
        </div>
      )}
    </div>
  );
}

function StatusBadge({ status }: { status: string }) {
  const config: Record<string, { bg: string; text: string }> = {
    COMPLETED: { bg: 'bg-green-100', text: 'text-green-700' },
    IN_PROGRESS: { bg: 'bg-blue-100', text: 'text-blue-700' },
    APPROVED: { bg: 'bg-emerald-100', text: 'text-emerald-700' },
    IN_REVIEW: { bg: 'bg-amber-100', text: 'text-amber-700' },
    OVERDUE: { bg: 'bg-red-100', text: 'text-red-700' },
    DRAFT: { bg: 'bg-slate-100', text: 'text-slate-600' },
  };
  const c = config[status] ?? config.DRAFT;
  return (
    <span className={clsx('px-2 py-0.5 rounded text-[10px] font-bold', c.bg, c.text)}>
      {status}
    </span>
  );
}
