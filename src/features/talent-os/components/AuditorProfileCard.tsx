import { useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  AlertTriangle,
  ArrowUp,
  BookOpen,
  CheckCircle2,
  ExternalLink,
  Loader2,
  Lock,
  Shield,
  Star,
  Trophy,
  Zap,
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import type { TalentProfileEnriched } from '../hooks/useTalentData';
import { LEVEL_LABELS } from '@/shared/types/talent';
import { XPEngine } from '../lib/XPEngine';
import type { LevelUpResult } from '../lib/XPEngine';

interface Props {
  profile: TalentProfileEnriched;
  isSelected: boolean;
  onSelect: () => void;
  onGiveKudos: () => void;
  isDiminishingActive?: boolean;
  memoryGateLocked?: boolean;
}

const LEVEL_GRADIENTS: Record<number, string> = {
  1: 'from-slate-500 to-slate-400',
  2: 'from-emerald-600 to-emerald-400',
  3: 'from-sky-600 to-sky-400',
  4: 'from-amber-600 to-amber-400',
  5: 'from-rose-600 via-orange-500 to-amber-400',
};

const TITLE_MAP: Record<string, string> = {
  Junior:  'Jr. Denetçi',
  Senior:  'Kd. Denetçi',
  Manager: 'Denetim Müdürü',
  Expert:  'Uzman Denetçi',
};

const CERT_COLORS: Record<string, { bg: string; text: string; border: string }> = {
  CIA:   { bg: 'bg-blue-50',    text: 'text-blue-700',    border: 'border-blue-200'   },
  CISA:  { bg: 'bg-cyan-50',    text: 'text-cyan-700',    border: 'border-cyan-200'   },
  CRISC: { bg: 'bg-amber-50',   text: 'text-amber-700',   border: 'border-amber-200'  },
  CFE:   { bg: 'bg-rose-50',    text: 'text-rose-700',    border: 'border-rose-200'   },
  SMMM:  { bg: 'bg-teal-50',    text: 'text-teal-700',    border: 'border-teal-200'   },
  SPK:   { bg: 'bg-sky-50',     text: 'text-sky-700',     border: 'border-sky-200'    },
  TKBB:  { bg: 'bg-emerald-50', text: 'text-emerald-700', border: 'border-emerald-200'},
};
const DEFAULT_CERT_COLOR = { bg: 'bg-slate-50', text: 'text-slate-600', border: 'border-slate-200' };

function getInitials(name: string) {
  return name.split(' ').slice(0, 2).map((n) => n[0]).join('').toUpperCase();
}

function FatigueMeter({ score }: { score: number }) {
  const pct = Math.min(1, Math.max(0, score / 100));
  const R = 34, CX = 50, CY = 50;
  const ptX = (a: number) => CX + R * Math.cos(a);
  const ptY = (a: number) => CY - R * Math.sin(a);
  const bgStart = { x: ptX(Math.PI), y: ptY(Math.PI) };
  const bgEnd   = { x: ptX(0),       y: ptY(0) };
  const bgPath  = `M ${bgStart.x} ${bgStart.y} A ${R} ${R} 0 0 0 ${bgEnd.x} ${bgEnd.y}`;
  const fillEnd   = Math.PI - pct * Math.PI;
  const fillEndPt = { x: ptX(fillEnd), y: ptY(fillEnd) };
  const largeArc  = pct > 0.5 ? 1 : 0;
  const fillPath  = pct > 0.001
    ? `M ${bgStart.x} ${bgStart.y} A ${R} ${R} 0 ${largeArc} 0 ${fillEndPt.x} ${fillEndPt.y}`
    : null;
  const needleAngle = Math.PI - pct * Math.PI;
  const needleTip   = {
    x: CX + (R - 6) * Math.cos(needleAngle),
    y: CY - (R - 6) * Math.sin(needleAngle),
  };
  const color = score >= 80 ? '#ef4444' : score >= 40 ? '#f59e0b' : '#10b981';
  const TICKS = [0, 0.25, 0.5, 0.75, 1];
  return (
    <svg viewBox="0 0 100 58" className="w-full max-w-[130px] mx-auto">
      <path d={bgPath} fill="none" stroke="#e2e8f0" strokeWidth="9" strokeLinecap="round" />
      {fillPath && <path d={fillPath} fill="none" stroke={color} strokeWidth="9" strokeLinecap="round" opacity={0.9} />}
      {TICKS.map((t) => {
        const a = Math.PI - t * Math.PI;
        return (
          <line key={t}
            x1={CX + (R + 2) * Math.cos(a)} y1={CY - (R + 2) * Math.sin(a)}
            x2={CX + (R + 8) * Math.cos(a)} y2={CY - (R + 8) * Math.sin(a)}
            stroke="#cbd5e1" strokeWidth="1.5" strokeLinecap="round"
          />
        );
      })}
      <line x1={CX} y1={CY} x2={needleTip.x} y2={needleTip.y} stroke={color} strokeWidth="2" strokeLinecap="round" />
      <circle cx={CX} cy={CY} r="3" fill={color} />
      <text x="50" y="50" textAnchor="middle" fontSize="13" fontWeight="bold" fill={color} fontFamily="monospace">{score}</text>
      <text x="50" y="57" textAnchor="middle" fontSize="6.5" fill="#94a3b8" fontFamily="sans-serif" letterSpacing="0.5">YORGUNLUK</text>
    </svg>
  );
}

function XPBar({
  current, next, level, showShield = false, memoryGateLocked = false,
}: { current: number; next: number; level: number; showShield?: boolean; memoryGateLocked?: boolean }) {
  const thresholds: Record<number, number> = { 1: 0, 2: 500, 3: 1500, 4: 3500, 5: 7000 };
  const levelStart = thresholds[level] ?? 0;
  const levelRange = next - levelStart;
  const progress   = levelRange > 0 ? Math.min(1, (current - levelStart) / levelRange) : 1;
  const gradient   = LEVEL_GRADIENTS[level] ?? LEVEL_GRADIENTS[1];
  const isGated    = memoryGateLocked && level >= 4;
  return (
    <div className="space-y-1">
      <div className="flex justify-between items-center">
        <div className="flex items-center gap-1">
          <span className="text-[10px] text-slate-400 font-mono uppercase tracking-widest">XP</span>
          {showShield && (
            <span title="Azalan Getiri aktif" className="inline-flex items-center gap-0.5 px-1 py-0.5 rounded-full bg-amber-50 border border-amber-200">
              <Shield size={8} className="text-amber-600" />
              <span className="text-[8px] text-amber-700 font-semibold tracking-wide">AG</span>
            </span>
          )}
          {isGated && (
            <span title="Hafıza Kapısı: Playbook'a girdi ekleyin" className="inline-flex items-center gap-0.5 px-1 py-0.5 rounded-full bg-slate-100 border border-slate-300">
              <Lock size={8} className="text-slate-500" />
              <span className="text-[8px] text-slate-500 font-semibold tracking-wide">LV5</span>
            </span>
          )}
        </div>
        <span className="text-[10px] text-slate-500 font-mono">{current.toLocaleString()} / {next.toLocaleString()}</span>
      </div>
      <div className="h-2 bg-slate-200 rounded-full overflow-hidden relative">
        <motion.div
          className={`h-full rounded-full bg-gradient-to-r ${isGated ? 'from-slate-400 to-slate-300' : gradient}`}
          initial={{ width: 0 }}
          animate={{ width: `${progress * 100}%` }}
          transition={{ duration: 1, ease: 'easeOut', delay: 0.2 }}
        />
      </div>
      {isGated && (
        <p className="text-[9px] text-slate-400 flex items-center gap-1">
          <Lock size={7} />
          Seviye 5 için Playbook&apos;a girdi ekleyin
        </p>
      )}
    </div>
  );
}

export function AuditorProfileCard({
  profile,
  isSelected,
  onSelect,
  onGiveKudos,
  isDiminishingActive = false,
  memoryGateLocked = false,
}: Props) {
  const navigate = useNavigate();

  const [gateResult, setGateResult] = useState<LevelUpResult | null>(null);
  const [isLeveling, setIsLeveling] = useState(false);
  const [leveledUp,  setLeveledUp]  = useState(false);

  const gradient   = LEVEL_GRADIENTS[profile.current_level] ?? LEVEL_GRADIENTS[1];
  const levelLabel = LEVEL_LABELS[profile.current_level] ?? `Lv ${profile.current_level}`;
  const initials   = getInitials(profile.full_name);
  const isBurnout  = profile.fatigue_score > 80;
  const topSkills  = profile.skills_snapshot?.skills?.slice(0, 3) ?? [];

  const canLevelUp    = profile.total_xp >= profile.next_level_xp && profile.current_level < 5;
  const isGateBlocked = gateResult?.reason === 'MEMORY_GATE_BLOCKED';

  const handleLevelUp = useCallback(async (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsLeveling(true);
    setGateResult(null);
    try {
      const result = await XPEngine.attemptLevelUp(profile.id, 0);
      setGateResult(result);
      if (result.success) setLeveledUp(true);
    } catch {
      setGateResult({ success: false, reason: 'PROFILE_NOT_FOUND' });
    } finally {
      setIsLeveling(false);
    }
  }, [profile.id]);

  return (
    <motion.div
      layout
      whileHover={{ y: -2, scale: 1.005 }}
      transition={{ type: 'spring', stiffness: 400, damping: 30 }}
      onClick={onSelect}
      className={`
        relative rounded-2xl p-5 cursor-pointer transition-all duration-300
        bg-white border shadow-sm hover:shadow-md
        ${isSelected
          ? 'border-sky-400 ring-1 ring-sky-300 shadow-sky-100'
          : isGateBlocked
          ? 'border-rose-200 shadow-rose-50'
          : 'border-slate-200 hover:border-slate-300'}
      `}
    >
      {isBurnout && (
        <div className="absolute top-3 right-3 flex items-center gap-1 bg-red-50 border border-red-200 rounded-full px-2 py-0.5">
          <AlertTriangle className="w-3 h-3 text-red-500" />
          <span className="text-[9px] text-red-600 font-semibold tracking-wide uppercase">Yorgunluk</span>
        </div>
      )}

      <div className="flex items-start gap-4 mb-4">
        <div className="relative flex-shrink-0">
          <motion.div
            animate={leveledUp ? { scale: [1, 1.15, 1] } : {}}
            transition={{ duration: 0.5 }}
            className={`w-14 h-14 rounded-xl bg-gradient-to-br ${gradient} flex items-center justify-center shadow`}
          >
            <span className="text-white font-bold text-lg tracking-tight">{initials}</span>
          </motion.div>
          <div className={`absolute -bottom-1.5 -right-1.5 bg-gradient-to-br ${gradient} rounded-md px-1.5 py-0.5 border border-white shadow`}>
            <span className="text-white text-[9px] font-black tracking-widest">LV{profile.current_level}</span>
          </div>
        </div>

        <div className="flex-1 min-w-0">
          <h3 className="text-slate-900 font-semibold text-sm leading-tight truncate">{profile.full_name}</h3>
          <p className="text-slate-500 text-xs mt-0.5">{TITLE_MAP[profile.title] ?? profile.title}</p>
          <p className="text-slate-400 text-[10px] mt-0.5 truncate">{profile.department}</p>
          <div className="flex items-center gap-2 mt-1.5">
            <div className="flex items-center gap-1">
              <Trophy className="w-3 h-3 text-amber-500" />
              <span className="text-[10px] text-amber-600 font-mono font-semibold">{levelLabel}</span>
            </div>
            {profile.is_available
              ? <span className="text-[9px] bg-emerald-50 text-emerald-700 border border-emerald-200 rounded-full px-1.5 py-0.5">Müsait</span>
              : <span className="text-[9px] bg-rose-50 text-rose-700 border border-rose-200 rounded-full px-1.5 py-0.5">Dolu</span>}
          </div>
        </div>
      </div>

      <div className="mb-4">
        <XPBar
          current={profile.total_xp}
          next={profile.next_level_xp}
          level={profile.current_level}
          showShield={isDiminishingActive}
          memoryGateLocked={memoryGateLocked}
        />
      </div>

      <AnimatePresence>
        {isGateBlocked && (
          <motion.div
            initial={{ opacity: 0, y: -6, height: 0 }}
            animate={{ opacity: 1, y: 0, height: 'auto' }}
            exit={{ opacity: 0, y: -6, height: 0 }}
            transition={{ duration: 0.3 }}
            className="mb-4 overflow-hidden"
          >
            <div className="rounded-xl border border-rose-200 bg-rose-50 p-3">
              <div className="flex items-start gap-2 mb-2">
                <Lock className="w-4 h-4 text-rose-600 flex-shrink-0 mt-0.5 animate-pulse" />
                <p className="text-[10px] font-black font-mono text-rose-800 uppercase tracking-widest leading-tight">
                  TERFİ ENGELLENDİ (Hafıza Kapısı)
                </p>
              </div>
              <p className="text-[10px] text-rose-800 leading-relaxed mb-3">
                Kurumsal Playbook kütüphanesine hiç denetim rehberi yazmadınız.
                Tecrübenizi kuruma aktarmadan bir üst seviyeye geçemezsiniz.
                <span className="block mt-1 text-[9px] text-rose-600 italic">
                  (Sentinel Oyunlaştırma Kuralı)
                </span>
              </p>
              <button
                onClick={(e) => { e.stopPropagation(); navigate('/playbook'); }}
                className="w-full flex items-center justify-center gap-2 py-2 rounded-lg
                  bg-white border border-rose-200 text-rose-700 text-[10px] font-semibold
                  hover:bg-rose-100 transition-all"
              >
                <BookOpen className="w-3 h-3" />
                Playbook'a Yaz
                <ExternalLink className="w-3 h-3 text-rose-400" />
              </button>
            </div>
          </motion.div>
        )}

        {leveledUp && gateResult?.success && (
          <motion.div
            initial={{ opacity: 0, scale: 0.92 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0 }}
            className="mb-4 rounded-xl border border-emerald-200 bg-emerald-50 p-3 flex items-center gap-2"
          >
            <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0" />
            <div>
              <p className="text-[10px] font-black font-mono text-emerald-700 uppercase tracking-widest">
                Seviye Atlandı! → Lv.{gateResult.newLevel}
              </p>
              <p className="text-[9px] text-emerald-600">Kurumsal bilgi aktarımı tamamlandı. Tebrikler.</p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="flex items-start gap-3 mb-4">
        <div className="flex-1">
          <FatigueMeter score={profile.fatigue_score} />
        </div>
        {topSkills.length > 0 && (
          <div className="flex-1 space-y-1.5">
            <p className="text-[9px] text-slate-400 uppercase tracking-widest font-semibold">Top Beceriler</p>
            {topSkills.map((s) => (
              <div key={s.skill_name} className="flex items-center gap-1.5">
                <div className="flex gap-0.5">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <div key={i} className={`w-1.5 h-1.5 rounded-full ${i < s.proficiency_level ? 'bg-sky-400' : 'bg-slate-200'}`} />
                  ))}
                </div>
                <span className="text-[9px] text-slate-500 truncate">{s.skill_name}</span>
              </div>
            ))}
          </div>
        )}
      </div>

      {profile.certifications.length > 0 && (
        <div className="flex flex-wrap gap-1.5 mb-4">
          {profile.certifications.slice(0, 4).map((cert) => {
            const key   = Object.keys(CERT_COLORS).find((k) => cert.name.includes(k)) ?? '';
            const style = CERT_COLORS[key] ?? DEFAULT_CERT_COLOR;
            return (
              <div key={cert.id} className={`flex items-center gap-1 px-1.5 py-0.5 rounded border text-[9px] font-semibold uppercase tracking-wide ${style.bg} ${style.text} ${style.border}`}>
                <Shield className="w-2.5 h-2.5" />
                {cert.name.split(' ')[0]}
              </div>
            );
          })}
          {profile.certifications.length > 4 && (
            <span className="text-[9px] text-slate-400 self-center">+{profile.certifications.length - 4}</span>
          )}
        </div>
      )}

      <div className="flex gap-2 pt-3 border-t border-slate-200">
        <button
          onClick={(e) => { e.stopPropagation(); onSelect(); }}
          className={`flex-1 flex items-center justify-center gap-1.5 py-2 rounded-lg text-xs font-medium transition-all
            ${isSelected
              ? 'bg-sky-50 text-sky-700 border border-sky-200 hover:bg-sky-100'
              : 'bg-slate-100 text-slate-600 border border-slate-200 hover:bg-slate-200 hover:text-slate-900'}`}
        >
          <Star className="w-3 h-3" />
          Radar
        </button>

        <button
          onClick={(e) => { e.stopPropagation(); onGiveKudos(); }}
          className="flex-1 flex items-center justify-center gap-1.5 py-2 rounded-lg text-xs font-medium transition-all
            bg-amber-50 text-amber-700 border border-amber-200 hover:bg-amber-100"
        >
          <Zap className="w-3 h-3" />
          Kudos
        </button>

        {canLevelUp && !leveledUp && (
          <button
            onClick={handleLevelUp}
            disabled={isLeveling}
            className={`flex-1 flex items-center justify-center gap-1.5 py-2 rounded-lg text-xs font-medium transition-all
              disabled:opacity-60
              ${isGateBlocked
                ? 'bg-rose-50 text-rose-700 border border-rose-200 hover:bg-rose-100'
                : 'bg-emerald-50 text-emerald-700 border border-emerald-200 hover:bg-emerald-100'}`}
          >
            {isLeveling
              ? <Loader2 className="w-3 h-3 animate-spin" />
              : isGateBlocked
              ? <Lock className="w-3 h-3" />
              : <ArrowUp className="w-3 h-3" />}
            {isLeveling ? 'Kontrol ediliyor...' : '🚀 Seviye Atla (Level Up)'}
          </button>
        )}
      </div>
    </motion.div>
  );
}
