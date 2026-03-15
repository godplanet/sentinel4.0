import { formatCost } from '@/features/planning/lib/ResourceAllocator';
import { updateHourlyRate } from '@/features/talent-os/api';
import { AuditorProfileCard } from '@/features/talent-os/components/AuditorProfileCard';
import { CompetencyRadar } from '@/features/talent-os/components/CompetencyRadar';
import { useTalentData, type TalentProfileEnriched } from '@/features/talent-os/hooks/useTalentData';
import {
 buildDecayMap,
 calculateAuditorDecay,
 persistDecayResults,
 type AuditorDecaySummary,
} from '@/features/talent-os/lib/EntropyEngine';
import { supabase } from '@/shared/api/supabase';
import { AnimatePresence, motion } from 'framer-motion';
import { Activity, AlertTriangle, Award, Check, DollarSign, Loader2, RefreshCw, Send, ShieldCheck, TrendingDown, Users, X, Zap } from 'lucide-react';
import { useCallback, useEffect, useState } from 'react';

const KUDOS_CATEGORIES = [
 { value: 'QUALITY', label: 'Kalite', color: 'border-sky-200 bg-sky-50 text-sky-700' },
 { value: 'TEAMWORK', label: 'Takım Ruhu', color: 'border-teal-200 bg-teal-50 text-teal-700' },
 { value: 'INNOVATION', label: 'İnovasyon', color: 'border-amber-200 bg-amber-50 text-amber-700' },
 { value: 'LEADERSHIP', label: 'Liderlik', color: 'border-rose-200 bg-rose-50 text-rose-700' },
 { value: 'MENTORING', label: 'Mentorluk', color: 'border-violet-200 bg-violet-50 text-violet-700' },
 { value: 'GENERAL', label: 'Genel', color: 'border-slate-200 bg-slate-100 text-slate-700' },
] as const;

const KUDOS_AMOUNTS = [10, 25, 50] as const;



interface KudosModalProps {
 profiles: TalentProfileEnriched[];
 defaultReceiver: TalentProfileEnriched | null;
 onClose: () => void;
}

