import { useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Shield, Lock, Eye, EyeOff, Send, Copy, Check,
  Radio, Fingerprint, ShieldCheck, AlertTriangle,
  ChevronDown,
} from 'lucide-react';
import clsx from 'clsx';
import { submitTip } from '@/features/investigation/api';
import type { TipChannel } from '@/features/investigation/types';
import { CHANNEL_LABELS } from '@/features/investigation/types';

type Phase = 'form' | 'submitting' | 'success';

const CHANNELS: Array<{ id: TipChannel; icon: typeof Shield; desc: string }> = [
  { id: 'WEB', icon: Shield, desc: 'Standart sifrelenmis web kanali' },
  { id: 'TOR_ONION', icon: Eye, desc: 'Tor aglari uzerinden anonim erisim (simule)' },
  { id: 'SIGNAL_MOCK', icon: Radio, desc: 'Uctan uca sifrelenmis mesajlasma (simule)' },
];

const SECURITY_BADGES = [
  { icon: Lock, label: 'AES-256 Sifreleme' },
  { icon: Fingerprint, label: 'Sifir Bilgi Kaniti' },
  { icon: EyeOff, label: 'Kimlik Korumasi Aktif' },
  { icon: ShieldCheck, label: 'Misilleme Korumasii' },
];

export default function SecureReportPage() {
  const [phase, setPhase] = useState<Phase>('form');
  const [channel, setChannel] = useState<TipChannel>('WEB');
  const [content, setContent] = useState('');
  const [trackingCode, setTrackingCode] = useState('');
  const [copied, setCopied] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = useCallback(async () => {
    if (content.trim().length < 20) {
      setError('Bildiriminiz en az 20 karakter olmalidir.');
      return;
    }

    setError('');
    setPhase('submitting');

    try {
      const result = await submitTip({ content, channel });
      setTrackingCode(result.trackingCode);
      setPhase('success');
    } catch (err) {
      console.error('Submission failed:', err);
      setError('Gonderim sirasinda bir hata olustu. Lutfen tekrar deneyin.');
      setPhase('form');
    }
  }, [content, channel]);

  const handleCopy = () => {
    navigator.clipboard.writeText(trackingCode);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="min-h-screen bg-slate-950 flex items-center justify-center p-4">
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-emerald-900/10 rounded-full blur-3xl" />
        <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-cyan-900/10 rounded-full blur-3xl" />
      </div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="relative w-full max-w-2xl"
      >
        <div className="flex items-center justify-center gap-3 mb-6">
          <div className="w-10 h-10 rounded-xl bg-emerald-500/20 border border-emerald-500/30 flex items-center justify-center">
            <Shield size={20} className="text-emerald-400" />
          </div>
          <div>
            <h1 className="text-lg font-bold text-white">Guvenli Bildirim Kanali</h1>
            <p className="text-xs text-slate-500">Sentinel GRC - Anonim Ihbar Sistemi</p>
          </div>
        </div>

        <div className="flex flex-wrap justify-center gap-2 mb-6">
          {SECURITY_BADGES.map((badge) => {
            const Icon = badge.icon;
            return (
              <div
                key={badge.label}
                className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-950/50 border border-emerald-800/30"
              >
                <Icon size={10} className="text-emerald-500" />
                <span className="text-[10px] text-emerald-400 font-medium">{badge.label}</span>
              </div>
            );
          })}
        </div>

        <AnimatePresence mode="wait">
          {phase === 'form' && (
            <motion.div
              key="form"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="bg-slate-900/80 backdrop-blur-xl border border-slate-800 rounded-2xl p-6 space-y-5"
            >
              <div>
                <label className="text-xs font-bold text-slate-400 mb-2 block">Bildirim Kanali</label>
                <div className="grid grid-cols-3 gap-2">
                  {CHANNELS.map((ch) => {
                    const Icon = ch.icon;
                    return (
                      <button
                        key={ch.id}
                        onClick={() => setChannel(ch.id)}
                        className={clsx(
                          'p-3 rounded-xl border transition-all text-left',
                          channel === ch.id
                            ? 'bg-emerald-950/50 border-emerald-600/50'
                            : 'bg-slate-800/50 border-slate-700/50 hover:border-slate-600',
                        )}
                      >
                        <Icon size={16} className={channel === ch.id ? 'text-emerald-400' : 'text-slate-500'} />
                        <span className={clsx(
                          'text-xs font-bold block mt-1.5',
                          channel === ch.id ? 'text-emerald-300' : 'text-slate-400',
                        )}>
                          {CHANNEL_LABELS[ch.id]}
                        </span>
                        <span className="text-[9px] text-slate-600 block mt-0.5">{ch.desc}</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              <div>
                <label className="text-xs font-bold text-slate-400 mb-2 block">Bildirim Icerigi</label>
                <textarea
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                  placeholder="Bildiriminizi buraya yazin. Ne kadar cok detay verirseniz (tarih, isim, tutar, belge no) inceleme o kadar etkili olur..."
                  rows={8}
                  className="w-full bg-slate-800/60 border border-slate-700/50 rounded-xl p-4 text-sm text-slate-300 placeholder-slate-600 resize-none focus:outline-none focus:border-emerald-600/50 focus:ring-1 focus:ring-emerald-600/20 transition-all"
                />
                <div className="flex items-center justify-between mt-1.5">
                  <span className="text-[10px] text-slate-600">{content.length} karakter</span>
                  {content.length > 0 && content.length < 20 && (
                    <span className="text-[10px] text-amber-500">En az 20 karakter gerekli</span>
                  )}
                </div>
              </div>

              {error && (
                <div className="flex items-center gap-2 p-3 bg-red-950/30 border border-red-800/30 rounded-lg">
                  <AlertTriangle size={14} className="text-red-400 shrink-0" />
                  <span className="text-xs text-red-400">{error}</span>
                </div>
              )}

              <div className="bg-slate-800/30 border border-slate-700/30 rounded-xl p-3">
                <button
                  className="w-full flex items-center justify-between text-left"
                  onClick={() => {}}
                >
                  <span className="text-[10px] text-slate-500 flex items-center gap-1.5">
                    <Lock size={10} />
                    Gizlilik Taahhutnamesi
                    <ChevronDown size={10} />
                  </span>
                </button>
                <p className="text-[10px] text-slate-600 mt-2 leading-relaxed">
                  Bildiriminiz AES-256 ile sifrelenmektedir. Kimlik bilgileriniz hicbir kosulda saklanmaz veya paylasılmaz.
                  5651 sayili Kanun ve 6698 sayili KVKK kapsaminda tum haklariniz korunmaktadir.
                  Misilleme yasagi garantisi altindasiniz.
                </p>
              </div>

              <button
                onClick={handleSubmit}
                disabled={content.trim().length < 20}
                className={clsx(
                  'w-full flex items-center justify-center gap-2 py-3 rounded-xl text-sm font-bold transition-all',
                  content.trim().length >= 20
                    ? 'bg-emerald-600 text-white hover:bg-emerald-500'
                    : 'bg-slate-800 text-slate-600 cursor-not-allowed',
                )}
              >
                <Send size={16} />
                Guvenli Gonder
              </button>
            </motion.div>
          )}

          {phase === 'submitting' && (
            <motion.div
              key="submitting"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="bg-slate-900/80 backdrop-blur-xl border border-slate-800 rounded-2xl p-12 text-center"
            >
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 2, repeat: Infinity, ease: 'linear' }}
                className="w-12 h-12 mx-auto mb-4 rounded-full border-2 border-emerald-500/30 border-t-emerald-500"
              />
              <h3 className="text-sm font-bold text-white mb-1">Sifreleme ve Gonderim</h3>
              <p className="text-xs text-slate-500">Bildiriminiz guvenli kanaldan iletiliyor...</p>
            </motion.div>
          )}

          {phase === 'success' && (
            <motion.div
              key="success"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="bg-slate-900/80 backdrop-blur-xl border border-emerald-800/30 rounded-2xl p-8 text-center space-y-5"
            >
              <div className="w-16 h-16 mx-auto rounded-2xl bg-emerald-500/20 border border-emerald-500/30 flex items-center justify-center">
                <ShieldCheck size={28} className="text-emerald-400" />
              </div>

              <div>
                <h3 className="text-lg font-bold text-white mb-1">Bildiriminiz Alindi</h3>
                <p className="text-xs text-slate-500">
                  AI triaj motoru bildiriminizi analiz ediyor. Asagidaki gizli erisim anahtarini saklayiniz.
                </p>
              </div>

              <div className="bg-slate-950 border border-slate-700 rounded-xl p-4">
                <span className="text-[10px] text-slate-500 block mb-2">Gizli Erisim Anahtari</span>
                <div className="flex items-center justify-center gap-3">
                  <code className="text-lg font-mono font-bold text-emerald-400 tracking-wider">
                    {trackingCode}
                  </code>
                  <button
                    onClick={handleCopy}
                    className="p-2 rounded-lg bg-slate-800 hover:bg-slate-700 transition-colors"
                  >
                    {copied ? (
                      <Check size={14} className="text-emerald-400" />
                    ) : (
                      <Copy size={14} className="text-slate-400" />
                    )}
                  </button>
                </div>
              </div>

              <div className="bg-amber-950/20 border border-amber-800/20 rounded-lg p-3">
                <div className="flex items-start gap-2">
                  <AlertTriangle size={14} className="text-amber-500 mt-0.5 shrink-0" />
                  <p className="text-[11px] text-amber-400/80 text-left">
                    Bu anahtar bildiriminizin durumunu takip etmenin tek yoludur.
                    Guvenli bir yere kaydedin. Bu anahtar tekrar gosterilemez.
                  </p>
                </div>
              </div>

              <button
                onClick={() => {
                  setPhase('form');
                  setContent('');
                  setTrackingCode('');
                }}
                className="text-xs text-slate-500 hover:text-slate-400 transition-colors"
              >
                Yeni Bildirim Olustur
              </button>
            </motion.div>
          )}
        </AnimatePresence>

        <div className="text-center mt-6">
          <span className="text-[10px] text-slate-700">
            Sentinel GRC v3.0 - Gizli Bildirim Altyapisi
          </span>
        </div>
      </motion.div>
    </div>
  );
}
