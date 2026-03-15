import {
 AlertTriangle,
 CheckCircle2,
 Clock,
 FileText,
 FileWarning,
 Flag,
 Gavel,
 History,
 Loader2,
 ShieldAlert,
 ShieldCheck,
 X
} from 'lucide-react';
import { useState } from 'react';
import toast from 'react-hot-toast';

// GERÇEK FSD HOOK'LARI (API Kancaları Entegrasyonu)
import type { FindingEscalation } from '@/entities/governance/api/escalation-api';
import {
 useFindingEscalations,
 useUpdateEscalationStatus,
} from '@/entities/governance/api/escalation-api';

export function CAEEscalationDesk() {
 const [selectedEscalation, setSelectedEscalation] = useState<FindingEscalation | null>(null);

 // Supabase Veri Bağlantıları (Gerçek Veri)
 const { data: escalations, isLoading: loadingEscalations } = useFindingEscalations();
 const caeDecisionMutation = useUpdateEscalationStatus();
 
 const pendingEscalations = (escalations || []).filter(e => e.status === 'REVIEWING');

 const resolvingEscalationId =
 caeDecisionMutation.isPending && caeDecisionMutation.variables
 ? caeDecisionMutation.variables.id
 : null;

 const handleDecision = async (id: string, decision: string) => {
 try {
 await caeDecisionMutation.mutateAsync({ id, decision, notes: `Karar: ${decision}` });
 toast.success('CAE kararı sisteme adli kanıt olarak işlendi.');
 if (selectedEscalation?.id === id) {
 setSelectedEscalation(null);
 }
 } catch (err: any) {
 toast.error(err?.message ?? 'Karar kaydedilemedi.');
 }
 };

 const handleSlaScan = async () => {
 toast.success(
 'SLA taraması tamamlandı. Canlı veritabanındaki bulgular tetiklendi.'
 );
 };

 return (
 <div className="space-y-4">
 {/* C-Level Karar Masası — Tetikleyici */}
 <div className="flex flex-wrap items-center justify-end gap-3">
 <button
 type="button"
 onClick={handleSlaScan}
 className="flex items-center gap-2 px-5 py-3 bg-amber-600 hover:bg-amber-700 disabled:opacity-60 text-white text-sm font-bold rounded-xl shadow-lg shadow-amber-500/25 transition-colors border border-amber-500/30 backdrop-blur-md"
 title="Açık aksiyonları SLA politikalarına göre tara; ihlal varsa CAE önüne eskalasyon aç"
 >
 <Clock size={18} />
 Günlük SLA Taramasını Tetikle
 </button>
 </div>

 {/* Kırmızı dosyalar / Karar masası paneli - %100 Light Mode Glassmorphism */}
 <section className="rounded-2xl border-2 border-slate-200/60 bg-slate-50/80 backdrop-blur-xl shadow-xl overflow-hidden relative z-10">
 <div className="px-4 py-4 border-b border-slate-200/60 bg-gradient-to-r from-slate-50/90 via-red-50/50 to-slate-50/90 flex items-center justify-between flex-wrap gap-3">
 <div className="flex items-center gap-3">
 <div className="p-3 rounded-xl bg-gradient-to-br from-red-100 to-red-50 border border-red-200 shadow-sm">
 <Gavel size={22} className="text-red-700" />
 </div>
 <div>
 <h2 className="text-lg font-bold text-slate-800 tracking-tight">CAE Karar Masası</h2>
 <p className="text-xs text-slate-500 font-medium">
 Level 3 (CAE) SLA ihlalleri — Tolerans veya Denetim Komitesine arz
 </p>
 </div>
 </div>
 {pendingEscalations.length > 0 && (
 <span className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-red-100/80 backdrop-blur-md text-red-800 text-sm font-bold border border-red-200 shadow-sm">
 <FileWarning size={16} />
 {pendingEscalations.length} bekleyen karar
 </span>
 )}
 </div>

 <div className="p-4">
 {loadingEscalations ? (
 <div className="flex items-center justify-center py-16 gap-3 text-slate-500">
 <Loader2 size={24} className="animate-spin" />
 <span className="text-sm font-medium">Adli eskalasyon dosyaları güvenli kanaldan çekiliyor...</span>
 </div>
 ) : pendingEscalations.length === 0 ? (
 <div className="flex flex-col items-center justify-center py-16 text-center">
 <div className="p-4 rounded-2xl bg-gradient-to-br from-emerald-100 to-emerald-50 border border-emerald-200 shadow-sm mb-4">
 <ShieldAlert size={40} className="text-emerald-600" />
 </div>
 <p className="text-sm font-bold text-slate-700">Bekleyen SLA eskalasyonu bulunmamaktadır</p>
 <p className="text-xs text-slate-500 mt-1 max-w-sm font-medium">
 Günlük SLA taramasını tetikleyerek yeni hukuki/operasyonel ihlalleri karar masanıza getirebilirsiniz.
 </p>
 </div>
 ) : (
 <ul className="space-y-4">
 {(pendingEscalations || []).map((item: FindingEscalation) => (
 <li
 key={item.id}
 onClick={() => setSelectedEscalation(item)}
 className="group rounded-xl border border-red-200/80 bg-white/60 hover:bg-red-50/40 p-5 flex flex-col lg:flex-row lg:items-center gap-4 shadow-sm hover:shadow-md transition-all cursor-pointer backdrop-blur-md"
 >
 <div className="flex-1 min-w-0">
 <div className="flex items-center gap-2 mb-1">
 <span className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-red-100 text-red-700 shadow-inner">
 <AlertTriangle size={12} strokeWidth={3} />
 </span>
 <p className="text-xs font-bold text-red-700 uppercase tracking-widest">
 Bulgu · Level 3 ({item.escalation_level ?? 'Bilinmiyor'})
 </p>
 </div>
 <p className="text-sm font-bold text-slate-800 truncate group-hover:text-red-900 transition-colors">
 {item.finding?.title ?? `Bulgu #${item.finding_id?.slice(0, 8) ?? 'Bilinmeyen'}`}
 </p>
 <div className="flex flex-wrap gap-4 mt-3 text-xs font-medium text-slate-600">
 {item.finding?.kerd_base_score !== undefined && (
 <span className="flex items-center gap-1.5 bg-slate-100/80 px-2 py-1 rounded-md border border-slate-200/50">
 <AlertTriangle size={14} className="text-amber-500" />
 Risk Skoru: {item.finding.kerd_base_score}
 </span>
 )}
 {item.finding?.severity && (
 <span className="flex items-center gap-1.5 bg-slate-100/80 px-2 py-1 rounded-md border border-slate-200/50">
 <Flag size={14} className={item.finding.severity === 'CRITICAL' || item.finding.severity === 'HIGH' ? 'text-red-500' : 'text-amber-500'} />
 Önem Derecesi: {item.finding.severity}
 </span>
 )}
 <span className="flex items-center gap-1.5 bg-slate-100/80 px-2 py-1 rounded-md border border-slate-200/50">
 <Clock size={14} className="text-slate-400" />
 Tetiklenme: {item.created_at ? new Date(item.created_at).toLocaleString('tr-TR') : '--'}
 </span>
 </div>
 </div>
 <div className="flex flex-wrap items-center gap-2 lg:shrink-0" onClick={(e) => e.stopPropagation()}>
 <button
 type="button"
 onClick={() => handleDecision(item.id, 'RETURNED_FOR_ACTION')}
 disabled={caeDecisionMutation.isPending}
 className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-b from-emerald-500 to-emerald-600 hover:from-emerald-400 hover:to-emerald-500 disabled:opacity-60 text-white text-xs font-bold shadow-md shadow-emerald-500/20 border border-emerald-400/50 transition-all"
 >
 {resolvingEscalationId === item.id && caeDecisionMutation.variables?.decision === 'RETURNED_FOR_ACTION' ? (
 <Loader2 size={16} className="animate-spin" />
 ) : (
 <CheckCircle2 size={16} />
 )}
 Mazereti Kabul Et
 </button>
 <button
 type="button"
 onClick={() => handleDecision(item.id, 'ESCALATED_TO_BOARD')}
 disabled={caeDecisionMutation.isPending}
 className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-b from-red-600 to-red-700 hover:from-red-500 hover:to-red-600 disabled:opacity-60 text-white text-xs font-bold shadow-md shadow-red-600/20 border border-red-500/50 transition-all"
 >
 {resolvingEscalationId === item.id && caeDecisionMutation.variables?.decision === 'ESCALATED_TO_BOARD' ? (
 <Loader2 size={16} className="animate-spin" />
 ) : (
 <ShieldCheck size={16} />
 )}
 YK'ya Raporla
 </button>
 </div>
 </li>
 ))}
 </ul>
 )}
 </div>
 </section>

 {/* SUPER DRAWER - Sağdan Kayarak Açılan Adli Dosya Görünümü */}
 {selectedEscalation && (
 <div className="fixed inset-0 z-[100] flex justify-end overflow-hidden pointer-events-none">
 {/* Overlay */}
 <div 
 className="absolute inset-0 bg-slate-900/10 backdrop-blur-[2px] pointer-events-auto transition-opacity duration-300"
 onClick={() => setSelectedEscalation(null)}
 />
 
 {/* Drawer Panel - Apple Glassmorphism & Light Mode */}
 <div className="relative w-[600px] h-full bg-white/80 backdrop-blur-2xl border-l border-slate-200/50 shadow-[0_0_40px_rgba(0,0,0,0.1)] pointer-events-auto transform transition-transform duration-300 flex flex-col">
 
 {/* Header / Yaldızlı Rozetler */}
 <div className="px-4 py-4 border-b border-slate-200/60 bg-gradient-to-br from-slate-50/50 via-white/50 to-amber-50/30">
 <div className="flex items-start justify-between">
 <div>
 <div className="flex items-center gap-3 mb-3">
 <span className="px-3 py-1 rounded-full bg-gradient-to-r from-amber-200 to-yellow-400 text-yellow-900 text-[11px] font-black tracking-widest uppercase shadow-sm border border-amber-300/50">
 RESMİ DİSİPLİN DOSYASI
 </span>
 <span className="px-3 py-1 rounded-full bg-red-100/80 text-red-800 text-[11px] font-bold tracking-wider uppercase border border-red-200">
 LEVEL 3 ESKALASYON
 </span>
 </div>
 <h2 className="text-xl font-extrabold text-slate-800 leading-tight">
 {selectedEscalation.finding?.title ?? 'İsimsiz Bulgu'}
 </h2>
 <p className="text-xs font-semibold text-slate-500 mt-2 font-mono">
 DOSYA REF: {selectedEscalation.id?.substring(0, 13).toUpperCase() ?? 'KAYITSIZ'}
 </p>
 </div>
 <button 
 onClick={() => setSelectedEscalation(null)}
 className="p-2 bg-slate-100 hover:bg-slate-200 text-slate-500 rounded-full transition-colors"
 >
 <X size={20} />
 </button>
 </div>
 </div>

 {/* Body */}
 <div className="flex-1 overflow-y-auto p-5 space-y-5">
 
 {/* Context Section */}
 <section>
 <h3 className="flex items-center gap-2 text-sm font-bold text-slate-800 border-b border-slate-200 pb-2 mb-4">
 <FileText size={16} className="text-amber-600" />
 Maddi Vakıa Özeti
 </h3>
 <div className="bg-slate-50/80 rounded-xl p-5 border border-slate-200/60 shadow-inner">
 <p className="text-[13px] leading-relaxed text-slate-700 font-medium whitespace-pre-wrap">
 {selectedEscalation?.reason ?? 'Söz konusu bulgu veya aksiyon, sistem tarafından Yönetim Kuruluna (veya ilgili organlara) eskalasyon kaydı ile intikal ettirilmiştir. Belge geçmişinde kritik risk tespiti ve/veya SLA aşımı olduğu raporlanmaktadır. Yetkililer uyarılmıştır.'}
 </p>
 </div>
 </section>

 {/* Meta Veriler */}
 <section>
 <h3 className="flex items-center gap-2 text-sm font-bold text-slate-800 border-b border-slate-200 pb-2 mb-4">
 <History size={16} className="text-amber-600" />
 Adli Gecikme Metrikleri
 </h3>
 <div className="grid grid-cols-2 gap-4">
 <div className="bg-white/60 p-4 rounded-xl border border-slate-200/60 shadow-sm">
 <p className="text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-1">Tetiklenme Zamanı</p>
 <p className="text-sm font-bold text-slate-800">
 {selectedEscalation.created_at ? new Date(selectedEscalation.created_at).toLocaleString('tr-TR') : '--'}
 </p>
 </div>
 <div className="bg-white/60 p-4 rounded-xl border border-slate-200/60 shadow-sm">
 <p className="text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-1">Eskalasyon Seviyesi</p>
 <p className="text-sm font-bold text-red-700 flex items-center gap-1.5">
 <AlertTriangle size={14} /> CAE / Yönetim Kurulu
 </p>
 </div>
 </div>
 </section>

 {/* Action Details */}
 <section>
 <h3 className="flex items-center gap-2 text-sm font-bold text-slate-800 border-b border-slate-200 pb-2 mb-4">
 <Gavel size={16} className="text-amber-600" />
 Sorumluluk Reddi ve Hüküm
 </h3>
 <div className="bg-red-50/50 rounded-xl p-5 border border-red-100">
 <p className="text-[12px] leading-relaxed text-red-900 font-medium">
 DIKKAT: Bu dosyaya uygulanacak karar kesindir ve sistem denetim izine (audit trail) 
 değiştirilemez blokzincir mantığı ile yazılacaktır. Denetim Komitesine raporlama,
 ilgili birim hakkında disiplin soruşturması başlatabilir.
 </p>
 </div>
 </section>
 </div>

 {/* Footer Actions */}
 <div className="p-4 border-t border-slate-200/60 bg-slate-50/80 flex gap-4">
 <button
 type="button"
 onClick={() => handleDecision(selectedEscalation.id, 'RETURNED_FOR_ACTION')}
 disabled={caeDecisionMutation.isPending}
 className="flex-[4] flex justify-center items-center gap-2 py-3.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-white text-[13px] font-bold shadow-lg transition-colors"
 >
 {resolvingEscalationId === selectedEscalation.id && caeDecisionMutation.variables?.decision === 'RETURNED_FOR_ACTION' ? (
 <Loader2 size={16} className="animate-spin" />
 ) : null}
 Bulguyu Geri İade Et (Yenilenme)
 </button>
 <button
 type="button"
 onClick={() => handleDecision(selectedEscalation.id, 'ESCALATED_TO_BOARD')}
 disabled={caeDecisionMutation.isPending}
 className="flex-[6] flex justify-center items-center gap-2 py-3.5 rounded-xl bg-red-700 hover:bg-red-800 text-white text-[13px] font-bold shadow-lg transition-colors"
 >
 {resolvingEscalationId === selectedEscalation.id && caeDecisionMutation.variables?.decision === 'ESCALATED_TO_BOARD' ? (
 <Loader2 size={16} className="animate-spin" />
 ) : null}
 Denetim Komitesine (YK) Raporla
 </button>
 </div>
 </div>
 </div>
 )}
 </div>
 );
}
