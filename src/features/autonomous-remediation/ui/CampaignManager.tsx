import { usePersonaStore } from '@/entities/user/model/persona-store';
import { AnimatePresence, motion } from 'framer-motion';
import { AlertCircle, CheckCircle2, Clock, Loader2, RefreshCw, Target, Upload } from 'lucide-react';
import React, { useState } from 'react';
import toast from 'react-hot-toast';
import { useAutoFixLogs, useCampaigns, useLaunchCampaign, type CampaignRow } from '../api/campaigns-api';

const TENANT_ID = '11111111-1111-1111-1111-111111111111';

const FIX_TYPE_BY_KEYWORD: Record<string, string> = {
 'şifre': 'password_policy',
 'firewall': 'firewall_rule',
 'erişim': 'access_revoke',
 'kvkk': 'data_masking',
 'maskeleme': 'data_masking',
 'api': 'access_revoke',
};

function inferFixType(title: string): string {
 const lower = title.toLowerCase();
 for (const [keyword, type] of Object.entries(FIX_TYPE_BY_KEYWORD)) {
 if (lower.includes(keyword)) return type;
 }
 return 'custom';
}

function inferTargetSystem(rootCause: string): string {
 if (!rootCause) return 'Hedef Sistem';
 if (rootCause.toLowerCase().includes('iam') || rootCause.toLowerCase().includes('ldap')) return 'IAM / Active Directory';
 if (rootCause.toLowerCase().includes('firewall') || rootCause.toLowerCase().includes('ağ')) return 'Network / Firewall';
 if (rootCause.toLowerCase().includes('api')) return 'API Gateway';
 return 'Core Banking System';
}

function AutoFixLogBadge({ campaignId }: { campaignId: string }) {
 const { data: logs = [] } = useAutoFixLogs(campaignId);
 const latestLog = (logs ?? [])[0];

 if (!latestLog) return null;

 const statusConfig = {
 running: { color: 'text-blue-600 bg-blue-50 border-blue-200', label: 'Çalışıyor', Icon: Loader2, spin: true },
 success: { color: 'text-emerald-700 bg-emerald-50 border-emerald-200', label: 'Tamamlandı', Icon: CheckCircle2, spin: false },
 failed: { color: 'text-rose-700 bg-rose-50 border-rose-200', label: 'Hata', Icon: AlertCircle, spin: false },
 pending: { color: 'text-amber-700 bg-amber-50 border-amber-200', label: 'Bekliyor', Icon: Clock, spin: false },
 reverted: { color: 'text-slate-600 bg-slate-50 border-slate-200', label: 'Geri Alındı', Icon: RefreshCw, spin: false },
 }[latestLog.status] ?? { color: 'text-slate-600 bg-slate-50 border-slate-200', label: latestLog.status, Icon: Clock, spin: false };

 const { color, label, Icon, spin } = statusConfig;

 return (
 <div className={`inline-flex items-center gap-1.5 px-2 py-1 rounded-lg border text-[10px] font-semibold ${color}`}>
 <Icon size={10} className={spin ? 'animate-spin' : ''} />
 Oto-Onarım: {label}
 </div>
 );
}

