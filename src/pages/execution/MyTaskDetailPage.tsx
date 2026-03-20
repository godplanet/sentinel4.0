import { AnimatePresence, motion } from 'framer-motion';
import clsx from 'clsx';
import toast from 'react-hot-toast';
import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import {
  Activity, AlertTriangle, Archive, ArrowLeft, ArrowRight,
  Award, BarChart3, Bot, Briefcase, Calendar, Check, CheckCircle2,
  ClipboardList, Clock, CreditCard, Database,
  Download, Eye, FileSearch, FileText, Layers,
  Paperclip, PieChart, PlayCircle, Plus, Save, Search, Send,
  ShieldCheck, Target, BookOpen, Trash2, Upload,
  User, Users, XCircle, Zap,
} from 'lucide-react';
import { usePersonaStore } from '@/entities/user/model/persona-store';

// ─── Static task map ──────────────────────────────────────────────────────────
const TASK_META: Record<string, { title: string; audit_type: string; entity: string; category: string }> = {
  'task-org1': {
    title: 'Kadıköy Şubesi',
    audit_type: 'İç Kontrol Denetimi',
    entity: 'Organizasyonel Yapı',
    category: 'Organizasyonel Yapı',
  },
  'task-org2': {
    title: 'Çankaya Şubesi',
    audit_type: 'Operasyonel Risk Denetimi',
    entity: 'Organizasyonel Yapı',
    category: 'Organizasyonel Yapı',
  },
  'task-org3': {
    title: 'Karşıyaka Şubesi',
    audit_type: 'Uyum Denetimi',
    entity: 'Organizasyonel Yapı',
    category: 'Organizasyonel Yapı',
  },
};

// ─── Types ────────────────────────────────────────────────────────────────────
interface PlanTask { id: string; title: string; assignee: string; due_date: string; status: 'TODO' | 'IN_PROGRESS' | 'DONE'; }
interface ChatMessage { role: 'user' | 'ai'; content: string; }
interface PhaseData {
  baslangic?: { purpose: string; scope: string; audit_start: string; audit_end: string };
  planlama?: { tasks: PlanTask[] };
  planlama_onay?: { approved: boolean; approved_at?: string; notes: string };
  raporlama?: { report_title: string; summary: string };
  raporlama_onay?: { approved: boolean; approved_at?: string; notes: string };
  tamamlandi?: { final_notes: string; completed_at?: string };
  kapanis?: { closure_notes: string; lessons_learned: string; closed_at?: string };
}

// ─── Constants ────────────────────────────────────────────────────────────────
const STAGES = [
  { id: 0, key: 'baslangic', label: 'Başlangıç', icon: PlayCircle },
  { id: 1, key: 'planlama', label: 'Planlama', icon: ClipboardList },
  { id: 2, key: 'planlama_onay', label: 'Planlama Onayı', icon: CheckCircle2 },
  { id: 3, key: 'yurutme', label: 'Yürütme', icon: Zap },
  { id: 4, key: 'raporlama', label: 'Raporlama', icon: FileText },
  { id: 5, key: 'raporlama_onay', label: 'Raporlama Onayı', icon: ShieldCheck },
  { id: 6, key: 'tamamlandi', label: 'Tamamlandı', icon: Award },
  { id: 7, key: 'kapanis', label: 'Kapanış', icon: Archive },
] as const;

const YURUTME_TABS = [
  { key: 'overview', label: 'Genel Bakış', icon: BarChart3 },
  { key: 'workpapers', label: 'Çalışma Kağıtları', icon: FileText },
  { key: 'findings', label: 'Bulgular', icon: AlertTriangle },
  { key: 'evidence', label: 'Kanıtlar', icon: Database },
  { key: 'pbc_requests', label: 'Belge Talepleri', icon: Download },
  { key: 'field_notes', label: 'Saha Notları', icon: ClipboardList },
  { key: 'sprint_board', label: 'Çevik Pano', icon: Zap },
  { key: 'audit_report', label: 'Denetim Raporu', icon: FileSearch },
] as const;

// ─── Mock Data ────────────────────────────────────────────────────────────────
const MUSTERI_DATA = [
  { no: 'M-001', ad: 'Ahmet Yılmaz', tc: '123**789**', sube: 'HQ Merkez', urun: 'Bireysel Kredi', limit: '250.000', kullanim: '180.000', durum: 'Aktif' },
  { no: 'M-002', ad: 'Fatma Kaya', tc: '234**890**', sube: 'HQ Efeler', urun: 'Konut Kredisi', limit: '1.200.000', kullanim: '980.000', durum: 'Aktif' },
  { no: 'M-003', ad: 'Mehmet Demir', tc: '345**901**', sube: 'HQ Merkez', urun: 'Taşıt Kredisi', limit: '450.000', kullanim: '320.000', durum: 'Aktif' },
  { no: 'M-004', ad: 'Ayşe Çelik', tc: '456**012**', sube: 'HQ Bölge', urun: 'Bireysel Kredi', limit: '100.000', kullanim: '85.000', durum: 'Gecikmiş' },
  { no: 'M-005', ad: 'Ali Şahin', tc: '567**123**', sube: 'HQ Merkez', urun: 'İşletme Kredisi', limit: '500.000', kullanim: '500.000', durum: 'Aktif' },
];

const CEK_DATA = [
  { no: 'ÇEK-2026-001', kesideci: 'Sentinel Tekstil A.Ş.', banka: 'İş Bankası', tutar: '125.000', vade: '2026-04-15', durum: 'Vadeli' },
  { no: 'ÇEK-2026-002', kesideci: 'Güneş Tarım Ltd.', banka: 'Ziraat Bankası', tutar: '85.000', vade: '2026-03-20', durum: 'Karşılıksız' },
  { no: 'ÇEK-2026-003', kesideci: 'Ege İnşaat A.Ş.', banka: 'Akbank', tutar: '310.000', vade: '2026-05-01', durum: 'Vadeli' },
  { no: 'ÇEK-2026-004', kesideci: 'Batı Liman Ltd.', banka: 'Yapı Kredi', tutar: '220.000', vade: '2026-06-30', durum: 'Vadeli' },
  { no: 'ÇEK-2026-005', kesideci: 'Efeler Nakliyat A.Ş.', banka: 'Halkbank', tutar: '62.000', vade: '2026-03-25', durum: 'Protesto' },
];

const KREDI_KARTI_DATA = [
  { no: '4*** **** **** 1234', musteri: 'Ahmet Yılmaz', limit: '50.000', kullanim: '32.500', son_odeme: '2026-03-25', durum: 'Normal' },
  { no: '5*** **** **** 5678', musteri: 'Fatma Kaya', limit: '25.000', kullanim: '24.800', son_odeme: '2026-03-20', durum: 'Limit Aşımı' },
  { no: '4*** **** **** 9012', musteri: 'Mehmet Demir', limit: '75.000', kullanim: '41.200', son_odeme: '2026-04-01', durum: 'Normal' },
  { no: '5*** **** **** 3456', musteri: 'Ayşe Çelik', limit: '15.000', kullanim: '14.950', son_odeme: '2026-03-15', durum: 'Gecikmiş' },
  { no: '4*** **** **** 7890', musteri: 'Ali Şahin', limit: '100.000', kullanim: '67.300', son_odeme: '2026-03-28', durum: 'Normal' },
];

const CALISMA_KAGITLARI = [
  { id: 'CK-001', kontrol: 'ACC-001', baslik: 'Kimlik Doğrulama Kontrolü', kategori: 'Access Control', tester: 'A. Yılmaz', tarih: '2026-03-01', sonuc: 'Etkin', risk: 'Düşük' },
  { id: 'CK-002', kontrol: 'AML-001', baslik: 'Şüpheli İşlem Bildirimi', kategori: 'AML', tester: 'F. Kaya', tarih: '2026-03-02', sonuc: 'Kısmen Etkin', risk: 'Orta' },
  { id: 'CK-003', kontrol: 'CR-001', baslik: 'Kredi Onay Süreci', kategori: 'Credit Risk', tester: 'M. Demir', tarih: '2026-03-03', sonuc: 'Etkin', risk: 'Düşük' },
  { id: 'CK-004', kontrol: 'IT-001', baslik: 'Kullanıcı Erişim Yönetimi', kategori: 'ITGC', tester: 'A. Yılmaz', tarih: '2026-03-04', sonuc: 'Etkin Değil', risk: 'Yüksek' },
  { id: 'CK-005', kontrol: 'OR-001', baslik: 'İş Sürekliliği Planı', kategori: 'Op. Risk', tester: 'F. Kaya', tarih: '2026-03-05', sonuc: 'Etkin', risk: 'Düşük' },
];

