import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  FileText, AlertTriangle, Send, CheckCircle, Clock, ArrowLeft, 
  Sun, Moon, MessageSquare, ShieldCheck, User, Calendar, Loader2, Lightbulb, Briefcase
} from 'lucide-react';
import clsx from 'clsx';
import { toast } from 'react-hot-toast';

// MEVCUT API VE TİPLERİNİZ (Eksiksiz korundu)
import { comprehensiveFindingApi, auditeePortalApi } from '@/entities/finding/api/module5-api';
import type { ComprehensiveFinding } from '@/entities/finding/model/types';
import { NegotiationChat } from '@/features/finding-studio/components/NegotiationChat';

const SEVERITY_CONFIG = {
  CRITICAL: { label: 'Kritik Risk', color: 'text-red-500', shadow: 'shadow-[0_0_15px_rgba(239,68,68,0.5)]', border: 'border-red-500/50', badgeBg: 'bg-red-500/20' },
  HIGH: { label: 'Yüksek Risk', color: 'text-orange-500', shadow: 'shadow-[0_0_15px_rgba(249,115,22,0.5)]', border: 'border-orange-500/50', badgeBg: 'bg-orange-500/20' },
  MEDIUM: { label: 'Orta Risk', color: 'text-yellow-500', shadow: 'shadow-[0_0_15px_rgba(234,179,8,0.5)]', border: 'border-yellow-500/50', badgeBg: 'bg-yellow-500/20' },
  LOW: { label: 'Düşük Risk', color: 'text-blue-500', shadow: 'shadow-[0_0_15px_rgba(59,130,246,0.5)]', border: 'border-blue-500/50', badgeBg: 'bg-blue-500/20' },
  OBSERVATION: { label: 'Gözlem', color: 'text-slate-400', shadow: '', border: 'border-slate-500/50', badgeBg: 'bg-slate-500/20' },
};

