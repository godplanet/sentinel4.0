import { useState } from 'react';
import {
  X, FileText, Link2, Cpu, History,
  AlertTriangle, Shield, User, Calendar,
  Clock3, FileCheck, UploadCloud, CheckCircle2,
} from 'lucide-react';
import clsx from 'clsx';
import { format } from 'date-fns';
import { tr } from 'date-fns/locale';
import { AgingTierBadge } from '@/entities/action/ui/AgingTierBadge';
import { ActionStatusBadge } from '@/entities/action/ui/ActionStatusBadge';
import { AuditorDecisionBar } from '@/features/action-review/ui/AuditorDecisionBar';
import { AIEvidenceAnalyzer } from '@/features/action-review/ui/AIEvidenceAnalyzer';
import { TraceabilityGoldenThread } from '@/features/action-review/ui/TraceabilityGoldenThread';
import { ForensicTimeline } from '@/shared/ui/ForensicTimeline';
import type { TimelineEvent } from '@/shared/ui/ForensicTimeline';
import type { ActionAgingMetrics, ActionEvidence } from '@/entities/action/model/types';

type Tab = 'context' | 'evidence' | 'history';

const TABS: { id: Tab; label: string; icon: React.ElementType }[] = [
  { id: 'context',  label: 'Bağlam & İzlenebilirlik', icon: Link2  },
  { id: 'evidence', label: 'Kanıt & AI İnceleme',       icon: Cpu   },
  { id: 'history',  label: 'Adli Tarihçe',               icon: History },
];

function buildTimeline(action: ActionAgingMetrics): TimelineEvent[] {
  const snapshot = action.finding_snapshot;
  const events: TimelineEvent[] = [
    {
      id: 'created',
      date: format(new Date(action.created_at), 'd MMM yyyy HH:mm', { locale: tr }),
      title: 'Aksiyon Oluşturuldu',
      description: `"${snapshot?.title ?? 'Bulgu'}" bulgusundan oluşturuldu. Orijinal termin: ${format(new Date(action.original_due_date), 'd MMM yyyy', { locale: tr })}.`,
      icon: FileCheck,
      color: 'blue',
    },
  ];

  if (action.evidence_count > 0) {
    events.push({
      id: 'evidence-submitted',
      date: format(new Date(action.updated_at), 'd MMM yyyy HH:mm', { locale: tr }),
      title: 'Kanıt Yüklendi',
      description: `${action.evidence_count} dosya yüklendi. AI analizine tabi tutuldu.`,
      icon: UploadCloud,
      color: 'green',
    });
  }

  if (action.is_bddk_breach) {
    events.push({
      id: 'bddk-breach',
      date: format(new Date(), 'd MMM yyyy', { locale: tr }),
      title: 'BDDK Kırmızı Çizgi İhlali',
      description: `Aksiyon ${action.performance_delay_days} gün gecikmiş. Yönetim Kurulu İstisnası gerekiyor.`,
      icon: AlertTriangle,
      color: 'maroon',
    });
  }

  if (action.pending_requests > 0) {
    events.push({
      id: 'pending-req',
      date: format(new Date(), 'd MMM yyyy', { locale: tr }),
      title: 'Bekleyen Talep',
      description: `${action.pending_requests} adet talep denetçi onayını bekliyor.`,
      icon: Clock3,
      color: 'amber',
    });
  }

  if (action.escalation_level > 0) {
    events.push({
      id: 'escalation',
      date: format(new Date(action.updated_at), 'd MMM yyyy', { locale: tr }),
      title: `Seviye ${action.escalation_level} Eskalasyon`,
      description: 'Aksiyon üst yönetime eskalasyon yapıldı.',
      icon: AlertTriangle,
      color: 'red',
    });
  }

  if (action.status === 'closed' && action.closed_at) {
    events.push({
      id: 'closed',
      date: format(new Date(action.closed_at), 'd MMM yyyy HH:mm', { locale: tr }),
      title: 'Aksiyon Kapatıldı',
      description: 'Denetçi tarafından incelendi ve kapatıldı.',
      icon: CheckCircle2,
      color: 'green',
    });
  }

  return events;
}

