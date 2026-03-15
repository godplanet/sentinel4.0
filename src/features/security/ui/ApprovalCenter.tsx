import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { CheckCircle2, FileText, Loader2, ShieldAlert, User, XCircle } from 'lucide-react';
import { toast } from 'react-hot-toast';
import {
 fetchPendingApprovals,
 resolveApproval,
 type FourEyesApproval,
 type ResolveApprovalStatus,
} from '../api/four-eyes';

/** Payload'ı okunaklı metne dönüştürür (REPORT_GRADE vb.). */
function formatPayload(payload: unknown): string {
 if (payload === null || payload === undefined) {
 return '—';
 }
 if (typeof payload !== 'object') {
 return String(payload);
 }
 const obj = payload as Record<string, unknown>;
 const entries = Object.entries(obj).filter(([, v]) => v !== undefined && v !== null);
 if (entries.length === 0) return '—';
 const lines = (entries || []).map(([k, v]) => {
 const label = k.replace(/([A-Z])/g, ' $1').replace(/^./, (s) => s.toUpperCase()).trim();
 return `${label}: ${typeof v === 'object' ? JSON.stringify(v) : String(v)}`;
 });
 return lines.join(' · ');
}

/** maker_id için kısa gösterim (ileride profil servisi ile zenginleştirilebilir). */
function makerDisplayName(makerId: string): string {
 if (!makerId) return 'Bilinmeyen';
 return makerId.slice(0, 8) + '…';
}

export function ApprovalCenter() {
 const queryClient = useQueryClient();

 const { data: pending = [], isLoading } = useQuery({
 queryKey: ['four-eyes-pending'],
 queryFn: () => fetchPendingApprovals(),
 });

 const resolveMutation = useMutation<
 FourEyesApproval,
 Error,
 { id: string; status: ResolveApprovalStatus }
 >({
 mutationFn: ({ id, status }) => resolveApproval({ id, status }),
 onSuccess: (_, variables) => {
 void queryClient.invalidateQueries({ queryKey: ['four-eyes-pending'] });
 toast.success(
 variables.status === 'APPROVED'
 ? 'Talep onaylandı ve mühürlendi.'
 : 'Talep reddedildi.'
 );
 },
 onError: (err: Error) => {
 toast.error(err?.message ?? 'İşlem gerçekleştirilemedi.');
 },
 });

 const resolvingId =
 resolveMutation.isPending && resolveMutation.variables
 ? resolveMutation.variables.id
 : null;

 if (isLoading) {
 return (
 <div className="flex items-center justify-center min-h-[320px] rounded-2xl border border-slate-700/60 bg-slate-900/40 backdrop-blur-sm">
 <div className="flex flex-col items-center gap-3 text-slate-400">
 <Loader2 size={32} className="animate-spin text-slate-500" />
 <p className="text-sm font-medium">Bekleyen talepler yükleniyor...</p>
 </div>
 </div>
 );
 }

 if (pending.length === 0) {
 return (
 <div className="flex flex-col items-center justify-center min-h-[320px] rounded-2xl border border-slate-700/60 bg-slate-900/40 backdrop-blur-sm p-5">
 <div className="flex h-14 w-14 items-center justify-center rounded-xl bg-slate-800/80 border border-slate-600/60">
 <CheckCircle2 size={28} className="text-emerald-500/80" />
 </div>
 <p className="mt-4 text-base font-semibold text-slate-200">Bekleyen onay talebi yok</p>
 <p className="mt-1 text-sm text-slate-500">Kritik işlem talepleri burada listelenir.</p>
 </div>
 );
 }

 return (
 <div className="space-y-4">
 <div className="flex items-center gap-2 px-1">
 <ShieldAlert size={18} className="text-amber-500/90" />
 <span className="text-sm font-bold text-slate-300 uppercase tracking-wider">
 Bekleyen Kritik İşlem Onayları ({pending.length})
 </span>
 </div>

 <ul className="space-y-4">
 {(pending || []).map((item: FourEyesApproval) => (
 <li
 key={item.id}
 className="rounded-2xl border border-slate-700/70 bg-slate-900/60 backdrop-blur-sm overflow-hidden shadow-xl shadow-black/20"
 >
 <div className="flex flex-col sm:flex-row sm:items-stretch gap-0">
 <div className="flex-1 p-5 space-y-3">
 <div className="flex flex-wrap items-center gap-2">
 <span className="inline-flex items-center gap-1.5 rounded-lg bg-amber-500/15 border border-amber-500/30 px-2.5 py-1 text-xs font-bold text-amber-200 uppercase tracking-wide">
 <FileText size={12} />
 {item.action_name}
 </span>
 <span className="rounded-md bg-slate-800/80 px-2 py-0.5 text-[11px] font-mono text-slate-400">
 {item.resource_type} · {item.resource_id}
 </span>
 </div>
 <div className="flex items-center gap-2 text-sm text-slate-400">
 <User size={14} className="text-slate-500 shrink-0" />
 <span>Talep eden:</span>
 <span className="font-medium text-slate-300">{makerDisplayName(item.maker_id)}</span>
 </div>
 <div className="rounded-xl border border-slate-700/60 bg-slate-950/50 px-3 py-2.5">
 <p className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider mb-1">
 Detay (Payload)
 </p>
 <p className="text-xs text-slate-300 font-mono leading-relaxed break-words">
 {formatPayload(item.payload)}
 </p>
 </div>
 </div>
 <div className="flex sm:flex-col gap-2 sm:gap-0 p-4 sm:p-4 sm:min-w-[140px] border-t sm:border-t-0 sm:border-l border-slate-700/60 bg-slate-800/30">
 <button
 type="button"
 onClick={() => resolveMutation.mutate({ id: item.id, status: 'APPROVED' })}
 disabled={resolveMutation.isPending}
 className="flex-1 sm:flex-none flex items-center justify-center gap-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 disabled:opacity-60 disabled:cursor-not-allowed px-4 py-3 text-sm font-bold text-emerald-950 shadow-lg shadow-emerald-500/25 transition-colors"
 >
 {resolvingId === item.id ? (
 <Loader2 size={18} className="animate-spin" />
 ) : (
 <CheckCircle2 size={18} />
 )}
 Mühürle / Onayla
 </button>
 <button
 type="button"
 onClick={() => resolveMutation.mutate({ id: item.id, status: 'REJECTED' })}
 disabled={resolveMutation.isPending}
 className="flex-1 sm:flex-none flex items-center justify-center gap-2 rounded-xl bg-red-600/90 hover:bg-red-500 disabled:opacity-60 disabled:cursor-not-allowed px-4 py-3 text-sm font-bold text-red-50 shadow-lg shadow-red-500/20 transition-colors"
 >
 <XCircle size={18} />
 Reddet
 </button>
 </div>
 </div>
 </li>
 ))}
 </ul>
 </div>
 );
}
