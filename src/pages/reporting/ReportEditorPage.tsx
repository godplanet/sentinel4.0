import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Lock, BookOpen, Layout, Monitor, MessageSquare, Plus, Sun, Sunrise, X, FileText } from 'lucide-react';
import clsx from 'clsx';
import { useActiveReportStore } from '@/entities/report';
import { fetchFirstDraftReport } from '@/entities/report/api/report-api';
import { useFindingStore } from '@/entities/finding/model/store';
import { fetchFindingsByEngagement } from '@/entities/finding/api/supabase-api';
import type { ComprehensiveFinding } from '@/entities/finding/model/types';
import { LiquidGlassToolbar } from '@/features/report-editor/ui/LiquidGlassToolbar';
import { SectionNavigator } from '@/features/report-editor/ui/SectionNavigator';
import { ZenCanvas } from '@/features/report-editor/ui/ZenCanvas';
import { BlockPalette } from '@/features/report-editor/ui/BlockPalette';
import { ExecutiveSummaryStudio } from '@/features/report-editor/ui/ExecutiveSummaryStudio';
import { BoardBriefingCard } from '@/features/report-editor/ui/BoardBriefingCard';
import { WorkflowActionBar } from '@/features/report-editor/ui/WorkflowActionBar';
import { ReviewNotesSidebar } from '@/features/report-editor/ui/ReviewNotesSidebar';
import { useCollaboration } from '@/features/report-editor/hooks/useCollaboration';
import { TraceabilityDrawer } from '@/widgets/TraceabilityDrawer';

type TabId = 'executive' | 'canvas' | 'board';

const TABS: { id: TabId; label: string; icon: React.ReactNode }[] = [
  { id: 'executive', label: 'Yönetici Özeti', icon: <BookOpen size={15} /> },
  { id: 'canvas', label: 'Detaylı Rapor', icon: <Layout size={15} /> },
  { id: 'board', label: 'YK Sunumu', icon: <Monitor size={15} /> },
];

const FALLBACK_FINDINGS: ComprehensiveFinding[] = [
  {
    id: 'find-001',
    tenant_id: 'mock-tenant',
    engagement_id: '10000000-0000-0000-0000-000000000003',
    code: 'F-2026-001',
    finding_code: 'F-2026-001',
    title: 'Kredi Limiti Onay Kontrolü Yetersizliği',
    severity: 'CRITICAL',
    state: 'PUBLISHED',
    impact_score: 87.5,
    detection_html:
      '<p>Kredi limitlerinin %23\'ü yetkisiz personel tarafından artırılmıştır. Toplam 147 işlem yetki matrisi dışında gerçekleştirilmiştir.</p>',
    impact_html:
      '<p>Potansiyel finansal kayıp: 12.4M TL. BDDK düzenleyici para cezası riski yüksek. İtibar hasarı ve müşteri güven kaybı muhtemel.</p>',
    created_at: '2026-01-15T10:00:00Z',
    updated_at: '2026-02-15T14:00:00Z',
    secrets: {
      finding_id: 'find-001',
      internal_notes: 'Şube müdürü ile 12 Şubat tarihinde gizlice görüşüldü.',
    },
    action_plans: [],
    comments: [],
    history: [],
  },
  {
    id: 'find-002',
    tenant_id: 'mock-tenant',
    engagement_id: '10000000-0000-0000-0000-000000000003',
    code: 'F-2026-002',
    finding_code: 'F-2026-002',
    title: 'KYC Dokümantasyon Eksiklikleri',
    severity: 'HIGH',
    state: 'NEGOTIATION',
    impact_score: 62.0,
    detection_html:
      '<p>147 aktif müşteri dosyasında güncel kimlik ve gelir belgesi bulunmamaktadır.</p>',
    impact_html:
      '<p>MASAK uyumsuzluk riski kritik seviyede. 5M TL\'ye varan para cezası potansiyeli mevcut.</p>',
    created_at: '2026-01-20T10:00:00Z',
    updated_at: '2026-02-10T09:00:00Z',
    secrets: {
      finding_id: 'find-002',
      internal_notes: 'Uyum ekibi bilgilendirildi.',
    },
    action_plans: [],
    comments: [],
    history: [],
  },
];

