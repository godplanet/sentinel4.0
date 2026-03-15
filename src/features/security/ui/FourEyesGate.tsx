import { useMutation } from '@tanstack/react-query';
import { CheckCircle2, Loader2, ShieldAlert, XCircle } from 'lucide-react';
import { ReactNode, useState } from 'react';
import { toast } from 'react-hot-toast';
import { createFourEyesApproval, CreateFourEyesApprovalInput } from '../api/four-eyes';

interface FourEyesGateProps extends CreateFourEyesApprovalInput {
 isCritical: boolean;
 /** Gerçek işlemi gerçekleştirecek handler (kritik değilse direkt, kritikse onaydan sonra tetiklenecek). */
 onExecute?: () => void | Promise<void>;
 /** Sarmalayacağımız tetikleyici; genelde bir buton. */
 children: (args: { onClick: () => void; loading: boolean }) => ReactNode;
}

export const FourEyesGate = ({
 isCritical,
 resourceType,
 resourceId,
 actionName,
 payload,
 onExecute,
 children,
}: FourEyesGateProps) => {
 const [isModalOpen, setIsModalOpen] = useState(false);

 const { mutateAsync, isLoading } = useMutation({
 mutationFn: () =>
 createFourEyesApproval({
 resourceType,
 resourceId,
 actionName,
 payload,
 }),
 });

 const handlePrimaryClick = () => {
 if (!isCritical) {
 void Promise.resolve(onExecute?.());
 return;
 }

 setIsModalOpen(true);
 };

 const handleSendForApproval = async () => {
 try {
 await mutateAsync();
 toast.success('İşlem 4 Göz onayına gönderildi.');
 setIsModalOpen(false);
 await onExecute?.();
 } catch (error) {
 // eslint-disable-next-line no-console
 console.error('Four-eyes approval failed', error);
 toast.error('Onaya gönderilirken bir hata oluştu.');
 }
 };

 return (
 <>
 {children({ onClick: handlePrimaryClick, loading: isLoading })}

 {isModalOpen && (
 <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm">
 <div className="relative w-full max-w-lg rounded-2xl bg-surface border border-slate-700/60 shadow-2xl shadow-black/50 p-4">
 <div className="flex items-start gap-4">
 <div className="mt-1 flex h-11 w-11 items-center justify-center rounded-xl bg-gradient-to-br from-rose-500 to-amber-500 shadow-lg shadow-rose-500/40">
 <ShieldAlert className="h-6 w-6 text-white" />
 </div>
 <div className="flex-1 space-y-2">
 <div className="flex items-center justify-between gap-2">
 <h2 className="text-lg font-semibold text-slate-50">
 Kritik İşlem Kilidi (4 Göz)
 </h2>
 <span className="rounded-full bg-slate-800/80 px-3 py-1 text-xs font-mono uppercase tracking-widest text-slate-300 border border-slate-600/70">
 Maker-Checker
 </span>
 </div>
 <p className="text-sm text-slate-300">
 Bu işlem kritik seviyededir. 4 Göz (Maker-Checker) prensibi gereği farklı bir
 yönetici tarafından onaylanmadan uygulanamaz.
 </p>
 <div className="rounded-xl border border-slate-700/70 bg-slate-900/60 px-3 py-2 text-xs text-slate-300 font-mono">
 <div className="flex items-center gap-2">
 <span className="text-slate-500">İşlem:</span>
 <span className="text-amber-300">{actionName}</span>
 </div>
 <div className="mt-1 flex items-center gap-2 text-slate-500">
 <span>Kaynak:</span>
 <span className="text-slate-300">
 {resourceType} · {resourceId}
 </span>
 </div>
 </div>
 <p className="text-xs text-slate-500">
 Devreye alınan güvenlik kilidi; sahte kapanış, not manipülasyonu ve iz bırakmadan
 geri alma girişimlerine karşı tasarlanmıştır.
 </p>
 </div>
 </div>

 <div className="mt-3 flex items-center justify-end gap-3">
 <button
 type="button"
 onClick={() => setIsModalOpen(false)}
 className="inline-flex items-center gap-2 rounded-lg border border-slate-600/70 bg-slate-900/60 px-4 py-2 text-xs font-semibold text-slate-200 hover:bg-slate-800/80 transition-colors"
 disabled={isLoading}
 >
 <XCircle className="h-4 w-4" />
 İptal
 </button>
 <button
 type="button"
 onClick={handleSendForApproval}
 className="inline-flex items-center gap-2 rounded-lg bg-emerald-500 px-4 py-2 text-xs font-semibold text-emerald-950 shadow-md shadow-emerald-500/40 hover:bg-emerald-400 transition-colors disabled:opacity-70"
 disabled={isLoading}
 >
 {isLoading ? (
 <>
 <Loader2 className="h-4 w-4 animate-spin" />
 Gönderiliyor...
 </>
 ) : (
 <>
 <CheckCircle2 className="h-4 w-4" />
 Onaya Gönder
 </>
 )}
 </button>
 </div>
 </div>
 </div>
 )}
 </>
 );
}

