import { useMemo } from 'react';
import {
  useAutomationRules,
  useAutomationLogs,
  type AutomationRule,
} from '@/features/automation';
import { RuleCard } from './RuleCard';
import {
  Zap, Activity, CheckCircle, AlertTriangle, Clock, Loader2, AlertCircle,
} from 'lucide-react';

interface Props {
  onSelectRule: (rule: AutomationRule) => void;
}

export const RuleList = ({ onSelectRule }: Props) => {
  const { data: rules, isLoading, error } = useAutomationRules();
  const { data: logs } = useAutomationLogs();

  const stats = useMemo(() => {
    if (!rules || !logs) return { active: 0, total: 0, totalExec: 0, successRate: 0, lastRun: null as string | null };
    const active = rules.filter((r) => r.is_active).length;
    const totalExec = rules.reduce((s, r) => s + r.execution_count, 0);
    const realLogs = logs.filter((l) => !l.is_simulation);
    const successCount = realLogs.filter((l) => l.status === 'Success').length;
    const successRate = realLogs.length > 0 ? Math.round((successCount / realLogs.length) * 100) : 100;
    const mostRecent = rules.reduce((latest, r) => {
      if (!r.last_triggered_at) return latest;
      return !latest || new Date(r.last_triggered_at) > new Date(latest) ? r.last_triggered_at : latest;
    }, null as string | null);
    return { active, total: rules.length, totalExec, successRate, lastRun: mostRecent };
  }, [rules, logs]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-48">
        <Loader2 className="w-5 h-5 animate-spin text-slate-400" />
        <span className="ml-2 text-sm text-slate-500">Kurallar yukleniyor...</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-48 text-red-500">
        <AlertCircle className="w-5 h-5 mr-2" />
        <span className="text-sm">Yuklenirken hata olustu</span>
      </div>
    );
  }

  const lastRunText = stats.lastRun ? getTimeAgo(stats.lastRun) : '-';

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard icon={Zap} label="Aktif Kurallar" value={`${stats.active}/${stats.total}`} color="bg-emerald-600" />
        <StatCard icon={Activity} label="Toplam Calistirma" value={stats.totalExec.toString()} color="bg-blue-600" />
        <StatCard icon={CheckCircle} label="Basari Orani" value={`%${stats.successRate}`} color="bg-teal-600" />
        <StatCard icon={Clock} label="Son Calistirma" value={lastRunText} color="bg-slate-600" />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {(rules || []).map((rule) => (
          <RuleCard key={rule.id} rule={rule} onSelect={() => onSelectRule(rule)} />
        ))}
      </div>

      {!rules?.length && (
        <div className="bg-white rounded-xl border border-dashed border-slate-200 p-12 text-center">
          <AlertTriangle className="w-8 h-8 mx-auto mb-3 text-slate-300" />
          <p className="text-sm text-slate-500">Henuz otomasyon kurali tanimlanmamis</p>
        </div>
      )}
    </div>
  );
};

function StatCard({ icon: Icon, label, value, color }: { icon: React.ElementType; label: string; value: string; color: string }) {
  return (
    <div className="bg-white rounded-xl border border-slate-200/80 p-4 shadow-sm flex items-center gap-3">
      <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${color} shadow-sm`}>
        <Icon size={18} className="text-white" />
      </div>
      <div>
        <div className="text-lg font-black text-slate-800">{value}</div>
        <div className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider">{label}</div>
      </div>
    </div>
  );
}

function getTimeAgo(dateStr: string): string {
  const diff = Date.now() - new Date(dateStr).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return 'Az once';
  if (mins < 60) return `${mins} dk once`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs} sa once`;
  return `${Math.floor(hrs / 24)} gun once`;
}