function KudosModal({ profiles, defaultReceiver, onClose }: KudosModalProps) {
 const [receiver, setReceiver] = useState<string>(defaultReceiver?.id ?? '');
 const [message, setMessage] = useState('');
 const [category, setCategory] = useState<string>('QUALITY');
 const [amount, setAmount] = useState<number>(25);
 const [sent, setSent] = useState(false);
 const [sending, setSending] = useState(false);

 const handleSend = async () => {
 if (!receiver || !message.trim()) return;
 setSending(true);
 await new Promise((r) => setTimeout(r, 800));
 setSending(false);
 setSent(true);
 setTimeout(onClose, 1800);
 };

 const receiverProfile = profiles.find((p) => p.id === receiver);

 return (
 <motion.div
 initial={{ opacity: 0 }}
 animate={{ opacity: 1 }}
 exit={{ opacity: 0 }}
 className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-50 flex items-center justify-center p-4"
 onClick={onClose}
 >
 <motion.div
 initial={{ scale: 0.92, y: 10 }}
 animate={{ scale: 1, y: 0 }}
 exit={{ scale: 0.92, y: 10 }}
 transition={{ type: 'spring', stiffness: 400, damping: 30 }}
 className="bg-surface border border-slate-200 rounded-2xl p-4 w-full max-w-md shadow-xl"
 onClick={(e) => e.stopPropagation()}
 >
 <div className="flex items-center justify-between mb-5">
 <div className="flex items-center gap-2">
 <div className="w-8 h-8 bg-amber-100 border border-amber-200 rounded-lg flex items-center justify-center">
 <Zap className="w-4 h-4 text-amber-600" />
 </div>
 <div>
 <h3 className="text-slate-800 font-semibold text-sm">Kudos Gönder</h3>
 <p className="text-slate-500 text-[10px]">Ekip üyelerini ödüllendir</p>
 </div>
 </div>
 <button onClick={onClose} className="text-slate-400 hover:text-slate-600 transition-colors">
 <X className="w-5 h-5" />
 </button>
 </div>

 {sent ? (
 <motion.div
 initial={{ scale: 0.8, opacity: 0 }}
 animate={{ scale: 1, opacity: 1 }}
 className="text-center py-5"
 >
 <div className="w-16 h-16 bg-amber-50 border border-amber-200 rounded-full flex items-center justify-center mx-auto mb-3">
 <Zap className="w-8 h-8 text-amber-500" />
 </div>
 <p className="text-slate-800 font-semibold text-lg">Kudos gönderildi!</p>
 <p className="text-slate-500 text-sm mt-1 font-medium">{amount} XP → {receiverProfile?.full_name}</p>
 </motion.div>
 ) : (
 <div className="space-y-4">
 <div>
 <label className="text-[10px] text-slate-500 uppercase tracking-widest font-semibold block mb-1.5">
 Alıcı
 </label>
 <select
 value={receiver}
 onChange={(e) => setReceiver(e.target.value)}
 className="w-full bg-canvas border border-slate-200 rounded-xl px-3 py-2.5 text-slate-800 text-sm focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-shadow"
 >
 <option value="" disabled>Seçin...</option>
 {(profiles || []).map((p) => (
 <option key={p.id} value={p.id}>{p.full_name}</option>
 ))}
 </select>
 </div>

 <div>
 <label className="text-[10px] text-slate-500 uppercase tracking-widest font-semibold block mb-1.5">
 Kategori
 </label>
 <div className="grid grid-cols-3 gap-1.5">
 {(KUDOS_CATEGORIES || []).map((cat) => (
 <button
 key={cat.value}
 onClick={() => setCategory(cat.value)}
 className={`px-2 py-1.5 rounded-lg text-[10px] font-semibold border transition-all
 ${category === cat.value ? cat.color : 'bg-canvas text-slate-600 border-slate-200 hover:border-slate-300'}`}
 >
 {cat.label}
 </button>
 ))}
 </div>
 </div>

 <div>
 <label className="text-[10px] text-slate-500 uppercase tracking-widest font-semibold block mb-1.5">
 XP Miktarı
 </label>
 <div className="flex gap-2">
 {(KUDOS_AMOUNTS || []).map((a) => (
 <button
 key={a}
 onClick={() => setAmount(a)}
 className={`flex-1 py-2 rounded-xl text-sm font-bold font-mono border transition-all
 ${amount === a
 ? 'bg-amber-100 text-amber-700 border-amber-300 shadow-sm'
 : 'bg-canvas text-slate-600 border-slate-200 hover:border-slate-300'}`}
 >
 +{a}
 </button>
 ))}
 </div>
 </div>

 <div>
 <label className="text-[10px] text-slate-500 uppercase tracking-widest font-semibold block mb-1.5">
 Mesaj
 </label>
 <textarea
 value={message}
 onChange={(e) => setMessage(e.target.value)}
 placeholder="Neden bu kudos'u hak etti?"
 rows={3}
 className="w-full bg-canvas border border-slate-200 rounded-xl px-3 py-2.5 text-slate-800 text-sm placeholder:text-slate-400 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-shadow resize-none"
 />
 </div>

 <button
 onClick={handleSend}
 disabled={!receiver || !message.trim() || sending}
 className="w-full flex items-center justify-center gap-2 py-2.5 bg-amber-50 hover:bg-amber-100 text-amber-700 border border-amber-200 shadow-sm rounded-xl text-sm font-semibold transition-all disabled:opacity-50 disabled:cursor-not-allowed"
 >
 {sending ? (
 <div className="w-4 h-4 border-2 border-amber-500 border-t-transparent rounded-full animate-spin" />
 ) : (
 <Send className="w-4 h-4" />
 )}
 {sending ? 'Gönderiliyor...' : `${amount} XP Gönder`}
 </button>
 </div>
 )}
 </motion.div>
 </motion.div>
 );
}

const CURRENCY_OPTIONS = ['TRY', 'USD', 'EUR'] as const;

