import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  FileDown, Plus, X, Clock, CheckCircle2, AlertTriangle,
  Send, Search, Filter, Calendar, User, Paperclip, Sparkles, Brain, Loader2
} from 'lucide-react';
import { supabase } from '@/shared/api/supabase';
import { useSentinelAI } from '@/shared/hooks/useSentinelAI';
import clsx from 'clsx';

interface PBCRequest {
  id: string;
  engagement_id: string | null;
  title: string;
  description: string;
  requested_from: string;
  assigned_to: string | null;
  status: 'PENDING' | 'IN_PROGRESS' | 'SUBMITTED' | 'ACCEPTED' | 'REJECTED';
  priority: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  due_date: string | null;
  created_at: string;
  updated_at: string;
}

const STATUS_CONFIG = {
  PENDING: { label: 'Bekliyor', icon: Clock, bg: 'bg-slate-100', text: 'text-slate-600', dot: 'bg-slate-400' },
  IN_PROGRESS: { label: 'Hazirlaniyor', icon: Clock, bg: 'bg-blue-100', text: 'text-blue-700', dot: 'bg-blue-500' },
  SUBMITTED: { label: 'Gonderildi', icon: Send, bg: 'bg-amber-100', text: 'text-amber-700', dot: 'bg-amber-500' },
  ACCEPTED: { label: 'Kabul Edildi', icon: CheckCircle2, bg: 'bg-green-100', text: 'text-green-700', dot: 'bg-green-500' },
  REJECTED: { label: 'Reddedildi', icon: AlertTriangle, bg: 'bg-red-100', text: 'text-red-700', dot: 'bg-red-500' },
} as const;

const PRIORITY_CONFIG = {
  LOW: { label: 'Dusuk', color: 'bg-slate-100 text-slate-600' },
  MEDIUM: { label: 'Orta', color: 'bg-blue-100 text-blue-700' },
  HIGH: { label: 'Yuksek', color: 'bg-orange-100 text-orange-700' },
  CRITICAL: { label: 'Kritik', color: 'bg-red-100 text-red-700' },
} as const;

interface PBCManagerProps {
  engagementId?: string;
}

const AUDIT_TYPES = [
  'Kredi Surecleri',
  'Hazine & Likidite',
  'BT & Siber Guvenlik',
  'Uyumluluk (MASAK/AML)',
  'Bordro & Insan Kaynaklari',
  'Operasyonel Surecler',
  'Dis Ticaret',
  'Mevduat & Bireysel Bankacilik',
  'Sigortacilik',
  'Diger',
] as const;

