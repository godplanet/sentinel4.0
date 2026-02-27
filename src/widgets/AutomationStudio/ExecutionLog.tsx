import { useAutomationLogs } from '@/features/automation';
import {
  CheckCircle, XCircle, AlertTriangle, FlaskConical, Loader2, Clock,
} from 'lucide-react';
import clsx from 'clsx';

const STATUS_CFG: Record<string, { icon: React.ElementType; bg: string; text: string }> = {
  Success: { icon: CheckCircle, bg: 'bg-emerald-50', text: 'text-emerald-700' },
  Failed: { icon: XCircle, bg: 'bg-red-50', text: 'text-red-700' },
  Skipped: { icon: AlertTriangle, bg: 'bg-amber-50', text: 'text-amber-700' },
  Simulated: { icon: FlaskConical, bg: 'bg-blue-50', text: 'text-blue-700' },
};

export const ExecutionLog = () => {
  const { data: logs, isLoading } = useAutomationLogs();

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-48">
        <Loader2 className="w-5 h-5 animate-spin text-slate-400" />
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl border border-slate-200/80 shadow-sm overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full text-left">
          <thead>
            <tr className="border-b border-slate-100 bg-slate-50/50">
              <th className="px-4 py-3 text-[10px] font-bold text-slate-500 uppercase tracking-wider">Durum</th>
              <th className="px-4 py-3 text-[10px] font-bold text-slate-500 uppercase tracking-wider">Kural</th>
              <th className="px-4 py-3 text-[10px] font-bold text-slate-500 uppercase tracking-wider">Tetikleyici</th>
              <th className="px-4 py-3 text-[10px] font-bold text-slate-500 uppercase tracking-wider">Sonuc</th>
              <th className="px-4 py-3 text-[10px] font-bold text-slate-500 uppercase tracking-wider">Sure</th>
              <th className="px-4 py-3 text-[10px] font-bold text-slate-500 uppercase tracking-wider">Zaman</th>
            </tr>
          </thead>
          <tbody>
            {(logs || []).map((log) => {
              const cfg = STATUS_CFG[log.status] || STATUS_CFG.Success;
              const Icon = cfg.icon;
              return (
                <tr key={log.id} className="border-b border-slate-50 hover:bg-slate-50/50 transition-colors">
                  <td className="px-4 py-3">
                    <span className={clsx('inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded', cfg.bg, cfg.text)}>
                      <Icon size={10} />
                      {log.status}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <span className="text-xs font-semibold text-slate-700">{log.rule_title || '-'}</span>
                    {log.is_simulation && (
                      <span className="ml-1.5 text-[9px] font-bold text-blue-500 bg-blue-50 px-1.5 py-0.5 rounded">SIM</span>
                    )}
                  </td>
                  <td className="px-4 py-3 text-[10px] text-slate-500 font-medium">{log.trigger_event}</td>
                  <td className="px-4 py-3 text-xs text-slate-600 max-w-xs truncate">{log.action_result}</td>
                  <td className="px-4 py-3">
                    <span className="flex items-center gap-1 text-[10px] text-slate-400">
                      <Clock size={10} />
                      {log.duration_ms}ms
                    </span>
                  </td>
                  <td className="px-4 py-3 text-[10px] text-slate-400">
                    {new Date(log.executed_at).toLocaleString('tr-TR', { day: '2-digit', month: '2-digit', hour: '2-digit', minute: '2-digit' })}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {!logs?.length && (
        <div className="py-12 text-center text-sm text-slate-400">
          Henuz calistirma kaydi bulunmuyor
        </div>
      )}
    </div>
  );
};