function HourlyRateRow({ profile, onSaved }: { profile: TalentProfileEnriched; onSaved: () => void }) {
 const [rate, setRate] = useState<number>(profile.hourly_rate ?? 1500);
 const [currency, setCurrency] = useState<string>(profile.currency ?? 'TRY');
 const [saving, setSaving] = useState(false);
 const [saved, setSaved] = useState(false);
 const dirty = rate !== (profile.hourly_rate ?? 1500) || currency !== (profile.currency ?? 'TRY');

 const handleSave = async () => {
 if (!dirty) return;
 try {
 setSaving(true);
 await updateHourlyRate(profile.id, rate, currency);
 setSaved(true);
 onSaved();
 setTimeout(() => setSaved(false), 2000);
 } catch {
 // no-op
 } finally {
 setSaving(false);
 }
 };

 const TITLE_COLORS: Record<string, string> = {
 Expert: 'text-amber-600',
 Manager: 'text-sky-600',
 Senior: 'text-emerald-600',
 Junior: 'text-slate-500',
 };

 return (
 <div className="flex items-center gap-3 px-4 py-3 border-b border-slate-100 hover:bg-slate-50 transition-colors">
 <div className="w-8 h-8 rounded-full bg-slate-200 flex items-center justify-center text-xs font-bold text-slate-600 flex-shrink-0">
 {profile.full_name.charAt(0)}
 </div>

 <div className="flex-1 min-w-0">
 <p className="text-slate-800 text-sm font-medium truncate">{profile.full_name}</p>
 <p className={`text-[11px] font-semibold ${TITLE_COLORS[profile.title] ?? 'text-slate-500'}`}>
 {profile.title}
 </p>
 </div>

 <div className="flex items-center gap-2">
 <select
 value={currency}
 onChange={(e) => setCurrency(e.target.value)}
 className="bg-canvas border border-slate-200 text-slate-700 text-xs rounded-lg px-2 py-1.5 focus:outline-none focus:border-blue-500 transition-colors"
 >
 {(CURRENCY_OPTIONS || []).map((c) => (
 <option key={c} value={c}>{c}</option>
 ))}
 </select>

 <input
 type="number"
 min={100}
 max={50000}
 step={100}
 value={rate}
 onChange={(e) => setRate(Math.max(100, parseFloat(e.target.value) || 100))}
 onKeyDown={(e) => e.key === 'Enter' && handleSave()}
 className="w-28 bg-canvas border border-slate-200 text-slate-800 text-sm font-mono font-semibold rounded-lg px-3 py-1.5 text-right focus:outline-none focus:border-blue-500 transition-colors"
 />

 <button
 onClick={handleSave}
 disabled={!dirty || saving}
 className={`w-8 h-8 rounded-lg flex items-center justify-center transition-all flex-shrink-0 ${
 saved
 ? 'bg-emerald-100 border border-emerald-200 text-emerald-600'
 : dirty
 ? 'bg-blue-50 border border-blue-200 text-blue-600 hover:bg-blue-100 cursor-pointer'
 : 'bg-canvas border border-slate-200 text-slate-400 cursor-not-allowed'
 }`}
 >
 {saving ? (
 <Loader2 className="w-3.5 h-3.5 animate-spin" />
 ) : saved ? (
 <Check className="w-3.5 h-3.5" />
 ) : (
 <DollarSign className="w-3.5 h-3.5" />
 )}
 </button>
 </div>
 </div>
 );
}

