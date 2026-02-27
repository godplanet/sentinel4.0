import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, ChevronRight, Zap } from 'lucide-react';
import { submitPulse, hasSubmittedThisWeek, getISOWeekKey } from '../api/pulse-api';
import type { PulseSubmission } from '../api/pulse-api';

// ─── Local dedup key (avoids extra DB call on every mount) ───────────────────

function getLocalKey(userId: string): string {
  return `pulse_shown_${userId}_${getISOWeekKey()}`;
}

function markSeenLocally(userId: string): void {
  localStorage.setItem(getLocalKey(userId), '1');
}

function hasSeenLocally(userId: string): boolean {
  return !!localStorage.getItem(getLocalKey(userId));
}

// ─── Energy scale config ─────────────────────────────────────────────────────

interface EnergyOption {
  value: number;
  emoji: string;
  label: string;
  color: string;
  ring: string;
  bg: string;
}

const ENERGY_OPTIONS: EnergyOption[] = [
  { value: 1, emoji: '💀', label: 'Tükendim',   color: '#ef4444', ring: 'ring-red-400',    bg: 'bg-red-50'     },
  { value: 2, emoji: '😓', label: 'Yoruldum',   color: '#f97316', ring: 'ring-orange-400', bg: 'bg-orange-50'  },
  { value: 3, emoji: '😐', label: 'İdare eder', color: '#eab308', ring: 'ring-yellow-400', bg: 'bg-yellow-50'  },
  { value: 4, emoji: '😊', label: 'İyi',         color: '#22c55e', ring: 'ring-green-400',  bg: 'bg-green-50'   },
  { value: 5, emoji: '⚡', label: 'Enerjiyim!', color: '#06b6d4', ring: 'ring-cyan-400',   bg: 'bg-cyan-50'    },
];

const STRESS_OPTIONS: Array<{ value: 'LOW' | 'NORMAL' | 'HIGH'; emoji: string; label: string }> = [
  { value: 'LOW',    emoji: '🌊', label: 'Sakin — hiçbir engel yok'      },
  { value: 'NORMAL', emoji: '⚖️', label: 'Normal — yönetilebilir'        },
  { value: 'HIGH',   emoji: '🔥', label: 'Yüksek — bir şeyler tıkanıyor' },
];

// ─── Slide variants ───────────────────────────────────────────────────────────

const slideVariants = {
  enter: (dir: number) => ({ x: dir * 60, opacity: 0 }),
  center: { x: 0, opacity: 1 },
  exit:  (dir: number) => ({ x: dir * -60, opacity: 0 }),
};

// ─── Component ────────────────────────────────────────────────────────────────

interface PulseCheckModalProps {
  userId: string;
  onClose: () => void;
}

type Phase = 'energy' | 'blockers' | 'done';

