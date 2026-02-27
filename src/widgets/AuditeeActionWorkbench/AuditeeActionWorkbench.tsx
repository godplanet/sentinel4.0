import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Inbox, Shield, Calendar, ChevronRight, UploadCloud,
  Clock3, RefreshCw, AlertTriangle, Loader2, FileText,
  ClipboardList,
} from 'lucide-react';
import clsx from 'clsx';
import { format } from 'date-fns';
import { tr } from 'date-fns/locale';
import { getActionsWithAging } from '@/entities/action/api/action-api';
import { ActionStatusBadge } from '@/entities/action/ui/ActionStatusBadge';
import { AgingTierBadge } from '@/entities/action/ui/AgingTierBadge';
import { EvidenceUploader } from '@/features/action-workflow/ui/EvidenceUploader';
import { ActionRequestForm } from '@/features/action-workflow/ui/ActionRequestForm';
import type { ActionAgingMetrics } from '@/entities/action/model/types';

type DetailTab = 'evidence' | 'request';

const SEVERITY_DOT: Record<string, string> = {
  CRITICAL: 'bg-[#eb0000]',
  HIGH:     'bg-[#ff960a]',
  MEDIUM:   'bg-[#FFD700]',
  LOW:      'bg-[#28a745]',
};

export function AuditeeActionWorkbench() {
  const [actions, setActions] = useState<ActionAgingMetrics[]>([]);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState<ActionAgingMetrics | null>(null);
  const [tab, setTab] = useState<DetailTab>('evidence');
  const [refreshKey, setRefreshKey] = useState(0);

  useEffect(() => {
    load();
  }, [refreshKey]);

  const load = async () => {
    setLoading(true);
    try {
      const data = await getActionsWithAging();
      setActions(data);
      if (!selected && data.length > 0) setSelected(data[0]);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const refresh = () => setRefreshKey((k) => k + 1);

  return (
    <div className="flex h-full rounded-2xl overflow-hidden border border-slate-200 shadow-sm bg-white">
      <LeftPane
        actions={actions}
        loading={loading}
        selected={selected}
        onSelect={(a) => { setSelected(a); setTab('evidence'); }}
        onRefresh={refresh}
      />

      <div className="flex-1 min-w-0 border-l border-slate-200">
        <AnimatePresence mode="wait">
          {selected ? (
            <motion.div
              key={selected.id}
              initial={{ opacity: 0, x: 10 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0 }}
              className="flex flex-col h-full"
            >
              <DetailHeader action={selected} />
              <IronVault action={selected} />
              <TabBar tab={tab} onChange={setTab} isBddk={selected.is_bddk_breach} />
              <div className="flex-1 overflow-y-auto p-6 bg-[#FDFBF7]">
                {tab === 'evidence' ? (
                  <EvidenceUploader actionId={selected.id} onSuccess={refresh} />
                ) : (
                  <ActionRequestForm action={selected} onSuccess={refresh} />
                )}
              </div>
            </motion.div>
          ) : (
            <motion.div
              key="empty"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="flex flex-col items-center justify-center h-full text-slate-400 gap-3"
            >
              <Inbox size={40} className="text-slate-300" />
              <p className="text-sm font-medium">Bir aksiyon seçin</p>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}

function LeftPane({
  actions,
  loading,
  selected,
  onSelect,
  onRefresh,
}: {
  actions: ActionAgingMetrics[];
  loading: boolean;
  selected: ActionAgingMetrics | null;
  onSelect: (a: ActionAgingMetrics) => void;
  onRefresh: () => void;
}) {
  return (
    <div className="w-80 shrink-0 flex flex-col border-r border-slate-200 bg-white">
      <div className="px-4 py-4 border-b border-slate-100 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-slate-100 flex items-center justify-center">
            <ClipboardList size={16} className="text-slate-600" />
          </div>
          <div>
            <p className="text-sm font-bold text-slate-800">Aksiyonlarım</p>
            <p className="text-xs text-slate-500">{actions.length} toplam</p>
          </div>
        </div>
        <button
          onClick={onRefresh}
          className="p-1.5 rounded-lg hover:bg-slate-100 text-slate-400 hover:text-slate-600 transition-colors"
          title="Yenile"
        >
          <RefreshCw size={14} className={clsx(loading && 'animate-spin')} />
        </button>
      </div>

      <div className="flex-1 overflow-y-auto divide-y divide-slate-100">
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 size={24} className="animate-spin text-slate-400" />
          </div>
        ) : actions.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12 text-slate-400 gap-2">
            <Inbox size={28} />
            <p className="text-sm font-medium">Aksiyon bulunmuyor</p>
          </div>
        ) : (
          actions.map((action) => (
            <ActionInboxItem
              key={action.id}
              action={action}
              isSelected={selected?.id === action.id}
              onClick={() => onSelect(action)}
            />
          ))
        )}
      </div>
    </div>
  );
}

function ActionInboxItem({
  action,
  isSelected,
  onClick,
}: {
  action: ActionAgingMetrics;
  isSelected: boolean;
  onClick: () => void;
}) {
  const snapshot = action.finding_snapshot;
  const sevDot = SEVERITY_DOT[snapshot?.severity ?? ''] ?? 'bg-slate-400';

  return (
    <button
      onClick={onClick}
      className={clsx(
        'w-full text-left px-4 py-3.5 transition-all hover:bg-slate-50',
        isSelected && 'bg-blue-50 border-r-2 border-blue-600',
      )}
    >
      <div className="flex items-start justify-between gap-2 mb-2">
        <p className={clsx(
          'text-xs font-bold leading-snug line-clamp-2 flex-1',
          isSelected ? 'text-blue-800' : 'text-slate-800',
        )}>
          {snapshot?.title ?? action.id.slice(0, 8)}
        </p>
        <ChevronRight
          size={14}
          className={clsx(
            'shrink-0 mt-0.5 transition-colors',
            isSelected ? 'text-blue-500' : 'text-slate-300',
          )}
        />
      </div>

      <div className="flex items-center gap-1.5 mb-2 flex-wrap">
        <span className={clsx('w-2 h-2 rounded-full shrink-0', sevDot)} />
        <ActionStatusBadge status={action.status} />
        <AgingTierBadge
          tier={action.aging_tier}
          isBddbBreach={action.is_bddk_breach}
          overdayDays={action.operational_delay_days > 0 ? action.operational_delay_days : undefined}
        />
      </div>

      <div className="flex items-center gap-1 text-[10px] text-slate-500">
        <Calendar size={10} />
        <span>Son: {format(new Date(action.current_due_date), 'd MMM yyyy', { locale: tr })}</span>
      </div>
    </button>
  );
}

function DetailHeader({ action }: { action: ActionAgingMetrics }) {
  const snapshot = action.finding_snapshot;
  return (
    <div className="px-6 py-4 bg-white/70 backdrop-blur-md border-b border-slate-200 shadow-sm flex items-center gap-4">
      <div className={clsx(
        'w-10 h-10 rounded-xl flex items-center justify-center shrink-0',
        action.is_bddk_breach
          ? 'bg-[#700000]/10'
          : 'bg-blue-50',
      )}>
        {action.is_bddk_breach ? (
          <AlertTriangle size={18} className="text-[#700000]" />
        ) : (
          <Shield size={18} className="text-blue-600" />
        )}
      </div>
      <div className="flex-1 min-w-0">
        <h2 className="text-sm font-bold text-slate-900 truncate">
          {snapshot?.title ?? 'Aksiyon'}
        </h2>
        <div className="flex items-center gap-2 mt-1 flex-wrap">
          <ActionStatusBadge status={action.status} />
          <AgingTierBadge
            tier={action.aging_tier}
            isBddbBreach={action.is_bddk_breach}
          />
          <span className="flex items-center gap-1 text-[10px] text-slate-500">
            <Clock3 size={10} />
            {format(new Date(action.current_due_date), 'd MMMM yyyy', { locale: tr })}
          </span>
        </div>
      </div>
    </div>
  );
}

function IronVault({ action }: { action: ActionAgingMetrics }) {
  const snapshot = action.finding_snapshot;
  return (
    <div className="px-6 py-5 bg-[#FDFBF7] border-b border-slate-200">
      <div className="flex items-center gap-2 mb-3">
        <FileText size={14} className="text-slate-500" />
        <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">
          Bulgu Kaydı — Değişmez Kayıt (Iron Vault)
        </span>
      </div>
      <div className="font-serif text-sm leading-relaxed text-slate-700 bg-white border border-slate-200 rounded-md p-5 shadow-sm space-y-2">
        <p className="font-bold text-slate-900 text-base not-italic">
          {snapshot?.title ?? 'Başlık Yok'}
        </p>
        {snapshot?.gias_category && (
          <p className="text-xs text-slate-500 not-italic font-sans">
            Kategori: {snapshot.gias_category}
          </p>
        )}
        <p className="text-slate-600 not-italic">
          {snapshot?.description ?? 'Bu aksiyon için kayıtlı bulgu açıklaması bulunmuyor.'}
        </p>
        <div className="flex items-center gap-3 pt-2 border-t border-slate-100 not-italic font-sans">
          <span className={clsx(
            'inline-flex px-2.5 py-0.5 rounded text-[11px] font-bold',
            snapshot?.severity === 'CRITICAL' ? 'bg-[#eb0000] text-white' :
            snapshot?.severity === 'HIGH' ? 'bg-[#ff960a] text-white' :
            snapshot?.severity === 'MEDIUM' ? 'bg-[#FFD700] text-black' :
            'bg-[#28a745] text-white',
          )}>
            {snapshot?.severity ?? 'N/A'}
          </span>
          {snapshot?.risk_rating && (
            <span className="text-xs text-slate-500">Risk: {snapshot.risk_rating}</span>
          )}
          {snapshot?.created_at && (
            <span className="text-xs text-slate-500 ml-auto">
              {format(new Date(snapshot.created_at), 'd MMM yyyy', { locale: tr })}
            </span>
          )}
        </div>
      </div>
    </div>
  );
}

function TabBar({
  tab,
  onChange,
  isBddk,
}: {
  tab: DetailTab;
  onChange: (t: DetailTab) => void;
  isBddk: boolean;
}) {
  return (
    <div className="flex border-b border-slate-200 bg-white">
      {(
        [
          { id: 'evidence' as DetailTab, label: 'Kanıt Yükle', icon: UploadCloud },
          { id: 'request'  as DetailTab, label: isBddk ? 'YK İstisnası' : 'Uzatma Talebi', icon: RefreshCw },
        ]
      ).map(({ id, label, icon: Icon }) => (
        <button
          key={id}
          onClick={() => onChange(id)}
          className={clsx(
            'flex items-center gap-1.5 px-5 py-3 text-xs font-bold border-b-2 transition-all',
            tab === id
              ? isBddk
                ? 'border-[#700000] text-[#700000]'
                : 'border-blue-600 text-blue-700'
              : 'border-transparent text-slate-500 hover:text-slate-700',
          )}
        >
          <Icon size={13} />
          {label}
        </button>
      ))}
    </div>
  );
}
