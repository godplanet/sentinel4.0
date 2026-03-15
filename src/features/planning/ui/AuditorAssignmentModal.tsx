import { useSentinelAI } from '@/shared/hooks/useSentinelAI';
import { useQuery } from '@tanstack/react-query';
import clsx from 'clsx';
import { AnimatePresence, motion } from 'framer-motion';
import {
 AlertTriangle,
 Brain,
 CheckCircle2,
 Loader2,
 Search,
 ShieldAlert,
 Sparkles,
 Users,
 X,
} from 'lucide-react';
import { useMemo, useState } from 'react';
import {
 fetchAdvisoryConflicts,
 fetchAuditorProfiles,
} from '../api/auditor-assignment-api';

interface ConflictWarning {
 auditorId: string;
 type: 'DIRECT_RELATION' | 'DEPARTMENT_MATCH' | 'OVERLOADED' | 'GIAS_22_ADVISORY' | 'AI_DETECTED';
 severity: 'HIGH' | 'MEDIUM' | 'LOW';
 description: string;
}

interface AuditorAssignmentModalProps {
 isOpen: boolean;
 onClose: () => void;
 onAssign: (auditorId: string) => void;
 engagementTitle: string;
 targetDepartment: string;
 targetEntities?: string[];
 /** audit_entities.id listesi — GIAS 2.2 bağımsızlık kontrolü için zorunlu */
 targetEntityIds?: string[];
}

/** GIAS 2.2 uyarısını denetçi üzerinde gösterir. */
function Gias22Badge() {
 return (
 <span className="flex items-center gap-1 text-[10px] font-bold px-2 py-1 bg-red-100 text-red-700 rounded-lg border border-red-200">
 <ShieldAlert size={11} />
 GIAS 2.2
 </span>
 );
}

