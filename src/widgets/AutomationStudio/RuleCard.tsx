import {
  useToggleRule,
  useDeleteRule,
  TRIGGER_EVENTS,
  type AutomationRule,
} from '@/features/automation';
import {
  Zap, Clock, AlertTriangle, Play, CheckCircle, RefreshCw,
  FileCheck, AlertCircle as AlertCircleIcon, Building2,
  TrendingUp, Trash2, ChevronRight,
} from 'lucide-react';
import clsx from 'clsx';

const TRIGGER_ICONS: Record<string, React.ElementType> = {
  FINDING_CREATED: AlertTriangle,
  RISK_CHANGED: TrendingUp,
  DUE_DATE_PASSED: Clock,
  AUDIT_STARTED: Play,
  ASSESSMENT_COMPLETED: CheckCircle,
  STATUS_CHANGED: RefreshCw,
  WORKPAPER_SIGNED: FileCheck,
  ACTION_OVERDUE: AlertCircleIcon,
  VENDOR_REVIEW_DUE: Building2,
};

const TRIGGER_COLORS: Record<string, string> = {
  FINDING_CREATED: 'bg-red-100 text-red-600',
  RISK_CHANGED: 'bg-amber-100 text-amber-600',
  DUE_DATE_PASSED: 'bg-orange-100 text-orange-600',
  AUDIT_STARTED: 'bg-blue-100 text-blue-600',
  ASSESSMENT_COMPLETED: 'bg-emerald-100 text-emerald-600',
  STATUS_CHANGED: 'bg-cyan-100 text-cyan-600',
  WORKPAPER_SIGNED: 'bg-teal-100 text-teal-600',
  ACTION_OVERDUE: 'bg-rose-100 text-rose-600',
  VENDOR_REVIEW_DUE: 'bg-slate-100 text-slate-600',
};

interface Props {
  rule: AutomationRule;
  onSelect: () => void;
}

export const RuleCard = ({ rule, onSelect }: Props) => {
  const toggle = useToggleRule();
  const deleteRule = useDeleteRule();
  const Icon = TRIGGER_ICONS[rule.trigger_event] || Zap;
  const triggerLabel = TRIGGER_EVENTS.find((t) => t.value === rule.trigger_event)?.label || rule.trigger_event;
  const colorClass = TRIGGER_COLORS[rule.trigger_event] || 'bg-slate-100 text-slate-600';

  const timeAgo = rule.last_triggered_at ? getTimeAgo(rule.last_triggered_at) : 'Henuz calismadi';

  const actionCount = Array.isArray(rule.actions) ? rule.actions.length : 0;
  const conditionCount = Object.keys(rule.conditions || {}).filter((k) => k !== 'operator').length;

  return (
    <div className={clsx(
      'group relative rounded-xl border transition-all duration-200',
      'hover:shadow-md hover:-translate-y-0.5',
      rule.is_active
        ? 'bg-white border-slate-200/80 shadow-sm'
        : 'bg-slate-50/50 border-dashed border-slate-200',
    )}>
      <div className="p-5">
        <div className="flex items-start justify-between mb-3">
          <div className="flex items-center gap-3">
            <div className={clsx('w-10 h-10 rounded-lg flex items-center justify-center', colorClass)}>
              <Icon size={18} />
            </div>
            <div>
              <h3 className={clsx('text-sm font-bold', rule.is_active ? 'text-slate-800' : 'text-slate-500')}>
                {rule.title}
              </h3>
              <span className="text-[10px] font-medium text-slate-400">{triggerLabel}</span>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={(e) => { e.stopPropagation(); toggle.mutate({ id: rule.id, is_active: !rule.is_active }); }}
              className={clsx(
                'relative w-11 h-6 rounded-full transition-all duration-200 flex-shrink-0',
                rule.is_active ? 'bg-emerald-500' : 'bg-slate-300',
              )}
            >
              <span className={clsx(
                'absolute top-0.5 w-5 h-5 rounded-full bg-white shadow transition-transform duration-200',
                rule.is_active ? 'translate-x-[22px]' : 'translate-x-0.5',
              )} />
            </button>
          </div>
        </div>

        {rule.description && (
          <p className="text-xs text-slate-500 mb-3 line-clamp-2">{rule.description}</p>
        )}

        <div className="flex items-center gap-2 mb-3">
          <span className="text-[10px] font-bold text-blue-600 bg-blue-50 px-2 py-0.5 rounded">
            {conditionCount} Kosul
          </span>
          <span className="text-[10px] font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded">
            {actionCount} Aksiyon
          </span>
          <span className="text-[10px] font-bold text-slate-500 bg-slate-100 px-2 py-0.5 rounded">
            Oncelik: {rule.priority}
          </span>
        </div>

        <div className="flex items-center justify-between pt-3 border-t border-slate-100">
          <div className="flex items-center gap-4 text-[10px] text-slate-400">
            <span className="flex items-center gap-1">
              <Zap size={10} />
              {rule.execution_count} calistirma
            </span>
            <span className="flex items-center gap-1">
              <Clock size={10} />
              {timeAgo}
            </span>
          </div>

          <div className="flex items-center gap-1">
            <button
              onClick={(e) => { e.stopPropagation(); if (confirm('Bu kurali silmek istediginize emin misiniz?')) deleteRule.mutate(rule.id); }}
              className="p-1.5 rounded-md text-slate-300 hover:text-red-500 hover:bg-red-50 transition-colors opacity-0 group-hover:opacity-100"
            >
              <Trash2 size={13} />
            </button>
            <button
              onClick={onSelect}
              className="flex items-center gap-1 px-2 py-1 rounded-md text-xs font-medium text-slate-500 hover:text-slate-700 hover:bg-slate-100 transition-colors"
            >
              Detay <ChevronRight size={12} />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

function getTimeAgo(dateStr: string): string {
  const diff = Date.now() - new Date(dateStr).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return 'Az once';
  if (mins < 60) return `${mins} dk once`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs} saat once`;
  const days = Math.floor(hrs / 24);
  return `${days} gun once`;
}