const BULGULAR_DATA = [
  { kod: 'BLG-001', baslik: 'Kimlik Doğrulama Prosedüründe Eksiklik', seviye: 'YÜKSEK', durum: 'Açık', birim: 'Operasyon', tarih: '2026-03-04', sorumlu: 'Birim Müdürü' },
  { kod: 'BLG-002', baslik: 'AML Eğitim Kayıtları Eksik', seviye: 'ORTA', durum: 'Müzakerede', birim: 'Uyum', tarih: '2026-03-05', sorumlu: 'Uyum Müdürü' },
  { kod: 'BLG-003', baslik: 'Kullanıcı Erişim Hakları Güncellenmemiş', seviye: 'KRİTİK', durum: 'Açık', birim: 'BT', tarih: '2026-03-06', sorumlu: 'BT Müdürü' },
  { kod: 'BLG-004', baslik: 'Kredi Dosyasında Eksik Belge', seviye: 'DÜŞÜK', durum: 'Kapatıldı', birim: 'Kredi', tarih: '2026-03-07', sorumlu: 'Kredi Müdürü' },
];

// ─── Shared: DataTable ────────────────────────────────────────────────────────
function DataTable({ headers, rows, durumCol, durumColors, compact = false }: {
  headers: string[]; rows: string[][]; durumCol: number; durumColors: Record<string, string>; compact?: boolean;
}) {
  return (
    <div className="overflow-hidden rounded-xl border border-slate-200">
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="bg-slate-50 border-b border-slate-200">
              {headers.map(h => (
                <th key={h} className={clsx('text-left font-bold text-slate-500 uppercase tracking-wide text-xs', compact ? 'px-3 py-2' : 'px-4 py-3')}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {rows.map((row, i) => (
              <tr key={i} className="border-b border-slate-100 last:border-0 hover:bg-slate-50 transition-colors">
                {row.map((cell, j) => (
                  <td key={j} className={clsx('text-slate-700', compact ? 'px-3 py-2 text-xs' : 'px-4 py-3 text-sm')}>
                    {j === durumCol
                      ? <span className={clsx('px-2 py-0.5 rounded-full text-[10px] font-bold', durumColors[cell] || 'bg-slate-100 text-slate-600')}>{cell}</span>
                      : cell}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

// ─── SectionHeader ────────────────────────────────────────────────────────────
function SectionHeader({ icon: Icon, color, title, desc }: { icon: React.ElementType; color: string; title: string; desc: string }) {
  return (
    <div className="flex items-center gap-3 mb-1">
      <div className={clsx('w-9 h-9 rounded-xl flex items-center justify-center', `bg-${color}-100`)}>
        <Icon size={18} className={`text-${color}-600`} />
      </div>
      <div>
        <h2 className="text-base font-bold text-slate-900">{title}</h2>
        <p className="text-xs text-slate-500">{desc}</p>
      </div>
    </div>
  );
}

// ─── CompactStepper ───────────────────────────────────────────────────────────
const STAGE_SHORT = ['Başlangıç', 'Planlama', 'Plan.Onayı', 'Yürütme', 'Raporlama', 'Rap.Onayı', 'Tamamlandı', 'Kapanış'];

const STAGE_BADGE: { pill: string; dot: string }[] = [
  { pill: 'bg-sky-50 text-sky-700 border-sky-200',         dot: 'bg-sky-500' },
  { pill: 'bg-indigo-50 text-indigo-700 border-indigo-200', dot: 'bg-indigo-500' },
  { pill: 'bg-violet-50 text-violet-700 border-violet-200', dot: 'bg-violet-500' },
  { pill: 'bg-amber-50 text-amber-700 border-amber-200',    dot: 'bg-amber-500' },
  { pill: 'bg-orange-50 text-orange-700 border-orange-200', dot: 'bg-orange-500' },
  { pill: 'bg-rose-50 text-rose-700 border-rose-200',       dot: 'bg-rose-500' },
  { pill: 'bg-emerald-50 text-emerald-700 border-emerald-200', dot: 'bg-emerald-500' },
  { pill: 'bg-slate-100 text-slate-600 border-slate-300',   dot: 'bg-slate-500' },
];

function CompactStepper({ currentPhase }: { currentPhase: number }) {
  return (
    <div className="flex items-start w-full">
      {STAGES.map((stage, idx) => {
        const isDone = idx < currentPhase;
        const isCurrent = idx === currentPhase;
        return (
          <div key={stage.id} className="flex flex-col items-center flex-1 min-w-0">
            <div className="flex items-center w-full">
              {idx > 0 && (
                <div className={clsx('flex-1 h-px transition-colors', isDone || isCurrent ? 'bg-blue-400' : 'bg-slate-200')} />
              )}
              <div className={clsx(
                'w-5 h-5 rounded-full flex items-center justify-center flex-shrink-0 text-[10px] font-bold transition-all',
                isDone ? 'bg-blue-500 text-white' :
                isCurrent ? 'bg-blue-600 text-white ring-2 ring-blue-200 ring-offset-1' :
                'bg-white border-2 border-slate-200 text-slate-400'
              )}>
                {isDone ? <Check size={9} /> : idx + 1}
              </div>
              {idx < STAGES.length - 1 && (
                <div className={clsx('flex-1 h-px transition-colors', isDone ? 'bg-blue-400' : 'bg-slate-200')} />
              )}
            </div>
            <span className={clsx(
              'text-[9px] font-medium mt-0.5 text-center leading-tight px-0.5',
              isCurrent ? 'text-blue-600 font-bold' : isDone ? 'text-slate-500' : 'text-slate-400'
            )}>{STAGE_SHORT[idx]}</span>
          </div>
        );
      })}
    </div>
  );
}

// ─── Stage: Başlangıç ────────────────────────────────────────────────────────
function BaslangicStage({ data, onChange }: { data: NonNullable<PhaseData['baslangic']>; onChange: (d: NonNullable<PhaseData['baslangic']>) => void }) {
  return (
    <div className="space-y-5">
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6">
        <h3 className="text-sm font-bold text-slate-700 mb-4 flex items-center gap-2"><Calendar size={14} className="text-blue-500" />Denetim Tarihleri</h3>
        <div className="grid grid-cols-2 gap-4">
          <div><label className="block text-xs font-semibold text-slate-600 mb-1.5">Başlangıç Tarihi</label><input type="date" value={data.audit_start} onChange={e => onChange({ ...data, audit_start: e.target.value })} className="w-full px-3 py-2.5 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" /></div>
          <div><label className="block text-xs font-semibold text-slate-600 mb-1.5">Bitiş Tarihi</label><input type="date" value={data.audit_end} onChange={e => onChange({ ...data, audit_end: e.target.value })} className="w-full px-3 py-2.5 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" /></div>
        </div>
      </div>
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6">
        <h3 className="text-sm font-bold text-slate-700 mb-3 flex items-center gap-2"><Target size={14} className="text-indigo-500" />Proje Amacı</h3>
        <textarea value={data.purpose} onChange={e => onChange({ ...data, purpose: e.target.value })} rows={4} placeholder="Denetimin amacını ve hedeflerini açıklayın..." className="w-full px-3 py-2.5 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none" />
      </div>
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6">
        <h3 className="text-sm font-bold text-slate-700 mb-3 flex items-center gap-2"><BookOpen size={14} className="text-purple-500" />Proje Kapsamı</h3>
        <textarea value={data.scope} onChange={e => onChange({ ...data, scope: e.target.value })} rows={5} placeholder="Denetimin kapsamını belirtin..." className="w-full px-3 py-2.5 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none" />
      </div>
    </div>
  );
}

// ─── Stage: Planlama ─────────────────────────────────────────────────────────
function PlanlamaStage({ data, onChange }: { data: NonNullable<PhaseData['planlama']>; onChange: (d: NonNullable<PhaseData['planlama']>) => void }) {
  const addTask = () => onChange({ tasks: [...data.tasks, { id: crypto.randomUUID(), title: '', assignee: '', due_date: '', status: 'TODO' }] });
  const updateTask = (id: string, field: keyof PlanTask, value: string) => onChange({ tasks: data.tasks.map(t => t.id === id ? { ...t, [field]: value } : t) });
  const removeTask = (id: string) => onChange({ tasks: data.tasks.filter(t => t.id !== id) });
  const S: Record<string, string> = { TODO: 'bg-slate-100 text-slate-700', IN_PROGRESS: 'bg-blue-100 text-blue-700', DONE: 'bg-emerald-100 text-emerald-700' };
  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <button onClick={addTask} className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white text-sm font-semibold rounded-lg hover:bg-indigo-700 shadow-sm"><Plus size={14} />Görev Ekle</button>
      </div>
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
        {data.tasks.length === 0 ? (
          <div className="text-center py-14"><ClipboardList size={36} className="mx-auto text-slate-300 mb-2" /><p className="text-slate-500 text-sm">Henüz görev eklenmedi</p></div>
        ) : (
          <>
            <div className="grid grid-cols-12 gap-2 px-5 py-2.5 bg-slate-50 border-b border-slate-200 text-[10px] font-bold text-slate-500 uppercase tracking-wide">
              <div className="col-span-5">Görev</div><div className="col-span-3">Sorumlu</div><div className="col-span-2">Termin</div><div className="col-span-1">Durum</div><div className="col-span-1" />
            </div>
            {data.tasks.map((t, idx) => (
              <motion.div key={t.id} initial={{ opacity: 0, y: -5 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: idx * 0.03 }} className="grid grid-cols-12 gap-2 px-5 py-2.5 border-b border-slate-100 last:border-0 items-center hover:bg-slate-50/60">
                <div className="col-span-5"><input value={t.title} onChange={e => updateTask(t.id, 'title', e.target.value)} placeholder="Görev..." className="w-full px-2.5 py-1.5 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400" /></div>
                <div className="col-span-3"><input value={t.assignee} onChange={e => updateTask(t.id, 'assignee', e.target.value)} placeholder="Kişi" className="w-full px-2.5 py-1.5 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400" /></div>
                <div className="col-span-2"><input type="date" value={t.due_date} onChange={e => updateTask(t.id, 'due_date', e.target.value)} className="w-full px-2 py-1.5 border border-slate-200 rounded-lg text-xs focus:outline-none focus:ring-2 focus:ring-indigo-400" /></div>
                <div className="col-span-1"><select value={t.status} onChange={e => updateTask(t.id, 'status', e.target.value)} className={clsx('w-full px-1 py-1.5 rounded-lg text-xs font-semibold border-0 focus:outline-none', S[t.status])}><option value="TODO">Bekl.</option><option value="IN_PROGRESS">Dev.</option><option value="DONE">Tamam</option></select></div>
                <div className="col-span-1 flex justify-end"><button onClick={() => removeTask(t.id)} className="p-1.5 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"><Trash2 size={12} /></button></div>
              </motion.div>
            ))}
          </>
        )}
      </div>
    </div>
  );
}

// ─── Stage: Onay ─────────────────────────────────────────────────────────────
function OnayStage({ title, desc, icon: Icon, color, data, onChange, summary }: {
  title: string; desc: string; icon: React.ElementType; color: string;
  data: { approved: boolean; notes: string; approved_at?: string };
  onChange: (d: { approved: boolean; notes: string; approved_at?: string }) => void;
  summary?: React.ReactNode;
}) {
  return (
    <div className="space-y-5">
      {summary && <div className="bg-slate-50 rounded-xl border border-slate-200 p-4"><p className="text-[10px] font-bold text-slate-500 uppercase tracking-wide mb-2">Özet</p>{summary}</div>}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6">
        <h3 className="text-sm font-bold text-slate-700 mb-3">Onay Notları</h3>
        <textarea value={data.notes} onChange={e => onChange({ ...data, notes: e.target.value })} rows={4} placeholder="Notlar..." className="w-full px-3 py-2.5 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none mb-4" />
        <div className="flex gap-3">
          <button onClick={() => onChange({ ...data, approved: true, approved_at: new Date().toISOString() })} className={clsx('flex items-center gap-2 px-5 py-2 rounded-lg text-sm font-semibold transition-all', data.approved ? 'bg-emerald-500 text-white' : 'bg-white border border-slate-200 text-slate-700 hover:border-emerald-400 hover:text-emerald-600')}><Check size={14} />Onayla</button>
          <button onClick={() => onChange({ ...data, approved: false, approved_at: undefined })} className="flex items-center gap-2 px-5 py-2 rounded-lg text-sm font-semibold bg-white border border-slate-200 text-slate-700 hover:border-red-400 hover:text-red-600 transition-all"><XCircle size={14} />Reddet</button>
        </div>
        {data.approved && data.approved_at && <div className="mt-4 flex items-center gap-2 text-emerald-600 bg-emerald-50 rounded-lg px-4 py-2.5"><CheckCircle2 size={14} /><span className="text-sm font-medium">Onaylandı — {new Date(data.approved_at).toLocaleDateString('tr-TR', { dateStyle: 'long' })}</span></div>}
      </div>
    </div>
  );
}

// ─── Dashboard Tab ────────────────────────────────────────────────────────────
function DashboardTab({ title, userName }: { title: string; userName: string }) {
  const [selectedService, setSelectedService] = useState<string | null>(null);
  const initials = userName.split(' ').map(p => p[0]).join('').slice(0, 2).toUpperCase();

  const UNIT_SERVICES = [
    { id: 'srv1', name: `${title} — Birinci Servis`, desc: `${title} kapsamındaki birincil operasyonel süreçlerin günlük yönetimi ve icrasını sağlar.`, employees: ['Ali Kaya', 'Fatma Demir'] },
    { id: 'srv2', name: 'Kalite ve Kontrol', desc: 'Üretilen işlerin standartlara uygunluk ve kalite kontrolünü gerçekleştirir.', employees: ['Mehmet Kontrolör', 'Zeynep Denetçi'] },
    { id: 'srv3', name: 'İdari Destek', desc: 'Birim personeline gerekli lojistik ve idari desteği sağlar.', employees: ['Canan Destek', 'Kemal Yardımcı'] },
  ];

  const kpis = [
    { label: 'Toplam Görev', value: '8', icon: Briefcase, color: 'blue' },
    { label: 'Tamamlanan', value: '5', icon: Check, color: 'emerald' },
    { label: 'Açık Bulgu', value: '4', icon: AlertTriangle, color: 'amber' },
    { label: 'Çalışma Kağıdı', value: '5', icon: FileText, color: 'purple' },
  ];

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        {/* Denetim Ekibi */}
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-5 flex flex-col">
          <SectionHeader icon={Users} color="indigo" title="Denetim Ekibi" desc="Projeye atanan personel bilgileri" />
          <div className="mt-4 flex-1 space-y-3">
            <div className="flex items-center gap-3 p-2 bg-slate-50 rounded-lg border border-slate-100">
              <div className="w-10 h-10 rounded-full bg-indigo-100 text-indigo-700 flex items-center justify-center font-bold text-sm">{initials}</div>
              <div className="flex-1"><p className="text-sm font-bold text-slate-800">{userName}</p><p className="text-[10px] text-slate-500 font-semibold uppercase tracking-wider">Baş Denetçi</p></div>
              <div className="px-2 py-0.5 rounded text-[10px] font-bold bg-indigo-50 text-indigo-600 border border-indigo-100">Lider</div>
            </div>
            <div className="flex items-center gap-3 p-2 hover:bg-slate-50 rounded-lg transition-colors">
              <div className="w-10 h-10 rounded-full bg-blue-100 text-blue-700 flex items-center justify-center font-bold text-sm">AY</div>
              <div className="flex-1"><p className="text-sm font-bold text-slate-800">Ayşe Yılmaz</p><p className="text-[10px] text-slate-500 font-semibold uppercase tracking-wider">Kıdemli Denetçi</p></div>
            </div>
            <div className="flex items-center gap-3 p-2 hover:bg-slate-50 rounded-lg transition-colors">
              <div className="w-10 h-10 rounded-full bg-slate-100 text-slate-700 flex items-center justify-center font-bold text-sm">MC</div>
              <div className="flex-1"><p className="text-sm font-bold text-slate-800">Mehmet Can</p><p className="text-[10px] text-slate-500 font-semibold uppercase tracking-wider">Denetçi Yardımcısı</p></div>
            </div>
          </div>
        </div>

        {/* Risk Özeti */}
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-5 md:col-span-2 flex flex-col">
          <SectionHeader icon={Activity} color="rose" title="Birim Risk Özeti" desc="Denetlenen birime ait genel istatistikler" />
          <div className="mt-4 flex-1 grid grid-cols-2 gap-4">
            <div className="bg-slate-50 rounded-xl p-4 border border-slate-100 flex flex-col justify-center items-center text-center">
              <div className="w-14 h-14 rounded-full bg-rose-100 flex items-center justify-center mb-2 border-4 border-white shadow-sm">
                <span className="text-xl font-black text-rose-600">82</span>
              </div>
              <p className="text-sm font-bold text-slate-700">Genel Risk Skoru</p>
              <p className="text-xs text-slate-500 mt-1">Önceki dönem: <span className="text-rose-600 font-semibold">↑ 4 puan artış</span></p>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="bg-emerald-50 rounded-xl p-3 border border-emerald-100">
                <p className="text-[10px] font-bold text-emerald-600 uppercase tracking-wide">Son Denetim Notu</p>
                <p className="text-2xl font-black text-emerald-700 mt-1">A-</p>
                <p className="text-[10px] text-emerald-600/80 mt-1">Şubat 2025</p>
              </div>
              <div className="bg-amber-50 rounded-xl p-3 border border-amber-100">
                <p className="text-[10px] font-bold text-amber-600 uppercase tracking-wide">Geçmiş Bulgular</p>
                <p className="text-2xl font-black text-amber-700 mt-1">12</p>
                <p className="text-[10px] text-amber-600/80 mt-1">2 adet kapanmamış</p>
              </div>
              <div className="bg-blue-50 rounded-xl p-3 border border-blue-100 col-span-2 flex items-center justify-between">
                <div>
                  <p className="text-[10px] font-bold text-blue-600 uppercase tracking-wide">Personel / Norm Kadro</p>
                  <p className="text-lg font-bold text-blue-800 mt-0.5">8 / 10</p>
                </div>
                <Users size={20} className="text-blue-300" />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Birim Servisleri */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6">
        <SectionHeader icon={Layers} color="purple" title="Birim Servisleri ve Organizasyon" desc="Servis detayları ve çalışanlar" />
        <div className="mt-4 grid grid-cols-1 md:grid-cols-3 gap-5">
          {UNIT_SERVICES.map(srv => (
            <div key={srv.id} className={clsx('border rounded-xl p-4 flex flex-col transition-all duration-300', selectedService === srv.id ? 'bg-purple-50/50 border-purple-300 shadow-sm' : 'bg-slate-50 border-slate-200')}>
              <div className="flex items-center gap-2 mb-3">
                <div className={clsx('w-8 h-8 rounded-lg flex items-center justify-center shadow-sm transition-colors', selectedService === srv.id ? 'bg-purple-600 text-white' : 'bg-purple-100 text-purple-600')}><Briefcase size={14} /></div>
                <h4 className="font-bold text-sm text-slate-800 flex-1">{srv.name}</h4>
              </div>
              <p className="text-[10px] font-bold text-slate-500 uppercase tracking-wide mb-2">Personel ({srv.employees.length})</p>
              <div className="flex flex-wrap gap-2">
                {srv.employees.map(emp => (
                  <button key={emp} onClick={() => setSelectedService(selectedService === srv.id ? null : srv.id)}
                    className={clsx('flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-bold border transition-all duration-200',
                      selectedService === srv.id ? 'bg-purple-600 text-white border-purple-600 ring-2 ring-purple-100' : 'bg-white text-slate-600 border-slate-200 hover:border-purple-300 hover:text-purple-600 shadow-sm'
                    )}>
                    <User size={12} /> {emp}
                  </button>
                ))}
              </div>
              <AnimatePresence>
                {selectedService === srv.id && (
                  <motion.div initial={{ opacity: 0, height: 0, marginTop: 0 }} animate={{ opacity: 1, height: 'auto', marginTop: 16 }} exit={{ opacity: 0, height: 0, marginTop: 0 }} className="overflow-hidden">
                    <div className="p-3 bg-white border border-purple-200 rounded-lg text-xs text-slate-700 leading-relaxed font-medium shadow-sm">
                      <span className="text-purple-700 font-bold block mb-1">Servis Görev Tanımı:</span>
                      {srv.desc}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          ))}
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {kpis.map(s => { const SIcon = s.icon; return (
          <div key={s.label} className="bg-white shadow-sm rounded-xl p-4 border border-slate-200">
            <div className="flex items-center justify-between mb-1.5">
              <div className={clsx('w-8 h-8 rounded-lg flex items-center justify-center', `bg-${s.color}-100`)}><SIcon size={14} className={`text-${s.color}-600`} /></div>
              <span className="text-2xl font-black text-slate-800">{s.value}</span>
            </div>
            <p className="text-xs font-semibold text-slate-500">{s.label}</p>
          </div>
        ); })}
      </div>

      {/* Chart placeholders */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {[{ label: 'Aşama İlerlemesi', icon: PieChart }, { label: 'Görev Dağılımı', icon: BarChart3 }, { label: 'Zaman Grafiği', icon: Activity }].map(({ label, icon: Icon }) => (
          <div key={label} className="bg-slate-50 rounded-xl border border-slate-200 border-dashed p-6 text-center">
            <Icon size={24} className="mx-auto text-slate-300 mb-2" />
            <p className="text-sm font-medium text-slate-500">{label}</p>
            <p className="text-[10px] text-slate-400 mt-0.5">Detaylar eklenecek</p>
          </div>
        ))}
      </div>
    </div>
  );
}

// ─── Envanter Tab ─────────────────────────────────────────────────────────────
function EnvanterTab() {
  const [sub, setSub] = useState<'musteri' | 'cek' | 'kredi'>('musteri');
  const [search, setSearch] = useState('');
  const DC: Record<string, string> = { 'Aktif': 'bg-emerald-100 text-emerald-700', 'Gecikmiş': 'bg-amber-100 text-amber-700', 'Vadeli': 'bg-slate-100 text-slate-600', 'Karşılıksız': 'bg-red-100 text-red-700', 'Tahsil Edildi': 'bg-emerald-100 text-emerald-700', 'Protesto': 'bg-red-100 text-red-700', 'Normal': 'bg-emerald-100 text-emerald-700', 'Limit Aşımı': 'bg-red-100 text-red-700' };
  const subTabs = [{ key: 'musteri' as const, label: 'Müşteri Envanteri', icon: Users }, { key: 'cek' as const, label: 'Çek Envanteri', icon: FileText }, { key: 'kredi' as const, label: 'Kredi Kartı Envanteri', icon: CreditCard }];
  return (
    <div className="space-y-4">
      <div className="flex gap-1 bg-slate-100 rounded-xl p-1">
        {subTabs.map(t => { const TIcon = t.icon; return (<button key={t.key} onClick={() => { setSub(t.key); setSearch(''); }} className={clsx('flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold flex-1 justify-center transition-all', sub === t.key ? 'bg-white text-blue-600 shadow-sm' : 'text-slate-600 hover:text-slate-800')}><TIcon size={13} />{t.label}</button>); })}
      </div>
      <div className="relative"><Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" /><input value={search} onChange={e => setSearch(e.target.value)} placeholder="Ara..." className="w-full pl-9 pr-4 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" /></div>
      {sub === 'musteri' && <DataTable headers={['Müşteri No', 'Ad Soyad', 'TC Kimlik', 'Şube', 'Ürün', 'Limit (₺)', 'Kullanım (₺)', 'Durum']} rows={MUSTERI_DATA.filter(r => JSON.stringify(r).toLowerCase().includes(search.toLowerCase())).map(r => [r.no, r.ad, r.tc, r.sube, r.urun, r.limit, r.kullanim, r.durum])} durumCol={7} durumColors={DC} />}
      {sub === 'cek' && <DataTable headers={['Çek No', 'Kesideci', 'Muhatap Banka', 'Tutar (₺)', 'Vade', 'Durum']} rows={CEK_DATA.filter(r => JSON.stringify(r).toLowerCase().includes(search.toLowerCase())).map(r => [r.no, r.kesideci, r.banka, r.tutar, r.vade, r.durum])} durumCol={5} durumColors={DC} />}
      {sub === 'kredi' && <DataTable headers={['Kart No', 'Müşteri', 'Limit (₺)', 'Kullanım (₺)', 'Son Ödeme', 'Durum']} rows={KREDI_KARTI_DATA.filter(r => JSON.stringify(r).toLowerCase().includes(search.toLowerCase())).map(r => [r.no, r.musteri, r.limit, r.kullanim, r.son_odeme, r.durum])} durumCol={5} durumColors={DC} />}
    </div>
  );
}

// ─── Çalışma Kağıtları Tab ───────────────────────────────────────────────────
function CalismaKagitlariTab() {
  const EC: Record<string, string> = { 'Etkin': 'bg-emerald-100 text-emerald-700', 'Kısmen Etkin': 'bg-amber-100 text-amber-700', 'Etkin Değil': 'bg-red-100 text-red-700' };
  const RC: Record<string, string> = { 'Düşük': 'bg-emerald-100 text-emerald-700', 'Orta': 'bg-amber-100 text-amber-700', 'Yüksek': 'bg-red-100 text-red-700' };
  return (
    <div className="overflow-hidden rounded-xl border border-slate-200">
      <div className="bg-slate-50 px-4 py-3 border-b border-slate-200 flex items-center justify-between">
        <span className="text-xs font-bold text-slate-600 uppercase tracking-wide">Çalışma Kağıtları</span>
        <span className="text-xs text-slate-400">{CALISMA_KAGITLARI.length} adet</span>
      </div>
      <table className="w-full text-sm">
        <thead><tr className="border-b border-slate-100">{['ID', 'Kontrol No', 'Başlık', 'Kategori', 'Tester', 'Tarih', 'Sonuç', 'Risk'].map(h => <th key={h} className="px-4 py-2.5 text-left text-xs font-bold text-slate-500 uppercase tracking-wide">{h}</th>)}</tr></thead>
        <tbody>{CALISMA_KAGITLARI.map((r, i) => (
          <tr key={i} className="border-b border-slate-100 last:border-0 hover:bg-slate-50 transition-colors">
            <td className="px-4 py-3 font-mono text-xs text-blue-600 font-bold">{r.id}</td>
            <td className="px-4 py-3 font-mono text-xs text-slate-500">{r.kontrol}</td>
            <td className="px-4 py-3 text-slate-800 text-sm font-medium">{r.baslik}</td>
            <td className="px-4 py-3 text-xs text-slate-500">{r.kategori}</td>
            <td className="px-4 py-3 text-xs text-slate-600">{r.tester}</td>
            <td className="px-4 py-3 text-xs text-slate-500">{r.tarih}</td>
            <td className="px-4 py-3"><span className={clsx('px-2 py-0.5 rounded-full text-[10px] font-bold', EC[r.sonuc])}>{r.sonuc}</span></td>
            <td className="px-4 py-3"><span className={clsx('px-2 py-0.5 rounded-full text-[10px] font-bold', RC[r.risk])}>{r.risk}</span></td>
          </tr>
        ))}</tbody>
      </table>
    </div>
  );
}

// ─── Bulgular Tab ─────────────────────────────────────────────────────────────
type Finding = typeof BULGULAR_DATA[0] & { detay?: string };
function BulgularTab() {
  const [search, setSearch] = useState('');
  const [findings, setFindings] = useState<Finding[]>(BULGULAR_DATA);
  const [view, setView] = useState<'list' | 'detail' | 'form'>('list');
  const [selectedFinding, setSelectedFinding] = useState<Finding | null>(null);
  const [formBaslik, setFormBaslik] = useState('');
  const [formDetay, setFormDetay] = useState('');
  const [formSeviye, setFormSeviye] = useState('ORTA');
  const [isAiGenerating, setIsAiGenerating] = useState(false);
  const SV: Record<string, string> = { 'KRİTİK': 'bg-red-100 text-red-700 border-red-200', 'YÜKSEK': 'bg-orange-100 text-orange-700 border-orange-200', 'ORTA': 'bg-amber-100 text-amber-700 border-amber-200', 'DÜŞÜK': 'bg-slate-100 text-slate-700 border-slate-200' };
  const SB: Record<string, string> = { 'KRİTİK': 'bg-red-500', 'YÜKSEK': 'bg-orange-500', 'ORTA': 'bg-amber-400', 'DÜŞÜK': 'bg-slate-400' };
  const DU: Record<string, string> = { 'Açık': 'bg-red-50 text-red-700 border-red-200', 'Müzakerede': 'bg-amber-50 text-amber-700 border-amber-200', 'Kapatıldı': 'bg-emerald-50 text-emerald-700 border-emerald-200' };
  const filtered = findings.filter(r => r.baslik.toLowerCase().includes(search.toLowerCase()) || r.kod.toLowerCase().includes(search.toLowerCase()));

  const handleSave = () => {
    if (!formBaslik.trim()) return;
    setFindings([{ kod: `BLG-00${findings.length + 1}`, baslik: formBaslik, detay: formDetay, seviye: formSeviye, durum: 'Açık', birim: 'Denetlenen Birim', tarih: new Date().toISOString().split('T')[0], sorumlu: 'Atanmadı' }, ...findings]);
    setView('list'); setFormBaslik(''); setFormDetay(''); setFormSeviye('ORTA');
    toast.success('Yeni bulgu kaydedildi.');
  };
  const handleAi = () => {
    if (!formBaslik.trim()) { toast.error('AI taslağı için başlık giriniz.'); return; }
    setIsAiGenerating(true);
    setTimeout(() => { setFormDetay(`AI Taslağı: "${formBaslik}" başlığına istinaden; ilgili sürecin kurum politikalarına uygun olmadığı tespit edilmiştir.\n\nKök Neden:\nSüreç sahiplerinin güncel prosedürlerden haberdar olmaması.\n\nÖneri:\nİvedilikle aksiyon planı oluşturulmalı ve personel eğitimleri tamamlanmalıdır.`); setIsAiGenerating(false); toast.success('AI taslağı oluşturuldu.'); }, 1500);
  };

  if (view === 'detail' && selectedFinding) return (
    <div className="space-y-4">
      <button onClick={() => setView('list')} className="flex items-center gap-1.5 text-sm text-slate-500 hover:text-slate-800 font-medium"><ArrowLeft size={16} />Listeye Dön</button>
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6 relative overflow-hidden">
        <div className={clsx('absolute top-0 right-0 w-32 h-32 rounded-bl-full opacity-10', SB[selectedFinding.seviye])} />
        <div className="flex items-center gap-3 mb-4">
          <span className="font-mono text-sm font-bold text-slate-500">{selectedFinding.kod}</span>
          <span className={clsx('px-2.5 py-0.5 rounded text-xs font-bold border', SV[selectedFinding.seviye])}>{selectedFinding.seviye}</span>
          <span className={clsx('px-2.5 py-0.5 rounded text-xs font-bold border', DU[selectedFinding.durum])}>{selectedFinding.durum}</span>
        </div>
        <h2 className="text-xl font-bold text-slate-900 mb-4">{selectedFinding.baslik}</h2>
        <div className="grid grid-cols-3 gap-4 mb-5">
          {[['Birim', selectedFinding.birim], ['Tarih', selectedFinding.tarih], ['Sorumlu', selectedFinding.sorumlu]].map(([l, v]) => (
            <div key={l} className="p-3 bg-slate-50 rounded-xl border border-slate-100"><p className="text-xs font-bold text-slate-500 uppercase mb-1">{l}</p><p className="text-sm font-semibold text-slate-800">{v}</p></div>
          ))}
        </div>
        <h3 className="text-sm font-bold text-slate-700 mb-2 border-b border-slate-200 pb-2">Bulgu Detayı</h3>
        <p className="text-sm text-slate-600 leading-relaxed whitespace-pre-wrap">{selectedFinding.detay || 'Detaylı açıklama henüz girilmemiştir. İlgili denetim kanıtları incelenerek detaylar eklenebilir.'}</p>
      </div>
    </div>
  );

  if (view === 'form') return (
    <div className="space-y-5">
      <div className="flex items-center justify-between border-b border-slate-200 pb-3">
        <button onClick={() => setView('list')} className="flex items-center gap-1.5 text-sm text-slate-500 hover:text-slate-800 font-medium"><ArrowLeft size={16} />İptal</button>
        <div className="flex gap-3">
          <button onClick={handleAi} disabled={isAiGenerating} className="flex items-center gap-1.5 px-4 py-2 bg-indigo-50 border border-indigo-200 text-indigo-700 text-sm font-bold rounded-lg hover:bg-indigo-100 disabled:opacity-50">
            {isAiGenerating ? <Clock size={14} className="animate-spin" /> : <Bot size={14} />}
            {isAiGenerating ? 'Üretiliyor...' : 'AI ile Taslak Üret'}
          </button>
          <button onClick={handleSave} className="flex items-center gap-1.5 px-6 py-2 bg-blue-600 text-white text-sm font-bold rounded-lg hover:bg-blue-700"><Save size={14} />Kaydet</button>
        </div>
      </div>
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6 space-y-5">
        <div><label className="block text-xs font-bold text-slate-600 uppercase tracking-wide mb-1.5">Bulgu Başlığı</label><input value={formBaslik} onChange={e => setFormBaslik(e.target.value)} className="w-full px-4 py-2.5 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500" /></div>
        <div><label className="block text-xs font-bold text-slate-600 uppercase tracking-wide mb-1.5">Risk Seviyesi</label><select value={formSeviye} onChange={e => setFormSeviye(e.target.value)} className="w-full px-4 py-2.5 border border-slate-300 rounded-lg text-sm bg-white focus:ring-2 focus:ring-blue-500"><option value="DÜŞÜK">Düşük</option><option value="ORTA">Orta</option><option value="YÜKSEK">Yüksek</option><option value="KRİTİK">Kritik</option></select></div>
        <div><label className="block text-xs font-bold text-slate-600 uppercase tracking-wide mb-1.5">Bulgu Detayı ve Kök Neden</label><textarea value={formDetay} onChange={e => setFormDetay(e.target.value)} rows={6} className="w-full px-4 py-3 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 resize-none" /></div>
      </div>
    </div>
  );

  return (
    <div className="space-y-4">
      <div className="flex gap-3 items-center">
        <div className="relative flex-1"><Search size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" /><input value={search} onChange={e => setSearch(e.target.value)} placeholder="Bulgu ara..." className="w-full pl-9 pr-4 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" /></div>
        <div className="hidden md:flex gap-1.5">{['YÜKSEK', 'ORTA', 'DÜŞÜK'].map(s => <span key={s} className={clsx('px-2.5 py-1 rounded-full border text-[10px] font-bold', SV[s])}>{s}: {findings.filter(b => b.seviye === s).length}</span>)}</div>
        <button onClick={() => { setView('form'); setFormBaslik(''); setFormDetay(''); setFormSeviye('ORTA'); }} className="flex items-center gap-1.5 px-4 py-2 bg-slate-900 text-white text-sm font-semibold rounded-lg hover:bg-slate-800"><Plus size={14} />Bulgu Girişi</button>
      </div>
      <div className="space-y-2">
        {filtered.map(b => (
          <div key={b.kod} onClick={() => { setSelectedFinding(b); setView('detail'); }} className="bg-white border border-slate-200 rounded-xl p-4 hover:border-indigo-300 hover:shadow-md cursor-pointer relative overflow-hidden transition-all group">
            <div className={clsx('absolute left-0 top-0 bottom-0 w-1 rounded-l-xl group-hover:w-2 transition-all', SB[b.seviye])} />
            <div className="pl-4">
              <div className="flex flex-col md:flex-row md:items-center justify-between mb-1.5 gap-2">
                <div className="flex items-center gap-2">
                  <span className="font-mono text-xs font-bold text-slate-400">{b.kod}</span>
                  <span className={clsx('px-2 py-0.5 rounded text-[10px] font-bold border', SV[b.seviye])}>{b.seviye}</span>
                  <span className={clsx('px-2 py-0.5 rounded text-[10px] font-bold border', DU[b.durum])}>{b.durum}</span>
                </div>
                <div className="flex items-center gap-3 text-xs text-slate-400 font-medium"><span>{b.birim}</span><span>{b.tarih}</span><span className="text-slate-600">{b.sorumlu}</span><Eye size={14} className="group-hover:text-indigo-600 transition-colors" /></div>
              </div>
              <p className="font-semibold text-slate-800 text-sm group-hover:text-indigo-900 transition-colors">{b.baslik}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// ─── Kanıtlar Tab ─────────────────────────────────────────────────────────────
function KanitlarTab() {
  const [files, setFiles] = useState<string[]>([]);
  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h3 className="text-sm font-bold text-slate-700">Denetim Kanıtları</h3>
        <label className="cursor-pointer flex items-center gap-1.5 px-4 py-2 bg-blue-600 text-white text-sm font-semibold rounded-lg hover:bg-blue-700"><Upload size={13} />Kanıt Yükle<input type="file" className="hidden" onChange={e => { if (e.target.files?.[0]) setFiles(p => [...p, e.target.files![0].name]); }} /></label>
      </div>
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-4">
        {files.length === 0 ? <div className="text-center py-8"><Database size={32} className="mx-auto text-slate-300 mb-2" /><p className="text-sm text-slate-500">Henüz kanıt yüklenmedi</p></div>
          : <div className="space-y-2">{files.map((f, i) => (<div key={i} className="flex items-center gap-3 py-2.5 px-3 border border-slate-100 rounded-lg bg-slate-50"><FileText size={16} className="text-blue-500" /><span className="text-sm text-slate-700 flex-1">{f}</span><button onClick={() => setFiles(p => p.filter((_, j) => j !== i))} className="text-slate-400 hover:text-red-500"><Trash2 size={14} /></button></div>))}</div>}
      </div>
    </div>
  );
}

// ─── PBC Tab ──────────────────────────────────────────────────────────────────
function PbcTab() {
  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center"><h3 className="text-sm font-bold text-slate-700">Belge ve Bilgi Talepleri (PBC)</h3><button className="flex items-center gap-1.5 px-4 py-2 bg-slate-900 text-white text-sm font-semibold rounded-lg"><Plus size={13} />Yeni Talep</button></div>
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-8 text-center"><Download size={32} className="mx-auto text-slate-300 mb-2" /><p className="text-sm font-medium text-slate-600">Aktif PBC Talebi Bulunmamaktadır</p><p className="text-xs text-slate-400 mt-1">Denetlenen birimlerden istenen belgeleri buradan yönetebilirsiniz.</p></div>
    </div>
  );
}

// ─── Saha Notları ─────────────────────────────────────────────────────────────
function SahaNotlariTab() {
  const [notes, setNotes] = useState<{ date: string; text: string }[]>([]);
  const [input, setInput] = useState('');
  const add = () => { if (input) { setNotes([...notes, { date: new Date().toLocaleTimeString('tr-TR'), text: input }]); setInput(''); } };
  return (
    <div className="space-y-4">
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-4"><div className="flex gap-2"><input value={input} onChange={e => setInput(e.target.value)} onKeyDown={e => e.key === 'Enter' && add()} placeholder="Saha gözlemi yazın..." className="flex-1 px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" /><button onClick={add} disabled={!input.trim()} className="px-4 py-2 bg-blue-600 text-white text-sm font-semibold rounded-lg disabled:opacity-50"><Plus size={14} /></button></div></div>
      <div className="space-y-3">{notes.map((n, i) => (<div key={i} className="bg-yellow-50/50 border border-yellow-200 rounded-xl p-4"><div className="text-[10px] text-yellow-600 font-bold mb-1 flex items-center gap-1"><Clock size={10} />{n.date}</div><p className="text-sm text-slate-800">{n.text}</p></div>))}</div>
    </div>
  );
}

// ─── Sprint Board ─────────────────────────────────────────────────────────────
function SprintBoardTab() {
  return (
    <div className="bg-slate-50 rounded-xl border border-slate-200 border-dashed p-8 text-center">
      <Zap size={32} className="mx-auto text-slate-300 mb-2" />
      <p className="text-sm font-medium text-slate-600">Çevik (Agile) Sprint Panosu</p>
      <p className="text-xs text-slate-400 mt-1">Bu denetim çevik yöntemle yürütülüyorsa sprint görevleri burada yer alır.</p>
    </div>
  );
}

// ─── Rapor Tab ────────────────────────────────────────────────────────────────
function RaporTab() {
  const [messages, setMessages] = useState<ChatMessage[]>([{ role: 'ai', content: 'Merhaba! Bulgularınızdan otomatik denetim raporu oluşturmamı ister misiniz? "Rapor Oluştur" butonuna tıklayın.' }]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [uploadedFiles, setUploadedFiles] = useState<string[]>([]);

  const send = (text?: string) => {
    const msg = text || input.trim();
    if (!msg) return;
    setMessages(prev => [...prev, { role: 'user', content: msg }]);
    setInput(''); setLoading(true);
    setTimeout(() => {
      const isReport = msg.toLowerCase().includes('rapor') || msg.toLowerCase().includes('oluştur');
      setMessages(prev => [...prev, { role: 'ai', content: isReport
        ? `✅ Denetim Raporu Taslağı Hazırlandı\n\n📋 Yönetici Özeti:\nToplam ${BULGULAR_DATA.length} bulgu tespit edilmiştir. 1 KRİTİK, 1 YÜKSEK, 1 ORTA, 1 DÜŞÜK seviyeli bulgu mevcuttur.\n\n🔴 Kritik Bulgular:\n• BLG-003: Kullanıcı erişim hakları güncellenmemiş\n• BLG-001: Kimlik doğrulama prosedürü eksik\n\n💡 Öneriler:\n1. Erişim haklarının 30 gün içinde güncellenmesi\n2. Prosedür kılavuzunun yenilenmesi`
        : `Anladım. "${msg}" hakkında denetim verilerini analiz edebilirim. Daha spesifik belirtin.`
      }]);
      setLoading(false);
    }, 1200);
  };

  return (
    <div className="grid grid-cols-5 gap-5" style={{ height: '480px' }}>
      <div className="col-span-3 flex flex-col bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="px-4 py-3 border-b border-slate-200 flex items-center gap-2 bg-gradient-to-r from-blue-50 to-indigo-50 flex-shrink-0">
          <div className="w-7 h-7 bg-blue-600 rounded-lg flex items-center justify-center"><Bot size={13} className="text-white" /></div>
          <span className="text-sm font-bold text-slate-800">Sentinel AI — Rapor Asistanı</span>
          <span className="ml-auto px-2 py-0.5 bg-emerald-100 text-emerald-700 text-[10px] font-bold rounded-full">Çevrimiçi</span>
        </div>
        <div className="flex-1 overflow-y-auto p-4 space-y-3 min-h-0">
          {messages.map((m, i) => (
            <div key={i} className={clsx('flex gap-2', m.role === 'user' ? 'flex-row-reverse' : 'flex-row')}>
              <div className={clsx('w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5', m.role === 'ai' ? 'bg-blue-100' : 'bg-slate-200')}>
                {m.role === 'ai' ? <Bot size={12} className="text-blue-600" /> : <User size={12} className="text-slate-600" />}
              </div>
              <div className={clsx('max-w-[80%] px-3.5 py-2.5 rounded-2xl text-xs leading-relaxed whitespace-pre-wrap', m.role === 'ai' ? 'bg-slate-100 text-slate-800 rounded-tl-sm' : 'bg-blue-600 text-white rounded-tr-sm')}>{m.content}</div>
            </div>
          ))}
          {loading && <div className="flex gap-2"><div className="w-6 h-6 rounded-full bg-blue-100 flex items-center justify-center"><Bot size={12} className="text-blue-600" /></div><div className="bg-slate-100 rounded-2xl rounded-tl-sm px-4 py-3 flex gap-1">{[0,1,2].map(i => <span key={i} className="w-1.5 h-1.5 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: `${i*0.15}s` }} />)}</div></div>}
        </div>
        <div className="p-3 border-t border-slate-200 flex-shrink-0">
          <div className="flex gap-2 mb-2">
            <button onClick={() => send('Bulgulardan denetim raporu oluştur')} className="flex-1 py-1.5 bg-blue-50 text-blue-700 text-xs font-semibold rounded-lg hover:bg-blue-100">📄 Rapor Oluştur</button>
            <button onClick={() => send('Kritik bulgular için aksiyon öner')} className="flex-1 py-1.5 bg-slate-50 text-slate-700 text-xs font-semibold rounded-lg hover:bg-slate-100">💡 Aksiyon Öner</button>
          </div>
          <div className="flex gap-2">
            <input value={input} onChange={e => setInput(e.target.value)} onKeyDown={e => e.key === 'Enter' && send()} placeholder="Mesajınızı yazın..." className="flex-1 px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
            <button onClick={() => send()} disabled={!input.trim()} className="p-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-40"><Send size={15} /></button>
          </div>
        </div>
      </div>
      <div className="col-span-2 flex flex-col gap-3 min-h-0">
        <div className="bg-white rounded-xl border-2 border-dashed border-slate-300 p-5 text-center hover:border-blue-400 transition-colors flex flex-col items-center justify-center flex-1">
          <Upload size={24} className="text-slate-300 mb-2" />
          <p className="text-sm font-semibold text-slate-700 mb-1">Rapor Yükle</p>
          <p className="text-xs text-slate-400 mb-3">PDF, DOCX, XLSX</p>
          <label className="cursor-pointer px-4 py-1.5 bg-blue-600 text-white text-xs font-semibold rounded-lg hover:bg-blue-700">Dosya Seç<input type="file" className="hidden" accept=".pdf,.docx,.xlsx" onChange={e => { if (e.target.files?.[0]) setUploadedFiles(p => [...p, e.target.files![0].name]); }} /></label>
        </div>
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-4 flex-1 overflow-y-auto min-h-0">
          <div className="flex items-center justify-between mb-2"><span className="text-xs font-bold text-slate-600 uppercase flex items-center gap-1"><Paperclip size={11} />Dosyalar</span><span className="text-xs text-slate-400">{uploadedFiles.length + 2}</span></div>
          {(['Taslak_Rapor.docx', 'Bulgular_Özet.xlsx', ...uploadedFiles]).map((f, i) => (
            <div key={i} className="flex items-center gap-2 py-2 border-b border-slate-100 last:border-0">
              <div className="w-6 h-6 bg-blue-50 rounded-lg flex items-center justify-center"><FileText size={11} className="text-blue-500" /></div>
              <span className="text-xs text-slate-700 flex-1 truncate">{f}</span>
              <button className="p-1 text-slate-400 hover:text-blue-600"><Download size={12} /></button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// ─── Yürütme Stage ────────────────────────────────────────────────────────────
function YurutmeStage({ title, userName }: { title: string; userName: string }) {
  const [activeTab, setActiveTab] = useState('overview');
  return (
    <div className="space-y-4">
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="flex border-b border-slate-200 overflow-x-auto bg-slate-50/80">
          {YURUTME_TABS.map(tab => { const TI = tab.icon; return (
            <button key={tab.key} onClick={() => setActiveTab(tab.key)} className={clsx('flex items-center gap-1.5 px-4 py-3 text-xs font-semibold whitespace-nowrap border-b-2 transition-all', activeTab === tab.key ? 'border-blue-600 text-blue-600 bg-white' : 'border-transparent text-slate-600 hover:text-slate-900 hover:bg-slate-100')}>
              <TI size={13} />{tab.label}
            </button>
          ); })}
        </div>
        <AnimatePresence mode="wait">
          <motion.div key={activeTab} initial={{ opacity: 0, y: 4 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} transition={{ duration: 0.15 }} className="p-5">
            {activeTab === 'overview' && <DashboardTab title={title} userName={userName} />}
            {activeTab === 'workpapers' && <CalismaKagitlariTab />}
            {activeTab === 'findings' && <BulgularTab />}
            {activeTab === 'evidence' && <KanitlarTab />}
            {activeTab === 'pbc_requests' && <PbcTab />}
            {activeTab === 'field_notes' && <SahaNotlariTab />}
            {activeTab === 'sprint_board' && <SprintBoardTab />}
            {activeTab === 'audit_report' && <RaporTab />}
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
}

// ─── Raporlama Stage ──────────────────────────────────────────────────────────
function RaporlamaStage({ data, onChange }: { data: NonNullable<PhaseData['raporlama']>; onChange: (d: NonNullable<PhaseData['raporlama']>) => void }) {
  return (
    <div className="space-y-5">
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6 space-y-4">
        <div><label className="block text-xs font-semibold text-slate-600 mb-1.5">Rapor Başlığı</label><input value={data.report_title} onChange={e => onChange({ ...data, report_title: e.target.value })} placeholder="Rapor başlığı..." className="w-full px-3 py-2.5 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" /></div>
        <div><label className="block text-xs font-semibold text-slate-600 mb-1.5">Yönetici Özeti</label><textarea value={data.summary} onChange={e => onChange({ ...data, summary: e.target.value })} rows={8} placeholder="Bulgular özeti ve öneriler..." className="w-full px-3 py-2.5 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none" /></div>
      </div>
    </div>
  );
}

function TamamlandiStage({ data, onChange }: { data: NonNullable<PhaseData['tamamlandi']>; onChange: (d: NonNullable<PhaseData['tamamlandi']>) => void }) {
  return (
    <div className="space-y-5">
      {data.completed_at && <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-5 flex items-center gap-4"><CheckCircle2 size={32} className="text-emerald-500 flex-shrink-0" /><div><p className="font-bold text-emerald-800">Denetim Tamamlandı</p><p className="text-emerald-700 text-sm mt-0.5">Tarih: {new Date(data.completed_at).toLocaleDateString('tr-TR', { dateStyle: 'long' })}</p></div></div>}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6"><label className="block text-xs font-semibold text-slate-600 mb-1.5">Son Notlar</label><textarea value={data.final_notes} onChange={e => onChange({ ...data, final_notes: e.target.value })} rows={5} placeholder="Genel değerlendirme..." className="w-full px-3 py-2.5 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none" /></div>
    </div>
  );
}

function KabanisStage({ data, onChange }: { data: NonNullable<PhaseData['kapanis']>; onChange: (d: NonNullable<PhaseData['kapanis']>) => void }) {
  return (
    <div className="space-y-5">
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6 space-y-4">
        <div><label className="block text-xs font-semibold text-slate-600 mb-1.5">Kapanış Notları</label><textarea value={data.closure_notes} onChange={e => onChange({ ...data, closure_notes: e.target.value })} rows={4} placeholder="Kapanış notları..." className="w-full px-3 py-2.5 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none" /></div>
        <div><label className="block text-xs font-semibold text-slate-600 mb-1.5">Öğrenilen Dersler</label><textarea value={data.lessons_learned} onChange={e => onChange({ ...data, lessons_learned: e.target.value })} rows={4} placeholder="Bu denetimden çıkarılan dersler..." className="w-full px-3 py-2.5 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none" /></div>
      </div>
    </div>
  );
}

function defaultPhaseData(): PhaseData {
  return {
    baslangic: { purpose: '', scope: '', audit_start: '', audit_end: '' },
    planlama: { tasks: [] },
    planlama_onay: { approved: false, notes: '' },
    raporlama: { report_title: '', summary: '' },
    raporlama_onay: { approved: false, notes: '' },
    tamamlandi: { final_notes: '' },
    kapanis: { closure_notes: '', lessons_learned: '' },
  };
}

// ─── Main ─────────────────────────────────────────────────────────────────────
export default function MyTaskDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { getCurrentPersonaConfig } = usePersonaStore();
  const config = getCurrentPersonaConfig();
  const userName = config.name;

  const meta = id ? TASK_META[id] : null;

  const [phase, setPhase] = useState(0);
  const [phaseData, setPhaseData] = useState<PhaseData>(defaultPhaseData());
  const [saving, setSaving] = useState(false);

  // Load from localStorage
  useEffect(() => {
    if (!id) return;
    try {
      const stored = localStorage.getItem(`my-task-detail-${id}`);
      if (stored) {
        const parsed = JSON.parse(stored);
        if (parsed.phase !== undefined) setPhase(parsed.phase);
        if (parsed.phaseData) setPhaseData({ ...defaultPhaseData(), ...parsed.phaseData });
      }
    } catch {/* ignore */}
  }, [id]);

  const save = (newPhase?: number) => {
    if (!id) return;
    setSaving(true);
    const targetPhase = newPhase ?? phase;
    const updatedData = { ...phaseData };
    if (newPhase === 6 && !updatedData.tamamlandi?.completed_at) updatedData.tamamlandi = { ...updatedData.tamamlandi!, completed_at: new Date().toISOString() };
    if (newPhase === 7 && !updatedData.kapanis?.closed_at) updatedData.kapanis = { ...updatedData.kapanis!, closed_at: new Date().toISOString() };
    localStorage.setItem(`my-task-detail-${id}`, JSON.stringify({ phase: targetPhase, phaseData: updatedData }));
    setTimeout(() => {
      setSaving(false);
      if (newPhase !== undefined) {
        setPhase(newPhase);
        setPhaseData(updatedData);
        toast.success(`${STAGES[newPhase].label} aşamasına geçildi`);
      } else {
        toast.success('Kaydedildi');
      }
    }, 300);
  };

  const updatePhaseData = <K extends keyof PhaseData>(key: K, value: PhaseData[K]) =>
    setPhaseData(prev => ({ ...prev, [key]: value }));

  if (!meta) {
    return (
      <div className="h-screen flex items-center justify-center bg-slate-50">
        <div className="text-center">
          <p className="text-slate-500 font-medium mb-3">Görev bulunamadı</p>
          <button onClick={() => navigate('/execution/my-engagements')} className="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-semibold">Görevlerime Dön</button>
        </div>
      </div>
    );
  }

  const isLastPhase = phase === STAGES.length - 1;

  return (
    <div className="h-screen flex flex-col bg-slate-50">
      {/* Compact Header */}
      <div className="bg-white border-b border-slate-200 flex-shrink-0 shadow-sm">
        {/* Top row */}
        <div className="px-4 py-2.5 flex items-center gap-2 max-w-[1600px] mx-auto w-full">
          {/* Left: back + icon + title */}
          <button
            onClick={() => navigate('/execution/my-engagements')}
            className="flex items-center gap-1 text-slate-500 hover:text-slate-800 text-xs font-medium flex-shrink-0 transition-colors"
          >
            <ArrowLeft size={13} />
            <span className="hidden sm:inline">Görevlerim</span>
          </button>
          <div className="w-px h-4 bg-slate-200 flex-shrink-0" />
          <div className="w-7 h-7 bg-gradient-to-br from-indigo-500 to-blue-600 rounded-lg flex items-center justify-center flex-shrink-0 shadow-sm">
            <Briefcase size={13} className="text-white" />
          </div>
          <h1 className="text-sm font-bold text-slate-900 truncate min-w-0 flex-shrink">{meta.title}</h1>

          {/* Center: current stage badge */}
          <div className="flex-1 flex items-center justify-center min-w-0 px-2">
            <span className={clsx(
              'inline-flex items-center gap-1.5 px-3 py-1 rounded-full border text-[11px] font-bold whitespace-nowrap shadow-sm',
              STAGE_BADGE[phase].pill
            )}>
              <span className={clsx('w-1.5 h-1.5 rounded-full flex-shrink-0', STAGE_BADGE[phase].dot)} />
              {STAGES[phase].label}
            </span>
          </div>

          {/* Right: stage navigation */}
          <div className="flex items-center gap-1.5 flex-shrink-0">
            <button
              onClick={() => save(Math.max(0, phase - 1))}
              disabled={phase === 0 || saving}
              className="flex items-center gap-1 px-2.5 py-1.5 bg-white border border-slate-200 text-slate-700 text-xs font-semibold rounded-lg hover:bg-slate-50 disabled:opacity-30 disabled:cursor-not-allowed shadow-sm transition-all"
            >
              <ArrowLeft size={11} /><span className="hidden sm:inline">Önceki</span>
            </button>
            <span className="text-[10px] text-slate-400 px-0.5 whitespace-nowrap tabular-nums">{phase + 1}/{STAGES.length}</span>
            <button
              onClick={() => save(isLastPhase ? phase : phase + 1)}
              disabled={isLastPhase || saving}
              className="flex items-center gap-1 px-2.5 py-1.5 bg-blue-600 text-white text-xs font-semibold rounded-lg hover:bg-blue-700 disabled:opacity-30 disabled:cursor-not-allowed shadow-sm shadow-blue-200 transition-all"
            >
              <span className="hidden sm:inline">Sonraki</span><ArrowRight size={11} />
            </button>
          </div>
        </div>
        {/* Stepper row */}
        <div className="px-4 pb-2.5 max-w-[1600px] mx-auto w-full">
          <CompactStepper currentPhase={phase} />
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-auto">
        <div className="px-6 py-6 w-full max-w-[1600px] mx-auto">
          <AnimatePresence mode="wait">
            <motion.div key={phase} initial={{ opacity: 0, x: 14 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -14 }} transition={{ duration: 0.18 }}>
              {phase === 0 && <BaslangicStage data={phaseData.baslangic!} onChange={d => updatePhaseData('baslangic', d)} />}
              {phase === 1 && <PlanlamaStage data={phaseData.planlama!} onChange={d => updatePhaseData('planlama', d)} />}
              {phase === 2 && <OnayStage title="Planlama Onayı" desc="Planlama aşamasını gözden geçirin" icon={CheckCircle2} color="violet"
                data={phaseData.planlama_onay!} onChange={d => updatePhaseData('planlama_onay', d)}
                summary={<div className="space-y-1.5 text-sm text-slate-700">
                  <div className="flex gap-2"><Calendar size={12} className="text-slate-400 mt-0.5" /><span><strong>Tarih:</strong> {phaseData.baslangic?.audit_start || '–'} → {phaseData.baslangic?.audit_end || '–'}</span></div>
                  <div className="flex gap-2"><Users size={12} className="text-slate-400 mt-0.5" /><span><strong>Görev sayısı:</strong> {phaseData.planlama?.tasks?.length ?? 0}</span></div>
                </div>} />}
              {phase === 3 && <YurutmeStage title={meta.title} userName={userName} />}
              {phase === 4 && <RaporlamaStage data={phaseData.raporlama!} onChange={d => updatePhaseData('raporlama', d)} />}
              {phase === 5 && <OnayStage title="Raporlama Onayı" desc="Denetim raporunu gözden geçirin" icon={ShieldCheck} color="rose"
                data={phaseData.raporlama_onay!} onChange={d => updatePhaseData('raporlama_onay', d)}
                summary={<div className="text-sm text-slate-700"><strong>Rapor:</strong> {phaseData.raporlama?.report_title || '–'}</div>} />}
              {phase === 6 && <TamamlandiStage data={phaseData.tamamlandi!} onChange={d => updatePhaseData('tamamlandi', d)} />}
              {phase === 7 && <KabanisStage data={phaseData.kapanis!} onChange={d => updatePhaseData('kapanis', d)} />}
            </motion.div>
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}