function HourlyRatePanel({ profiles, onRefresh }: { profiles: TalentProfileEnriched[]; onRefresh: () => void }) {
 const totalBudget80h = (profiles || []).reduce((sum, p) => sum + (p.hourly_rate ?? 1500) * 80, 0);
 const avgRate = profiles.length
 ? Math.round((profiles || []).reduce((sum, p) => sum + (p.hourly_rate ?? 1500), 0) / profiles.length)
 : 0;

 return (
 <div className="bg-surface border border-slate-200 rounded-2xl overflow-hidden shadow-sm">
 <div className="px-5 py-4 border-b border-slate-200 flex items-center justify-between">
 <div className="flex items-center gap-2">
 <div className="w-8 h-8 bg-amber-50 border border-amber-200 rounded-lg flex items-center justify-center">
 <DollarSign className="w-4 h-4 text-amber-600" />
 </div>
 <div>
 <h3 className="text-slate-800 font-semibold text-sm">Ücret Yönetimi</h3>
 <p className="text-slate-500 text-[10px]">Yalnızca Yönetici & CAE rolü görebilir</p>
 </div>
 </div>

 <div className="flex items-center gap-4 text-right">
 <div>
 <p className="text-[10px] text-slate-500 uppercase tracking-widest">Ort. Saat Ücreti</p>
 <p className="text-slate-800 font-bold font-mono text-sm">{formatCost(avgRate)}</p>
 </div>
 <div>
 <p className="text-[10px] text-slate-500 uppercase tracking-widest">80 Saatlik Bütçe</p>
 <p className="text-amber-600 font-bold font-mono text-sm">{formatCost(totalBudget80h)}</p>
 </div>
 </div>
 </div>

 <div>
 {(profiles || []).map((p) => (
 <HourlyRateRow key={p.id} profile={p} onSaved={onRefresh} />
 ))}
 </div>

 <div className="px-5 py-3 bg-slate-50 flex items-center gap-2 text-[11px] text-slate-500">
 <ShieldCheck className="w-3.5 h-3.5 text-blue-500 flex-shrink-0" />
 Ücret verileri şifrelenmiş olarak saklanır · Sadece yetkili kullanıcılar görüntüleyebilir
 </div>
 </div>
 );
}