function WarmthControl({ warmth, onChange }: { warmth: number; onChange: (v: number) => void }) {
  const [open, setOpen] = useState(false);

  const warmthLabel = warmth === 0
    ? 'Beyaz'
    : warmth <= 3
    ? 'Krem'
    : warmth <= 6
    ? 'Sıcak'
    : 'Bej';

  return (
    <div className="relative flex items-center">
      <button
        onClick={() => setOpen((v) => !v)}
        title="Kağıt sıcaklığını ayarla"
        className={clsx(
          'flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-sans font-medium border transition-all',
          open
            ? 'bg-amber-500 border-amber-400 text-white'
            : warmth > 5
            ? 'bg-amber-50 border-amber-200 text-amber-700 hover:bg-amber-100'
            : 'bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100',
        )}
      >
        <Sun size={13} />
        <span className="hidden sm:inline">{warmthLabel}</span>
      </button>

      {open && (
        <>
          <div
            className="fixed inset-0 z-40"
            onClick={() => setOpen(false)}
          />
          <div className="absolute right-0 top-full mt-2 bg-white rounded-2xl shadow-2xl border border-slate-200 p-4 w-64 z-50">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <Sunrise size={15} className="text-amber-500" />
                <span className="text-xs font-sans font-semibold text-slate-700">Kağıt Sıcaklığı</span>
              </div>
              <button
                onClick={() => setOpen(false)}
                className="p-0.5 rounded text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors"
              >
                <X size={13} />
              </button>
            </div>

            <input
              type="range"
              min="0"
              max="10"
              step="1"
              value={warmth}
              onChange={(e) => onChange(Number(e.target.value))}
              className="w-full h-2 bg-gradient-to-r from-slate-200 via-amber-100 to-amber-400 rounded-full appearance-none cursor-pointer
                [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-4 [&::-webkit-slider-thumb]:h-4
                [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-white
                [&::-webkit-slider-thumb]:shadow-md [&::-webkit-slider-thumb]:border-2 [&::-webkit-slider-thumb]:border-amber-300
                [&::-moz-range-thumb]:w-4 [&::-moz-range-thumb]:h-4 [&::-moz-range-thumb]:rounded-full
                [&::-moz-range-thumb]:bg-white [&::-moz-range-thumb]:shadow-md [&::-moz-range-thumb]:border-2 [&::-moz-range-thumb]:border-amber-300"
            />

            <div className="flex items-center justify-between mt-2 text-xs">
              <span className="text-slate-400">Beyaz</span>
              <span className={clsx('font-semibold', warmth > 5 ? 'text-amber-600' : 'text-slate-600')}>
                {warmthLabel}
              </span>
              <span className="text-amber-500">Bej</span>
            </div>

            <p className="mt-2 pt-2 border-t border-slate-100 text-xs text-slate-400 leading-relaxed">
              {warmth === 0
                ? 'Dijital beyaz — klasik ekran'
                : warmth <= 3
                ? 'Hafif krem — gündüz okuma'
                : warmth <= 6
                ? 'Orta sıcak — göz dostu'
                : warmth <= 8
                ? 'Sıcak bej — akşam okuma'
                : 'Kindle modu — gece okuma'}
            </p>
          </div>
        </>
      )}
    </div>
  );
}

export default function ReportEditorPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { activeReport, isLoading, error, loadReport, setActiveReport } = useActiveReportStore();
  const setFindings = useFindingStore((s) => s.setFindings);
  const [activeTab, setActiveTab] = useState<TabId>('executive');
  const [rightPanel, setRightPanel] = useState<'blocks' | 'notes'>('blocks');
  const [warmth, setWarmth] = useState(2);
  const [traceabilityOpen, setTraceabilityOpen] = useState(false);
  const collabCtx = useCollaboration(id ?? 'no-report');

  useEffect(() => {
    let cancelled = false;
    async function init() {
      let targetId = id;
      if (!targetId) {
        const firstId = await fetchFirstDraftReport().catch(() => null);
        if (firstId && !cancelled) {
          navigate(`/reporting/zen-editor/${firstId}`, { replace: true });
          return;
        }
      }
      if (targetId && !cancelled) {
        await loadReport(targetId);
      }
    }
    init();
    return () => {
      cancelled = true;
      setActiveReport(null);
    };
  }, [id]);

  useEffect(() => {
    if (!activeReport) return;
    const engagementId = activeReport.engagementId;
    if (!engagementId) {
      setFindings(FALLBACK_FINDINGS);
      return;
    }
    (async () => {
      try {
        const data = await fetchFindingsByEngagement(engagementId);
        setFindings(data.length > 0 ? data : FALLBACK_FINDINGS);
      } catch {
        setFindings(FALLBACK_FINDINGS);
      }
    })();
  }, [activeReport?.id, setFindings]);

  if (isLoading) {
    return (
      <div className="h-screen flex flex-col items-center justify-center bg-slate-50 gap-4">
        <div className="w-10 h-10 rounded-full border-4 border-slate-200 border-t-blue-600 animate-spin" />
        <p className="text-sm font-sans text-slate-500">Rapor yükleniyor...</p>
      </div>
    );
  }

  if (error || !activeReport) {
    return (
      <div className="h-screen flex flex-col items-center justify-center bg-slate-50 gap-4">
        <FileText size={40} className="text-slate-300" />
        <p className="text-sm font-sans font-semibold text-slate-600">
          {error ?? 'Rapor bulunamadı.'}
        </p>
      </div>
    );
  }

  const isLocked =
    activeReport?.status === 'published' || activeReport?.status === 'archived';
  const isEditable = !isLocked;

  return (
    <div className="h-screen overflow-hidden flex flex-col bg-slate-100 print:h-auto print:overflow-visible">
      <LiquidGlassToolbar
        collabCtx={collabCtx}
        traceabilityOpen={traceabilityOpen}
        onTraceabilityToggle={() => setTraceabilityOpen((v) => !v)}
      />

      {isLocked && (
        <div className="flex items-center justify-center gap-2 bg-amber-50 border-b border-amber-200 py-2 px-4 no-print">
          <Lock size={14} className="text-amber-600 flex-shrink-0" />
          <span className="text-xs font-sans font-semibold text-amber-700">
            Bu rapor kilitlenmiştir. Yayınlanmış raporlar düzenlenemez.
          </span>
        </div>
      )}

      <div className="bg-white border-b border-slate-200 px-4 sm:px-6 flex-shrink-0 no-print">
        <div className="flex items-center justify-between">
          <div className="flex gap-1 overflow-x-auto">
            {TABS.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={clsx(
                  'flex items-center gap-2 px-4 py-3 text-sm font-sans font-medium border-b-2 transition-colors whitespace-nowrap',
                  activeTab === tab.id
                    ? 'border-blue-600 text-blue-700'
                    : 'border-transparent text-slate-500 hover:text-slate-800 hover:border-slate-300',
                )}
              >
                {tab.icon}
                {tab.label}
              </button>
            ))}
          </div>
          <div className="flex-shrink-0 pl-3 py-1.5">
            <WarmthControl warmth={warmth} onChange={setWarmth} />
          </div>
        </div>
      </div>

      <div className="flex-1 min-h-0 overflow-hidden">
        {activeTab === 'executive' && (
          <div className="h-full overflow-y-auto pb-20">
            <ExecutiveSummaryStudio readOnly={!isEditable} warmth={warmth} />
          </div>
        )}

        {activeTab === 'canvas' && (
          <div className="flex h-full overflow-hidden">
            <div className="hidden lg:block flex-shrink-0">
              <SectionNavigator />
            </div>
            <div className="flex-1 min-w-0 overflow-y-auto pb-20">
              <ZenCanvas readOnly={!isEditable} warmth={warmth} externalCollabCtx={collabCtx} />
            </div>
            <div className="hidden sm:flex flex-col border-l border-slate-200 flex-shrink-0 w-56 xl:w-64">
              <div className="flex items-center bg-white border-b border-slate-200 px-2 py-1.5 gap-1">
                {isEditable && (
                  <button
                    onClick={() => setRightPanel('blocks')}
                    className={clsx(
                      'flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-sans font-medium transition-colors',
                      rightPanel === 'blocks'
                        ? 'bg-slate-900 text-white'
                        : 'text-slate-500 hover:bg-slate-100',
                    )}
                  >
                    <Plus size={12} />
                    Bloklar
                  </button>
                )}
                <button
                  onClick={() => setRightPanel('notes')}
                  className={clsx(
                    'flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-sans font-medium transition-colors',
                    rightPanel === 'notes'
                      ? 'bg-amber-500 text-white'
                      : 'text-slate-500 hover:bg-slate-100',
                  )}
                >
                  <MessageSquare size={12} />
                  Notlar
                  {(activeReport?.reviewNotes ?? []).filter((n) => n.status === 'open').length > 0 && (
                    <span className="ml-0.5 bg-amber-600 text-white text-xs rounded-full w-4 h-4 flex items-center justify-center font-bold">
                      {(activeReport?.reviewNotes ?? []).filter((n) => n.status === 'open').length}
                    </span>
                  )}
                </button>
              </div>
              <div className="flex-1 overflow-y-auto">
                {rightPanel === 'blocks' && isEditable ? (
                  <BlockPalette />
                ) : (
                  <ReviewNotesSidebar />
                )}
              </div>
            </div>
          </div>
        )}

        {activeTab === 'board' && activeReport && (
          <div className="h-full overflow-y-auto pb-20">
            <BoardBriefingCard report={activeReport} warmth={warmth} />
          </div>
        )}
      </div>

      <WorkflowActionBar />

      <TraceabilityDrawer
        open={traceabilityOpen}
        onClose={() => setTraceabilityOpen(false)}
      />
    </div>
  );
}
