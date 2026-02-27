import type { SkepticChallenge } from '@/entities/sox';
import { ShieldAlert, AlertTriangle, X, Send } from 'lucide-react';
import { motion } from 'framer-motion';
import clsx from 'clsx';

interface Props {
  challenge: SkepticChallenge;
  justification: string;
  onJustificationChange: (val: string) => void;
  onOverride: () => void;
  onCancel: () => void;
}

export const SkepticChallengeModal = ({
  challenge, justification, onJustificationChange, onOverride, onCancel,
}: Props) => {
  const isCritical = challenge.severity === 'critical';
  const canSubmit = justification.trim().length >= 20;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        onClick={onCancel}
      />
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        className="relative w-full max-w-xl bg-white rounded-2xl shadow-2xl overflow-hidden"
      >
        <div className={clsx(
          'p-5 flex items-start gap-4',
          isCritical
            ? 'bg-gradient-to-r from-red-600 to-red-700'
            : 'bg-gradient-to-r from-amber-500 to-orange-500',
        )}>
          <div className="w-11 h-11 bg-white/20 rounded-xl flex items-center justify-center flex-shrink-0">
            {isCritical ? <ShieldAlert className="w-6 h-6 text-white" /> : <AlertTriangle className="w-6 h-6 text-white" />}
          </div>
          <div className="flex-1 text-white">
            <h3 className="text-lg font-black">
              {isCritical ? 'Sentinel Skeptic - Kritik Itiraz' : 'Sentinel Skeptic - Uyari'}
            </h3>
            <p className="text-sm opacity-90 mt-0.5">
              Yapay zeka denetcisi beyaninizi sorguluyor
            </p>
          </div>
          <button onClick={onCancel} className="text-white/70 hover:text-white transition-colors">
            <X size={20} />
          </button>
        </div>

        <div className="p-5 space-y-4">
          <div className={clsx(
            'rounded-lg p-4 text-sm font-mono leading-relaxed whitespace-pre-wrap',
            isCritical ? 'bg-red-50 text-red-800 border border-red-200' : 'bg-amber-50 text-amber-800 border border-amber-200',
          )}>
            {challenge.message}
          </div>

          <div className={clsx(
            'rounded-lg p-3 text-xs',
            isCritical ? 'bg-red-50 border border-red-100' : 'bg-amber-50 border border-amber-100',
          )}>
            <div className="font-bold text-slate-600 mb-2">Iliskili Olaylar ({challenge.incidentCount})</div>
            {challenge.incidents.map((inc) => (
              <div key={inc.id} className="flex items-center gap-2 py-1">
                <span className={clsx(
                  'text-[9px] font-bold px-1.5 py-0.5 rounded',
                  inc.severity === 'Critical' ? 'bg-red-200 text-red-800' :
                  inc.severity === 'High' ? 'bg-orange-200 text-orange-800' :
                  'bg-amber-200 text-amber-800',
                )}>
                  {inc.severity}
                </span>
                <span className="text-slate-700">{inc.title}</span>
              </div>
            ))}
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-600 mb-1.5">
              Gerekce / Aciklama <span className="text-red-500">*</span>
            </label>
            <textarea
              value={justification}
              onChange={(e) => onJustificationChange(e.target.value)}
              placeholder="Bu olaylara ragmen kontrolun neden etkin oldugunu en az 20 karakter ile aciklayiniz..."
              rows={4}
              className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/30 resize-none"
            />
            {justification.length > 0 && justification.length < 20 && (
              <p className="text-[10px] text-red-500 mt-1">En az 20 karakter gereklidir ({justification.length}/20)</p>
            )}
          </div>
        </div>

        <div className="flex items-center justify-end gap-3 p-5 border-t border-slate-100 bg-slate-50/50">
          <button
            onClick={onCancel}
            className="px-4 py-2 text-sm font-medium text-slate-600 hover:bg-slate-100 rounded-lg transition-colors"
          >
            Vazgec
          </button>
          <button
            onClick={onOverride}
            disabled={!canSubmit}
            className={clsx(
              'flex items-center gap-2 px-5 py-2.5 rounded-lg text-sm font-bold transition-all',
              canSubmit
                ? 'bg-gradient-to-r from-blue-600 to-blue-700 text-white hover:shadow-lg'
                : 'bg-slate-200 text-slate-400 cursor-not-allowed',
            )}
          >
            <Send size={14} />
            Gerekce ile Imzala
          </button>
        </div>
      </motion.div>
    </div>
  );
};
