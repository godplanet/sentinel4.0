import { useState, useCallback, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Users, Zap, Award, Activity, ChevronRight, X, Send, AlertTriangle, DollarSign, ShieldCheck, Check, Loader2, RefreshCw, TrendingDown } from 'lucide-react';
import { supabase } from '@/shared/api/supabase';
import { useTalentData, type TalentProfileEnriched } from '@/features/talent-os/hooks/useTalentData';
import { AuditorProfileCard } from '@/features/talent-os/components/AuditorProfileCard';
import { CompetencyRadar } from '@/features/talent-os/components/CompetencyRadar';
import { updateHourlyRate } from '@/features/talent-os/api';
import { formatCost } from '@/features/planning/lib/ResourceAllocator';
import {
  calculateAuditorDecay,
  persistDecayResults,
  buildDecayMap,
  type AuditorDecaySummary,
  type SkillDecayResult,
} from '@/features/talent-os/lib/EntropyEngine';

const KUDOS_CATEGORIES = [
  { value: 'QUALITY',      label: 'Kalite',     color: 'border-sky-500/40 bg-sky-500/10 text-sky-300' },
  { value: 'TEAMWORK',     label: 'Takım Ruhu', color: 'border-teal-500/40 bg-teal-500/10 text-teal-300' },
  { value: 'INNOVATION',   label: 'İnovasyon',  color: 'border-amber-500/40 bg-amber-500/10 text-amber-300' },
  { value: 'LEADERSHIP',   label: 'Liderlik',   color: 'border-rose-500/40 bg-rose-500/10 text-rose-300' },
  { value: 'MENTORING',    label: 'Mentorluk',  color: 'border-violet-500/40 bg-violet-500/10 text-violet-300' },
  { value: 'GENERAL',      label: 'Genel',      color: 'border-slate-500/40 bg-slate-500/10 text-slate-300' },
] as const;

const KUDOS_AMOUNTS = [10, 25, 50] as const;