export function PulseCheckModal({ userId, onClose }: PulseCheckModalProps) {
  const [phase, setPhase]             = useState<Phase>('energy');
  const [direction, setDirection]     = useState(1);
  const [energy, setEnergy]           = useState<number | null>(null);
  const [stress, setStress]           = useState<'LOW' | 'NORMAL' | 'HIGH'>('NORMAL');
  const [notes, setNotes]             = useState('');
  const [saving, setSaving]           = useState(false);

  function advance(newPhase: Phase) {
    setDirection(1);
    setPhase(newPhase);
  }

  async function handleSubmit() {
    if (!energy) return;
    setSaving(true);
    try {
      const payload: PulseSubmission = {
        user_id:       userId,
        energy_level:  energy,
        stress_factor: stress,
        notes:         notes.trim() || undefined,
        week_key:      getISOWeekKey(),
      };
      await submitPulse(payload);
      markSeenLocally(userId);
      advance('done');
    } catch {
      // silent fail — non-critical survey
      markSeenLocally(userId);
      advance('done');
    } finally {
      setSaving(false);
    }
  }

  const selectedEnergy = ENERGY_OPTIONS.find((o) => o.value === energy);

  return (
    <div
      className="fixed inset-0 z-[9999] flex items-center justify-center p-4"
      style={{ background: 'rgba(0,0,0,0.45)', backdropFilter: 'blur(4px)' }}
    >
      <motion.div
        initial={{ scale: 0.88, opacity: 0, y: 20 }}
        animate={{ scale: 1,    opacity: 1, y: 0  }}
        exit={{    scale: 0.88, opacity: 0, y: 20 }}
        transition={{ type: 'spring', stiffness: 380, damping: 28 }}
        className="relative w-full max-w-md rounded-3xl shadow-2xl overflow-hidden"
        style={{ background: 'linear-gradient(145deg, #ffffff 0%, #f8fafc 100%)' }}
      >
        {/* Decorative top band */}
        <div
          className="h-1.5 w-full"
          style={{
            background: selectedEnergy
              ? `linear-gradient(90deg, ${selectedEnergy.color}, ${selectedEnergy.color}88)`
              : 'linear-gradient(90deg, #38bdf8, #818cf8)',
          }}
        />

        {/* Header */}
        <div className="flex items-center justify-between px-6 pt-5 pb-3">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-cyan-400 to-blue-500 flex items-center justify-center shadow-sm">
              <Zap size={15} className="text-white" />
            </div>
            <div>
              <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Haftalık Kontrol</p>
              <p className="text-sm font-bold text-slate-800 leading-tight">Nabız Ölçümü</p>
            </div>
          </div>

          {phase !== 'done' && (
            <button
              onClick={() => { markSeenLocally(userId); onClose(); }}
              className="w-7 h-7 rounded-full flex items-center justify-center text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors"
            >
              <X size={14} />
            </button>
          )}
        </div>

        {/* Progress dots */}
        {phase !== 'done' && (
          <div className="flex justify-center gap-1.5 pb-2">
            {(['energy', 'blockers'] as const).map((p) => (
              <div
                key={p}
                className="h-1.5 rounded-full transition-all duration-300"
                style={{
                  width: phase === p ? 20 : 6,
                  background: phase === p ? '#38bdf8' : '#e2e8f0',
                }}
              />
            ))}
          </div>
        )}

        {/* Slide content */}
        <div className="px-6 pb-6 min-h-[280px] relative overflow-hidden">
          <AnimatePresence mode="wait" custom={direction}>

            {/* ── Step 1: Energy Level ─────────────────── */}
            {phase === 'energy' && (
              <motion.div
                key="energy"
                custom={direction}
                variants={slideVariants}
                initial="enter"
                animate="center"
                exit="exit"
                transition={{ duration: 0.22, ease: 'easeInOut' }}
                className="pt-3"
              >
                <p className="text-xl font-bold text-slate-800 mb-1">
                  Bu hafta ne kadar enerjik hissediyorsun? 🔋
                </p>
                <p className="text-sm text-slate-500 mb-5">
                  Dürüst ol — seni dinliyoruz.
                </p>

                <div className="flex items-center justify-between gap-2 mb-5">
                  {ENERGY_OPTIONS.map((opt) => (
                    <button
                      key={opt.value}
                      onClick={() => setEnergy(opt.value)}
                      className={[
                        'flex-1 flex flex-col items-center gap-1.5 py-3 rounded-2xl border-2 transition-all duration-200',
                        energy === opt.value
                          ? `ring-2 ${opt.ring} ring-offset-1 border-transparent ${opt.bg} scale-105 shadow-md`
                          : 'border-slate-100 hover:border-slate-200 hover:scale-102',
                      ].join(' ')}
                    >
                      <span className="text-2xl leading-none">{opt.emoji}</span>
                      <span
                        className="text-xs font-semibold leading-tight text-center"
                        style={{ color: energy === opt.value ? opt.color : '#94a3b8', fontSize: '10px' }}
                      >
                        {opt.label}
                      </span>
                    </button>
                  ))}
                </div>

                <motion.button
                  onClick={() => energy && advance('blockers')}
                  disabled={!energy}
                  whileTap={{ scale: 0.97 }}
                  className={[
                    'w-full flex items-center justify-center gap-2 py-3 rounded-2xl font-semibold text-sm transition-all',
                    energy
                      ? 'bg-gradient-to-r from-cyan-500 to-blue-500 text-white shadow-md hover:shadow-lg hover:scale-[1.01]'
                      : 'bg-slate-100 text-slate-400 cursor-not-allowed',
                  ].join(' ')}
                >
                  Devam Et
                  <ChevronRight size={16} />
                </motion.button>
              </motion.div>
            )}

            {/* ── Step 2: Blockers ────────────────────── */}
            {phase === 'blockers' && (
              <motion.div
                key="blockers"
                custom={direction}
                variants={slideVariants}
                initial="enter"
                animate="center"
                exit="exit"
                transition={{ duration: 0.22, ease: 'easeInOut' }}
                className="pt-3"
              >
                <p className="text-xl font-bold text-slate-800 mb-1">
                  Akışını kesen bir şey var mı? 🤔
                </p>
                <p className="text-sm text-slate-500 mb-4">
                  Anonim olarak paylaşılır — güvende ol.
                </p>

                <div className="flex flex-col gap-2 mb-4">
                  {STRESS_OPTIONS.map((opt) => (
                    <button
                      key={opt.value}
                      onClick={() => setStress(opt.value as 'LOW' | 'NORMAL' | 'HIGH')}
                      className={[
                        'flex items-center gap-3 px-4 py-3 rounded-2xl border-2 text-left transition-all duration-200',
                        stress === opt.value
                          ? 'border-cyan-400 bg-cyan-50 shadow-sm'
                          : 'border-slate-100 hover:border-slate-200',
                      ].join(' ')}
                    >
                      <span className="text-xl">{opt.emoji}</span>
                      <span className={`text-sm font-medium ${stress === opt.value ? 'text-cyan-700' : 'text-slate-600'}`}>
                        {opt.label}
                      </span>
                    </button>
                  ))}
                </div>

                {stress === 'HIGH' && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.2 }}
                    className="overflow-hidden mb-4"
                  >
                    <textarea
                      value={notes}
                      onChange={(e) => setNotes(e.target.value)}
                      placeholder="Ne tıkandı? (isteğe bağlı)"
                      maxLength={280}
                      rows={2}
                      className="w-full resize-none rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm text-slate-700 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-cyan-300 transition-all"
                    />
                  </motion.div>
                )}

                <motion.button
                  onClick={handleSubmit}
                  disabled={saving}
                  whileTap={{ scale: 0.97 }}
                  className="w-full flex items-center justify-center gap-2 py-3 rounded-2xl font-semibold text-sm bg-gradient-to-r from-cyan-500 to-blue-500 text-white shadow-md hover:shadow-lg hover:scale-[1.01] transition-all disabled:opacity-60 disabled:cursor-not-allowed"
                >
                  {saving ? 'Kaydediliyor…' : 'Gönder ✓'}
                </motion.button>
              </motion.div>
            )}

            {/* ── Done ──────────────────────────────────── */}
            {phase === 'done' && (
              <motion.div
                key="done"
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1,   opacity: 1 }}
                transition={{ type: 'spring', stiffness: 300, damping: 22 }}
                className="flex flex-col items-center justify-center pt-8 pb-4 gap-4"
              >
                <motion.div
                  animate={{ rotate: [0, -10, 10, -6, 6, 0] }}
                  transition={{ duration: 0.6, delay: 0.15 }}
                  className="text-6xl"
                >
                  🙏
                </motion.div>
                <p className="text-xl font-bold text-slate-800 text-center">Teşekkürler!</p>
                <p className="text-sm text-slate-500 text-center max-w-xs">
                  Geri bildiriminiz liderliğe anonim olarak iletildi. Seni önemsiyoruz.
                </p>
                <button
                  onClick={onClose}
                  className="mt-2 px-6 py-2.5 rounded-2xl bg-slate-900 text-white text-sm font-semibold hover:bg-slate-700 transition-colors"
                >
                  Kapat
                </button>
              </motion.div>
            )}

          </AnimatePresence>
        </div>
      </motion.div>
    </div>
  );
}

// ─── Hook — decides whether to show the modal ─────────────────────────────────

export function usePulseCheck(userId: string | null) {
  const [show, setShow] = useState(false);

  useEffect(() => {
    if (!userId) return;
    if (hasSeenLocally(userId)) return;

    let cancelled = false;
    hasSubmittedThisWeek(userId)
      .then((already) => {
        if (!cancelled && !already) {
          const delay = setTimeout(() => setShow(true), 1800);
          return () => clearTimeout(delay);
        }
      })
      .catch(() => {});

    return () => { cancelled = true; };
  }, [userId]);

  return { show, dismiss: () => { if (userId) markSeenLocally(userId); setShow(false); } };
}