export function TalentRPGView() {
 const { profiles, loading, error, teamStats, refetch } = useTalentData();
 const [selectedId, setSelectedId] = useState<string | null>(null);
 const [kudosTarget, setKudosTarget] = useState<TalentProfileEnriched | null>(null);
 const [adminMode, setAdminMode] = useState(false);
 const [decayData, setDecayData] = useState<Map<string, AuditorDecaySummary>>(new Map());
 const [refreshing, setRefreshing] = useState(false);
 const [lastRefreshed, setLastRefreshed] = useState<Date | null>(null);
 const [currentUserId, setCurrentUserId] = useState<string | null>(null);
 const [playbookCount, setPlaybookCount] = useState<number>(1);

 useEffect(() => {
 (async () => {
 const { data: { user } } = await supabase.auth.getUser();
 const uid = user?.id ?? localStorage.getItem('sentinel_user_id');
 if (!uid) return;
 setCurrentUserId(uid);
 const { count } = await supabase
 .from('playbook_entries')
 .select('id', { count: 'exact', head: true })
 .eq('author_id', uid);
 setPlaybookCount(count ?? 0);
 })();
 }, []);

 const handleRefreshAnalytics = useCallback(async () => {
 if (refreshing || profiles.length === 0) return;
 setRefreshing(true);
 try {
 const newMap = new Map<string, AuditorDecaySummary>();
 for (const profile of profiles) {
 const skills = profile.skills as any[];
 const summary = calculateAuditorDecay(profile.id, skills);
 newMap.set(profile.id, summary);
 await persistDecayResults(summary.skills);
 }
 setDecayData(newMap);
 setLastRefreshed(new Date());
 } finally {
 setRefreshing(false);
 }
 }, [profiles, refreshing]);

 const selectedProfile = profiles.find((p) => p.id === selectedId) ?? null;

 if (loading) {
 return (
 <div className="min-h-[400px] flex items-center justify-center">
 <div className="text-center">
 <div className="w-10 h-10 border-2 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-3" />
 <p className="text-slate-500 text-sm font-medium">RPG Dashboard yükleniyor...</p>
 </div>
 </div>
 );
 }

 if (error) {
 return (
 <div className="min-h-[200px] flex items-center justify-center p-4">
 <div className="flex items-center gap-2 text-rose-600 bg-rose-50 border border-rose-200 rounded-xl px-4 py-3 shadow-sm">
 <AlertTriangle className="w-5 h-5 flex-shrink-0" />
 <span className="text-sm font-medium">{error}</span>
 </div>
 </div>
 );
 }



 return (
 <div className="space-y-4">
 <div className="flex items-center justify-between gap-3 flex-wrap">
 {decayData.size > 0 && (() => {
 const allSummaries = Array.from(decayData.values());
 const totalDecayed = (allSummaries || []).reduce(
 (sum, s) => sum + s.severeDecayCount + s.mildDecayCount, 0
 );
 const affectedAuditors = (allSummaries || []).filter((s) => s.hasAnyDecay).length;
 return (
 <div className="flex items-center gap-2 px-3 py-2 bg-rose-50 border border-rose-200 rounded-xl text-xs shadow-sm">
 <TrendingDown className="w-3.5 h-3.5 text-rose-500" />
 <span className="text-rose-700 font-medium">
 {affectedAuditors} denetçide {totalDecayed} bozunan yetenek tespit edildi
 </span>
 {lastRefreshed && (
 <span className="text-slate-500 border-l border-slate-300 pl-2">
 {lastRefreshed.toLocaleTimeString('tr-TR', { hour: '2-digit', minute: '2-digit' })}
 </span>
 )}
 </div>
 );
 })()}

 <div className="flex items-center gap-2 ml-auto">
 <button
 onClick={handleRefreshAnalytics}
 disabled={refreshing || loading}
 className={`flex items-center gap-2 px-3 py-1.5 rounded-lg border text-xs font-semibold transition-all shadow-sm ${
 refreshing
 ? 'bg-blue-50 border-blue-200 text-blue-600'
 : 'bg-surface border-slate-200 text-slate-600 hover:border-blue-300 hover:text-blue-600 hover:bg-blue-50'
 } disabled:opacity-50 disabled:cursor-not-allowed`}
 >
 <RefreshCw className={`w-3.5 h-3.5 ${refreshing ? 'animate-spin' : ''}`} />
 {refreshing ? 'Analiz ediliyor...' : 'Yetenek Erozyonu Analizi'}
 </button>

 <button
 onClick={() => setAdminMode((v) => !v)}
 className={`flex items-center gap-2 px-3 py-1.5 rounded-lg border text-xs font-semibold transition-all shadow-sm ${
 adminMode
 ? 'bg-amber-50 border-amber-200 text-amber-700'
 : 'bg-surface border-slate-200 text-slate-600 hover:border-slate-300 hover:text-slate-800'
 }`}
 >
 <ShieldCheck className="w-3.5 h-3.5" />
 {adminMode ? 'Ücret Yönetimi Açık' : 'Ücret Yönetimi'}
 </button>
 </div>
 </div>

 {/* Full-width gradient stat banner */}
 <div className="rounded-2xl overflow-hidden shadow-sm bg-gradient-to-r from-blue-600 via-indigo-600 to-violet-600 text-white">
 <div className="grid grid-cols-2 lg:grid-cols-4 divide-x divide-white/20">
 {[
 {
 icon: Users,
 label: 'Ekip Büyüklüğü',
 value: profiles.length,
 sub: `${teamStats.availableCount} müsait`,
 },
 {
 icon: Activity,
 label: 'Ort. Yorgunluk',
 value: `${teamStats.avgFatigue}`,
 sub: teamStats.avgFatigue >= 75 ? '⚠ Kritik' : teamStats.avgFatigue >= 40 ? 'Orta' : '✓ İyi',
 },
 {
 icon: Zap,
 label: 'Toplam XP',
 value: teamStats.totalXP.toLocaleString(),
 sub: 'Kurumsal birikim',
 },
 {
 icon: Award,
 label: 'Sertifikalar',
 value: teamStats.totalCerts,
 sub: 'Aktif & doğrulanmış',
 },
 ].map(({ icon: Icon, label, value, sub }) => (
 <div key={label} className="px-4 py-5 flex items-center gap-4">
 <div className="w-10 h-10 rounded-xl bg-white/15 backdrop-blur-sm flex items-center justify-center flex-shrink-0">
 <Icon className="w-5 h-5 text-white" />
 </div>
 <div>
 <p className="text-white/70 text-[10px] uppercase tracking-widest font-semibold">{label}</p>
 <p className="text-2xl font-bold font-mono text-white leading-tight">{value}</p>
 <p className="text-white/60 text-[11px] mt-0.5">{sub}</p>
 </div>
 </div>
 ))}
 </div>
 {teamStats.topPerformer && (
 <div className="border-t border-white/20 px-4 py-2.5 flex items-center gap-2 bg-white/5">
 <Zap className="w-3.5 h-3.5 text-amber-300 flex-shrink-0" />
 <span className="text-white/70 text-xs">En Yüksek Seviye:</span>
 <span className="text-white font-semibold text-xs">{teamStats.topPerformer}</span>
 </div>
 )}
 </div>

 <div className={`grid gap-5 ${selectedProfile ? 'grid-cols-1 lg:grid-cols-3' : 'grid-cols-1 md:grid-cols-2 xl:grid-cols-3'}`}>
 <div className={`grid gap-5 ${selectedProfile ? 'lg:col-span-2 grid-cols-1 sm:grid-cols-2' : 'col-span-full grid-cols-1 md:grid-cols-2 xl:grid-cols-3'}`}>
 {(profiles || []).map((profile) => (
 <AuditorProfileCard
 key={profile.id}
 profile={profile}
 isSelected={selectedId === profile.id}
 onSelect={() => setSelectedId(selectedId === profile.id ? null : profile.id)}
 onGiveKudos={() => setKudosTarget(profile)}
 memoryGateLocked={
 profile.user_id === currentUserId &&
 profile.current_level >= 4 &&
 playbookCount === 0
 }
 />
 ))}

 {profiles.length === 0 && (
 <div className="col-span-full flex flex-col items-center justify-center py-16 bg-canvas border-2 border-dashed border-slate-200 rounded-xl text-slate-500">
 <Users className="w-12 h-12 mb-3 text-slate-300" />
 <p className="text-sm font-medium">Henüz denetçi profili yok</p>
 </div>
 )}
 </div>

 <AnimatePresence mode="wait">
 {selectedProfile && (
 <motion.div
 key={selectedProfile.id}
 initial={{ opacity: 0, x: 20 }}
 animate={{ opacity: 1, x: 0 }}
 exit={{ opacity: 0, x: 20 }}
 transition={{ type: 'spring', stiffness: 400, damping: 35 }}
 className="lg:col-span-1"
 >
 <div className="sticky top-4">
 <div className="flex items-center justify-between mb-3 bg-surface p-3 border border-slate-200 rounded-xl shadow-sm">
 <p className="text-xs text-slate-500 uppercase tracking-widest font-bold">
 Yetkinlik Radarı
 </p>
 <button
 onClick={() => setSelectedId(null)}
 className="text-slate-400 hover:text-slate-600 bg-canvas p-1 rounded-md transition-colors"
 >
 <X className="w-4 h-4" />
 </button>
 </div>
 <div className="bg-surface border border-slate-200 rounded-2xl p-4 shadow-sm">
 <CompetencyRadar
 profileName={selectedProfile.full_name}
 snapshot={selectedProfile.skills_snapshot}
 decayMap={
 decayData.has(selectedProfile.id)
 ? buildDecayMap(decayData.get(selectedProfile.id)!)
 : undefined
 }
 />
 </div>
 </div>
 </motion.div>
 )}
 </AnimatePresence>
 </div>

 <AnimatePresence>
 {adminMode && (
 <motion.div
 initial={{ opacity: 0, y: 12 }}
 animate={{ opacity: 1, y: 0 }}
 exit={{ opacity: 0, y: 12 }}
 transition={{ type: 'spring', stiffness: 400, damping: 35 }}
 >
 <HourlyRatePanel profiles={profiles} onRefresh={refetch} />
 </motion.div>
 )}
 </AnimatePresence>

 <AnimatePresence>
 {kudosTarget && (
 <KudosModal
 profiles={profiles}
 defaultReceiver={kudosTarget}
 onClose={() => setKudosTarget(null)}
 />
 )}
 </AnimatePresence>
 </div>
 );
}
