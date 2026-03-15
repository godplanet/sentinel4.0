import { usePBCRequests, useUploadPBC, type PBCRequest } from '@/entities/pbc/api/pbc-requests';
import { fetchAuditeeTasks, requestExtension, uploadEvidenceFile } from '@/features/auditee-portal/api';
import { fetchRCSACampaigns, RCSACampaign } from '@/features/rcsa/api/rcsa-campaigns';
import { SurveyExecutor } from '@/features/rcsa/ui/SurveyExecutor';
import { AdvisoryRequestModal } from '@/widgets/AdvisoryWorkspace/AdvisoryRequestModal';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import clsx from 'clsx';
import {
 AlertTriangle,
 CalendarPlus,
 CheckCircle,
 CheckCircle2,
 ChevronRight,
 ClipboardList,
 Clock,
 FileDown,
 Handshake,
 Loader2,
 Send,
 ShieldAlert,
 Upload,
} from 'lucide-react';
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';


export function AuditeeDashboardPage() {
 const navigate = useNavigate();
 const queryClient = useQueryClient();
 const [extensionId, setExtensionId] = useState<string | null>(null);
 const [extensionReason, setExtensionReason] = useState('');
 const [showAdvisoryModal, setShowAdvisoryModal] = useState(false);
 const [activeRCSACampaignId, setActiveRCSACampaignId] = useState<string | null>(null);

 const { data: tasks = [], isLoading } = useQuery({
 queryKey: ['auditee-tasks'],
 queryFn: fetchAuditeeTasks,
 });

 const { data: rcsaCampaigns = [], isLoading: rcsaLoading } = useQuery<RCSACampaign[]>({
 queryKey: ['rcsa-campaigns-auditee'],
 queryFn: fetchRCSACampaigns,
 });

 const activeRCSACampaigns = (rcsaCampaigns || []).filter((c) => c.status === 'ACTIVE');
 const activeRCSACampaign = activeRCSACampaigns.find((c) => c.id === activeRCSACampaignId) ?? null;

 const userStr = localStorage.getItem('sentinel_user');
  let currentUserId = '00000000-0000-0000-0000-000000000010'; // Fallback to Burak Yılmaz (Auditee)
  try {
    if (userStr) {
      const u = JSON.parse(userStr);
      if (u.id) currentUserId = u.id;
    }
  } catch(e) {}

 // Wave 20: PBC Requests live data
 const { data: pbcRequests = [], isLoading: pbcLoading } = usePBCRequests();
 const uploadPBCMutation = useUploadPBC();

 const uploadMutation = useMutation({
 mutationFn: ({ findingId, file }: { findingId: string; file: File }) =>
 uploadEvidenceFile(findingId, file),
 onSuccess: () => {
 queryClient.invalidateQueries({ queryKey: ['auditee-tasks'] });
 },
 });

 const extensionMutation = useMutation({
 mutationFn: () => {
 if (!extensionId || !extensionReason.trim()) throw new Error('Missing data');
 const finding = tasks.find((t) => t.id === extensionId);
 return requestExtension({
 findingId: extensionId,
 reason: extensionReason,
 currentDueDate: finding?.due_date ?? null,
 });
 },
 onSuccess: () => {
 setExtensionId(null);
 setExtensionReason('');
 },
 });

 const pending = (tasks || []).filter((t) => ['SENT_TO_AUDITEE', 'AUDITEE_REVIEWING'].includes(t.status));
 const inProgress = (tasks || []).filter((t) => ['REMEDIATION_STARTED', 'AUDITEE_ACCEPTED', 'PENDING_APPROVAL'].includes(t.status));
 const overdue = (tasks || []).filter((t) => t.due_date && new Date(t.due_date) < new Date());

 if (isLoading) {
 return (
 <div className="flex items-center justify-center py-24">
 <Loader2 size={28} className="animate-spin text-slate-400" />
 </div>
 );
 }

 return (
 <div className="space-y-5">
 <div className="flex items-start justify-between">
 <div>
 <h1 className="text-2xl font-bold text-slate-800">Hosgeldiniz</h1>
 <p className="text-sm text-slate-500 mt-1">Size atanmis denetim bulgulari ve aksiyonlar asagidadir.</p>
 </div>
 <button
 onClick={() => setShowAdvisoryModal(true)}
 className="flex items-center gap-2 px-4 py-2.5 bg-gradient-to-r from-blue-600 to-cyan-600 text-white text-sm font-bold rounded-xl hover:from-blue-700 hover:to-cyan-700 transition-all shadow-sm"
 >
 <Handshake size={16} />
 Danismanlik Talep Et
 </button>
 </div>

 <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
 <StatCard label="Toplam Gorev" value={tasks.length} icon={ClipboardList} color="bg-slate-100 text-slate-600" />
 <StatCard label="Bekleyen Yanit" value={pending.length} icon={Clock} color="bg-amber-100 text-amber-600" />
 <StatCard label="Devam Eden" value={inProgress.length} icon={CheckCircle2} color="bg-emerald-100 text-emerald-600" />
 <StatCard label="Suresi Gecen" value={overdue.length} icon={AlertTriangle} color="bg-red-100 text-red-600" />
 </div>

 {/* Aktif RCSA Öz Değerlendirme Görevleri */}
 <div className="bg-surface border-2 border-slate-200 rounded-2xl shadow-sm overflow-hidden">
 <div className="px-6 py-4 border-b-2 border-slate-200 bg-canvas flex items-center justify-between">
 <h2 className="text-lg font-bold text-slate-800 flex items-center gap-2">
 <ShieldAlert size={18} />
 Aktif RCSA Öz Değerlendirme Görevleri
 </h2>
 <span className="text-xs text-slate-500">
 {rcsaLoading
 ? 'Kampanyalar yükleniyor...'
 : activeRCSACampaigns.length === 0
 ? 'Şu anda size atanmış aktif RCSA kampanyası yok.'
 : `${activeRCSACampaigns.length} aktif kampanya bulundu`}
 </span>
 </div>
 <div className="px-6 py-4 space-y-3">
 {rcsaLoading && (
 <div className="flex items-center gap-2 text-xs text-slate-500">
 <Loader2 size={14} className="animate-spin" />
 Kampanyalar yükleniyor...
 </div>
 )}
 {!rcsaLoading && activeRCSACampaigns.length === 0 && (
 <p className="text-xs text-slate-500">
 Teftiş Kurulu şu an için bir RCSA öz değerlendirme kampanyası başlatmamış.
 </p>
 )}
 {!rcsaLoading &&
 (activeRCSACampaigns || []).map((campaign) => (
 <div
 key={campaign.id}
 className="flex flex-col gap-2 rounded-xl border border-slate-200 bg-canvas px-4 py-3 md:flex-row md:items-center md:justify-between"
 >
 <div className="space-y-1">
 <p className="text-sm font-semibold text-slate-800">
 {campaign.title}
 </p>
 <p className="text-xs text-slate-500">
 Başlangıç: {campaign.start_date ? new Date(campaign.start_date).toLocaleDateString('tr-TR') : 'Belirtilmedi'} ·
 {' '}Bitiş: {campaign.end_date ? new Date(campaign.end_date).toLocaleDateString('tr-TR') : 'Belirtilmedi'}
 </p>
 </div>
 <button
 type="button"
 onClick={() => setActiveRCSACampaignId(campaign.id)}
 className="inline-flex items-center justify-center gap-2 rounded-lg bg-blue-600 px-3 py-1.5 text-xs font-semibold text-white shadow-sm hover:bg-blue-700 transition-colors"
 >
 Anketi Başlat
 </button>
 </div>
 ))}
 </div>
 </div>

 <div className="bg-surface border-2 border-slate-200 rounded-2xl shadow-sm overflow-hidden">
 <div className="px-6 py-4 border-b-2 border-slate-200 bg-canvas">
 <h2 className="text-lg font-bold text-slate-800 flex items-center gap-2">
 <ClipboardList size={18} />
 Yapilacaklar Listem
 </h2>
 </div>

 {tasks.length === 0 ? (
 <div className="text-center py-16">
 <CheckCircle2 size={36} className="mx-auto text-emerald-400 mb-3" />
 <p className="text-slate-500 font-medium">Tum gorevler tamamlandi!</p>
 </div>
 ) : (
 <div className="divide-y divide-slate-100">
 {(tasks || []).map((task) => {
 const SEVERITY_CONFIG: Record<string, { bg: string; text: string; label: string }> = {
 CRITICAL: { bg: 'bg-red-100 border-red-300', text: 'text-red-700', label: 'Kritik' },
 HIGH: { bg: 'bg-orange-100 border-orange-300', text: 'text-orange-700', label: 'Yuksek' },
 MEDIUM: { bg: 'bg-amber-100 border-amber-300', text: 'text-amber-700', label: 'Orta' },
 LOW: { bg: 'bg-blue-100 border-blue-300', text: 'text-blue-700', label: 'Dusuk' },
 };
 const sev = SEVERITY_CONFIG[task.severity] || SEVERITY_CONFIG.LOW;
 const isOverdue = task.due_date && new Date(task.due_date) < new Date();

 return (
 <div
 key={task.id}
 className="px-6 py-4 hover:bg-canvas transition-colors group"
 >
 <div className="flex items-start gap-4">
 <div className={clsx('mt-0.5 w-3 h-3 rounded-full shrink-0 border-2', sev.bg)} />

 <div className="flex-1 min-w-0">
 <div className="flex items-center gap-2 mb-1">
 {task.finding_code && (
 <span className="text-[10px] font-mono font-bold text-slate-400 bg-slate-100 px-2 py-0.5 rounded">
 {task.finding_code}
 </span>
 )}
 <span className={clsx('text-[10px] font-bold px-2 py-0.5 rounded border', sev.bg, sev.text)}>
 {sev.label}
 </span>
 {isOverdue && (
 <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-red-100 text-red-700 border border-red-300">
 Suresi Gecti!
 </span>
 )}
 </div>

 <h3 className="text-sm font-bold text-slate-800 mb-1">{task.title}</h3>

 {task.due_date && (
 <p className="text-xs text-slate-500 flex items-center gap-1">
 <Clock size={10} />
 Son Tarih: {new Date(task.due_date).toLocaleDateString('tr-TR')}
 </p>
 )}
 </div>

 <div className="flex items-center gap-2 shrink-0 opacity-0 group-hover:opacity-100 transition-opacity">
 <label className="flex items-center gap-1.5 px-3 py-2 bg-blue-600 text-white text-xs font-bold rounded-lg hover:bg-blue-700 transition-colors cursor-pointer">
 <Upload size={12} />
 Kanit Yukle
 <input
 type="file"
 className="hidden"
 onChange={(e) => {
 const file = e.target.files?.[0];
 if (file) uploadMutation.mutate({ findingId: task.id, file });
 }}
 />
 </label>

 <button
 onClick={() => setExtensionId(task.id)}
 className="flex items-center gap-1.5 px-3 py-2 bg-slate-100 text-slate-700 text-xs font-bold rounded-lg hover:bg-slate-200 transition-colors"
 >
 <CalendarPlus size={12} />
 +7 Gun
 </button>

 <button
 onClick={() => navigate(`/auditee-portal/finding/${task.id}`)}
 className="flex items-center gap-1 px-3 py-2 bg-slate-800 text-white text-xs font-bold rounded-lg hover:bg-slate-700 transition-colors"
 >
 Detay
 <ChevronRight size={12} />
 </button>
 </div>
 </div>
 </div>
 );
 })}
 </div>
 )}
 </div>

 {/* ============================================================= */}
 {/* WAVE 20: PBC KANIT TALEPLERİ */}
 {/* ============================================================= */}
 <div data-testid="pbc-requests-section" className="bg-surface border-2 border-slate-200 rounded-2xl shadow-sm overflow-hidden">
 <div className="px-6 py-4 border-b-2 border-slate-200 bg-canvas flex items-center justify-between">
 <h2 className="text-lg font-bold text-slate-800 flex items-center gap-2">
 <FileDown size={18} />
 Kanıt Talepleri (PBC)
 </h2>
 <span className="text-xs text-slate-500">
 {pbcLoading ? 'Yükleniyor...' : `${pbcRequests?.length ?? 0} talep`}
 </span>
 </div>

 {pbcLoading ? (
 <div className="flex items-center justify-center py-10">
 <Loader2 size={24} className="animate-spin text-slate-400" />
 </div>
 ) : (pbcRequests?.length ?? 0) === 0 ? (
 <div className="text-center py-12">
 <CheckCircle size={36} className="mx-auto text-emerald-400 mb-3" />
 <p className="text-slate-500 font-medium">Bekleyen kanıt talebiniz bulunmuyor.</p>
 </div>
 ) : (
 <div data-testid="pbc-request-list" className="divide-y divide-slate-100">
 {(pbcRequests ?? []).map((req: PBCRequest) => {
 const isOverdue = req.due_date && new Date(req.due_date) < new Date() && req.status !== 'ACCEPTED';
 const STYLE: Record<string, { bg: string; text: string; label: string }> = {
 PENDING: { bg: 'bg-slate-100', text: 'text-slate-600', label: 'Bekliyor' },
 IN_PROGRESS: { bg: 'bg-blue-100', text: 'text-blue-700', label: 'Hazırlanıyor' },
 SUBMITTED: { bg: 'bg-amber-100', text: 'text-amber-700', label: 'Gönderildi' },
 ACCEPTED: { bg: 'bg-green-100', text: 'text-green-700', label: 'Kabul Edildi' },
 REJECTED: { bg: 'bg-red-100', text: 'text-red-700', label: 'Reddedildi' },
 };
 const st = STYLE[req.status] ?? STYLE.PENDING;
 const PDOT: Record<string, string> = { LOW: 'bg-slate-400', MEDIUM: 'bg-blue-500', HIGH: 'bg-orange-500', CRITICAL: 'bg-red-500' };

 return (
 <div key={req.id} className="px-6 py-4 hover:bg-canvas transition-colors group">
 <div className="flex items-start gap-4">
 <div className={clsx('mt-1.5 w-3 h-3 rounded-full shrink-0', PDOT[req.priority] ?? 'bg-slate-400')} />
 <div className="flex-1 min-w-0">
 <div className="flex items-center gap-2 mb-1 flex-wrap">
 <h3 className="text-sm font-bold text-slate-800">{req.title}</h3>
 <span className={clsx('text-[10px] font-bold px-2 py-0.5 rounded', st.bg, st.text)}>{st.label}</span>
 {isOverdue && (
 <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-red-100 text-red-700">Süresi Geçti!</span>
 )}
 </div>
 {req.description && (
 <p className="text-xs text-slate-500 line-clamp-1 mb-1">{req.description}</p>
 )}
 <div className="flex items-center gap-4 text-xs text-slate-500">
 <span className="flex items-center gap-1"><ClipboardList size={10} />{req.requested_from}</span>
 {req.due_date && (
 <span className={clsx('flex items-center gap-1', isOverdue && 'text-red-600 font-semibold')}>
 <Clock size={10} />Son Tarih: {new Date(req.due_date).toLocaleDateString('tr-TR')}
 </span>
 )}
 </div>
 </div>
 {req.status !== 'ACCEPTED' && (
 <label className="flex items-center gap-1.5 px-3 py-2 bg-blue-600 text-white text-xs font-bold rounded-lg hover:bg-blue-700 transition-colors cursor-pointer opacity-0 group-hover:opacity-100 shrink-0">
 {uploadPBCMutation.isPending ? <Loader2 size={12} className="animate-spin" /> : <Send size={12} />}
 Kanıt Yükle
 <input type="file" className="hidden" onChange={(e) => {
 const file = e.target.files?.[0];
 if (file) uploadPBCMutation.mutate({ requestId: req.id, file });
 }} />
 </label>
 )}
 </div>
 </div>
 );
 })}
 </div>
 )}
 </div>

 {uploadMutation.isPending && (
 <div className="fixed inset-0 bg-black/30 flex items-center justify-center z-50">
 <div className="bg-surface rounded-2xl p-5 shadow-2xl flex items-center gap-4">
 <Loader2 size={24} className="animate-spin text-blue-600" />
 <span className="text-sm font-bold text-slate-700">Kanit yukleniyor...</span>
 </div>
 </div>
 )}

 {showAdvisoryModal && (
 <AdvisoryRequestModal onClose={() => setShowAdvisoryModal(false)} />
 )}

 {extensionId && (
 <div className="fixed inset-0 bg-black/30 flex items-center justify-center z-50 p-4">
 <div className="bg-surface rounded-2xl p-4 max-w-md w-full shadow-2xl">
 <h3 className="text-lg font-bold text-slate-800 mb-1">Sure Uzatimi Talebi</h3>
 <p className="text-sm text-slate-500 mb-4">Mevcut son tarihe +7 gun eklenecektir.</p>

 <textarea
 value={extensionReason}
 onChange={(e) => setExtensionReason(e.target.value)}
 placeholder="Uzatim gerekce aciklamasi..."
 rows={3}
 className="w-full px-4 py-3 bg-canvas border-2 border-slate-200 rounded-xl text-sm focus:outline-none focus:border-slate-400 resize-none"
 />

 <div className="flex items-center gap-3 mt-4">
 <button
 onClick={() => { setExtensionId(null); setExtensionReason(''); }}
 className="flex-1 px-4 py-2.5 bg-slate-100 text-slate-700 text-sm font-bold rounded-xl hover:bg-slate-200 transition-colors"
 >
 Iptal
 </button>
 <button
 onClick={() => extensionMutation.mutate()}
 disabled={extensionMutation.isPending || !extensionReason.trim()}
 className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 bg-slate-800 text-white text-sm font-bold rounded-xl hover:bg-slate-700 transition-colors disabled:opacity-50"
 >
 {extensionMutation.isPending ? <Loader2 size={14} className="animate-spin" /> : <CalendarPlus size={14} />}
 Talep Gonder
 </button>
 </div>
 </div>
 </div>
 )}

 {activeRCSACampaignId && activeRCSACampaign && (
 <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
 <div className="w-full max-w-3xl max-h-[90vh] rounded-2xl bg-canvas border border-slate-200 shadow-2xl flex flex-col">
 <div className="flex items-center justify-between border-b border-slate-200 px-5 py-3 bg-surface/80 backdrop-blur-md">
 <div>
 <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
 RCSA Öz Değerlendirme
 </p>
 <p className="text-sm font-bold text-slate-900">
 {activeRCSACampaign.title}
 </p>
 </div>
 <button
 type="button"
 onClick={() => setActiveRCSACampaignId(null)}
 className="rounded-lg border border-slate-300 bg-canvas px-3 py-1.5 text-xs font-semibold text-slate-700 hover:bg-slate-50 transition-colors"
 >
 Kapat
 </button>
 </div>
 <div className="flex-1 overflow-auto p-5">
 <SurveyExecutor
 campaignId={activeRCSACampaign.id}
 auditeeId={currentUserId}
 />
 </div>
 </div>
 </div>
 )}
 </div>
 );
}

function StatCard({ label, value, icon: Icon, color }: {
 label: string;
 value: number;
 icon: React.ElementType;
 color: string;
}) {
 return (
 <div className="bg-surface border-2 border-slate-200 rounded-2xl p-5 shadow-sm">
 <div className="flex items-center justify-between">
 <div>
 <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">{label}</p>
 <p className="text-3xl font-bold text-slate-800 mt-1">{value}</p>
 </div>
 <div className={clsx('w-12 h-12 rounded-xl flex items-center justify-center', color)}>
 <Icon size={22} />
 </div>
 </div>
 </div>
 );
}
