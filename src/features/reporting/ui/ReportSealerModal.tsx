/**
 * Nihai Rapor Mühürleme — 4 Göz onayı ile raporu kilitleme.
 * Cyber-Forensic tema; mock yok, gerçek Supabase reports tablosu güncellenir.
 */

import { useSealReport } from '@/features/reporting/api/seal-api';
import { FourEyesGate } from '@/features/security/ui/FourEyesGate';
import { AlertTriangle, Lock, X } from 'lucide-react';
import React, { useCallback } from 'react';
import { toast } from 'react-hot-toast';

export interface ReportSealerModalProps {
 reportId: string;
 reportTitle?: string;
 onSealed?: () => void;
 onClose: () => void;
}

export const ReportSealerModal: React.FC<ReportSealerModalProps> = ({
 reportId,
 reportTitle,
 onSealed,
 onClose,
}) => {
 const sealMutation = useSealReport(reportId, {
 onSuccess: () => {
 toast.success('Rapor mühürlendi ve kilitlendi.');
 onSealed?.();
 onClose();
 },
 onError: (err) => {
 toast.error(err.message ?? 'Mühürleme başarısız.');
 },
 });

 const handleSealReport = useCallback(() => {
 sealMutation.mutate();
 }, [sealMutation]);

 return (
 <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 backdrop-blur-sm p-4">
 <div className="w-full max-w-lg rounded-2xl border border-slate-700/60 bg-slate-900 shadow-2xl overflow-hidden">
 <div className="px-4 pt-4 pb-4 border-b border-slate-700/60">
 <div className="flex items-start justify-between gap-4">
 <div className="flex items-start gap-3">
 <div className="w-12 h-12 rounded-xl bg-amber-500/20 border border-amber-500/40 flex items-center justify-center shrink-0">
 <Lock className="w-6 h-6 text-amber-400" />
 </div>
 <div>
 <h2 className="text-lg font-semibold text-slate-100">
 Nihai Rapor Mühürleme
 </h2>
 <p className="text-xs text-slate-400 mt-0.5 font-mono">
 WORM · Adli kanıt kilidi
 </p>
 </div>
 </div>
 <button
 type="button"
 onClick={onClose}
 className="p-2 rounded-lg text-slate-400 hover:text-slate-200 hover:bg-slate-800 transition-colors"
 aria-label="Kapat"
 >
 <X size={18} />
 </button>
 </div>
 </div>

 <div className="p-4 space-y-5">
 <div className="flex items-start gap-3 p-4 rounded-xl bg-red-950/40 border border-red-800/50">
 <AlertTriangle className="w-5 h-5 text-red-400 shrink-0 mt-0.5" />
 <p className="text-sm text-red-200 leading-relaxed">
 Bu işlem geri alınamaz. Rapor adli bir kanıt olarak kilitlenecektir.
 </p>
 </div>

 {reportTitle && (
 <div className="rounded-xl border border-slate-700/60 bg-slate-800/50 px-4 py-3">
 <p className="text-xs text-slate-500 uppercase tracking-wider mb-1">Rapor</p>
 <p className="text-sm font-medium text-slate-200 truncate">{reportTitle}</p>
 </div>
 )}

 <FourEyesGate
 isCritical={true}
 resourceType="REPORT_SEAL"
 resourceId={reportId}
 actionName="Final Report Sealing"
 payload={{ reportId, reportTitle: reportTitle ?? null }}
 onExecute={handleSealReport}
 children={({ onClick, loading }) => (
 <button
 type="button"
 onClick={onClick}
 disabled={loading || sealMutation.isPending}
 className="w-full flex items-center justify-center gap-2.5 px-5 py-3.5 rounded-xl text-sm font-semibold transition-all
 bg-amber-500 hover:bg-amber-400 text-amber-950 shadow-lg shadow-amber-500/20
 disabled:opacity-60 disabled:cursor-not-allowed"
 >
 <Lock size={18} />
 Raporu Mühürle
 </button>
 )}
 />
 </div>
 </div>
 </div>
 );
};