export const CampaignManager: React.FC = () => {
 const { data: campaigns = [], isLoading } = useCampaigns();
 const launchCampaign = useLaunchCampaign();
 const getCurrentPersonaConfig = usePersonaStore((s) => s.getCurrentPersonaConfig);
 const personaConfig = getCurrentPersonaConfig();
 const initiatedBy = personaConfig?.name ?? 'sentinel-system';

 const [executing, setExecuting] = useState<string | null>(null);

 const handleMassExecute = async (row: CampaignRow) => {
 const campaignId = row.campaign.id;
 if (executing || launchCampaign.isPending) return;

 setExecuting(campaignId);

 try {
 await launchCampaign.mutateAsync({
 campaignId,
 tenantId: TENANT_ID,
 initiatedBy,
 fixType: inferFixType(row.campaign.title ?? ''),
 targetSystem: inferTargetSystem(row.campaign.root_cause ?? ''),
 });

 toast.success('Merkezi kanıt teslim edildi — bağlı tüm aksiyonlar güncellendi.', { duration: 4500 });
 } catch (err) {
 const msg = err instanceof Error ? err.message : 'Kampanya başlatılamadı';
 toast.error(msg);
 } finally {
 setExecuting(null);
 }
 };

 return (
 <div className="bg-surface/70 backdrop-blur-md border border-slate-200 shadow-sm rounded-2xl overflow-hidden h-full">
 <div className="px-6 pt-6 pb-4 border-b border-slate-100">
 <div className="flex items-center gap-3">
 <div className="w-9 h-9 rounded-xl bg-canvas border border-slate-200 flex items-center justify-center">
 <Target size={16} className="text-slate-700" />
 </div>
 <div>
 <h3 className="font-sans text-sm font-semibold text-primary">Master Action Campaigns</h3>
 <p className="text-xs text-slate-500 mt-0.5">
 {isLoading ? 'Yükleniyor...' : `${(campaigns ?? []).length} program`}
 </p>
 </div>
 </div>
 </div>

 <div className="divide-y divide-slate-100">
 {isLoading ? (
 <div className="px-6 py-5 flex items-center justify-center">
 <Loader2 size={20} className="animate-spin text-slate-400" />
 </div>
 ) : (campaigns ?? []).length === 0 ? (
 <div className="px-6 py-5 text-center text-sm text-slate-400">
 Henüz kampanya bulunmuyor.
 </div>
 ) : (
 (campaigns ?? []).map((row) => {
 const isExec = executing === row.campaign.id || (launchCampaign.isPending && launchCampaign.variables?.campaignId === row.campaign.id);
 const pct = row.totalActions > 0
 ? Math.round((row.closedActions / row.totalActions) * 100)
 : 0;
 const isDone = pct === 100;

 return (
 <div key={row.campaign.id} className="px-6 py-5 space-y-3">
 <div>
 <p className="text-sm font-semibold text-primary font-sans">{row.campaign.title}</p>
 <p className="text-xs text-slate-500 font-serif italic leading-relaxed mt-1 line-clamp-2">
 {row.campaign.root_cause}
 </p>
 </div>

 {/* Progress bar */}
 <div className="space-y-1.5">
 <div className="flex items-center justify-between text-xs text-slate-500 font-sans">
 <span>{row.closedActions} / {row.totalActions} actions closed</span>
 <span className="font-medium text-slate-700">{pct}%</span>
 </div>
 <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
 <motion.div
 initial={{ width: 0 }}
 animate={{ width: `${pct}%` }}
 transition={{ duration: 0.8, ease: 'easeOut' }}
 className={`h-full rounded-full transition-colors ${
 pct === 100 ? 'bg-emerald-500' : pct > 50 ? 'bg-amber-400' : 'bg-slate-400'
 }`}
 />
 </div>
 </div>

 {/* Auto fix log badge */}
 {row.campaign.status === 'active' && (
 <AutoFixLogBadge campaignId={row.campaign.id} />
 )}

 {/* Action button */}
 <AnimatePresence mode="wait">
 {isDone ? (
 <motion.div
 key="done"
 initial={{ opacity: 0, y: 4 }}
 animate={{ opacity: 1, y: 0 }}
 className="flex items-center gap-2 text-xs text-emerald-700 font-sans font-medium"
 >
 <CheckCircle2 size={14} />
 Tüm {row.totalActions} aksiyon evidence_submitted olarak güncellendi
 </motion.div>
 ) : (
 <motion.button
 key="btn"
 onClick={() => handleMassExecute(row)}
 disabled={!!executing || launchCampaign.isPending}
 whileTap={{ scale: 0.97 }}
 className="flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-medium font-sans transition-all
 bg-surface/70 backdrop-blur-md border border-slate-300 text-slate-700
 hover:bg-canvas hover:shadow-md disabled:opacity-60 disabled:cursor-not-allowed shadow-sm"
 >
 {isExec ? (
 <>
 <Loader2 size={13} className="animate-spin text-slate-500" />
 Submitting central evidence...
 </>
 ) : (
 <>
 <Upload size={13} />
 Submit Central Evidence
 </>
 )}
 </motion.button>
 )}
 </AnimatePresence>
 </div>
 );
 })
 )}
 </div>
 </div>
 );
};