interface Props {
  action: ActionAgingMetrics;
  evidence?: ActionEvidence[];
  isOpen?: boolean;
  onClose?: () => void;
  onDecision?: (verdict: 'closed' | 'review_rejected') => void;
}

export function ActionSuperDrawer({
  action,
  evidence,
  isOpen,
  onClose,
  onDecision,
}: Props) {
  const [activeTab, setActiveTab] = useState<Tab>('context');
  const snapshot = action.finding_snapshot;

  if (isOpen === false) return null;

  return (
        <div
          className={clsx(
            'flex flex-col h-full',
            'bg-white/90 backdrop-blur-2xl border-l border-slate-200',
            action.is_bddk_breach && 'border-t-[3px] border-t-[#700000]',
          )}
        >
            {action.is_bddk_breach && (
              <div className="bg-[#700000] text-white px-6 py-2 flex items-center gap-2">
                <AlertTriangle size={14} className="animate-pulse shrink-0" />
                <p className="text-xs font-black tracking-wide">
                  BDDK KIRMIZI ÇİZGİ İHLALİ — Acil Yönetim Kurulu Eskalasyonu Gereklidir
                </p>
              </div>
            )}

            <DrawerHeader action={action} onClose={onClose} />

            <div className="flex-1 overflow-y-auto min-h-0">
              <IronVaultSection action={action} />

              <TabNavigation
                tabs={TABS}
                activeTab={activeTab}
                onChange={setActiveTab}
                isBddk={action.is_bddk_breach}
              />

              <div className="p-6 bg-[#FDFBF7]">
                {activeTab === 'context' && (
                  <TraceabilityGoldenThread action={action} />
                )}
                {activeTab === 'evidence' && (
                  <AIEvidenceAnalyzer evidence={evidence} />
                )}
                {activeTab === 'history' && (
                  <ForensicTimeline
                    events={buildTimeline(action)}
                    emptyMessage="Adli tarihçe kaydı bulunamadı."
                  />
                )}
              </div>
            </div>

            <AuditorDecisionBar action={action} onDecision={(v) => { onDecision?.(v); onClose?.(); }} />
        </div>
  );
}

function DrawerHeader({
  action,
  onClose,
}: {
  action: ActionAgingMetrics;
  onClose?: () => void;
}) {
  const snapshot = action.finding_snapshot;

  return (
    <div className="px-6 py-4 border-b border-slate-200 bg-white/70 backdrop-blur-md flex items-start justify-between gap-4 shrink-0">
      <div className="flex items-start gap-3 flex-1 min-w-0">
        <div className={clsx(
          'w-10 h-10 rounded-xl flex items-center justify-center shrink-0 mt-0.5',
          action.is_bddk_breach ? 'bg-[#700000]/10' : 'bg-blue-50',
        )}>
          {action.is_bddk_breach ? (
            <Shield size={18} className="text-[#700000]" />
          ) : (
            <Shield size={18} className="text-blue-600" />
          )}
        </div>

        <div className="flex-1 min-w-0">
          <h2 className="text-base font-black text-slate-900 leading-snug line-clamp-2 mb-2">
            {snapshot?.title ?? 'Aksiyon Detayı'}
          </h2>
          <div className="flex flex-wrap items-center gap-2">
            <ActionStatusBadge status={action.status} />
            <AgingTierBadge
              tier={action.aging_tier}
              isBddbBreach={action.is_bddk_breach}
              overdayDays={action.operational_delay_days > 0 ? action.operational_delay_days : undefined}
            />
            {action.assignee_unit_id && (
              <span className="inline-flex items-center gap-1 text-[11px] text-slate-500 font-medium">
                <User size={10} />
                {action.assignee_unit_id.slice(0, 8)}...
              </span>
            )}
            <span className="inline-flex items-center gap-1 text-[11px] text-slate-500">
              <Calendar size={10} />
              {format(new Date(action.current_due_date), 'd MMM yyyy', { locale: tr })}
            </span>
          </div>
        </div>
      </div>

      <button
        onClick={() => onClose?.()}
        className="w-8 h-8 rounded-lg hover:bg-slate-100 flex items-center justify-center text-slate-400 hover:text-slate-700 transition-colors shrink-0"
        aria-label="Kapat"
      >
        <X size={18} />
      </button>
    </div>
  );
}

