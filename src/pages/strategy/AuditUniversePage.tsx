import { ProcessFlowEditor } from '@/features/process-canvas/ProcessFlowEditor';
import { RiskContagionRadar } from '@/features/risk-contagion/ui/RiskContagionRadar';
import { PageHeader } from '@/shared/ui/PageHeader';
import { useQueryClient } from '@tanstack/react-query';
import clsx from 'clsx';
import { AnimatePresence, motion } from 'framer-motion';
import {
 Activity,
 AlertTriangle,
 ArrowRight,
 BrainCircuit,
 Building2,
 CalendarPlus,
 CheckSquare,
 ChevronRight,
 Download,
 Pencil,
 Filter,
 Info,
 ListTree,
 Loader2,
 Lock,
 Plus,
 Radar,
 Scale,
 Search,
 Server, ShieldCheck,
 Square,
 Trash2,
 Upload,
 Workflow,
 X, Zap,
} from 'lucide-react';
import React, { useMemo, useState } from 'react';
import toast from 'react-hot-toast';
import { useNavigate } from 'react-router-dom';

// --- MİMARİ BAĞLANTILAR (FSD) ---
import { useCreateEntity, useUpdateEntity, useDeleteEntity } from '@/entities/universe/api';
import { useAuditUniverseLive, useBulkCreateEntities, type AuditEntityLive } from '@/entities/universe/api/universe-live-api';
import type { EntityType } from '@/entities/universe/model/types';
import { calculateEntityGrade, type EntityGradeInput } from '@/features/grading-engine/calculator';
import { createEngagementsFromEntities, getDefaultPlanId } from '@/features/planning/linkage';
import { GRADING_THRESHOLDS, SENTINEL_CONSTITUTION } from '@/shared/config/constitution';

const BASE_ENTITY_TYPES: { key: string; label: string; desc: string; color: string; bgColor: string }[] = [
  { key: 'HOLDING',      label: 'Holding',              desc: 'En üst düzey ana kuruluş',   color: 'text-purple-700', bgColor: 'bg-purple-50 border-purple-200' },
  { key: 'BANK',         label: 'Banka',                desc: 'Ana banka kuruluşu',         color: 'text-blue-700',   bgColor: 'bg-blue-50 border-blue-200' },
  { key: 'GROUP',        label: 'Grup / İş Kolu',       desc: 'İş grubu veya iş kolu',      color: 'text-indigo-700', bgColor: 'bg-indigo-50 border-indigo-200' },
  { key: 'HEADQUARTERS', label: 'Genel Müdürlük',       desc: 'Merkez yönetim birimi',      color: 'text-slate-700',  bgColor: 'bg-slate-50 border-slate-300' },
  { key: 'UNIT',         label: 'Direktörlük / Birim',  desc: 'Ana direktörlük veya birim', color: 'text-emerald-700',bgColor: 'bg-emerald-50 border-emerald-200' },
  { key: 'DEPARTMENT',   label: 'Departman',            desc: 'Alt departman veya bölüm',   color: 'text-teal-700',   bgColor: 'bg-teal-50 border-teal-200' },
  { key: 'BRANCH',       label: 'Şube',                 desc: 'Banka şubesi',               color: 'text-amber-700',  bgColor: 'bg-amber-50 border-amber-200' },
  { key: 'PROCESS',      label: 'Süreç',                desc: 'İş süreci veya akış',        color: 'text-orange-700', bgColor: 'bg-orange-50 border-orange-200' },
  { key: 'SUBSIDIARY',   label: 'İştirak',              desc: 'Bağlı ortaklık',             color: 'text-rose-700',   bgColor: 'bg-rose-50 border-rose-200' },
  { key: 'VENDOR',       label: 'Tedarikçi',            desc: 'Dış hizmet sağlayıcı',       color: 'text-violet-700', bgColor: 'bg-violet-50 border-violet-200' },
  { key: 'IT_ASSET',     label: 'BT Varlığı',           desc: 'Bilgi teknolojisi sistemi',  color: 'text-cyan-700',   bgColor: 'bg-cyan-50 border-cyan-200' },
];

const toSlug = (text: string) =>
  text.toLowerCase()
    .replace(/ğ/g, 'g').replace(/ü/g, 'u').replace(/ş/g, 's')
    .replace(/ı/g, 'i').replace(/ö/g, 'o').replace(/ç/g, 'c')
    .replace(/[^a-z0-9]+/g, '_').replace(/^_+|_+$/g, '');

interface NewEntityForm {
  name: string;
  type: string;
  parentPath: string;
}

interface EditEntityForm {
  id: string;
  name: string;
  type: string;
  path: string;
}