export function PBCManager({ engagementId }: PBCManagerProps) {
  const [requests, setRequests] = useState<PBCRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreate, setShowCreate] = useState(false);
  const [filter, setFilter] = useState<string>('ALL');
  const [search, setSearch] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [selectedAuditType, setSelectedAuditType] = useState('');
  const [draftItems, setDraftItems] = useState<string[]>([]);
  const { loading: aiLoading, generate, configured: aiConfigured } = useSentinelAI();
  const [form, setForm] = useState({
    title: '',
    description: '',
    requested_from: '',
    priority: 'MEDIUM' as PBCRequest['priority'],
    due_date: '',
  });

  const handleMagicDraft = async () => {
    if (!selectedAuditType) return;
    const prompt = `Bir Turk bankasinda "${selectedAuditType}" denetimi icin denetlenen birimden talep edilecek standart PBC (Provided-by-Client) belge ve bilgi listesini olustur.

Her madde icin kisa ve net bir baslik ver. Sadece maddeleri sirala, aciklama yapma.
Format: Her satira bir madde yaz (numara olmadan). 8-12 madde yaz.
Ornek: Kredi portfoy raporu, Yetki matrisi, Surec akis semasi gibi.`;

    const result = await generate(prompt);
    if (result) {
      const items = result
        .split('\n')
        .map((l) => l.replace(/^[-*\d.)\]]+\s*/, '').trim())
        .filter((l) => l.length > 3 && l.length < 200);
      setDraftItems(items);
      if (items.length > 0) {
        setForm((p) => ({
          ...p,
          description: items.map((it, i) => `${i + 1}. ${it}`).join('\n'),
        }));
      }
    }
  };

  const applyDraftItem = (item: string) => {
    setForm((p) => ({
      ...p,
      title: item,
      description: p.description,
    }));
  };

  useEffect(() => {
    loadRequests();
  }, [engagementId]);

  const loadRequests = async () => {
    try {
      setLoading(true);
      let query = supabase.from('pbc_requests').select('*').order('created_at', { ascending: false });
      if (engagementId) query = query.eq('engagement_id', engagementId);
      const { data } = await query;
      setRequests((data as PBCRequest[]) || []);
    } catch (err) {
      console.error('Failed to load PBC requests:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = async () => {
    if (!form.title.trim() || !form.requested_from.trim()) return;
    try {
      setSubmitting(true);
      await supabase.from('pbc_requests').insert({
        title: form.title,
        description: form.description,
        requested_from: form.requested_from,
        priority: form.priority,
        due_date: form.due_date || null,
        engagement_id: engagementId || null,
        status: 'PENDING',
      });
      setShowCreate(false);
      setForm({ title: '', description: '', requested_from: '', priority: 'MEDIUM', due_date: '' });
      await loadRequests();
    } catch (err) {
      console.error('Failed to create PBC request:', err);
    } finally {
      setSubmitting(false);
    }
  };

  const handleStatusChange = async (id: string, status: PBCRequest['status']) => {
    try {
      await supabase.from('pbc_requests').update({ status }).eq('id', id);
      setRequests(prev => prev.map(r => r.id === id ? { ...r, status } : r));
    } catch (err) {
      console.error('Failed to update status:', err);
    }
  };

  const filtered = requests.filter(r => {
    if (filter !== 'ALL' && r.status !== filter) return false;
    if (search && !r.title.toLowerCase().includes(search.toLowerCase()) &&
        !r.requested_from.toLowerCase().includes(search.toLowerCase())) return false;
    return true;
  });

  const statusCounts = {
    ALL: requests.length,
    PENDING: requests.filter(r => r.status === 'PENDING').length,
    IN_PROGRESS: requests.filter(r => r.status === 'IN_PROGRESS').length,
    SUBMITTED: requests.filter(r => r.status === 'SUBMITTED').length,
    ACCEPTED: requests.filter(r => r.status === 'ACCEPTED').length,
    REJECTED: requests.filter(r => r.status === 'REJECTED').length,
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
            <FileDown size={20} className="text-blue-600" />
            PBC Talep Yonetimi
          </h2>
          <p className="text-sm text-slate-500 mt-0.5">
            Denetlenen birimlerden belge ve bilgi talepleri
          </p>
        </div>
        <button
          onClick={() => setShowCreate(true)}
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm font-semibold"
        >
          <Plus size={16} />
          Yeni Talep
        </button>
      </div>

      <div className="grid grid-cols-6 gap-3">
        {(['ALL', 'PENDING', 'IN_PROGRESS', 'SUBMITTED', 'ACCEPTED', 'REJECTED'] as const).map(s => (
          <button
            key={s}
            onClick={() => setFilter(s)}
            className={clsx(
              'p-3 rounded-xl border-2 text-center transition-all',
              filter === s
                ? 'border-blue-500 bg-blue-50/80 shadow-md shadow-blue-500/10'
                : 'border-slate-200/60 bg-white/80 hover:border-slate-300 hover:shadow-sm'
            )}
          >
            <p className="text-xl font-black text-slate-900">{statusCounts[s]}</p>
            <p className="text-[10px] font-bold text-slate-500 uppercase">
              {s === 'ALL' ? 'Tumu' : STATUS_CONFIG[s].label}
            </p>
          </button>
        ))}
      </div>

      <div className="flex items-center gap-3">
        <div className="relative flex-1">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Talep ara..."
            className="w-full pl-10 pr-4 py-2.5 bg-white border border-slate-300 rounded-lg text-sm"
          />
        </div>
      </div>

      {loading ? (
        <div className="flex justify-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600" />
        </div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-12 bg-white rounded-xl border-2 border-dashed border-slate-200">
          <FileDown className="mx-auto text-slate-300 mb-3" size={40} />
          <p className="text-sm font-semibold text-slate-600">Talep bulunamadi</p>
        </div>
      ) : (
        <div className="space-y-3">
          {filtered.map((req, idx) => {
            const statusCfg = STATUS_CONFIG[req.status];
            const priorityCfg = PRIORITY_CONFIG[req.priority];
            const StatusIcon = statusCfg.icon;
            const isOverdue = req.due_date && new Date(req.due_date) < new Date() && req.status !== 'ACCEPTED';

            return (
              <motion.div
                key={req.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.03 }}
                className="bg-white/90 backdrop-blur-sm rounded-xl border border-slate-200/60 shadow-sm p-4 hover:border-slate-300 hover:shadow-md transition-all"
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="flex items-start gap-3 flex-1">
                    <div className={clsx('w-2 h-2 rounded-full mt-2 flex-shrink-0', statusCfg.dot)} />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <h3 className="font-semibold text-slate-900 text-sm">{req.title}</h3>
                        <span className={clsx('text-[10px] font-bold px-2 py-0.5 rounded', priorityCfg.color)}>
                          {priorityCfg.label}
                        </span>
                        {isOverdue && (
                          <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-red-100 text-red-700 flex items-center gap-1">
                            <AlertTriangle size={10} />
                            Gecikme
                          </span>
                        )}
                      </div>
                      {req.description && (
                        <p className="text-xs text-slate-500 mt-1 line-clamp-1">{req.description}</p>
                      )}
                      <div className="flex items-center gap-4 mt-2 text-xs text-slate-500">
                        <span className="flex items-center gap-1">
                          <User size={12} />
                          {req.requested_from}
                        </span>
                        {req.due_date && (
                          <span className={clsx('flex items-center gap-1', isOverdue && 'text-red-600 font-semibold')}>
                            <Calendar size={12} />
                            {new Date(req.due_date).toLocaleDateString('tr-TR')}
                          </span>
                        )}
                        <span className="flex items-center gap-1">
                          <Clock size={12} />
                          {new Date(req.created_at).toLocaleDateString('tr-TR')}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <span className={clsx('flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-lg', statusCfg.bg, statusCfg.text)}>
                      <StatusIcon size={14} />
                      {statusCfg.label}
                    </span>
                    <select
                      value={req.status}
                      onChange={(e) => handleStatusChange(req.id, e.target.value as PBCRequest['status'])}
                      className="text-xs border border-slate-300 rounded-lg px-2 py-1.5 bg-white"
                    >
                      <option value="PENDING">Bekliyor</option>
                      <option value="IN_PROGRESS">Hazirlaniyor</option>
                      <option value="SUBMITTED">Gonderildi</option>
                      <option value="ACCEPTED">Kabul Edildi</option>
                      <option value="REJECTED">Reddedildi</option>
                    </select>
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>
      )}

      <AnimatePresence>
        {showCreate && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
            onClick={() => !submitting && setShowCreate(false)}
          >
            <motion.div
              initial={{ scale: 0.95, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.95, y: 20 }}
              className="bg-white rounded-2xl shadow-2xl max-w-lg w-full"
              onClick={e => e.stopPropagation()}
            >
              <div className="bg-gradient-to-r from-blue-600 to-blue-700 px-6 py-4 rounded-t-2xl flex items-center justify-between">
                <h2 className="text-lg font-bold text-white flex items-center gap-2">
                  <FileDown size={20} />
                  Yeni PBC Talebi
                </h2>
                <button
                  onClick={() => !submitting && setShowCreate(false)}
                  className="w-8 h-8 bg-white/20 rounded-lg flex items-center justify-center hover:bg-white/30"
                  disabled={submitting}
                >
                  <X size={16} className="text-white" />
                </button>
              </div>

              <div className="p-6 space-y-4">
                <div className="bg-gradient-to-r from-slate-800 to-slate-700 rounded-xl p-4">
                  <div className="flex items-center gap-2 mb-3">
                    <Brain size={16} className="text-blue-400" />
                    <h4 className="text-sm font-bold text-white">Magic Draft - AI ile Otomatik Taslak</h4>
                  </div>
                  <div className="flex items-end gap-3">
                    <div className="flex-1">
                      <label className="block text-xs font-semibold text-slate-300 mb-1">Denetim Turu</label>
                      <select
                        value={selectedAuditType}
                        onChange={(e) => setSelectedAuditType(e.target.value)}
                        className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-sm text-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500 [&>option]:text-slate-900"
                        disabled={aiLoading || submitting}
                      >
                        <option value="">Denetim turu secin...</option>
                        {AUDIT_TYPES.map((t) => (
                          <option key={t} value={t}>{t}</option>
                        ))}
                      </select>
                    </div>
                    <button
                      onClick={handleMagicDraft}
                      disabled={!selectedAuditType || aiLoading || submitting || !aiConfigured}
                      className="flex items-center gap-2 px-4 py-2 bg-blue-500 text-white rounded-lg text-sm font-bold hover:bg-blue-600 disabled:bg-slate-600 disabled:text-slate-400 transition-colors whitespace-nowrap"
                    >
                      {aiLoading ? (
                        <Loader2 size={14} className="animate-spin" />
                      ) : (
                        <Sparkles size={14} />
                      )}
                      {aiLoading ? 'Uretiliyor...' : 'Magic Draft'}
                    </button>
                  </div>
                  {!aiConfigured && (
                    <p className="text-[10px] text-amber-400 mt-2">
                      AI motoru yapilandirilmamis. Ayarlar &gt; Cognitive Engine
                    </p>
                  )}
                </div>

                {draftItems.length > 0 && (
                  <div className="bg-blue-50 border border-blue-200 rounded-xl p-3">
                    <p className="text-xs font-bold text-blue-800 mb-2 flex items-center gap-1.5">
                      <Sparkles size={12} />
                      AI Onerileri - Baslik olarak kullanmak icin tiklayin
                    </p>
                    <div className="flex flex-wrap gap-1.5">
                      {draftItems.map((item, i) => (
                        <button
                          key={i}
                          onClick={() => applyDraftItem(item)}
                          className="text-[11px] px-2.5 py-1 bg-white border border-blue-200 rounded-lg text-blue-700 hover:bg-blue-100 transition-colors"
                        >
                          {item}
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-1">
                    Talep Basligi <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={form.title}
                    onChange={e => setForm(p => ({ ...p, title: e.target.value }))}
                    className="w-full px-4 py-2.5 bg-slate-50 border-2 border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="Ornegin: 2025 Kredi Portfoy Raporu"
                    disabled={submitting}
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-1">Aciklama</label>
                  <textarea
                    value={form.description}
                    onChange={e => setForm(p => ({ ...p, description: e.target.value }))}
                    className="w-full px-4 py-2.5 bg-slate-50 border-2 border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 min-h-[80px]"
                    placeholder="Talep detaylari..."
                    disabled={submitting}
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-semibold text-slate-700 mb-1">
                      Talep Edilen Birim <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      value={form.requested_from}
                      onChange={e => setForm(p => ({ ...p, requested_from: e.target.value }))}
                      className="w-full px-4 py-2.5 bg-slate-50 border-2 border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      placeholder="Birim adi"
                      disabled={submitting}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-slate-700 mb-1">Oncelik</label>
                    <select
                      value={form.priority}
                      onChange={e => setForm(p => ({ ...p, priority: e.target.value as PBCRequest['priority'] }))}
                      className="w-full px-4 py-2.5 bg-slate-50 border-2 border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      disabled={submitting}
                    >
                      <option value="LOW">Dusuk</option>
                      <option value="MEDIUM">Orta</option>
                      <option value="HIGH">Yuksek</option>
                      <option value="CRITICAL">Kritik</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-1">Teslim Tarihi</label>
                  <input
                    type="date"
                    value={form.due_date}
                    onChange={e => setForm(p => ({ ...p, due_date: e.target.value }))}
                    className="w-full px-4 py-2.5 bg-slate-50 border-2 border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    disabled={submitting}
                  />
                </div>
              </div>

              <div className="bg-slate-50 px-6 py-4 flex justify-end gap-3 border-t border-slate-200 rounded-b-2xl">
                <button
                  onClick={() => !submitting && setShowCreate(false)}
                  className="px-5 py-2 bg-white border border-slate-300 text-slate-700 rounded-lg font-medium text-sm"
                  disabled={submitting}
                >
                  Iptal
                </button>
                <button
                  onClick={handleCreate}
                  disabled={submitting || !form.title.trim() || !form.requested_from.trim()}
                  className="flex items-center gap-2 px-5 py-2 bg-blue-600 text-white rounded-lg font-semibold text-sm hover:bg-blue-700 disabled:bg-slate-400"
                >
                  {submitting ? (
                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  ) : (
                    <Send size={14} />
                  )}
                  Talep Olustur
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