export function AuditorAssignmentModal({
 isOpen,
 onClose,
 onAssign,
 engagementTitle,
 targetDepartment,
 targetEntities = [],
 targetEntityIds = [],
}: AuditorAssignmentModalProps) {
 const [search, setSearch] = useState('');
 const [selectedId, setSelectedId] = useState<string | null>(null);
 const [acknowledgedConflicts, setAcknowledgedConflicts] = useState(false);
 const [aiConflicts, setAiConflicts] = useState<ConflictWarning[]>([]);
 const { loading: aiLoading, generate, configured: aiConfigured } = useSentinelAI();

 /* ------------------------------------------------------------------ */
 /* Gerçek denetçi listesi — auditor_profiles + user_profiles */
 /* ------------------------------------------------------------------ */
 const { data: auditors = [], isLoading: auditorsLoading } = useQuery({
 queryKey: ['auditor-profiles'],
 queryFn: fetchAuditorProfiles,
 staleTime: 5 * 60 * 1000,
 });

 /* ------------------------------------------------------------------ */
 /* GIAS 2.2 — Seçilen denetçi için bağımsızlık çakışması sorgusu */
 /* ------------------------------------------------------------------ */
 const { data: advisoryConflicts = [] } = useQuery({
 queryKey: ['advisory-conflicts', selectedId, targetEntityIds],
 queryFn: () => fetchAdvisoryConflicts(selectedId!, targetEntityIds),
 enabled: !!selectedId && targetEntityIds.length > 0,
 staleTime: 60 * 1000,
 });

 /* ------------------------------------------------------------------ */
 /* Kural tabanlı çakışma tespiti */
 /* ------------------------------------------------------------------ */
 const ruleConflictsForSelected = useMemo((): ConflictWarning[] => {
 if (!selectedId) return [];
 const auditor = auditors.find((a) => a.user_id === selectedId);
 if (!auditor) return [];

 const warnings: ConflictWarning[] = [];
 const skills = Object.keys(auditor.skills_matrix ?? {});

 if (auditor.department?.toLowerCase() === targetDepartment.toLowerCase()) {
 warnings.push({
 auditorId: auditor.user_id,
 type: 'DEPARTMENT_MATCH',
 severity: 'MEDIUM',
 description: `${auditor.full_name} denetlenen departmanda çalışma geçmişine sahip olabilir.`,
 });
 }

 const hasRelation = targetEntities.some((entity) =>
 skills.some(
 (s) =>
 s.toLowerCase().includes(entity.toLowerCase()) ||
 entity.toLowerCase().includes(s.toLowerCase()),
 ),
 );
 if (hasRelation) {
 warnings.push({
 auditorId: auditor.user_id,
 type: 'DIRECT_RELATION',
 severity: 'HIGH',
 description: `${auditor.full_name} ile denetlenen birim arasında yetkinlik tabanlı ilgisel bağlantı tespit edildi.`,
 });
 }

 return warnings;
 }, [selectedId, auditors, targetDepartment, targetEntities]);

 /* GIAS 2.2 danışmanlık çakışmasını ConflictWarning formatına çevir */
 const gias22Warnings = useMemo((): ConflictWarning[] => {
 if (!selectedId || advisoryConflicts.length === 0) return [];
 return (advisoryConflicts || []).map((c) => ({
 auditorId: selectedId,
 type: 'GIAS_22_ADVISORY' as const,
 severity: 'HIGH' as const,
 description:
 `GIAS 2.2 İhlali: Bu denetçi ilgili süreç/departmana ` +
 `${new Date(c.engagement_end_date).toLocaleDateString('tr-TR')} tarihine kadar ` +
 `danışmanlık vermiştir. Soğuma süresi ${new Date(c.cooling_off_expires_at).toLocaleDateString('tr-TR')} tarihine dek devam etmektedir.`,
 }));
 }, [selectedId, advisoryConflicts]);

 const allConflicts: ConflictWarning[] = [
 ...ruleConflictsForSelected,
 ...gias22Warnings,
 ...(aiConflicts || []).filter((c) => c.auditorId === selectedId),
 ];
 const hasHighConflict = allConflicts.some((c) => c.severity === 'HIGH');
 const hasGias22Conflict = gias22Warnings.length > 0;

 /* ------------------------------------------------------------------ */
 /* Filtreleme */
 /* ------------------------------------------------------------------ */
 const filtered = useMemo(() => {
 if (!search) return auditors;
 const q = search.toLowerCase();
 return (auditors || []).filter(
 (a) =>
 a.full_name.toLowerCase().includes(q) ||
 Object.keys(a.skills_matrix ?? {}).some((s) => s.toLowerCase().includes(q)),
 );
 }, [search, auditors]);

 const selectedAuditor = auditors.find((a) => a.user_id === selectedId);

 /* ------------------------------------------------------------------ */
 /* AI Derin Tarama */
 /* ------------------------------------------------------------------ */
 const handleDeepScan = async () => {
 if (!selectedAuditor) return;

 const prompt = `Bir iç denetim atama sürecinde çıkar çatışması analizi yapıyorsun.

DENETÇİ BİLGİLERİ:
- İsim: ${selectedAuditor.full_name}
- Ünvan: ${selectedAuditor.title ?? 'Belirtilmemiş'}
- Departman: ${selectedAuditor.department ?? 'Belirtilmemiş'}
- Yetkinlikler: ${Object.keys(selectedAuditor.skills_matrix ?? {}).join(', ') || 'Belirtilmemiş'}

DENETİM GÖREVİ:
- Başlık: ${engagementTitle}
- Hedef Departman: ${targetDepartment}
- Hedef Birimler: ${targetEntities.join(', ') || 'Belirtilmemiş'}

Bilgilere dayanarak gizli çıkar çatışmalarını tespit et. Her tespit için ciddiyet seviyesi (HIGH/MEDIUM/LOW) belirle.
Format: Her satıra "[SEVERITY] Açıklama" yaz. Sadece tespitleri listele.
Tespit yoksa "TEMIZ: Gizli çıkar çatışması tespit edilmedi." yaz.`;

 const result = await generate(prompt);
 if (!result) return;

 const newConflicts: ConflictWarning[] = [];
 const lines = result.split('\n').filter(Boolean);

 for (const line of lines) {
 const trimmed = line.trim().replace(/^[-*\d.)\]]+\s*/, '');
 if (trimmed.toLowerCase().includes('temiz') || trimmed.toLowerCase().includes('tespit edilmedi')) continue;

 let severity: 'HIGH' | 'MEDIUM' | 'LOW' = 'MEDIUM';
 let desc = trimmed;

 if (/^\[?HIGH\]?/i.test(trimmed)) { severity = 'HIGH'; desc = trimmed.replace(/^\[?HIGH\]?\s*:?\s*/i, ''); }
 else if (/^\[?LOW\]?/i.test(trimmed)) { severity = 'LOW'; desc = trimmed.replace(/^\[?LOW\]?\s*:?\s*/i, ''); }
 else if (/^\[?MEDIUM\]?/i.test(trimmed)) { severity = 'MEDIUM'; desc = trimmed.replace(/^\[?MEDIUM\]?\s*:?\s*/i, ''); }

 if (desc.length > 5) {
 newConflicts.push({
 auditorId: selectedAuditor.user_id,
 type: 'AI_DETECTED',
 severity,
 description: desc,
 });
 }
 }

 setAiConflicts((prev) => [
 ...(prev || []).filter((c) => c.auditorId !== selectedAuditor.user_id),
 ...newConflicts,
 ]);
 };

 const handleAssign = () => {
 if (!selectedId) return;
 if (hasHighConflict && !acknowledgedConflicts) return;
 onAssign(selectedId);
 onClose();
 };

 if (!isOpen) return null;

 return (
 <AnimatePresence>
 <motion.div
 initial={{ opacity: 0 }}
 animate={{ opacity: 1 }}
 exit={{ opacity: 0 }}
 className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
 onClick={onClose}
 >
 <motion.div
 initial={{ scale: 0.95, y: 20 }}
 animate={{ scale: 1, y: 0 }}
 exit={{ scale: 0.95, y: 20 }}
 className="bg-surface rounded-2xl shadow-2xl w-full max-w-2xl max-h-[85vh] flex flex-col"
 onClick={(e) => e.stopPropagation()}
 >
 <div className="bg-gradient-to-r from-slate-700 to-slate-800 px-4 py-4 rounded-t-2xl flex items-center justify-between">
 <div>
 <h2 className="text-lg font-bold text-white flex items-center gap-2">
 <Users size={20} />
 Denetçi Atama
 </h2>
 <p className="text-xs text-slate-300 mt-0.5">{engagementTitle}</p>
 </div>
 <button onClick={onClose} className="w-8 h-8 bg-surface/20 rounded-lg flex items-center justify-center hover:bg-surface/30">
 <X size={16} className="text-white" />
 </button>
 </div>

 <div className="p-4 flex-1 overflow-auto space-y-4">
 <div className="relative">
 <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
 <input
 type="text"
 value={search}
 onChange={(e) => setSearch(e.target.value)}
 placeholder="Denetçi ara (isim veya yetkinlik)..."
 className="w-full pl-10 pr-4 py-2.5 bg-canvas border-2 border-slate-300 rounded-lg text-sm"
 />
 </div>

 {auditorsLoading ? (
 <div className="flex items-center justify-center py-12">
 <Loader2 size={24} className="animate-spin text-slate-400" />
 <span className="ml-2 text-sm text-slate-500">Denetçiler yükleniyor...</span>
 </div>
 ) : (
 <div className="space-y-2">
 {(filtered || []).map((auditor) => {
 const hasConflict =
 (selectedId === auditor.user_id && allConflicts.length > 0) ||
 (selectedId !== auditor.user_id && false);
 const isSelected = selectedId === auditor.user_id;
 const skills = Object.keys(auditor.skills_matrix ?? {});

 return (
 <button
 key={auditor.user_id}
 onClick={() => {
 setSelectedId(isSelected ? null : auditor.user_id);
 setAcknowledgedConflicts(false);
 }}
 className={clsx(
 'w-full text-left p-4 rounded-lg border-2 transition-all',
 isSelected
 ? hasConflict ? 'border-amber-500 bg-amber-50' : 'border-blue-500 bg-blue-50'
 : 'border-slate-200 bg-surface hover:border-slate-300',
 )}
 >
 <div className="flex items-start justify-between">
 <div className="flex items-center gap-3">
 <div className={clsx(
 'w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm shrink-0',
 isSelected && hasConflict ? 'bg-amber-100 text-amber-700' : 'bg-slate-100 text-slate-700',
 )}>
 {auditor.full_name.split(' ').map((n) => n[0]).join('').slice(0, 2)}
 </div>
 <div>
 <p className="font-semibold text-primary text-sm">{auditor.full_name}</p>
 <p className="text-xs text-slate-500">{auditor.title ?? auditor.department ?? '—'}</p>
 </div>
 </div>

 <div className="flex items-center gap-2 shrink-0">
 {isSelected && hasGias22Conflict && <Gias22Badge />}
 {isSelected && (allConflicts || []).filter((c) => c.type !== 'GIAS_22_ADVISORY').length > 0 && (
 <span className="flex items-center gap-1 text-[10px] font-bold px-2 py-1 bg-amber-100 text-amber-700 rounded-lg">
 <AlertTriangle size={12} />
 {(allConflicts || []).filter((c) => c.type !== 'GIAS_22_ADVISORY').length} uyarı
 </span>
 )}
 </div>
 </div>

 {skills.length > 0 && (
 <div className="flex flex-wrap gap-1.5 mt-2">
 {skills.slice(0, 5).map((s) => (
 <span key={s} className="text-[10px] px-2 py-0.5 bg-slate-100 text-slate-600 rounded font-medium">{s}</span>
 ))}
 {skills.length > 5 && (
 <span className="text-[10px] px-2 py-0.5 bg-slate-100 text-slate-400 rounded">+{skills.length - 5}</span>
 )}
 </div>
 )}
 </button>
 );
 })}

 {filtered.length === 0 && !auditorsLoading && (
 <div className="py-10 text-center text-slate-400 text-sm">
 Arama kriterine uygun denetçi bulunamadı.
 </div>
 )}
 </div>
 )}

 {selectedId && selectedAuditor && (
 <div className="bg-gradient-to-r from-slate-800 to-slate-700 rounded-xl p-4">
 <div className="flex items-center justify-between mb-3">
 <div className="flex items-center gap-2">
 <Brain size={16} className="text-blue-400" />
 <h4 className="text-sm font-bold text-white">AI Derin Çatışma Analizi</h4>
 </div>
 <button
 onClick={handleDeepScan}
 disabled={aiLoading || !aiConfigured}
 className="flex items-center gap-2 px-3 py-1.5 bg-blue-500 text-white rounded-lg text-xs font-bold hover:bg-blue-600 disabled:bg-slate-600 disabled:text-slate-400 transition-colors"
 >
 {aiLoading ? <Loader2 size={12} className="animate-spin" /> : <Sparkles size={12} />}
 {aiLoading ? 'Tarama...' : 'Derin Tarama'}
 </button>
 </div>
 <p className="text-xs text-slate-400">
 Denetçinin özgeçmiş, aile bağlantıları ve geçmiş görevleri AI ile analiz edilerek gizli çıkar çatışmaları tespit edilir.
 </p>
 {!aiConfigured && (
 <p className="text-[10px] text-amber-400 mt-2">AI motoru yapılandırılmamış. Ayarlar &gt; Cognitive Engine</p>
 )}
 </div>
 )}

 {/* GIAS 2.2 UYARISI — danışmanlık geçmişi tespit edildiğinde */}
 {hasGias22Conflict && selectedId && (
 <div className="bg-red-50 border-2 border-red-300 rounded-xl p-4 space-y-2">
 <div className="flex items-center gap-2">
 <ShieldAlert size={18} className="text-red-600" />
 <h4 className="text-sm font-bold text-red-800">GIAS 2.2 — Bağımsızlık Duvarı İhlali</h4>
 </div>
 {(gias22Warnings || []).map((c, i) => (
 <div key={i} className="flex items-start gap-2 p-2 rounded bg-red-100">
 <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-red-200 text-red-800 shrink-0">
 GIAS 2.2
 </span>
 <p className="text-xs text-red-700">{c.description}</p>
 </div>
 ))}
 <p className="text-xs text-red-700 font-semibold">
 Atamaya devam etmek için CAE yazılı gerekçesi zorunludur.
 </p>
 </div>
 )}

 {/* Diğer çakışma uyarıları */}
 {(allConflicts || []).filter((c) => c.type !== 'GIAS_22_ADVISORY').length > 0 && selectedId && (
 <div className="bg-amber-50 border-2 border-amber-200 rounded-lg p-4 space-y-3">
 <div className="flex items-center gap-2">
 <AlertTriangle size={18} className="text-amber-600" />
 <h4 className="text-sm font-bold text-amber-800">Çıkar Çatışması Uyarısı</h4>
 </div>
 {(allConflicts || []).filter((c) => c.type !== 'GIAS_22_ADVISORY').map((c, i) => (
 <div key={i} className={clsx(
 'flex items-start gap-2 p-2 rounded',
 c.severity === 'HIGH' && 'bg-red-50',
 c.severity === 'MEDIUM' && 'bg-amber-50',
 c.severity === 'LOW' && 'bg-yellow-50',
 )}>
 <div className="flex items-center gap-1 shrink-0">
 <span className={clsx(
 'text-[10px] font-bold px-1.5 py-0.5 rounded',
 c.severity === 'HIGH' && 'bg-red-100 text-red-700',
 c.severity === 'MEDIUM' && 'bg-amber-100 text-amber-700',
 c.severity === 'LOW' && 'bg-yellow-100 text-yellow-700',
 )}>
 {c.severity}
 </span>
 {c.type === 'AI_DETECTED' && (
 <span className="text-[9px] font-bold px-1 py-0.5 bg-blue-100 text-blue-700 rounded">AI</span>
 )}
 </div>
 <p className="text-xs text-slate-700">{c.description}</p>
 </div>
 ))}

 {hasHighConflict && (
 <label className="flex items-start gap-2 cursor-pointer pt-2 border-t border-amber-200">
 <input
 type="checkbox"
 checked={acknowledgedConflicts}
 onChange={(e) => setAcknowledgedConflicts(e.target.checked)}
 className="mt-0.5 w-4 h-4 text-amber-600 border-amber-300 rounded"
 />
 <span className="text-xs text-amber-800 font-medium">
 Çıkar çatışması riskini kabul ediyorum ve atama işlemini onaylıyorum.
 </span>
 </label>
 )}
 </div>
 )}
 </div>

 <div className="bg-canvas px-4 py-4 border-t border-slate-200 rounded-b-2xl flex items-center justify-between">
 <p className="text-xs text-slate-500">
 {selectedAuditor ? `Seçilen: ${selectedAuditor.full_name}` : 'Denetçi seçin'}
 </p>
 <div className="flex items-center gap-3">
 <button onClick={onClose} className="px-5 py-2 bg-surface border border-slate-300 text-slate-700 rounded-lg font-medium text-sm">
 İptal
 </button>
 <button
 onClick={handleAssign}
 disabled={!selectedId || (hasHighConflict && !acknowledgedConflicts)}
 className="flex items-center gap-2 px-5 py-2 bg-blue-600 text-white rounded-lg font-semibold text-sm hover:bg-blue-700 disabled:bg-slate-400 transition-colors"
 >
 <CheckCircle2 size={14} />
 Atama Yap
 </button>
 </div>
 </div>
 </motion.div>
 </motion.div>
 </AnimatePresence>
 );
}