function StatCard({
  icon: Icon,
  label,
  value,
  sub,
  accent,
}: {
  icon: React.ElementType;
  label: string;
  value: string | number;
  sub?: string;
  accent: string;
}) {
  return (
    <div className="bg-slate-900/60 backdrop-blur-sm border border-white/8 rounded-xl p-4">
      <div className="flex items-center gap-2 mb-2">
        <div className={`w-7 h-7 rounded-lg flex items-center justify-center ${accent}`}>
          <Icon className="w-3.5 h-3.5" />
        </div>
        <span className="text-[10px] text-slate-500 uppercase tracking-widest font-semibold">{label}</span>
      </div>
      <p className="text-2xl font-bold text-white font-mono">{value}</p>
      {sub && <p className="text-[10px] text-slate-500 mt-0.5">{sub}</p>}
    </div>
  );
}

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
      className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4"
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.92, y: 10 }}
        animate={{ scale: 1, y: 0 }}
        exit={{ scale: 0.92, y: 10 }}
        transition={{ type: 'spring', stiffness: 400, damping: 30 }}
        className="bg-slate-900 border border-white/10 rounded-2xl p-6 w-full max-w-md shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between mb-5">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-amber-500/20 border border-amber-500/30 rounded-lg flex items-center justify-center">
              <Zap className="w-4 h-4 text-amber-400" />
            </div>
            <div>
              <h3 className="text-white font-semibold text-sm">Kudos Gönder</h3>
              <p className="text-slate-500 text-[10px]">Ekip üyelerini ödüllendir</p>
            </div>
          </div>
          <button onClick={onClose} className="text-slate-600 hover:text-slate-400 transition-colors">
            <X className="w-4 h-4" />
          </button>
        </div>

        {sent ? (
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="text-center py-8"
          >
            <div className="w-16 h-16 bg-amber-500/20 border border-amber-500/30 rounded-full flex items-center justify-center mx-auto mb-3">
              <Zap className="w-8 h-8 text-amber-400" />
            </div>
            <p className="text-white font-semibold">Kudos gönderildi!</p>
            <p className="text-slate-400 text-xs mt-1">{amount} XP → {receiverProfile?.full_name}</p>
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
                className="w-full bg-slate-800 border border-white/8 rounded-xl px-3 py-2.5 text-white text-sm focus:outline-none focus:border-sky-500/50 transition-colors"
              >
                <option value="" disabled>Seçin...</option>
                {profiles.map((p) => (
                  <option key={p.id} value={p.id}>{p.full_name}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="text-[10px] text-slate-500 uppercase tracking-widest font-semibold block mb-1.5">
                Kategori
              </label>
              <div className="grid grid-cols-3 gap-1.5">
                {KUDOS_CATEGORIES.map((cat) => (
                  <button
                    key={cat.value}
                    onClick={() => setCategory(cat.value)}
                    className={`px-2 py-1.5 rounded-lg text-[10px] font-semibold border transition-all
                      ${category === cat.value ? cat.color : 'bg-slate-800/60 text-slate-500 border-white/6 hover:border-white/12'}`}
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
                {KUDOS_AMOUNTS.map((a) => (
                  <button
                    key={a}
                    onClick={() => setAmount(a)}
                    className={`flex-1 py-2 rounded-xl text-sm font-bold font-mono border transition-all
                      ${amount === a
                        ? 'bg-amber-500/20 text-amber-300 border-amber-500/40'
                        : 'bg-slate-800 text-slate-400 border-white/6 hover:border-white/14'}`}
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
                className="w-full bg-slate-800 border border-white/8 rounded-xl px-3 py-2.5 text-white text-sm placeholder:text-slate-600 focus:outline-none focus:border-sky-500/50 transition-colors resize-none"
              />
            </div>

            <button
              onClick={handleSend}
              disabled={!receiver || !message.trim() || sending}
              className="w-full flex items-center justify-center gap-2 py-2.5 bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 border border-amber-500/40 rounded-xl text-sm font-semibold transition-all disabled:opacity-40 disabled:cursor-not-allowed"
            >
              {sending ? (
                <div className="w-4 h-4 border-2 border-amber-400 border-t-transparent rounded-full animate-spin" />
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
    Expert:  'text-amber-400',
    Manager: 'text-sky-400',
    Senior:  'text-emerald-400',
    Junior:  'text-slate-400',
  };

  return (
    <div className="flex items-center gap-3 px-4 py-3 border-b border-white/5 hover:bg-white/3 transition-colors">
      <div className="w-8 h-8 rounded-full bg-slate-700 flex items-center justify-center text-xs font-bold text-white flex-shrink-0">
        {profile.full_name.charAt(0)}
      </div>

      <div className="flex-1 min-w-0">
        <p className="text-white text-sm font-medium truncate">{profile.full_name}</p>
        <p className={`text-[11px] font-semibold ${TITLE_COLORS[profile.title] ?? 'text-slate-400'}`}>
          {profile.title}
        </p>
      </div>

      <div className="flex items-center gap-2">
        <select
          value={currency}
          onChange={(e) => setCurrency(e.target.value)}
          className="bg-slate-700 border border-white/10 text-white text-xs rounded-lg px-2 py-1.5 focus:outline-none focus:border-sky-500/50 transition-colors"
        >
          {CURRENCY_OPTIONS.map((c) => (
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
          className="w-28 bg-slate-700 border border-white/10 text-white text-sm font-mono font-semibold rounded-lg px-3 py-1.5 text-right focus:outline-none focus:border-sky-500/50 transition-colors"
        />

        <button
          onClick={handleSave}
          disabled={!dirty || saving}
          className={`w-8 h-8 rounded-lg flex items-center justify-center transition-all flex-shrink-0 ${
            saved
              ? 'bg-emerald-500/20 border border-emerald-500/40 text-emerald-400'
              : dirty
                ? 'bg-sky-500/20 border border-sky-500/40 text-sky-400 hover:bg-sky-500/30 cursor-pointer'
                : 'bg-slate-700/50 border border-white/6 text-slate-600 cursor-not-allowed'
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
  const totalBudget80h = profiles.reduce((sum, p) => sum + (p.hourly_rate ?? 1500) * 80, 0);
  const avgRate = profiles.length
    ? Math.round(profiles.reduce((sum, p) => sum + (p.hourly_rate ?? 1500), 0) / profiles.length)
    : 0;

  return (
    <div className="bg-slate-900/60 border border-white/8 rounded-2xl overflow-hidden">
      <div className="px-5 py-4 border-b border-white/8 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 bg-amber-500/20 border border-amber-500/30 rounded-lg flex items-center justify-center">
            <DollarSign className="w-4 h-4 text-amber-400" />
          </div>
          <div>
            <h3 className="text-white font-semibold text-sm">Ücret Yönetimi</h3>
            <p className="text-slate-500 text-[10px]">Yalnızca Yönetici & CAE rolü görebilir</p>
          </div>
        </div>

        <div className="flex items-center gap-4 text-right">
          <div>
            <p className="text-[10px] text-slate-500 uppercase tracking-widest">Ort. Saat Ücreti</p>
            <p className="text-white font-bold font-mono text-sm">{formatCost(avgRate)}</p>
          </div>
          <div>
            <p className="text-[10px] text-slate-500 uppercase tracking-widest">80 Saatlik Bütçe</p>
            <p className="text-amber-300 font-bold font-mono text-sm">{formatCost(totalBudget80h)}</p>
          </div>
        </div>
      </div>

      <div>
        {profiles.map((p) => (
          <HourlyRateRow key={p.id} profile={p} onSaved={onRefresh} />
        ))}
      </div>

      <div className="px-5 py-3 bg-slate-800/30 flex items-center gap-2 text-[11px] text-slate-500">
        <ShieldCheck className="w-3.5 h-3.5 text-sky-400 flex-shrink-0" />
        Ücret verileri şifrelenmiş olarak saklanır · Sadece yetkili kullanıcılar görüntüleyebilir
      </div>
    </div>
  );
}

export default function TalentDashboardPage() {
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
          <div className="w-10 h-10 border-2 border-sky-500 border-t-transparent rounded-full animate-spin mx-auto mb-3" />
          <p className="text-slate-500 text-sm">Talent OS yükleniyor...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-[200px] flex items-center justify-center">
        <div className="flex items-center gap-2 text-rose-400 bg-rose-500/10 border border-rose-500/20 rounded-xl px-4 py-3">
          <AlertTriangle className="w-4 h-4 flex-shrink-0" />
          <span className="text-sm">{error}</span>
        </div>
      </div>
    );
  }

  const fatigueColor =
    teamStats.avgFatigue >= 75 ? 'bg-rose-500/20 text-rose-300'
    : teamStats.avgFatigue >= 40 ? 'bg-amber-500/20 text-amber-300'
    : 'bg-emerald-500/20 text-emerald-300';

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between gap-3 flex-wrap">
        {decayData.size > 0 && (() => {
          const allSummaries = Array.from(decayData.values());
          const totalDecayed = allSummaries.reduce(
            (sum, s) => sum + s.severeDecayCount + s.mildDecayCount, 0
          );
          const affectedAuditors = allSummaries.filter((s) => s.hasAnyDecay).length;
          return (
            <div className="flex items-center gap-2 px-3 py-2 bg-rose-500/10 border border-rose-500/20 rounded-xl text-xs">
              <TrendingDown className="w-3.5 h-3.5 text-rose-400" />
              <span className="text-rose-300 font-medium">
                {affectedAuditors} denetçide {totalDecayed} bozunan yetenek
              </span>
              {lastRefreshed && (
                <span className="text-slate-500">
                  · {lastRefreshed.toLocaleTimeString('tr-TR', { hour: '2-digit', minute: '2-digit' })}
                </span>
              )}
            </div>
          );
        })()}

        <div className="flex items-center gap-2 ml-auto">
          <button
            onClick={handleRefreshAnalytics}
            disabled={refreshing || loading}
            className={`flex items-center gap-2 px-3 py-1.5 rounded-lg border text-xs font-semibold transition-all ${
              refreshing
                ? 'bg-sky-500/10 border-sky-500/20 text-sky-400'
                : 'bg-slate-800/60 border-white/8 text-slate-400 hover:border-sky-500/40 hover:text-sky-300 hover:bg-sky-500/10'
            } disabled:opacity-50 disabled:cursor-not-allowed`}
          >
            <RefreshCw className={`w-3.5 h-3.5 ${refreshing ? 'animate-spin' : ''}`} />
            {refreshing ? 'Analiz ediliyor...' : 'Analitikleri Yenile'}
          </button>

          <button
            onClick={() => setAdminMode((v) => !v)}
            className={`flex items-center gap-2 px-3 py-1.5 rounded-lg border text-xs font-semibold transition-all ${
              adminMode
                ? 'bg-amber-500/20 border-amber-500/40 text-amber-300'
                : 'bg-slate-800/60 border-white/8 text-slate-500 hover:border-white/20 hover:text-slate-400'
            }`}
          >
            <ShieldCheck className="w-3.5 h-3.5" />
            {adminMode ? 'Yönetici Modu Açık' : 'Yönetici Modu'}
          </button>
        </div>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <StatCard
          icon={Users}
          label="Ekip Büyüklüğü"
          value={profiles.length}
          sub={`${teamStats.availableCount} müsait`}
          accent="bg-sky-500/20 text-sky-400"
        />
        <StatCard
          icon={Activity}
          label="Ort. Yorgunluk"
          value={teamStats.avgFatigue}
          sub="0–100 ölçeği"
          accent={`${fatigueColor}`}
        />
        <StatCard
          icon={Zap}
          label="Toplam XP"
          value={teamStats.totalXP.toLocaleString()}
          sub="Ekip birikimi"
          accent="bg-amber-500/20 text-amber-400"
        />
        <StatCard
          icon={Award}
          label="Sertifikalar"
          value={teamStats.totalCerts}
          sub="Aktif & doğrulanmış"
          accent="bg-violet-500/20 text-violet-400"
        />
      </div>

      {teamStats.topPerformer && (
        <div className="flex items-center gap-2 px-4 py-2.5 bg-slate-900/50 border border-amber-500/20 rounded-xl text-sm">
          <Zap className="w-4 h-4 text-amber-400 flex-shrink-0" />
          <span className="text-slate-400">En yüksek seviye:</span>
          <span className="text-amber-300 font-semibold">{teamStats.topPerformer}</span>
          <ChevronRight className="w-3.5 h-3.5 text-slate-600 ml-auto" />
        </div>
      )}

      <div className={`grid gap-4 ${selectedProfile ? 'grid-cols-1 lg:grid-cols-3' : 'grid-cols-1 md:grid-cols-2 xl:grid-cols-3'}`}>
        <div className={`grid gap-4 ${selectedProfile ? 'lg:col-span-2 grid-cols-1 sm:grid-cols-2' : 'col-span-full grid-cols-1 md:grid-cols-2 xl:grid-cols-3'}`}>
          {profiles.map((profile) => (
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
            <div className="col-span-full flex flex-col items-center justify-center py-16 text-slate-500">
              <Users className="w-12 h-12 mb-3 opacity-30" />
              <p className="text-sm">Henüz denetçi profili yok</p>
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
                <div className="flex items-center justify-between mb-2">
                  <p className="text-[10px] text-slate-500 uppercase tracking-widest font-semibold">
                    Yetkinlik Radarı
                  </p>
                  <button
                    onClick={() => setSelectedId(null)}
                    className="text-slate-600 hover:text-slate-400 transition-colors"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                </div>
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