export default function AuditUniversePage() {
 const navigate = useNavigate();
 const queryClient = useQueryClient();

 const [searchTerm, setSearchTerm] = useState('');
 const [viewMode, setViewMode] = useState<'tree' | 'canvas' | 'neural'>('tree');
 const [selectedEntity, setSelectedEntity] = useState<AuditEntityLive | null>(null);
 const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
 const [showBulkModal, setShowBulkModal] = useState(false);
 const [isBulkCreating, setIsBulkCreating] = useState(false);
 const [showNewEntityModal, setShowNewEntityModal] = useState(false);
 const [newEntityForm, setNewEntityForm] = useState<NewEntityForm>({ name: '', type: 'UNIT', parentPath: '' });
 const [showParentPicker, setShowParentPicker] = useState(false);
 const [parentSearch, setParentSearch] = useState('');
 const [customTypes, _setCustomTypes] = useState<{ key: string; label: string; desc: string; color: string; bgColor: string }[]>([]);
 const [_showAddTypeInput, _setShowAddTypeInput] = useState(false);
 const [_newTypeInput, _setNewTypeInput] = useState('');
 const [editingEntity, setEditingEntity] = useState<EditEntityForm | null>(null);
 const [expandedPaths, setExpandedPaths] = useState<Set<string>>(new Set());
 const [expandedGroups, setExpandedGroups] = useState<Set<string>>(new Set());
 const [isImporting, setIsImporting] = useState(false);
 const [isEditMode, setIsEditMode] = useState(false);

 // API Çağrısı artık Entities katmanından geliyor!
 const { data: liveUniverse, isLoading, error: universeError } = useAuditUniverseLive();
 const universe = liveUniverse ?? [];
 const createEntity = useCreateEntity();
 const updateEntity = useUpdateEntity();
 const deleteEntity = useDeleteEntity();
 const bulkCreateEntities = useBulkCreateEntities();

 const allEntityTypes = [...BASE_ENTITY_TYPES, ...customTypes];


 const handleUpdateEntity = async (e: React.FormEvent) => {
  e.preventDefault();
  if (!editingEntity) return;
  try {
   await updateEntity.mutateAsync({ id: editingEntity.id, name: editingEntity.name, type: editingEntity.type as EntityType, path: editingEntity.path });
   toast.success(`"${editingEntity.name}" güncellendi.`);
   setEditingEntity(null);
  } catch (err: unknown) {
   toast.error(`Hata: ${err instanceof Error ? err.message : 'Bilinmeyen hata'}`);
  }
 };

 const handleDeleteEntity = async () => {
  if (!editingEntity) return;
  if (!window.confirm(`"${editingEntity.name}" varlığını silmek istediğinizden emin misiniz? Bu işlem geri alınamaz.`)) return;
  try {
   await deleteEntity.mutateAsync(editingEntity.id);
   toast.success(`"${editingEntity.name}" silindi.`);
   setEditingEntity(null);
  } catch (err: unknown) {
   toast.error(`Hata: ${err instanceof Error ? err.message : 'Bilinmeyen hata'}`);
  }
 };

 const handleBulkDelete = async () => {
  const ids = Array.from(selectedIds);
  if (ids.length === 0) return;
  if (!window.confirm(`${ids.length} varlığı silmek istediğinizden emin misiniz? Bu işlem geri alınamaz.`)) return;
  try {
   await Promise.all(ids.map(id => deleteEntity.mutateAsync(id)));
   toast.success(`${ids.length} varlık silindi.`);
   setSelectedIds(new Set());
  } catch (err: unknown) {
   toast.error(`Hata: ${err instanceof Error ? err.message : 'Bilinmeyen hata'}`);
  }
 };

 const handleDownloadTemplate = () => {
   const header = 'name,type,path,risk_score';
   const examples = [
     'Kurumsal Bankacılık Direktörlüğü,UNIT,bank.corporate_banking,60',
     'Hazine Bölümü,UNIT,bank.treasury,75',
     'Bireysel Bankacılık,UNIT,bank.retail,50',
   ].join('\n');
   const csv = `${header}\n${examples}`;
   const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
   const url = URL.createObjectURL(blob);
   const a = document.createElement('a');
   a.href = url;
   a.download = 'denetim_evreni_sablon.csv';
   a.click();
   URL.revokeObjectURL(url);
 };

 const handleExcelUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
   const file = e.target.files?.[0];
   if (!file) return;
   e.target.value = '';

   setIsImporting(true);
   const toastId = toast.loading('Dosya okunuyor...');
   try {
     const text = await file.text();
     const lines = text.split('\n').map(l => l.trim()).filter(Boolean);
     if (lines.length < 2) throw new Error('Dosyada veri satırı bulunamadı.');

     const headers = lines[0].split(',').map(h => h.trim().toLowerCase().replace(/"/g, ''));
     const nameIdx = headers.indexOf('name');
     const typeIdx = headers.indexOf('type');
     const pathIdx = headers.indexOf('path');
     const riskIdx = headers.indexOf('risk_score');

     if (nameIdx === -1 || pathIdx === -1) throw new Error('CSV\'de "name" ve "path" sütunları zorunludur.');

     const rows = lines.slice(1).map(line => {
       const cols = line.split(',').map(c => c.trim().replace(/"/g, ''));
       return {
         name: cols[nameIdx] || '',
         type: (typeIdx >= 0 ? cols[typeIdx] : 'UNIT') || 'UNIT',
         path: cols[pathIdx] || '',
         risk_score: riskIdx >= 0 ? Number(cols[riskIdx]) || 50 : 50,
       };
     }).filter(r => r.name && r.path);

     if (rows.length === 0) throw new Error('Geçerli satır bulunamadı. name ve path alanları dolu olmalıdır.');

     await bulkCreateEntities.mutateAsync(rows);
     toast.dismiss(toastId);
     toast.success(`${rows.length} varlık başarıyla eklendi.`, { duration: 4000 });
   } catch (err: unknown) {
     toast.dismiss(toastId);
     toast.error(`Hata: ${err instanceof Error ? err.message : 'Bilinmeyen hata'}`);
   } finally {
     setIsImporting(false);
   }
 };

 const { rwaScore, rwaGrade, rwaOpinion, totalWeight, cappedCount } = useMemo(() => {
 let weightedSum = 0; let weightTotal = 0; let caps = 0;
 universe.forEach(e => {
 const { finalScore, vetoReason } = calculateEntityGrade(e as unknown as EntityGradeInput);
 weightedSum += (finalScore * e.weight);
 weightTotal += e.weight;
 if (vetoReason) caps++;
 });
 const score = weightTotal > 0 ? (weightedSum / weightTotal) : 0;
 const gradeData = GRADING_THRESHOLDS.find(g => score >= g.min) || GRADING_THRESHOLDS[GRADING_THRESHOLDS.length - 1];
 return { rwaScore: score.toFixed(2), rwaGrade: gradeData.grade, rwaOpinion: gradeData.opinion, totalWeight: weightTotal, cappedCount: caps };
 }, [universe]);

 const filteredUniverse = (universe || []).filter(e =>
 e.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
 e.path.toLowerCase().includes(searchTerm.toLowerCase())
 );

 const toggleSelect = (id: string) => {
 setSelectedIds(prev => {
 const next = new Set(prev);
 if (next.has(id)) next.delete(id);
 else next.add(id);
 return next;
 });
 };

 const toggleSelectAll = () => {
 if (selectedIds.size === filteredUniverse.length) {
 setSelectedIds(new Set());
 } else {
 setSelectedIds(new Set((filteredUniverse || []).map(e => e.id)));
 }
 };

 const handleBulkCreate = async () => {
 if (selectedIds.size === 0) return;
 setIsBulkCreating(true);
 const toastId = toast.loading(`${selectedIds.size} varlık için denetim görevleri oluşturuluyor...`);
 try {
 const planId = await getDefaultPlanId();
 const result = await createEngagementsFromEntities({
 entity_ids: Array.from(selectedIds),
 plan_id: planId,
 year: new Date().getFullYear(),
 });

 toast.dismiss(toastId);
 if (result.success) {
 toast.success(
 `${result.created_count} denetim görevi oluşturuldu! Toplam tahmini saat: ${result.summary.total_hours}`,
 { duration: 5000 }
 );
 queryClient.invalidateQueries({ queryKey: ['audit-engagements-list'] });
 setSelectedIds(new Set());
 setShowBulkModal(false);
 navigate('/strategy/annual-plan');
 } else {
 toast.error('Bazı görevler oluşturulamadı.');
 }
 } catch (err: unknown) {
 toast.dismiss(toastId);
 toast.error(`Hata: ${err instanceof Error ? err.message : 'Bilinmeyen hata'}`);
 } finally {
 setIsBulkCreating(false);
 }
 };

 const computedPath = (() => {
  const slug = toSlug(newEntityForm.name);
  if (!slug) return newEntityForm.parentPath || '';
  return newEntityForm.parentPath ? `${newEntityForm.parentPath}.${slug}` : slug;
 })();

 const handleCreateEntity = async (e: React.FormEvent) => {
  e.preventDefault();
  const finalPath = computedPath;
  if (!newEntityForm.name || !finalPath) return;
  try {
   await createEntity.mutateAsync({
    name: newEntityForm.name,
    type: newEntityForm.type as EntityType,
    path: finalPath,
    risk_score: 50,
    velocity_multiplier: 1.0,
    status: 'ACTIVE',
   });
   toast.success(`"${newEntityForm.name}" denetim evrenine eklendi.`);
   setShowNewEntityModal(false);
   setNewEntityForm({ name: '', type: 'UNIT', parentPath: '' });
   setShowParentPicker(false);
   setParentSearch('');
  } catch (err: unknown) {
   toast.error(`Hata: ${err instanceof Error ? err.message : 'Bilinmeyen hata'}`);
  }
 };

 if (isLoading) {
 return (
  <div className="flex items-center justify-center h-64 bg-canvas">
   <Loader2 className="w-8 h-8 text-slate-400 animate-spin" />
  </div>
 );
 }

 if (universeError) {
 return (
  <div className="flex flex-col items-center justify-center h-64 bg-canvas gap-3">
   <AlertTriangle className="w-8 h-8 text-red-400" />
   <div className="text-sm text-red-600 font-medium">Veri yüklenemedi</div>
   <div className="text-xs text-slate-400 font-mono max-w-md text-center">{(universeError as {message?:string})?.message ?? String(universeError)}</div>
  </div>
 );
 }

 const selectedEntities = (universe || []).filter(e => selectedIds.has(e.id));

 return (
 <div className="w-full px-4 sm:px-4 lg:px-4 py-5 space-y-4 bg-canvas min-h-screen font-sans">

 {/* HEADER */}
 <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
 <PageHeader
 title="Denetim Evreni (Audit Universe)"
 description="KERD-2026 Çerçevesi & IIA 2024: Kısıt Bazlı Kesinti Modeli ve RWA Konsolidasyonu"
 icon={Building2}
 />
 <div className="flex items-center gap-3">
 <button
 onClick={() => navigate('/strategy/annual-plan')}
 className="flex items-center gap-2 px-4 py-2.5 bg-surface border border-slate-300 text-slate-700 rounded-lg hover:bg-slate-50 transition-colors font-medium shadow-sm text-sm"
 >
 <CalendarPlus size={16} />
 Stratejik Plan
 <ArrowRight size={14} className="text-slate-400" />
 </button>

 {/* Apple Glass 3-lü Görünüm Değiştirici */}
 <div className="flex p-1 bg-surface border border-slate-200/60 rounded-xl shadow-sm">
 {(
 [
 { mode: 'tree', Icon: ListTree, label: 'Tablo Görünümü' },
 { mode: 'canvas', Icon: Workflow, label: 'Süreç Kanvası' },
 { mode: 'neural', Icon: Radar, label: 'Bulaşıcılık Radarı' },
 ] as const
 ).map(({ mode, Icon, label }) => (
 <button
 key={mode}
 onClick={() => setViewMode(mode)}
 className={clsx(
 'flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all duration-150',
 viewMode === mode
 ? 'bg-blue-600 text-white shadow-md'
 : 'text-slate-500 hover:text-slate-800 hover:bg-slate-50',
 )}
 >
 <Icon className="w-3.5 h-3.5 shrink-0" />
 {label}
 </button>
 ))}
 </div>

 <button
 onClick={() => setShowNewEntityModal(true)}
 className="flex items-center gap-2 px-5 py-2.5 bg-slate-900 text-white rounded-lg hover:bg-slate-800 transition-colors font-medium shadow-sm"
 >
 <Plus size={18} /> Yeni Varlık Ekle
 </button>
 </div>
 </div>

 {/* KPI CARDS */}
 <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} className="grid grid-cols-1 xl:grid-cols-3 gap-4">
 <div className="bg-gradient-to-br from-slate-900 to-slate-800 rounded-xl p-4 shadow-md border border-slate-700 relative overflow-hidden flex flex-col justify-between">
 <div className="absolute -right-6 -top-6 text-white/5"><Scale size={160} /></div>
 <div className="relative z-10">
 <h2 className="text-slate-300 text-xs font-bold uppercase tracking-widest mb-1 flex items-center gap-2">
 <ShieldCheck size={16} className="text-emerald-400"/> Banka Geneli Güvence
 </h2>
 <p className="text-slate-500 text-xs font-medium">Risk Ağırlıklı Ortalama (RWA)</p>
 </div>
 <div className="mt-3 flex items-end gap-4 relative z-10">
 <div className="text-6xl font-black text-white tracking-tighter">{rwaScore}</div>
 <div className="mb-2">
 <div className={clsx("inline-flex px-2.5 py-0.5 rounded text-sm font-bold border", Number(rwaScore) < 50 ? 'bg-fuchsia-900/50 text-fuchsia-300 border-fuchsia-800' : Number(rwaScore) < 70 ? 'bg-orange-500/20 text-orange-400 border-orange-500/30' : 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30')}>
 {rwaGrade}
 </div>
 <div className="text-sm text-slate-300 mt-1 font-medium">{rwaOpinion}</div>
 </div>
 </div>
 </div>

 <div className="xl:col-span-2 bg-gradient-to-br from-slate-800 to-slate-900 rounded-xl p-4 shadow-md border border-slate-700/50 flex flex-col justify-center relative overflow-hidden">
 <div className="absolute -right-20 -bottom-20 w-64 h-64 bg-blue-500 rounded-full opacity-10 blur-3xl pointer-events-none"></div>
 <div className="flex items-start gap-4 relative z-10">
 <div className="p-3 bg-blue-500/20 rounded-xl border border-blue-500/30 shrink-0"><BrainCircuit className="w-6 h-6 text-blue-300" /></div>
 <div className="flex-1">
 <div className="flex items-center justify-between mb-2">
 <h3 className="text-blue-200 font-bold flex items-center gap-2">
 Sentinel AI Stratejik Gözlem
 {Number(rwaScore) < 60 && <span className="px-2 py-0.5 bg-rose-500/20 text-rose-300 text-[10px] rounded-full border border-rose-500/30 uppercase tracking-wide animate-pulse">Sistemik Risk Uyarısı</span>}
 </h3>
 <div className="text-xs text-blue-300/70 font-mono flex items-center gap-2"><span>Aktif Veto: {cappedCount}</span><span>|</span><span>Toplam Ağırlık: {totalWeight.toFixed(1)}</span></div>
 </div>
 <p className="text-slate-300 text-sm leading-relaxed">
 Aritmetik ortalamalar yanıltıcıdır. <strong>Hazine Bölümü (Risk Ağırlığı: 10.0)</strong> tarafındaki <em>Şer'i İhlal Vetosu</em> ve <strong>IT Bölümündeki</strong> <em>Yüksek Hacim Tavanı</em>, Banka Genel RWA Puanını <strong className="text-rose-400">{rwaScore} ({rwaOpinion})</strong> seviyesine çekmiştir. Yönetim Kurulu'na acil durum raporlaması önerilir.
 </p>
 </div>
 </div>
 </div>
 </motion.div>

 {/* INFO BANNER */}
 <div className="bg-blue-50 border border-blue-100 rounded-lg p-4 flex items-start gap-3 shadow-sm">
 <Info className="w-5 h-5 text-blue-600 mt-0.5 flex-shrink-0" />
 <div className="text-sm text-blue-900 leading-relaxed"><strong>Kısıt Bazlı Kesinti Modeli (IIA Std 14.5):</strong> Doğrusal puanlama reddedilmiştir. Bir varlığın ham puanı yüksek olsa dahi, <em>Kritik Bulgu Varlığı</em> (Max D), <em>Yüksek Hacim</em> (Max C) veya <em>Şer'i İhlal</em> (Sıfırlama) gibi kurallar Nihai Notu ezer. Varlıkları seçip denetim görevine dönüştürebilirsiniz.</div>
 </div>

 {/* CANVAS VIEW */}
 {viewMode === 'canvas' && (
 <div className="h-[700px] w-full animate-in fade-in zoom-in-95 duration-500 rounded-2xl overflow-hidden border border-slate-200/80 shadow-sm">
 <ProcessFlowEditor />
 </div>
 )}

 {/* NEURAL / RADAR VIEW */}
 {viewMode === 'neural' && (
 <div className="h-[700px] w-full animate-in fade-in zoom-in-95 duration-500">
 <RiskContagionRadar />
 </div>
 )}

 {/* TABLE */}
 {viewMode === 'tree' && (
 <>
 <div className="bg-surface rounded-xl shadow-sm border border-slate-200 overflow-hidden flex flex-col">
 <div className="p-4 border-b border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-surface">
 <div className="flex items-center gap-3">
 <div className="relative max-w-md w-full">
 <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4" />
 <input
 type="text"
 placeholder="Varlık adı veya yoluna göre filtrele..."
 className="w-full pl-9 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-md text-sm focus:outline-none focus:bg-white focus:border-blue-500 transition-all"
 value={searchTerm}
 onChange={(e) => setSearchTerm(e.target.value)}
 />
 </div>
 {selectedIds.size > 0 && !isEditMode && (
 <div className="flex items-center gap-2 px-3 py-2 bg-blue-50 border border-blue-200 rounded-lg text-blue-700 text-sm font-semibold">
 <CheckSquare size={16} />
 {selectedIds.size} varlık seçildi
 </div>
 )}
 </div>
 <div className="flex items-center gap-2">
 {isEditMode && selectedIds.size > 0 && (
  <button
   onClick={handleBulkDelete}
   className="flex items-center gap-2 px-4 py-2 bg-red-600 text-white rounded-lg text-sm font-semibold hover:bg-red-700 transition-colors shadow-sm"
  >
   <Trash2 size={16} />
   Seçilenleri Sil ({selectedIds.size})
  </button>
 )}
 {!isEditMode && selectedIds.size > 0 && (
 <button
 onClick={() => setShowBulkModal(true)}
 className="flex items-center gap-2 px-4 py-2 bg-emerald-600 text-white rounded-lg text-sm font-semibold hover:bg-emerald-700 transition-colors shadow-sm"
 >
 <CalendarPlus size={16} />
 Denetim Planla ({selectedIds.size})
 </button>
 )}
 <button
 onClick={() => { setIsEditMode(v => !v); setSelectedIds(new Set()); }}
 className={`flex items-center gap-2 px-3 py-2 rounded-md text-sm font-medium transition-colors shadow-sm border ${isEditMode ? 'bg-red-50 border-red-200 text-red-700 hover:bg-red-100' : 'bg-surface border-slate-200 text-slate-600 hover:bg-slate-50'}`}
 title="Düzenleme modunu aç/kapat"
>
 <Pencil size={16} /> {isEditMode ? 'Düzenleme Modu' : 'Düzenle'}
</button>
 <button className="flex items-center gap-2 px-3 py-2 bg-surface border border-slate-200 text-slate-600 rounded-md text-sm font-medium hover:bg-slate-50 transition-colors shadow-sm">
 <Filter size={16} /> Detaylı Filtre
 </button>
 <button
  onClick={handleDownloadTemplate}
  className="flex items-center gap-2 px-3 py-2 bg-surface border border-slate-200 text-slate-600 rounded-md text-sm font-medium hover:bg-slate-50 transition-colors shadow-sm"
  title="CSV şablonunu indir (Excel'de açılır)"
 >
  <Download size={16} /> Şablon İndir
 </button>
 <label
  className={`flex items-center gap-2 px-3 py-2 bg-emerald-50 border border-emerald-200 text-emerald-700 rounded-md text-sm font-medium hover:bg-emerald-100 transition-colors shadow-sm cursor-pointer ${isImporting ? 'opacity-50 pointer-events-none' : ''}`}
  title="CSV dosyasından toplu varlık yükle"
 >
  {isImporting ? <Loader2 size={16} className="animate-spin" /> : <Upload size={16} />}
  {isImporting ? 'Yükleniyor...' : 'Excel / CSV Yükle'}
  <input
   type="file"
   accept=".csv,.txt"
   className="hidden"
   onChange={handleExcelUpload}
   disabled={isImporting}
  />
 </label>
 </div>
 </div>

 <div className="overflow-x-auto">
 <table className="w-full text-left text-sm whitespace-nowrap">
 <thead className="bg-slate-50 text-slate-600 font-semibold uppercase tracking-wider text-[11px] border-b border-slate-200">
 <tr>
  <th className="px-2 py-3 w-8">
   <button onClick={toggleSelectAll} className="text-slate-400 hover:text-slate-700 transition-colors">
    {selectedIds.size === filteredUniverse.length && filteredUniverse.length > 0 ? <CheckSquare size={14} className="text-blue-600" /> : <Square size={14} />}
   </button>
  </th>
  <th className="px-3 py-3">Birim / Varlık</th>
  <th className="px-3 py-3 text-center w-16">Ağırlık</th>
  <th className="px-3 py-3 text-center w-20">Ham / Nihai</th>
  <th className="px-3 py-3 text-center w-12">Not</th>
  <th className="px-3 py-3 w-36">Güvence</th>
  <th className="px-3 py-3 text-center w-24" title="Bordo/Kızıl/Turuncu/Sarı">Bulgular</th>
  <th className="px-2 py-3 text-right w-16">{isEditMode ? 'Sil' : ''}</th>
 </tr>
</thead>
 <tbody className="text-slate-800">
 {(() => {
  // Build virtual tree from filteredUniverse
  interface TNode {
   path: string;
   label: string;
   entity?: typeof filteredUniverse[0];
   children: TNode[];
  }
  const nodeMap = new Map<string, TNode>();
  const getNode = (path: string): TNode => {
   if (!nodeMap.has(path)) nodeMap.set(path, { path, label: path.split('.').pop() || path, children: [] });
   return nodeMap.get(path)!;
  };
  filteredUniverse.forEach(e => {
   const node = getNode(e.path);
   node.entity = e;
   node.label = e.name;
   const parts = e.path.split('.');
   for (let i = 1; i < parts.length; i++) {
    const anc = parts.slice(0, i).join('.');
    getNode(anc);
   }
  });
  nodeMap.forEach(node => {
   const parts = node.path.split('.');
   if (parts.length > 1) {
    const parentPath = parts.slice(0, -1).join('.');
    const parent = getNode(parentPath);
    if (!parent.children.find(ch => ch.path === node.path)) parent.children.push(node);
   }
  });
  nodeMap.forEach(node => node.children.sort((a, b) => a.path.localeCompare(b.path)));
  const roots = Array.from(nodeMap.values()).filter(n => !n.path.includes('.')).sort((a, b) => a.path.localeCompare(b.path));

  const collectLeaves = (node: TNode): typeof filteredUniverse => {
   if (node.children.length === 0 && node.entity) return [node.entity];
   return node.children.flatMap(ch => collectLeaves(ch));
  };

  const toggleGroup = (path: string) => setExpandedGroups(prev => {
   const next = new Set(prev); next.has(path) ? next.delete(path) : next.add(path); return next;
  });

  const CAT_COLORS: Record<string, { grpBg: string; grpBorder: string; grpText: string; grpHover: string; chevron: string; rowBorder: string; dot: string }> = {
    org:  { grpBg: 'bg-sky-50',     grpBorder: 'border-sky-200',    grpText: 'text-sky-800',    grpHover: 'hover:bg-sky-100/70',    chevron: 'text-sky-500',    rowBorder: 'border-l-sky-300',    dot: 'bg-sky-500' },
    proc: { grpBg: 'bg-amber-50',   grpBorder: 'border-amber-200',  grpText: 'text-amber-800',  grpHover: 'hover:bg-amber-100/70',  chevron: 'text-amber-500',  rowBorder: 'border-l-amber-300',  dot: 'bg-amber-500' },
    prod: { grpBg: 'bg-emerald-50', grpBorder: 'border-emerald-200',grpText: 'text-emerald-800',grpHover: 'hover:bg-emerald-100/70',chevron: 'text-emerald-500',rowBorder: 'border-l-emerald-300',dot: 'bg-emerald-500' },
    sub:  { grpBg: 'bg-rose-50',    grpBorder: 'border-rose-200',   grpText: 'text-rose-800',   grpHover: 'hover:bg-rose-100/70',   chevron: 'text-rose-500',   rowBorder: 'border-l-rose-300',   dot: 'bg-rose-500' },
    tp:   { grpBg: 'bg-violet-50',  grpBorder: 'border-violet-200', grpText: 'text-violet-800', grpHover: 'hover:bg-violet-100/70', chevron: 'text-violet-500', rowBorder: 'border-l-violet-300', dot: 'bg-violet-500' },
   };
   const getCatColor = (path: string) => CAT_COLORS[path.split('.')[0]] ?? { grpBg: 'bg-slate-50', grpBorder: 'border-slate-200', grpText: 'text-slate-700', grpHover: 'hover:bg-slate-100', chevron: 'text-slate-400', rowBorder: 'border-l-slate-300', dot: 'bg-slate-400' };

   const renderNode = (node: TNode, depth: number): React.ReactNode => {
   const isGroup = node.children.length > 0;
   const isGrpExpanded = expandedGroups.has(node.path);
   const indent = depth * 18;
   const col = getCatColor(node.path);

   if (isGroup) {
    const leaves = collectLeaves(node);
    const grades = leaves.map(e => calculateEntityGrade(e as unknown as EntityGradeInput));
    const avgScore = leaves.length > 0 ? grades.reduce((s, g) => s + g.finalScore, 0) / leaves.length : 0;
    const totalB = leaves.reduce((s, e) => s + e.findings.bordo, 0);
    const totalK = leaves.reduce((s, e) => s + e.findings.kizil, 0);
    const totalT = leaves.reduce((s, e) => s + e.findings.turuncu, 0);
    const totalS = leaves.reduce((s, e) => s + e.findings.sari, 0);
    const avgGradeColor = avgScore >= 85 ? 'text-emerald-700 bg-emerald-50 border-emerald-300' : avgScore >= 70 ? 'text-blue-700 bg-blue-50 border-blue-300' : avgScore >= 55 ? 'text-amber-700 bg-amber-50 border-amber-300' : 'text-red-700 bg-red-50 border-red-300';
    const avgGradeLetter = avgScore >= 85 ? 'A' : avgScore >= 70 ? 'B' : avgScore >= 55 ? 'C' : 'D';
    // Root-level rows slightly bolder background
    const rowBg = depth === 0 ? col.grpBg + ' border-b ' + col.grpBorder : 'bg-white/60 border-b ' + col.grpBorder + '/50';
    return (
     <React.Fragment key={node.path}>
      <tr className={`${rowBg} ${col.grpHover} cursor-pointer transition-colors`} onClick={() => toggleGroup(node.path)}>
       <td className="px-2 py-2.5" onClick={e => e.stopPropagation()}>
        <button onClick={() => {}} className="opacity-0 pointer-events-none"><Square size={14} /></button>
       </td>
       <td className="px-3 py-2.5" style={{ paddingLeft: (12 + indent) + 'px' }}>
        <div className="flex items-center gap-2">
         {depth === 0 && <span className={`w-2 h-2 rounded-full flex-shrink-0 ${col.dot}`} />}
         <ChevronRight size={14} className={`${col.chevron} transition-transform flex-shrink-0 ${isGrpExpanded ? 'rotate-90' : ''}`} />
         <div>
          <div className={`font-bold text-sm ${depth === 0 ? col.grpText : 'text-slate-700'}`}>{node.label}</div>
          <div className="text-[10px] text-slate-400 font-mono">{node.path} · {leaves.length} varlık</div>
         </div>
        </div>
       </td>
       <td className="px-3 py-2.5 text-center"><span className="text-[10px] text-slate-400">—</span></td>
       <td className="px-3 py-2.5 text-center">
        <span className={`font-mono text-xs font-bold ${depth === 0 ? col.grpText : 'text-slate-600'}`}>{avgScore.toFixed(1)}</span>
        <div className="text-[9px] text-slate-400">ort.</div>
       </td>
       <td className="px-3 py-2.5 text-center">
        <span className={`inline-flex items-center justify-center w-7 h-7 rounded font-bold border text-xs ${avgGradeColor}`}>{avgGradeLetter}</span>
       </td>
       <td className="px-3 py-2.5"><span className="text-[10px] text-slate-400">{leaves.length} birim ortalaması</span></td>
       <td className="px-3 py-2.5">
        <div className="flex items-center justify-center gap-0.5 font-mono text-[10px]">
         <span className={`w-5 h-5 flex items-center justify-center rounded font-bold border ${totalB > 0 ? 'bg-fuchsia-950 text-white border-fuchsia-900' : 'bg-slate-50 text-slate-300 border-slate-200'}`}>{totalB}</span>
         <span className={`w-5 h-5 flex items-center justify-center rounded font-bold border ${totalK > 0 ? 'bg-red-600 text-white border-red-700' : 'bg-slate-50 text-slate-300 border-slate-200'}`}>{totalK}</span>
         <span className={`w-5 h-5 flex items-center justify-center rounded font-bold border ${totalT > 0 ? 'bg-orange-500 text-white border-orange-600' : 'bg-slate-50 text-slate-300 border-slate-200'}`}>{totalT}</span>
         <span className={`w-5 h-5 flex items-center justify-center rounded font-bold border ${totalS > 0 ? 'bg-yellow-400 text-slate-900 border-yellow-500' : 'bg-slate-50 text-slate-300 border-slate-200'}`}>{totalS}</span>
        </div>
       </td>
       <td className="px-2 py-2.5 text-right">
        <ChevronRight size={14} className={`${col.chevron} transition-transform ${isGrpExpanded ? 'rotate-90' : ''}`} />
       </td>
      </tr>
      {isGrpExpanded && node.children.map(ch => renderNode(ch, depth + 1))}
     </React.Fragment>
    );
   }

   // Leaf entity row
   const entity = node.entity!;
   if (!entity) return null;
   const { rawScore, finalScore, vetoReason, grade, opinion, color } = calculateEntityGrade(entity as unknown as EntityGradeInput);
   const isCapped = rawScore !== finalScore;
   const isSelected = selectedIds.has(entity.id);
   const isDetailOpen = selectedEntity?.id === entity.id;

   return (
    <React.Fragment key={entity.id}>
     <tr
      className={clsx("border-b border-slate-100 border-l-2 hover:bg-slate-50/80 transition-colors group cursor-pointer", col.rowBorder, isSelected ? "bg-blue-50" : "bg-surface", isDetailOpen ? "bg-slate-50/60" : "")}
      onClick={() => setSelectedEntity(isDetailOpen ? null : entity)}
     >
      <td className="px-2 py-2.5" onClick={e => e.stopPropagation()}>
       <button onClick={() => toggleSelect(entity.id)} className="text-slate-400 hover:text-blue-600 transition-colors">
        {isSelected ? <CheckSquare size={14} className="text-blue-600" /> : <Square size={14} />}
       </button>
      </td>
      <td className="px-3 py-2.5" style={{ paddingLeft: (12 + indent + 18) + 'px' }}>
       <div className="flex items-center gap-2">
        <div className={clsx("w-7 h-7 rounded flex items-center justify-center text-white flex-shrink-0 text-[10px] font-bold shadow-sm", entity.type === 'BRANCH' ? 'bg-amber-600' : entity.type === 'IT_ASSET' ? 'bg-slate-600' : entity.type === 'PROCESS' ? 'bg-orange-500' : 'bg-emerald-500')}>
         {entity.type === 'IT_ASSET' ? <Server size={12} /> : <Building2 size={12} />}
        </div>
        <div className="min-w-0">
         <div className="font-semibold text-slate-900 text-sm truncate group-hover:text-blue-700 transition-colors">{entity.name}</div>
         <div className="text-[10px] text-slate-400 font-mono truncate">{entity.path}</div>
        </div>
       </div>
      </td>
      <td className="px-3 py-2.5 text-center">
       <span className="inline-flex items-center justify-center px-1.5 py-0.5 rounded bg-slate-100 text-slate-700 font-mono text-[11px] font-bold">{entity.weight.toFixed(1)}x</span>
      </td>
      <td className="px-3 py-2.5 text-center">
       <div className="flex flex-col items-center">
        <span className={clsx("font-mono text-xs font-medium", isCapped ? "line-through text-slate-300" : "text-slate-500")}>{rawScore.toFixed(1)}</span>
        <span className="font-mono text-xs font-bold text-slate-800">{finalScore.toFixed(1)}</span>
       </div>
      </td>
      <td className="px-3 py-2.5 text-center">
       <span className={clsx("inline-flex items-center justify-center w-7 h-7 rounded font-bold border text-xs shadow-sm", color)}>{grade}</span>
      </td>
      <td className="px-3 py-2.5">
       <div className="text-xs font-medium text-slate-700 leading-tight truncate max-w-[140px]" title={opinion}>{opinion}</div>
       {vetoReason && <div className="text-[9px] text-red-600 font-bold truncate">{vetoReason}</div>}
      </td>
      <td className="px-3 py-2.5">
       <div className="flex items-center justify-center gap-0.5 font-mono text-[10px]">
        <span className={clsx("w-5 h-5 flex items-center justify-center rounded font-bold border", entity.findings.bordo > 0 ? "bg-fuchsia-950 text-white border-fuchsia-900" : "bg-slate-50 text-slate-300 border-slate-200")}>{entity.findings.bordo}</span>
        <span className={clsx("w-5 h-5 flex items-center justify-center rounded font-bold border", entity.findings.kizil > 0 ? "bg-red-600 text-white border-red-700" : "bg-slate-50 text-slate-300 border-slate-200")}>{entity.findings.kizil}</span>
        <span className={clsx("w-5 h-5 flex items-center justify-center rounded font-bold border", entity.findings.turuncu > 0 ? "bg-orange-500 text-white border-orange-600" : "bg-slate-50 text-slate-300 border-slate-200")}>{entity.findings.turuncu}</span>
        <span className={clsx("w-5 h-5 flex items-center justify-center rounded font-bold border", entity.findings.sari > 0 ? "bg-yellow-400 text-slate-900 border-yellow-500" : "bg-slate-50 text-slate-300 border-slate-200")}>{entity.findings.sari}</span>
       </div>
      </td>
      <td className="px-2 py-2.5 text-right" onClick={e => e.stopPropagation()}>
       {isEditMode ? (
        <button
         onClick={(e) => { e.stopPropagation(); if (window.confirm(`"${entity.name}" silinsin mi?`)) deleteEntity.mutateAsync(entity.id).then(() => toast.success(`"${entity.name}" silindi.`)).catch(() => toast.error('Silme hatası')); }}
         className="w-6 h-6 inline-flex items-center justify-center rounded-full bg-red-100 text-red-600 hover:bg-red-200 transition-colors font-bold"
        >−</button>
       ) : (
        <div className="flex items-center justify-end gap-0.5">
         <button onClick={(e) => { e.stopPropagation(); setEditingEntity({ id: entity.id, name: entity.name, type: entity.type, path: entity.path }); }} className="p-1 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded transition-colors" title="Düzenle"><Pencil size={13} /></button>
         <ChevronRight size={14} className={`text-slate-400 group-hover:text-blue-500 transition-transform ${isDetailOpen ? 'rotate-90' : ''}`} />
        </div>
       )}
      </td>
     </tr>
     <AnimatePresence>
      {isDetailOpen && (
       <tr className="border-b border-slate-200">
        <td colSpan={8} className="p-0">
         <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} className="overflow-hidden">
          <div className={`p-5 grid grid-cols-1 lg:grid-cols-3 gap-4 border-t ${col.grpBorder} shadow-inner ${col.grpBg}/30`}>
           <div className="bg-surface border border-slate-200 rounded-lg p-4 shadow-sm">
            <h5 className="text-[11px] font-bold text-slate-400 uppercase tracking-widest mb-3 flex items-center gap-2"><Activity size={13} className="text-blue-500"/> Kesinti Matematiği</h5>
            <div className="space-y-2 font-mono text-sm text-slate-700">
             <div className="flex justify-between border-b border-slate-100 pb-2"><span className="text-slate-500">Başlangıç:</span><span>100.00</span></div>
             <div className="flex justify-between text-rose-600 border-b border-slate-100 pb-2"><span>Kesintiler:</span><span>-{(100 - rawScore).toFixed(2)}</span></div>
             <div className="flex justify-between font-bold pt-1 text-slate-900"><span>Ham Puan:</span><span>{rawScore.toFixed(2)}</span></div>
             {isCapped && <div className="flex justify-between font-bold text-red-700"><span>Nihai (Capped):</span><span>{finalScore.toFixed(2)}</span></div>}
            </div>
           </div>
           <div className="bg-surface border border-slate-200 rounded-lg p-4 shadow-sm">
            <h5 className="text-[11px] font-bold text-slate-400 uppercase tracking-widest mb-3 flex items-center gap-2"><Info size={13} className="text-violet-500"/> Risk Profili</h5>
            <div className="grid grid-cols-2 gap-2">
             <div className="bg-canvas rounded p-2"><div className="text-[9px] text-slate-500">Ağırlık</div><div className="font-bold text-slate-800">{entity.weight.toFixed(1)}x</div></div>
             <div className="bg-canvas rounded p-2"><div className="text-[9px] text-slate-500">Toplam Bulgu</div><div className="font-bold text-slate-800">{entity.findings.bordo+entity.findings.kizil+entity.findings.turuncu+entity.findings.sari}</div></div>
             <div className="bg-canvas rounded p-2"><div className="text-[9px] text-slate-500">Son Denetim</div><div className="text-xs font-semibold text-slate-700">{entity.lastAudit}</div></div>
             <div className="bg-canvas rounded p-2"><div className="text-[9px] text-slate-500">Şeri İhlal</div><div className={clsx("font-bold", entity.findings.shariah_systemic > 0 ? "text-fuchsia-700" : "text-slate-400")}>{entity.findings.shariah_systemic > 0 ? `${entity.findings.shariah_systemic} Tespit` : 'Yok'}</div></div>
            </div>
           </div>
           <div className="bg-surface border border-slate-200 rounded-lg p-4 shadow-sm flex flex-col justify-between">
            <div>
             <h5 className="text-[11px] font-bold text-slate-400 uppercase tracking-widest mb-3 flex items-center gap-2"><Lock size={13} className="text-slate-500"/> Veto Kararı</h5>
             {vetoReason ? (
              <div className={clsx("p-3 border rounded-lg text-xs", vetoReason.includes("Şer'i") ? "bg-fuchsia-50 border-fuchsia-200 text-fuchsia-900" : "bg-red-50 border-red-200 text-red-900")}>
               <strong>İHLAL:</strong> "{vetoReason}" sebebiyle puan {rawScore.toFixed(2)}→<strong>{finalScore.toFixed(2)} ({grade})</strong>
              </div>
             ) : (
              <div className="p-3 bg-emerald-50 border border-emerald-100 rounded-lg text-emerald-800 text-xs flex items-center gap-2">
               <ShieldCheck size={18} className="text-emerald-600 flex-shrink-0" /><div><strong>Kısıt Yok.</strong> Veto tetiklenmedi.</div>
              </div>
             )}
            </div>
            <button onClick={(e) => { e.stopPropagation(); setSelectedIds(new Set([entity.id])); setShowBulkModal(true); }} className="mt-3 flex items-center gap-2 px-3 py-2 bg-emerald-600 text-white rounded-lg text-xs font-semibold hover:bg-emerald-700 transition-colors w-full justify-center">
             <CalendarPlus size={13} />Bu Varlık için Denetim Planla
            </button>
           </div>
          </div>
         </motion.div>
        </td>
       </tr>
      )}
     </AnimatePresence>
    </React.Fragment>
   );
  };
  if (filteredUniverse.length === 0) return (
   <tr><td colSpan={8} className="px-4 py-16 text-center">
    <Building2 className="w-10 h-10 text-slate-200 mx-auto mb-3" />
    <p className="text-slate-500 font-medium">Denetim evreninde varlık bulunamadı</p>
    <p className="text-slate-400 text-xs mt-1">{universe.length === 0 ? 'Henüz varlık yok.' : 'Arama kriterlerine uyan varlık bulunamadı.'}</p>
    <p className="text-slate-300 text-xs mt-2 font-mono">Toplam DB kaydı: {universe.length}</p>
   </td></tr>
  );

  // When searching → flat list; otherwise → tree
  if (searchTerm) {
   return <>{filteredUniverse.map(entity => renderNode({ path: entity.path, label: entity.name, entity, children: [] }, 0))}</>;
  }
  return <>{roots.map(node => renderNode(node, 0))}</>;
 })()}
</tbody>
        </table>
        </div>
        </div>

        {/* RISK ZONE LEGEND */}
 <div className="bg-surface rounded-xl shadow-sm border border-slate-200 p-5">
 <h4 className="text-[11px] font-bold text-slate-400 uppercase tracking-widest mb-4 flex items-center gap-2">
 <ShieldCheck size={14} className="text-emerald-500" /> Risk Zon Eşiği (KERD-2026 Anayasa Referansı)
 </h4>
 <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
 {Object.entries(SENTINEL_CONSTITUTION.RISK.ZONES).map(([key, zone]) => (
 <div
 key={key}
 className="flex items-center gap-3 p-3 rounded-lg border-l-4"
 style={{ backgroundColor: `${zone.color}15`, borderLeftColor: zone.color }}
 >
 <div>
 <div className="font-bold text-slate-800 text-sm">{zone.label}</div>
 <div className="text-xs text-slate-500 mt-0.5 font-mono">
 Skor: {zone.min}–{zone.max}
 </div>
 </div>
 </div>
 ))}
 </div>
 <div className="mt-3 pt-3 border-t border-slate-100">
 <p className="text-[10px] text-slate-400">
 <span className="font-semibold text-slate-500">Notlandırma Skalası:</span>{' '}
 {Object.entries(SENTINEL_CONSTITUTION.GRADING.GRADE_SCALE).map(([grade, def]) => (
 <span key={grade} className="mr-3">
 <span className="font-bold text-slate-600">{grade}</span>: {def.min}–{def.max} ({def.label})
 </span>
 ))}
 </p>
 </div>
 </div>
 </>
 )}

 {/* FLOATING SELECTION BAR */}
 <AnimatePresence>
 {selectedIds.size > 0 && (
 <motion.div
 initial={{ opacity: 0, y: 60 }}
 animate={{ opacity: 1, y: 0 }}
 exit={{ opacity: 0, y: 60 }}
 className="fixed bottom-8 left-1/2 -translate-x-1/2 z-40 bg-slate-900 text-white rounded-2xl shadow-2xl px-4 py-4 flex items-center gap-4 border border-slate-700"
 >
 <div className="flex items-center gap-2 text-sm">
 <CheckSquare size={18} className="text-blue-400" />
 <span className="font-semibold">{selectedIds.size} varlık seçildi</span>
 </div>
 <div className="w-px h-6 bg-slate-700" />
 <button
 onClick={() => setShowBulkModal(true)}
 className="flex items-center gap-2 px-4 py-2 bg-emerald-500 text-white rounded-xl text-sm font-semibold hover:bg-emerald-400 transition-colors"
 >
 <Zap size={16} />
 Denetim Görevi Oluştur
 </button>
 <button
 onClick={() => setSelectedIds(new Set())}
 className="p-1.5 text-slate-400 hover:text-white hover:bg-slate-700 rounded-lg transition-colors"
 >
 <X size={16} />
 </button>
 </motion.div>
 )}
 </AnimatePresence>

 {/* BULK CREATE MODAL */}
 <AnimatePresence>
 {showBulkModal && (
 <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-4">
 <motion.div
 initial={{ opacity: 0 }}
 animate={{ opacity: 1 }}
 exit={{ opacity: 0 }}
 className="absolute inset-0 bg-black/50 backdrop-blur-sm"
 onClick={() => !isBulkCreating && setShowBulkModal(false)}
 />
 <motion.div
 initial={{ opacity: 0, scale: 0.95, y: 20 }}
 animate={{ opacity: 1, scale: 1, y: 0 }}
 exit={{ opacity: 0, scale: 0.95, y: 20 }}
 className="bg-surface rounded-2xl shadow-2xl w-full max-w-lg flex flex-col max-h-[90vh] overflow-hidden relative z-10"
 >
 <div className="flex items-center justify-between p-4 border-b border-slate-100 shrink-0">
 <div>
 <h3 className="text-xl font-bold text-primary">Denetim Görevi Oluştur</h3>
 <p className="text-sm text-slate-500 mt-1">Risk bazlı otomatik kapsam ve bütçe hesaplanır</p>
 </div>
 <button
 onClick={() => !isBulkCreating && setShowBulkModal(false)}
 className="p-2 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-lg transition-colors"
 >
 <X size={18} />
 </button>
 </div>

 <div className="p-4 overflow-y-auto flex-1 bg-canvas">
 <div className="bg-surface rounded-xl border border-slate-200 p-4 mb-5">
 <div className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-3">Seçili Varlıklar</div>
 <div className="space-y-2">
 {(selectedEntities || []).map(e => {
 const { grade, color } = calculateEntityGrade(e as unknown as EntityGradeInput);
 return (
 <div key={e.id} className="flex items-center justify-between gap-3 bg-slate-50 border border-slate-100 rounded-lg px-3 py-2">
 <div className="flex items-center gap-2">
 <Building2 size={14} className="text-slate-400" />
 <span className="text-sm font-semibold text-primary">{e.name}</span>
 <span className="text-[10px] text-slate-400 font-mono">{e.path}</span>
 </div>
 <span className={clsx("inline-flex items-center justify-center w-7 h-7 rounded font-bold border text-xs bg-surface", color)}>{grade}</span>
 </div>
 );
 })}
 </div>
 </div>

 <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 text-sm text-blue-900">
 <strong>Risk Tabanlı Kapsam:</strong> Her varlık için risk skoru, hız çarpanı ve varlık tipi dikkate alınarak tahmini saat ve denetim türü otomatik hesaplanacaktır. Görevler aktif yıllık plana eklenecektir.
 </div>
 </div>

 <div className="flex gap-3 p-4 border-t border-slate-100 shrink-0 bg-surface">
 <button
 onClick={() => !isBulkCreating && setShowBulkModal(false)}
 disabled={isBulkCreating}
 className="flex-1 px-4 py-3 text-slate-700 bg-surface border border-slate-300 rounded-xl hover:bg-canvas transition-colors font-medium disabled:opacity-50"
 >
 İptal
 </button>
 <button
 onClick={handleBulkCreate}
 disabled={isBulkCreating}
 className="flex-1 flex items-center justify-center gap-2 px-4 py-3 bg-emerald-600 text-white rounded-xl hover:bg-emerald-700 transition-colors font-semibold disabled:opacity-50"
 >
 {isBulkCreating ? (
 <><Loader2 size={16} className="animate-spin" /> Oluşturuluyor...</>
 ) : (
 <><CalendarPlus size={16} /> {selectedEntities.length} Görev Oluştur</>
 )}
 </button>
 </div>
 </motion.div>
 </div>
 )}
 </AnimatePresence>

 {/* NEW ENTITY MODAL */}
 <AnimatePresence>
  {showNewEntityModal && (
   <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
     className="absolute inset-0 bg-black/60 backdrop-blur-sm"
     onClick={() => { setShowNewEntityModal(false); setShowParentPicker(false); }}
    />
    <motion.div
     initial={{ opacity: 0, scale: 0.96, y: 16 }} animate={{ opacity: 1, scale: 1, y: 0 }}
     exit={{ opacity: 0, scale: 0.96, y: 16 }}
     className="bg-surface rounded-2xl shadow-2xl w-full max-w-lg flex flex-col max-h-[92vh] overflow-hidden relative z-10"
    >
     <div className="flex items-center justify-between px-4 py-4 bg-gradient-to-r from-slate-900 to-slate-800 rounded-t-2xl shrink-0">
      <div>
       <h3 className="text-base font-bold text-white">Yeni Denetim Varlığı</h3>
       <p className="text-slate-400 text-xs mt-0.5">Organizasyon ağacına yeni birim ekle</p>
      </div>
      <button onClick={() => { setShowNewEntityModal(false); setShowParentPicker(false); }}
       className="p-2 text-slate-400 hover:text-white hover:bg-white/10 rounded-lg transition-colors">
       <X size={16} />
      </button>
     </div>

     <form onSubmit={handleCreateEntity} className="flex flex-col flex-1 overflow-hidden">
      <div className="p-5 space-y-4 overflow-y-auto flex-1">

       {/* Kategori Seçimi */}
       <div>
        <label className="block text-xs font-bold text-slate-500 uppercase tracking-widest mb-2">Kategori</label>
        <div className="grid grid-cols-5 gap-1.5">
         {([
          { path: 'org',  label: 'Organizasyonel Yapı', short: 'Org',  type: 'UNIT',       color: 'text-blue-700',   bgColor: 'bg-blue-50 border-blue-300' },
          { path: 'proc', label: 'Süreçler',             short: 'Süreç',type: 'PROCESS',    color: 'text-orange-700', bgColor: 'bg-orange-50 border-orange-300' },
          { path: 'prod', label: 'Ürünler',              short: 'Ürün', type: 'UNIT',       color: 'text-emerald-700',bgColor: 'bg-emerald-50 border-emerald-300' },
          { path: 'sub',  label: 'İştirakler',           short: 'İştirak',type:'SUBSIDIARY',color: 'text-rose-700',   bgColor: 'bg-rose-50 border-rose-300' },
          { path: 'tp',   label: 'Üçüncü Taraflar',      short: 'Üçüncü Taraf',type:'VENDOR',color:'text-violet-700',bgColor: 'bg-violet-50 border-violet-300' },
         ] as const).map(cat => {
          const isSelected = newEntityForm.parentPath === cat.path || newEntityForm.parentPath.startsWith(cat.path + '.');
          return (
           <button key={cat.path} type="button"
            onClick={() => setNewEntityForm(f => ({ ...f, type: cat.type, parentPath: cat.path }))}
            className={"flex flex-col items-center gap-1 py-2.5 px-1 rounded-xl border-2 text-center transition-all " + (
             isSelected ? cat.bgColor + " " + cat.color + " shadow-sm" : "bg-white border-slate-200 text-slate-500 hover:border-slate-300 hover:bg-slate-50"
            )}
           >
            <span className={"text-[11px] font-bold leading-tight " + (isSelected ? cat.color : "")}>{cat.short}</span>
           </button>
          );
         })}
        </div>
       </div>

       {/* Varlık Adı */}
       <div>
        <label className="block text-xs font-bold text-slate-500 uppercase tracking-widest mb-2">Varlık Adı *</label>
        <input type="text" required value={newEntityForm.name}
         onChange={e => setNewEntityForm(f => ({ ...f, name: e.target.value }))}
         placeholder="örn. Hazine ve Fon Yönetimi Direktörlüğü"
         className="w-full px-3 py-2.5 bg-white border border-slate-200 rounded-xl text-sm focus:outline-none focus:border-blue-500 transition-all"
        />
       </div>

       {/* Üst Birim Seçici */}
       <div>
        <label className="block text-xs font-bold text-slate-500 uppercase tracking-widest mb-2">Bağlı Olduğu Üst Birim</label>
        <div className="relative">
         <button type="button" onClick={() => setShowParentPicker(v => !v)}
          className="w-full flex items-center justify-between px-3 py-2.5 bg-white border border-slate-200 rounded-xl text-sm hover:border-blue-400 transition-all"
         >
          <span className={newEntityForm.parentPath ? "text-slate-800" : "text-slate-400"}>
           {newEntityForm.parentPath
            ? (() => { const p = universe.find(e => e.path === newEntityForm.parentPath); return p ? p.name : newEntityForm.parentPath; })()
            : "Kök seviye veya üst birim seç..."}
          </span>
          <ChevronRight size={14} className={"text-slate-400 transition-transform " + (showParentPicker ? "rotate-90" : "")} />
         </button>

         {showParentPicker && (() => {
           // Build virtual node map: all entity paths + all their ancestors
           const nameMap = new Map<string, string>();
           universe.forEach(e => {
            nameMap.set(e.path, e.name);
            const parts = e.path.split('.');
            for (let i = 1; i < parts.length; i++) {
             const anc = parts.slice(0, i).join('.');
             if (!nameMap.has(anc)) nameMap.set(anc, parts[i - 1]);
            }
           });
           const getChildren = (parentPath: string) =>
            Array.from(nameMap.keys())
             .filter(p => {
              const pp = parentPath.split('.');
              const cp = p.split('.');
              return cp.length === pp.length + 1 && p.startsWith(parentPath + '.');
             })
             .sort();
           const getRoots = () =>
            Array.from(nameMap.keys()).filter(p => !p.includes('.')).sort();

           const toggleExpand = (path: string) => {
            setExpandedPaths(prev => {
             const next = new Set(prev);
             next.has(path) ? next.delete(path) : next.add(path);
             return next;
            });
           };

           const renderNode = (path: string, depth: number): React.ReactNode => {
            const label = nameMap.get(path) || path.split('.').pop() || path;
            const isSelected = newEntityForm.parentPath === path;
            const isExpanded = expandedPaths.has(path);
            const children = getChildren(path);
            const hasKids = children.length > 0;
            return (
             <React.Fragment key={path}>
              <div
               className={"flex items-center py-1.5 pr-2 transition-colors " + (isSelected ? "bg-blue-50" : "hover:bg-slate-50")}
               style={{ paddingLeft: (8 + depth * 14) + "px" }}
              >
               {hasKids ? (
                <button type="button"
                 onClick={(e) => { e.stopPropagation(); toggleExpand(path); }}
                 className="w-5 h-5 flex items-center justify-center text-slate-400 hover:text-blue-600 flex-shrink-0 mr-1 rounded hover:bg-blue-100 transition-colors"
                >
                 <ChevronRight size={10} className={"transition-transform duration-150 " + (isExpanded ? "rotate-90" : "")} />
                </button>
               ) : (
                <span className="w-6 flex-shrink-0 mr-1" />
               )}
               <button type="button"
                onClick={() => { setNewEntityForm(f => ({ ...f, parentPath: path })); setShowParentPicker(false); setParentSearch(''); }}
                className="flex-1 text-left min-w-0"
               >
                <div className={"text-xs font-semibold leading-tight truncate " + (isSelected ? "text-blue-700" : "text-slate-800")}>{label}</div>
                <div className="text-[10px] text-slate-400 font-mono truncate">{path}</div>
               </button>
              </div>
              {isExpanded && children.map(child => renderNode(child, depth + 1))}
             </React.Fragment>
            );
           };

           const searchResults = parentSearch
            ? Array.from(nameMap.entries())
               .filter(([path, name]) =>
                name.toLowerCase().includes(parentSearch.toLowerCase()) ||
                path.toLowerCase().includes(parentSearch.toLowerCase())
               )
            : null;

           return (
            <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-slate-200 rounded-xl shadow-xl z-20 flex flex-col" style={{ maxHeight: '280px' }}>
             <div className="p-2 border-b border-slate-100 shrink-0">
              <input autoFocus type="text" placeholder="Birim ara..." value={parentSearch}
               onChange={e => setParentSearch(e.target.value)}
               className="w-full px-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:border-blue-400"
              />
             </div>
             <div className="overflow-y-auto">
              <div
               onClick={() => { setNewEntityForm(f => ({ ...f, parentPath: '' })); setShowParentPicker(false); }}
               className={"flex items-center gap-2 px-3 py-2.5 cursor-pointer border-b border-slate-100 " + (!newEntityForm.parentPath ? "bg-blue-50 text-blue-700" : "hover:bg-slate-50 text-slate-500")}
              >
               <span className="text-xs font-semibold">— Kök Seviye</span>
              </div>
              {searchResults
               ? searchResults.map(([path, name]) => {
                  const isSelected = newEntityForm.parentPath === path;
                  return (
                   <div key={path}
                    onClick={() => { setNewEntityForm(f => ({ ...f, parentPath: path })); setShowParentPicker(false); setParentSearch(''); }}
                    className={"flex items-start gap-1 px-3 py-2 cursor-pointer transition-colors " + (isSelected ? "bg-blue-50" : "hover:bg-slate-50")}
                   >
                    <div className="min-w-0">
                     <div className={"text-xs font-semibold " + (isSelected ? "text-blue-700" : "text-slate-800")}>{name}</div>
                     <div className="text-[10px] text-slate-400 font-mono">{path}</div>
                    </div>
                   </div>
                  );
                 })
               : getRoots().map(path => renderNode(path, 0))
              }
             </div>
            </div>
           );
          })()}
        </div>
       </div>

       {/* Path Preview */}
       <div className={"rounded-xl px-4 py-3 border transition-all " + (computedPath ? "bg-emerald-50 border-emerald-200" : "bg-slate-50 border-dashed border-slate-200")}>
        <div className="text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-1.5">Organizasyon Yolu (Otomatik)</div>
        <div className="font-mono text-xs font-semibold text-slate-700 flex flex-wrap items-center gap-0.5">
         {computedPath
          ? computedPath.split('.').map((seg, i, arr) => (
            <span key={i} className="flex items-center gap-0.5">
             {i > 0 && <span className="text-slate-300 mx-0.5">›</span>}
             <span className={i === arr.length - 1 ? "bg-blue-100 text-blue-700 px-1.5 py-0.5 rounded" : "text-slate-500"}>{seg}</span>
            </span>
           ))
          : <span className="text-slate-400 italic font-normal">Varlık adını girin, yol otomatik oluşur</span>
         }
        </div>
       </div>

      </div>

      <div className="flex gap-2 px-5 py-4 border-t border-slate-100 bg-slate-50 rounded-b-2xl shrink-0">
       <button type="button" onClick={() => { setShowNewEntityModal(false); setShowParentPicker(false); }}
        className="flex-1 px-4 py-2.5 text-slate-700 bg-white border border-slate-300 rounded-xl hover:bg-slate-50 transition-colors font-medium text-sm">
        İptal
       </button>
       <button type="submit" disabled={createEntity.isPending || !newEntityForm.name || !computedPath}
        className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 bg-slate-900 text-white rounded-xl hover:bg-slate-800 transition-colors font-semibold text-sm disabled:opacity-40"
       >
        {createEntity.isPending ? <Loader2 size={14} className="animate-spin" /> : <Plus size={14} />}
        {createEntity.isPending ? "Ekleniyor..." : "Varlığı Ekle"}
       </button>
      </div>
     </form>
    </motion.div>
   </div>
  )}
 </AnimatePresence>

 {/* EDIT ENTITY MODAL */}
 <AnimatePresence>
  {editingEntity && (
   <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
     className="absolute inset-0 bg-black/60 backdrop-blur-sm"
     onClick={() => setEditingEntity(null)}
    />
    <motion.div
     initial={{ opacity: 0, scale: 0.96, y: 16 }} animate={{ opacity: 1, scale: 1, y: 0 }}
     exit={{ opacity: 0, scale: 0.96, y: 16 }}
     className="bg-surface rounded-2xl shadow-2xl w-full max-w-lg flex flex-col max-h-[90vh] overflow-hidden relative z-10"
    >
     <div className="flex items-center justify-between px-4 py-4 bg-gradient-to-r from-blue-900 to-blue-800 rounded-t-2xl shrink-0">
      <div>
       <h3 className="text-base font-bold text-white">Varlığı Düzenle</h3>
       <p className="text-blue-300 text-xs mt-0.5 font-mono">{editingEntity.path}</p>
      </div>
      <button onClick={() => setEditingEntity(null)}
       className="p-2 text-blue-300 hover:text-white hover:bg-white/10 rounded-lg transition-colors">
       <X size={16} />
      </button>
     </div>

     <form onSubmit={handleUpdateEntity} className="flex flex-col flex-1 overflow-hidden">
      <div className="p-5 space-y-4 overflow-y-auto flex-1">

       <div>
        <label className="block text-xs font-bold text-slate-500 uppercase tracking-widest mb-2">Varlık Tipi</label>
        <div className="flex flex-wrap gap-1.5">
         {allEntityTypes.map(t => (
          <button key={t.key} type="button"
           onClick={() => setEditingEntity(f => f ? { ...f, type: t.key } : f)}
           className={"px-3 py-1.5 rounded-lg border text-xs font-semibold transition-all " + (
            editingEntity.type === t.key
             ? t.bgColor + " " + t.color + " shadow-sm"
             : "bg-white border-slate-200 text-slate-500 hover:border-slate-300"
           )}
          >{t.label}</button>
         ))}
        </div>
       </div>

       <div>
        <label className="block text-xs font-bold text-slate-500 uppercase tracking-widest mb-2">Varlık Adı *</label>
        <input type="text" required value={editingEntity.name}
         onChange={e => setEditingEntity(f => f ? { ...f, name: e.target.value } : f)}
         className="w-full px-3 py-2.5 bg-white border border-slate-200 rounded-xl text-sm focus:outline-none focus:border-blue-500 transition-all"
        />
       </div>

       <div>
        <label className="block text-xs font-bold text-slate-500 uppercase tracking-widest mb-2">Organizasyon Yolu</label>
        <input type="text" required value={editingEntity.path}
         onChange={e => setEditingEntity(f => f ? { ...f, path: e.target.value } : f)}
         className="w-full px-3 py-2.5 bg-white border border-slate-200 rounded-xl text-sm font-mono focus:outline-none focus:border-blue-500 transition-all"
        />
        <p className="text-[10px] text-slate-400 mt-1">Yolu değiştirmek hiyerarşiyi etkiler, dikkatli olun.</p>
       </div>

      </div>

      <div className="flex gap-2 px-5 py-4 border-t border-slate-100 bg-slate-50 rounded-b-2xl shrink-0">
       <button type="button" onClick={handleDeleteEntity}
        disabled={deleteEntity.isPending}
        className="flex items-center gap-1.5 px-4 py-2.5 bg-red-50 border border-red-200 text-red-600 rounded-xl hover:bg-red-100 transition-colors font-semibold text-sm disabled:opacity-40"
       >
        <Trash2 size={14} />
        {deleteEntity.isPending ? "Siliniyor..." : "Sil"}
       </button>
       <div className="flex-1" />
       <button type="button" onClick={() => setEditingEntity(null)}
        className="px-4 py-2.5 text-slate-700 bg-white border border-slate-300 rounded-xl hover:bg-slate-50 transition-colors font-medium text-sm">
        İptal
       </button>
       <button type="submit" disabled={updateEntity.isPending}
        className="flex items-center justify-center gap-2 px-4 py-2.5 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-colors font-semibold text-sm disabled:opacity-40"
       >
        {updateEntity.isPending ? <Loader2 size={14} className="animate-spin" /> : <Pencil size={14} />}
        {updateEntity.isPending ? "Kaydediliyor..." : "Kaydet"}
       </button>
      </div>
     </form>
    </motion.div>
   </div>
  )}
 </AnimatePresence>
 </div>
 );
}
