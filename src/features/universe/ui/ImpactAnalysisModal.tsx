import { archiveAuditEntity, useEntityImpactAnalysis } from '@/entities/universe/api/universe-api';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { AlertTriangle, Archive, FileWarning, Network, Shield, Trash2, X } from 'lucide-react';
import toast from 'react-hot-toast';

interface ImpactAnalysisModalProps {
 entityId: string;
 entityName: string;
 onClose: () => void;
}

export function ImpactAnalysisModal({ entityId, entityName, onClose }: ImpactAnalysisModalProps) {
 const queryClient = useQueryClient();

 const { data: impact, isLoading, error } = useEntityImpactAnalysis(entityId);

 const archiveMutation = useMutation({
 mutationFn: () => archiveAuditEntity(entityId),
 onSuccess: () => {
 queryClient.invalidateQueries({ queryKey: ['audit-universe-hierarchy'] });
 toast.success(`"${entityName}" arşivlendi.`);
 onClose();
 },
 onError: (err: Error) => {
 toast.error(`Arşivleme başarısız: ${err.message}`);
 },
 });

 const isSafe =
 impact &&
 impact.descendant_count === 0 &&
 impact.rkm_risk_count === 0 &&
 impact.open_finding_count === 0;

 const isDangerous =
 impact &&
 (impact.descendant_count > 0 ||
 impact.rkm_risk_count > 0 ||
 impact.open_finding_count > 0);

 return (
 <div className="fixed inset-0 z-[200] flex items-center justify-center p-4">
 {/* Backdrop */}
 <div
 className="absolute inset-0 bg-slate-900/70 backdrop-blur-md"
 onClick={onClose}
 />

 {/* Panel */}
 <div className="relative w-full max-w-lg bg-white/90 backdrop-blur-xl rounded-2xl shadow-2xl border border-red-100 overflow-hidden">
 {/* Kırmızı header şerit */}
 <div className="h-1.5 w-full bg-gradient-to-r from-red-500 via-red-400 to-rose-500" />

 {/* Header */}
 <div className="flex items-start justify-between px-6 pt-5 pb-4 border-b border-slate-100">
 <div className="flex items-center gap-3">
 <div className="w-10 h-10 rounded-xl bg-red-100 flex items-center justify-center flex-shrink-0">
 <AlertTriangle size={20} className="text-red-600" />
 </div>
 <div>
 <h2 className="text-lg font-bold text-slate-800">Kaskad Yıkım Analizi</h2>
 <p className="text-xs text-slate-500 mt-0.5">
 Silinmesi / arşivlenmesi planlanan: <span className="font-semibold text-slate-700">"{entityName}"</span>
 </p>
 </div>
 </div>
 <button
 onClick={onClose}
 className="p-1.5 rounded-lg hover:bg-slate-100 text-slate-400 transition-colors"
 >
 <X size={18} />
 </button>
 </div>

 {/* İçerik */}
 <div className="px-6 py-5">
 {isLoading && (
 <div className="flex flex-col items-center gap-3 py-5">
 <div className="w-8 h-8 border-2 border-slate-200 border-t-red-500 rounded-full animate-spin" />
 <p className="text-sm text-slate-500">Etki analizi hesaplanıyor…</p>
 </div>
 )}

 {error && (
 <div className="bg-red-50 rounded-xl p-4 text-sm text-red-700">
 Etki analizi yüklenemedi: {(error as Error).message}
 </div>
 )}

 {impact && (
 <>
 {/* Metrik kartları */}
 <div className="grid grid-cols-3 gap-3 mb-5">
 <MetricCard
 icon={<Network size={16} className="text-slate-500" />}
 label="Alt Süreç"
 value={impact.descendant_count}
 danger={impact.descendant_count > 0}
 dangerLabel="yetim kalacak"
 />
 <MetricCard
 icon={<Shield size={16} className="text-amber-500" />}
 label="Risk Kaydı"
 value={impact.rkm_risk_count}
 danger={impact.rkm_risk_count > 0}
 dangerLabel="bağlantısı kopacak"
 />
 <MetricCard
 icon={<FileWarning size={16} className="text-red-500" />}
 label="Açık Bulgu"
 value={impact.open_finding_count}
 danger={impact.open_finding_count > 0}
 dangerLabel="kapanmadan etkilenecek"
 />
 </div>

 {/* Uyarı bandı */}
 {isDangerous ? (
 <div className="bg-red-50 border border-red-200 rounded-xl p-4 mb-5">
 <p className="text-sm font-semibold text-red-700 mb-1">
 ⚠️ Yüksek Etki — Dikkatli Olun
 </p>
 <p className="text-xs text-red-600 leading-relaxed">
 Bu süreci arşivlerseniz{' '}
 {impact.descendant_count > 0 && (
 <><strong>{impact.descendant_count} alt süreç</strong> yetim kalacak, </>
 )}
 {impact.rkm_risk_count > 0 && (
 <><strong>{impact.rkm_risk_count} risk kaydının</strong> bağlantısı kopacak{impact.open_finding_count > 0 ? ' ve ' : '. '}</>
 )}
 {impact.open_finding_count > 0 && (
 <><strong>{impact.open_finding_count} açık bulgu</strong> sahipsiz kalacak. </>
 )}
 Bu işlem geri alınamaz. Devam etmek istediğinize emin misiniz?
 </p>
 </div>
 ) : (
 <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-4 mb-5">
 <p className="text-sm font-semibold text-emerald-700 mb-1">
 ✓ Güvenli Arşivleme
 </p>
 <p className="text-xs text-emerald-600">
 Bu düğümün bağımlılığı bulunmuyor. Güvenle arşivleyebilirsiniz.
 </p>
 </div>
 )}

 {/* Aksiyon butonları */}
 <div className="flex items-center justify-end gap-3">
 <button
 onClick={onClose}
 className="px-4 py-2 text-sm text-slate-600 bg-slate-100 hover:bg-slate-200 rounded-lg font-medium transition-colors"
 >
 İptal
 </button>

 {/* Arşivle — her zaman aktif, uyarı zaten gösterildi */}
 <button
 onClick={() => archiveMutation.mutate()}
 disabled={archiveMutation.isPending}
 className={`
 flex items-center gap-2 px-4 py-2 text-sm font-semibold rounded-lg transition-colors
 ${isDangerous
 ? 'bg-red-600 hover:bg-red-700 text-white'
 : 'bg-amber-500 hover:bg-amber-600 text-white'}
 disabled:opacity-50 disabled:cursor-not-allowed
 `}
 >
 <Archive size={14} />
 {archiveMutation.isPending ? 'Arşivleniyor…' : 'Arşivle'}
 </button>

 {/* Sadece bağımlılık yoksa "tamamen sil" seçeneği de sun */}
 {isSafe && (
 <button
 className="flex items-center gap-2 px-4 py-2 text-sm font-semibold bg-slate-800 hover:bg-slate-900 text-white rounded-lg transition-colors opacity-60 cursor-not-allowed"
 title="Kalıcı silme henüz aktif değil — arşivleme önerilir"
 disabled
 >
 <Trash2 size={14} />
 Sil (yakında)
 </button>
 )}
 </div>
 </>
 )}
 </div>
 </div>
 </div>
 );
}

// ─── Yardımcı bileşen ─────────────────────────────────────────────────────────

interface MetricCardProps {
 icon: React.ReactNode;
 label: string;
 value: number;
 danger: boolean;
 dangerLabel: string;
}

function MetricCard({ icon, label, value, danger, dangerLabel }: MetricCardProps) {
 return (
 <div
 className={`
 rounded-xl p-3 border text-center
 ${danger
 ? 'bg-red-50 border-red-200'
 : 'bg-slate-50 border-slate-200'}
 `}
 >
 <div className="flex justify-center mb-1">{icon}</div>
 <div
 className={`text-2xl font-black tabular-nums mb-0.5 ${danger ? 'text-red-600' : 'text-slate-400'}`}
 >
 {value}
 </div>
 <div className="text-[10px] font-semibold text-slate-500 uppercase tracking-wide">{label}</div>
 {danger && (
 <div className="text-[9px] text-red-400 mt-0.5">{dangerLabel}</div>
 )}
 </div>
 );
}
