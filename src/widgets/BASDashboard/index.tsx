import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Crosshair, ShieldAlert, XCircle, AlertTriangle, Terminal, ChevronRight } from 'lucide-react';
import clsx from 'clsx';
import {
  useCampaigns, useAttackLogs, useUpdateCampaignStatus,
  type RedTeamCampaign, type BasAttackLog
} from '@/features/red-team/api';

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------
function getSeverityColor(sev: string) {
  switch (sev) {
    case 'CRITICAL': return 'bg-red-100 text-red-700 border-red-200';
    case 'HIGH':     return 'bg-orange-100 text-orange-700 border-orange-200';
    case 'MEDIUM':   return 'bg-amber-100 text-amber-700 border-amber-200';
    default:         return 'bg-emerald-100 text-emerald-700 border-emerald-200';
  }
}

function getStatusBadge(status: string) {
  const map: Record<string, string> = {
    PLANNED: 'bg-slate-100 text-slate-600',
    ACTIVE: 'bg-blue-100 text-blue-700 border-blue-200 animate-pulse',
    PAUSED: 'bg-amber-100 text-amber-700',
    COMPLETED: 'bg-emerald-100 text-emerald-700',
    CANCELED: 'bg-slate-100 text-slate-400 line-through',
  };
  return <span className={clsx('text-[10px] font-bold px-2 py-0.5 rounded border uppercase', map[status])}>{status}</span>;
}

function getAttackIcon(status: string) {
  switch (status) {
    case 'SUCCESS':   return <AlertTriangle size={14} className="text-red-500 shrink-0" />;
    case 'BLOCKED':   return <ShieldAlert size={14} className="text-emerald-500 shrink-0" />;
    case 'DETECTED':  return <Crosshair size={14} className="text-orange-500 shrink-0" />;
    case 'IGNORED':   return <XCircle size={14} className="text-slate-400 shrink-0" />;
    default:          return <Terminal size={14} className="text-blue-400 shrink-0" />;
  }
}