function IronVaultSection({ action }: { action: ActionAgingMetrics }) {
  const snapshot = action.finding_snapshot;
  return (
    <div className="px-6 py-5 border-b border-slate-200 bg-white">
      <div className="flex items-center gap-2 mb-3">
        <FileText size={13} className="text-slate-400" />
        <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
          Bulgu Kaydı — Iron Vault (Değişmez)
        </span>
        {snapshot?.created_at && (
          <time className="ml-auto text-[10px] text-slate-400 font-mono">
            {format(new Date(snapshot.created_at), 'd MMM yyyy', { locale: tr })}
          </time>
        )}
      </div>

      <div className="font-serif bg-[#FDFBF7] border border-slate-200 rounded-xl p-5 shadow-sm space-y-3">
        <div className="flex items-start justify-between gap-3">
          <h3 className="text-base font-bold text-slate-900 not-italic leading-snug">
            {snapshot?.title ?? 'Başlık Yok'}
          </h3>
          <span className={clsx(
            'inline-flex items-center px-2.5 py-0.5 rounded text-[11px] font-bold shrink-0 not-italic font-sans',
            snapshot?.severity === 'CRITICAL' ? 'bg-[#eb0000] text-white' :
            snapshot?.severity === 'HIGH'     ? 'bg-[#ff960a] text-white' :
            snapshot?.severity === 'MEDIUM'   ? 'bg-[#FFD700] text-black' :
                                                'bg-[#28a745] text-white',
          )}>
            {snapshot?.severity ?? 'N/A'}
          </span>
        </div>

        {snapshot?.gias_category && (
          <p className="text-xs text-slate-500 not-italic font-sans">
            GIAS Kategorisi: <span className="font-semibold">{snapshot.gias_category}</span>
          </p>
        )}

        <p className="text-sm text-slate-600 leading-relaxed not-italic">
          {snapshot?.description ?? 'Bu aksiyon için kayıtlı bulgu açıklaması bulunmuyor.'}
        </p>

        <div className="flex items-center gap-3 pt-3 border-t border-slate-100 not-italic font-sans">
          <span className="text-xs text-slate-500">
            Risk: <span className="font-semibold text-slate-700">{snapshot?.risk_rating ?? 'N/A'}</span>
          </span>
          <span className="flex items-center gap-1 text-xs text-slate-500 ml-auto">
            <Clock3 size={11} />
            Son: {format(new Date(action.current_due_date), 'd MMMM yyyy', { locale: tr })}
          </span>
        </div>
      </div>
    </div>
  );
}

function TabNavigation({
  tabs,
  activeTab,
  onChange,
  isBddk,
}: {
  tabs: typeof TABS;
  activeTab: Tab;
  onChange: (t: Tab) => void;
  isBddk: boolean;
}) {
  return (
    <div className="flex border-b border-slate-200 bg-white shrink-0 overflow-x-auto">
      {tabs.map(({ id, label, icon: Icon }) => (
        <button
          key={id}
          onClick={() => onChange(id)}
          className={clsx(
            'flex items-center gap-1.5 px-5 py-3.5 text-xs font-bold whitespace-nowrap border-b-2 transition-all',
            activeTab === id
              ? isBddk
                ? 'border-[#700000] text-[#700000]'
                : 'border-blue-600 text-blue-700'
              : 'border-transparent text-slate-500 hover:text-slate-700 hover:border-slate-300',
          )}
        >
          <Icon size={13} />
          {label}
        </button>
      ))}
    </div>
  );
}