export const AuditeePortalPage = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  
  // ORİJİNAL STATE'LER
  const [finding, setFinding] = useState<ComprehensiveFinding | null>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  // YENİ UX STATE'LERİ
  const [warmth, setWarmth] = useState(0); // 0 (Soğuk) - 100 (Sıcak/Sarı)
  const [showConfetti, setShowConfetti] = useState(false);

  // ORİJİNAL FORM STATE'İ
  const [actionPlanForm, setActionPlanForm] = useState({
    title: '',
    description: '',
    responsible_person: '',
    responsible_person_title: '',
    responsible_department: '',
    target_date: '',
    priority: 'MEDIUM' as const,
  });
  const [comment, setComment] = useState('');

  useEffect(() => {
    if (id) {
      loadFinding();
    }
  }, [id]);

  const loadFinding = async () => {
    if (!id) return;
    try {
      setLoading(true);
      const data = await comprehensiveFindingApi.getById(id);
      setFinding(data);
    } catch (error) {
      console.error('Failed to load finding:', error);
      toast.error('Bulgu yüklenirken bir hata oluştu.');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmitResponse = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!id) return;

    try {
      setSubmitting(true);

      // ORİJİNAL API ÇAĞRISI
      await auditeePortalApi.submitResponse(
        id,
        actionPlanForm,
        comment || undefined
      );

      await loadFinding();

      // Formu Temizle
      setActionPlanForm({
        title: '', description: '', responsible_person: '', responsible_person_title: '',
        responsible_department: '', target_date: '', priority: 'MEDIUM',
      });
      setComment('');

      // Başarı Animasyonu (Konfeti)
      setShowConfetti(true);
      toast.success('Aksiyon Planı Başarıyla Gönderildi!');
      setTimeout(() => setShowConfetti(false), 3500);

    } catch (error) {
      console.error('Failed to submit response:', error);
      toast.error('Aksiyon planı gönderilemedi. Lütfen tekrar deneyin.');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return <div className="h-screen w-full flex items-center justify-center bg-slate-900"><Loader2 className="w-10 h-10 text-blue-500 animate-spin" /></div>;
  }

  if (!finding) {
    return (
      <div className="h-screen w-full flex items-center justify-center bg-slate-900">
        <div className="text-center">
          <AlertTriangle className="text-red-500 mx-auto mb-4" size={48} />
          <p className="text-lg text-white font-semibold mb-4">Bulgu bulunamadı veya erişim yetkiniz yok.</p>
          <button onClick={() => navigate('/auditee')} className="px-6 py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-bold transition-colors">
            Gösterge Paneline Dön
          </button>
        </div>
      </div>
    );
  }

  const sevStyle = SEVERITY_CONFIG[finding.severity as keyof typeof SEVERITY_CONFIG] || SEVERITY_CONFIG.MEDIUM;

  return (
    <div className="flex h-screen w-full overflow-hidden bg-[url('https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?q=80&w=2564&auto=format&fit=crop')] bg-cover bg-center">
      
      {/* ================================================================================= */}
      {/* SOL PANEL: OKUMA MODU (APPLE GLASS & ZEN READER - BLIND MODE ACTIVE)                */}
      {/* ================================================================================= */}
      <div className="relative w-1/2 h-full flex flex-col backdrop-blur-2xl bg-white/10 border-r border-white/20 transition-colors duration-500">
        
        {/* WARMTH (SAYFA SICAKLIĞI) OVERLAY */}
        <div 
            className="absolute inset-0 pointer-events-none transition-opacity duration-300"
            style={{ 
                backgroundColor: '#fcd34d', 
                opacity: warmth * 0.0035, 
                mixBlendMode: 'color-burn'
            }} 
        />

        {/* Üst Bar (Geri Dön ve Ayarlar) */}
        <div className="h-16 px-8 flex items-center justify-between border-b border-white/10 shrink-0 z-10 bg-black/10">
          <button onClick={() => navigate('/auditee')} className="flex items-center gap-2 text-white/70 hover:text-white transition-colors">
            <ArrowLeft size={18} />
            <span className="font-semibold text-sm">Gösterge Paneline Dön</span>
          </button>

          {/* Sayfa Sıcaklık Ayarı (Warmth Slider) */}
          <div className="flex items-center gap-3 bg-black/20 px-4 py-1.5 rounded-full border border-white/10 shadow-inner">
            <Sun size={14} className={warmth < 50 ? 'text-white' : 'text-white/40'} />
            <input 
                type="range" min="0" max="100" value={warmth} 
                onChange={(e) => setWarmth(parseInt(e.target.value))}
                className="w-24 h-1 bg-white/20 rounded-lg appearance-none cursor-pointer accent-white"
            />
            <Moon size={14} className={warmth >= 50 ? 'text-white' : 'text-white/40'} />
          </div>
        </div>

        {/* İçerik (Sadece Okuma - Denetçi Kök Neden Notları GİZLİ) */}
        <div className="flex-1 overflow-y-auto p-12 z-10 custom-scrollbar">
          <div className="max-w-2xl mx-auto">
            {/* Neon Badge */}
            <div className={clsx("inline-flex items-center gap-2 px-3 py-1 rounded border bg-black/40 backdrop-blur-md mb-6", sevStyle.border, sevStyle.shadow)}>
                <div className={clsx("w-2 h-2 rounded-full", sevStyle.color.replace('text-', 'bg-'))} />
                <span className={clsx("text-xs font-black tracking-widest uppercase", sevStyle.color)}>{sevStyle.label}</span>
            </div>

            <h1 className="text-4xl font-black text-white leading-tight mb-4 drop-shadow-md">
                {finding.title}
            </h1>
            
            <div className="flex flex-wrap items-center gap-4 text-white/60 text-sm font-medium mb-10 border-b border-white/10 pb-6">
                <span className="flex items-center gap-1"><FileText size={16} /> Referans: {finding.finding_code || finding.code}</span>
                {finding.gias_category && <span className="flex items-center gap-1"><Briefcase size={16} /> Kategori: {finding.gias_category}</span>}
                <span className="flex items-center gap-1"><Clock size={16} /> Tarih: {finding.published_at ? new Date(finding.published_at).toLocaleDateString() : 'Belirtilmedi'}</span>
            </div>

            <div className="space-y-10 text-white/90">
                <section>
                    <h3 className="text-xs font-black text-white/50 uppercase tracking-widest mb-4">Tespit Edilen Durum (Condition)</h3>
                    <div 
                        className="prose prose-invert prose-lg max-w-none font-medium leading-relaxed prose-p:mb-4"
                        dangerouslySetInnerHTML={{ __html: finding.description_public || finding.description || 'Açıklama bulunmuyor.' }} 
                    />
                </section>

                {/* Eğer varsa Düzeltici Öneriyi göster */}
                {finding.details?.recommendation_text && (
                  <section className="bg-blue-900/20 border border-blue-500/20 p-6 rounded-2xl shadow-inner">
                      <h3 className="text-xs font-black text-blue-400 uppercase tracking-widest mb-4 flex items-center gap-2">
                          <Lightbulb size={16} /> Beklenen Aksiyon (Recommendation)
                      </h3>
                      <div 
                          className="prose prose-invert max-w-none text-blue-50 leading-relaxed"
                          dangerouslySetInnerHTML={{ __html: finding.details.recommendation_text }} 
                      />
                  </section>
                )}
            </div>
          </div>
        </div>
      </div>


      {/* ================================================================================= */}
      {/* SAĞ PANEL: AKSİYON ALANI (KOYU TEMA OPERASYON ÜSSÜ)                                 */}
      {/* ================================================================================= */}
      <div className="w-1/2 h-full bg-[#0f172a] flex flex-col shadow-2xl relative z-20 border-l border-slate-800">
        
        {/* Başarı Konfeti Efekti */}
        <AnimatePresence>
            {showConfetti && (
                <motion.div 
                    initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0 }}
                    className="absolute inset-0 z-[100] flex items-center justify-center bg-slate-900/80 backdrop-blur-sm"
                >
                    <div className="text-center">
                        <div className="w-24 h-24 bg-emerald-500 rounded-full flex items-center justify-center mx-auto mb-6 shadow-[0_0_30px_rgba(16,185,129,0.5)]">
                            <CheckCircle className="w-12 h-12 text-white" />
                        </div>
                        <h2 className="text-3xl font-black text-white mb-2">Aksiyon Alındı!</h2>
                        <p className="text-slate-300 font-medium">Aksiyon planınız incelenmek üzere denetçiye iletildi.</p>
                    </div>
                </motion.div>
            )}
        </AnimatePresence>

        <div className="h-16 px-8 flex items-center border-b border-slate-800 shrink-0 bg-slate-900 shadow-md z-10">
            <h2 className="text-lg font-bold text-white flex items-center gap-2">
                <ShieldCheck className="text-blue-500" /> Operasyon & Aksiyon Üssü
            </h2>
        </div>

        <div className="flex-1 overflow-y-auto p-8 custom-scrollbar">
            <div className="max-w-xl mx-auto space-y-8 pb-12">
                
                {/* EĞER ÖNCEDEN GİRİLMİŞ AKSİYON PLANLARI VARSA LİSTELE */}
                {finding.action_plans && finding.action_plans.length > 0 && (
                  <div className="space-y-4">
                    <h3 className="text-sm font-bold text-white flex items-center gap-2 mb-4">
                      <CheckCircle size={18} className="text-emerald-500" /> Mevcut Aksiyon Planları
                    </h3>
                    {finding.action_plans.map((plan) => (
                      <div key={plan.id} className="p-5 bg-slate-800/80 rounded-xl border border-slate-700 shadow-sm">
                        <div className="flex items-start justify-between mb-3">
                          <h4 className="font-bold text-white">{plan.title}</h4>
                          <span className={clsx(
                            "text-xs px-2.5 py-1 rounded font-bold tracking-wide",
                            plan.status === 'APPROVED' ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30' : 
                            plan.status === 'IN_REVIEW' ? 'bg-blue-500/20 text-blue-400 border border-blue-500/30' : 
                            'bg-slate-500/20 text-slate-300 border border-slate-500/30'
                          )}>
                            {plan.status === 'APPROVED' ? 'Onaylandı' : plan.status === 'IN_REVIEW' ? 'İncelemede' : plan.status}
                          </span>
                        </div>
                        <p className="text-sm text-slate-300 mb-4 leading-relaxed">{plan.description}</p>
                        <div className="grid grid-cols-2 gap-4 text-xs">
                          <div>
                            <div className="text-slate-500 font-semibold mb-1">Sorumlu Kişi</div>
                            <div className="font-bold text-slate-200">{plan.responsible_person}</div>
                          </div>
                          <div>
                            <div className="text-slate-500 font-semibold mb-1">Hedef Termin</div>
                            <div className="font-bold text-slate-200">{new Date(plan.target_date).toLocaleDateString('tr-TR')}</div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                {/* YENİ AKSİYON GİRİŞ FORMU */}
                <div className="bg-slate-800/40 border border-slate-700 rounded-2xl p-6 shadow-lg">
                    <div className="flex items-center gap-3 mb-6 border-b border-slate-700 pb-4">
                        <div className="w-10 h-10 rounded-xl bg-blue-500/20 flex items-center justify-center border border-blue-500/30">
                            <Send className="w-5 h-5 text-blue-400 ml-0.5" />
                        </div>
                        <div>
                            <h3 className="text-base font-bold text-white">Aksiyon Planı Oluştur</h3>
                            <p className="text-xs text-slate-400 font-medium">Bu bulguyu çözmek için detayları girin</p>
                        </div>
                    </div>

                    <form onSubmit={handleSubmitResponse} className="space-y-5">
                        <div>
                            <label className="block text-xs font-bold text-slate-400 uppercase mb-2">Plan Başlığı *</label>
                            <input 
                                type="text" required
                                value={actionPlanForm.title} onChange={(e) => setActionPlanForm({ ...actionPlanForm, title: e.target.value })}
                                placeholder="Örn: Kasa Prosedürü Güncellemesi"
                                className="w-full px-4 py-3 bg-slate-900 border border-slate-700 rounded-xl text-slate-200 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                            />
                        </div>

                        <div>
                            <label className="block text-xs font-bold text-slate-400 uppercase mb-2">Aksiyon Detayı (Nasıl Çözülecek?) *</label>
                            <textarea 
                                required
                                value={actionPlanForm.description} onChange={(e) => setActionPlanForm({ ...actionPlanForm, description: e.target.value })}
                                rows={3}
                                placeholder="Alınacak aksiyonları detaylıca açıklayın..."
                                className="w-full px-4 py-3 bg-slate-900 border border-slate-700 rounded-xl text-slate-200 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all resize-none"
                            />
                        </div>
                        
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="block text-xs font-bold text-slate-400 uppercase mb-2">Sorumlu Kişi *</label>
                                <div className="flex items-center gap-2 px-4 py-2.5 bg-slate-900 border border-slate-700 rounded-xl focus-within:border-blue-500 focus-within:ring-1 focus-within:ring-blue-500 transition-all">
                                    <User size={16} className="text-slate-500" />
                                    <input 
                                        type="text" required
                                        value={actionPlanForm.responsible_person} onChange={(e) => setActionPlanForm({ ...actionPlanForm, responsible_person: e.target.value })}
                                        className="bg-transparent border-none outline-none text-sm font-medium text-slate-200 w-full placeholder:text-slate-600"
                                        placeholder="İsim Soyisim"
                                    />
                                </div>
                            </div>
                            <div>
                                <label className="block text-xs font-bold text-slate-400 uppercase mb-2">Hedef Termin *</label>
                                <div className="flex items-center gap-2 px-4 py-2.5 bg-slate-900 border border-slate-700 rounded-xl focus-within:border-blue-500 focus-within:ring-1 focus-within:ring-blue-500 transition-all">
                                    <Calendar size={16} className="text-slate-500" />
                                    <input 
                                        type="date" required
                                        value={actionPlanForm.target_date} onChange={(e) => setActionPlanForm({ ...actionPlanForm, target_date: e.target.value })}
                                        className="bg-transparent border-none outline-none text-sm text-slate-200 w-full [color-scheme:dark]"
                                    />
                                </div>
                            </div>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="block text-xs font-bold text-slate-400 uppercase mb-2">Departman</label>
                                <input 
                                    type="text"
                                    value={actionPlanForm.responsible_department} onChange={(e) => setActionPlanForm({ ...actionPlanForm, responsible_department: e.target.value })}
                                    className="w-full px-4 py-2.5 bg-slate-900 border border-slate-700 rounded-xl text-sm font-medium text-slate-200 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                                    placeholder="Örn: Şube Operasyon"
                                />
                            </div>
                            <div>
                                <label className="block text-xs font-bold text-slate-400 uppercase mb-2">Öncelik</label>
                                <select 
                                    value={actionPlanForm.priority} onChange={(e) => setActionPlanForm({ ...actionPlanForm, priority: e.target.value as any })}
                                    className="w-full px-4 py-2.5 bg-slate-900 border border-slate-700 rounded-xl text-sm font-medium text-slate-200 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                                >
                                    <option value="LOW">Düşük</option>
                                    <option value="MEDIUM">Orta</option>
                                    <option value="HIGH">Yüksek</option>
                                    <option value="CRITICAL">Kritik</option>
                                </select>
                            </div>
                        </div>

                        <div>
                            <label className="block text-xs font-bold text-slate-400 uppercase mb-2">Denetçiye Ek Not / Yorum (Opsiyonel)</label>
                            <textarea 
                                value={comment} onChange={(e) => setComment(e.target.value)}
                                rows={2}
                                placeholder="İletmek istediğiniz ilave bir not varsa yazın..."
                                className="w-full px-4 py-3 bg-slate-900 border border-slate-700 rounded-xl text-sm text-slate-200 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all resize-none"
                            />
                        </div>

                        <button 
                            type="submit" disabled={submitting}
                            className="w-full py-3.5 mt-2 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white rounded-xl font-bold flex items-center justify-center gap-2 shadow-lg shadow-blue-900/50 transition-all active:scale-[0.98] disabled:opacity-50"
                        >
                            {submitting ? <Loader2 size={18} className="animate-spin" /> : <Send size={18} />}
                            Aksiyon Planını Gönder
                        </button>
                    </form>
                </div>

                {/* SOHBET (MÜZAKERE) MODÜLÜ */}
                <div className="bg-slate-800/40 border border-slate-700 rounded-2xl overflow-hidden flex flex-col h-[400px] shadow-lg">
                    <div className="px-6 py-4 border-b border-slate-700 bg-slate-800/80 flex items-center gap-3">
                        <MessageSquare className="text-slate-400 w-5 h-5" />
                        <h3 className="text-sm font-bold text-white">Denetçi ile Müzakere & Soru Cevap</h3>
                    </div>
                    <div className="flex-1 overflow-hidden relative bg-slate-900/50">
                        {/* Orijinal NegotiationChat bileşeniniz çalışıyor.
                            Gerekirse CSS sınıfları ile koyu temaya adapte edilebilir.
                        */}
                        <NegotiationChat 
                            findingId={finding.id}
                            currentUserId="auditee-1"
                            currentUserName="Birim Yöneticisi"
                            currentUserRole="AUDITEE"
                            tenantId="default-tenant"
                        />
                    </div>
                </div>

            </div>
        </div>
      </div>
    </div>
  );
};