// ---------------------------------------------------------------------------
// Attack Log Row
// ---------------------------------------------------------------------------
function AttackLogItem({ log }: { log: BasAttackLog }) {
  return (
    <div className={clsx(
      'flex items-center gap-3 p-2 rounded-lg border text-sm',
      log.status === 'SUCCESS' ? 'border-red-200 bg-red-50/50' :
      log.status === 'BLOCKED' ? 'border-emerald-200 bg-emerald-50/50' :
      'border-slate-100 bg-white'
    )}>
      {getAttackIcon(log.status)}
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <span className="font-mono text-xs text-slate-700">{log.attack_vector}</span>
          <span className={clsx('text-[10px] px-1.5 py-0.5 rounded-full font-bold',
            log.status === 'SUCCESS' ? 'bg-red-100 text-red-600' :
            log.status === 'BLOCKED' ? 'bg-emerald-100 text-emerald-600' : 'bg-slate-100 text-slate-500'
          )}>
            {log.status}
          </span>
        </div>
        <p className="text-[10px] text-slate-500 font-mono mt-0.5 mt-1 border-t border-slate-100 pt-1">
          {log.target_asset}
          {log.mitre_technique && <span className="ml-2 text-indigo-500">{log.mitre_tactic} ({log.mitre_technique})</span>}
        </p>
      </div>
      <span className="text-[10px] text-slate-400 whitespace-nowrap">
        {new Date(log.timestamp).toLocaleTimeString('tr-TR')}
      </span>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Campaign Card
// ---------------------------------------------------------------------------
function CampaignCard({ campaign }: { campaign: RedTeamCampaign }) {
  const [expanded, setExpanded] = useState(campaign.status === 'ACTIVE');
  const { data: logs = [] } = useAttackLogs(expanded ? campaign.id : undefined);
  const { mutate: updateStatus } = useUpdateCampaignStatus();

  const successLogs = logs.filter(l => l.status === 'SUCCESS').length;
  const blockedLogs = logs.filter(l => l.status === 'BLOCKED').length;

  return (
    <div className={clsx(
      'border rounded-xl overflow-hidden shadow-sm transition-colors',
      campaign.status === 'ACTIVE' ? 'border-blue-200 bg-blue-50/20' : 'border-slate-200 bg-white'
    )}>
      <div className="p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="flex items-start gap-3 flex-1">
          <div className="p-2 bg-slate-100 rounded-lg text-slate-600">
            <Crosshair size={20} className={campaign.status === 'ACTIVE' ? 'text-blue-600' : 'text-slate-500'} />
          </div>
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className={clsx('text-[10px] font-bold px-2 py-0.5 rounded border uppercase', getSeverityColor(campaign.severity))}>
                {campaign.severity}
              </span>
              {getStatusBadge(campaign.status)}
              <span className="text-[10px] bg-indigo-50 text-indigo-700 border border-indigo-100 px-2 py-0.5 rounded font-bold">
                {campaign.campaign_type}
              </span>
              <span className="text-[10px] font-mono text-slate-400">{campaign.campaign_code}</span>
            </div>
            <h3 className="font-bold text-slate-800 text-sm">{campaign.title}</h3>
            {campaign.description && <p className="text-xs text-slate-500 mt-0.5 line-clamp-1">{campaign.description}</p>}
          </div>
        </div>

        <div className="flex items-center gap-4 shrink-0">
          {(campaign.success_rate !== null) && (
            <div className="text-right">
              <div className="text-[10px] text-slate-500 uppercase font-bold">Başarı/Taviz Oranı</div>
              <div className="text-lg font-black text-red-600">%{campaign.success_rate}</div>
            </div>
          )}
          <button onClick={() => setExpanded(e => !e)} className="p-1 hover:bg-slate-100 rounded text-slate-400 hover:text-slate-700 transition">
            <ChevronRight size={20} className={clsx('transition-transform', expanded && 'rotate-90')} />
          </button>
        </div>
      </div>

      <AnimatePresence>
        {expanded && (
          <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} className="overflow-hidden">
            <div className="border-t border-slate-100 bg-slate-50/50 p-4">
              <div className="flex items-center justify-between mb-3 text-xs">
                <div className="flex items-center gap-3 font-semibold text-slate-600">
                  <Terminal size={14} /> Saldırı / Sömürü Logları ({logs.length})
                  <div className="flex gap-2 font-normal text-[10px]">
                    <span className="text-red-600">{successLogs} İhlal</span>
                    <span className="text-emerald-600">{blockedLogs} Engellenen</span>
                  </div>
                </div>
                {campaign.status === 'ACTIVE' && (
                  <button 
                    onClick={() => updateStatus({ campaignId: campaign.id, status: 'COMPLETED' })}
                    className="px-2 py-1 bg-slate-800 text-white rounded text-[10px] font-bold hover:bg-slate-700 transition"
                  >
                    Kampanyayı Sonlandır
                  </button>
                )}
              </div>
              
              <div className="space-y-1.5 max-h-64 overflow-y-auto pr-2 custom-scrollbar">
                {logs.length === 0 ? (
                  <p className="text-xs text-slate-400 py-4 text-center">Henüz BAS/Oltalama logu kaydedilmedi.</p>
                ) : (
                  logs.map(log => <AttackLogItem key={log.id} log={log} />)
                )}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

// ---------------------------------------------------------------------------
// MAIN: BAS Dashboard Widget
// ---------------------------------------------------------------------------
export function BASDashboard() {
  const { data: campaigns = [], isLoading } = useCampaigns();

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-slate-400" />
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {campaigns.length === 0 ? (
        <div className="text-center py-12 border border-dashed border-slate-300 rounded-xl bg-slate-50">
          <Crosshair size={32} className="mx-auto text-slate-400 mb-2" />
          <h3 className="font-bold text-slate-600">Aktif Red Team Kampanyası Yok</h3>
          <p className="text-sm text-slate-500">BAS veya Phishing operasyonu başlatıldığında burada görünür.</p>
        </div>
      ) : (
        campaigns.map(c => <CampaignCard key={c.id} campaign={c} />)
      )}
    </div>
  );
}
