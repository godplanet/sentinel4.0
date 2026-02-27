import { useState } from 'react';
import { motion } from 'framer-motion';
import {
  FileCheck, UserCheck, CheckCircle2, Clock, Shield, Loader2, Lock,
  AlertTriangle, ShieldOff, TrendingUp,
} from 'lucide-react';
import clsx from 'clsx';
import type { Workpaper } from '@/entities/workpaper/model/types';

const QAIP_THRESHOLD = 70;

interface SignOffPanelProps {
  workpaper: Workpaper | null;
  currentUserId: string;
  onSignOffPrepared: () => Promise<void>;
  onSignOffReviewed: () => Promise<void>;
  qaipScore?: number;
}

function QAIPGateBanner({ score }: { score: number }) {
  const isBlocked = score < QAIP_THRESHOLD;
  const deficit = QAIP_THRESHOLD - score;

  return (
    <motion.div
      initial={{ opacity: 0, y: -8 }}
      animate={{ opacity: 1, y: 0 }}
      className={clsx(
        'rounded-xl border-2 p-4',
        isBlocked
          ? 'bg-red-950/30 border-red-500/60 shadow-[0_0_20px_rgba(239,68,68,0.18)]'
          : 'bg-emerald-950/20 border-emerald-500/40',
      )}
    >
      <div className="flex items-start gap-3">
        <div className={clsx(
          'w-9 h-9 rounded-lg flex items-center justify-center flex-shrink-0',
          isBlocked
            ? 'bg-red-500/20 border border-red-500/40'
            : 'bg-emerald-500/20 border border-emerald-500/35',
        )}>
          {isBlocked
            ? <ShieldOff size={16} className="text-red-400" />
            : <Shield size={16} className="text-emerald-400" />}
        </div>

        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1 flex-wrap">
            {isBlocked && (
              <div className="flex items-center gap-1 px-2 py-0.5 bg-red-500/20 border border-red-500/40 rounded-md">
                <Lock size={10} className="text-red-400" />
                <span className="text-[10px] font-bold text-red-400 uppercase tracking-wider">
                  İmza Engellendi
                </span>
              </div>
            )}
            <span className={clsx(
              'text-sm font-bold',
              isBlocked ? 'text-red-200' : 'text-emerald-200',
            )}>
              QAIP Kalite Puanı: {score}/100
            </span>
          </div>

          {isBlocked ? (
            <p className="text-xs text-red-300/90 leading-relaxed">
              <span className="font-bold text-red-300">GIAS 2024 — İmza Kapatma Engeli:</span>{' '}
              Kalite puanı ({score}), zorunlu eşik değerinin ({QAIP_THRESHOLD}) {deficit} puan
              altındadır. Kapatma için gözden geçirme notları temizlenmeli ve kalite metrikleri
              iyileştirilmelidir.
            </p>
          ) : (
            <p className="text-xs text-emerald-300/90 leading-relaxed">
              Kalite puanı eşik değerini karşılıyor. İmza kapatma işlemi onaylandı.
            </p>
          )}
        </div>
      </div>

      <div className="mt-3">
        <div className="flex items-center gap-2 mb-1">
          <div className="flex-1 h-2 bg-slate-800/60 rounded-full overflow-hidden">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${Math.min(100, score)}%` }}
              transition={{ duration: 0.7, ease: 'easeOut' }}
              className={clsx(
                'h-full rounded-full',
                score < 50
                  ? 'bg-red-500'
                  : score < QAIP_THRESHOLD
                    ? 'bg-orange-500'
                    : score < 85
                      ? 'bg-amber-400'
                      : 'bg-emerald-500',
              )}
            />
          </div>
          <div className="flex items-center gap-1">
            <TrendingUp size={10} className={isBlocked ? 'text-red-400' : 'text-emerald-400'} />
            <span className={clsx(
              'text-[10px] font-bold tabular-nums',
              isBlocked ? 'text-red-400' : 'text-emerald-400',
            )}>
              {score}%
            </span>
          </div>
        </div>
        {isBlocked && (
          <div className="flex items-center gap-1 mt-1">
            <AlertTriangle size={10} className="text-orange-400" />
            <span className="text-[10px] text-orange-300">
              Kapatma için {deficit} puan daha gerekli
            </span>
          </div>
        )}
      </div>
    </motion.div>
  );
}

export function SignOffPanel({
  workpaper,
  currentUserId: _currentUserId,
  onSignOffPrepared,
  onSignOffReviewed,
  qaipScore = 65,
}: SignOffPanelProps) {
  const [submitting, setSubmitting] = useState<'prepared' | 'reviewed' | null>(null);

  const isQAIPBlocked = qaipScore < QAIP_THRESHOLD;

  const handleSignOff = async (type: 'prepared' | 'reviewed') => {
    if (type === 'reviewed' && isQAIPBlocked) return;
    setSubmitting(type);
    try {
      if (type === 'prepared') {
        await onSignOffPrepared();
      } else {
        await onSignOffReviewed();
      }
    } catch (err) {
      console.error('Sign-off failed:', err);
    } finally {
      setSubmitting(null);
    }
  };

  const isPrepared = !!workpaper?.prepared_at;
  const isReviewed = !!workpaper?.reviewed_at;
  const canPrepare = !isPrepared;
  const canReview = isPrepared && !isReviewed;

  return (
    <div className="space-y-5">
      <div className="flex items-center gap-2 mb-4">
        <div className="p-2 bg-blue-100 rounded-xl">
          <FileCheck size={16} className="text-blue-600" />
        </div>
        <div>
          <h3 className="text-sm font-bold text-slate-900">İmza Süreci</h3>
          <p className="text-xs text-slate-500">Hazırlayan ve Gözden Geçiren Onayları</p>
        </div>
      </div>

      <QAIPGateBanner score={qaipScore} />

      <div className="space-y-3">
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          className={clsx(
            'border-2 rounded-xl p-4 transition-all',
            isPrepared
              ? 'border-emerald-300 bg-emerald-50/50'
              : 'border-slate-200 bg-slate-50',
          )}
        >
          <div className="flex items-start justify-between gap-3 mb-3">
            <div className="flex items-start gap-3">
              <div className={clsx('p-2 rounded-lg shrink-0', isPrepared ? 'bg-emerald-100' : 'bg-slate-200')}>
                {isPrepared ? (
                  <CheckCircle2 size={18} className="text-emerald-600" />
                ) : (
                  <Clock size={18} className="text-slate-500" />
                )}
              </div>
              <div className="flex-1 min-w-0">
                <h4 className="text-sm font-bold text-slate-900 mb-1">Hazırlayan İmzası</h4>
                {isPrepared ? (
                  <div className="space-y-1">
                    <p className="text-xs text-slate-600">
                      <span className="font-medium">İmzalayan:</span>{' '}
                      {workpaper?.prepared_by_name || 'Bilinmiyor'}
                    </p>
                    <p className="text-xs text-slate-500">
                      {workpaper?.prepared_at &&
                        new Date(workpaper.prepared_at).toLocaleString('tr-TR')}
                    </p>
                  </div>
                ) : (
                  <p className="text-xs text-slate-500">
                    Workpaper henüz hazırlayan tarafından imzalanmadı.
                  </p>
                )}
              </div>
            </div>
          </div>

          {canPrepare && (
            <button
              onClick={() => handleSignOff('prepared')}
              disabled={submitting === 'prepared'}
              className="w-full flex items-center justify-center gap-2 px-4 py-2.5 bg-blue-600 text-white text-sm font-bold rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
            >
              {submitting === 'prepared' ? (
                <>
                  <Loader2 size={14} className="animate-spin" />
                  İmzalanıyor...
                </>
              ) : (
                <>
                  <UserCheck size={14} />
                  Hazırlayan Olarak İmzala
                </>
              )}
            </button>
          )}
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className={clsx(
            'border-2 rounded-xl p-4 transition-all',
            isReviewed
              ? 'border-emerald-300 bg-emerald-50/50'
              : !isPrepared
                ? 'border-slate-200 bg-slate-50 opacity-60'
                : isQAIPBlocked
                  ? 'border-red-400/50 bg-red-950/20'
                  : 'border-slate-200 bg-slate-50',
          )}
        >
          <div className="flex items-start justify-between gap-3 mb-3">
            <div className="flex items-start gap-3">
              <div className={clsx(
                'p-2 rounded-lg shrink-0',
                isReviewed
                  ? 'bg-emerald-100'
                  : isQAIPBlocked && isPrepared
                    ? 'bg-red-500/20'
                    : 'bg-slate-200',
              )}>
                {isReviewed ? (
                  <CheckCircle2 size={18} className="text-emerald-600" />
                ) : isQAIPBlocked && isPrepared ? (
                  <Lock size={18} className="text-red-400" />
                ) : (
                  <Shield size={18} className="text-slate-500" />
                )}
              </div>
              <div className="flex-1 min-w-0">
                <h4 className={clsx(
                  'text-sm font-bold mb-1',
                  isQAIPBlocked && isPrepared && !isReviewed ? 'text-red-200' : 'text-slate-900',
                )}>
                  Gözden Geçiren İmzası — Denetim Kapatma
                </h4>
                {isReviewed ? (
                  <div className="space-y-1">
                    <p className="text-xs text-slate-600">
                      <span className="font-medium">İmzalayan:</span>{' '}
                      {workpaper?.reviewed_by_name || 'Bilinmiyor'}
                    </p>
                    <p className="text-xs text-slate-500">
                      {workpaper?.reviewed_at &&
                        new Date(workpaper.reviewed_at).toLocaleString('tr-TR')}
                    </p>
                  </div>
                ) : isPrepared ? (
                  isQAIPBlocked ? (
                    <p className="text-xs text-red-300/80">
                      QAIP puanı yetersiz — kapatma devre dışı bırakıldı.
                    </p>
                  ) : (
                    <p className="text-xs text-slate-500">
                      Workpaper gözden geçirme onayı bekliyor.
                    </p>
                  )
                ) : (
                  <p className="text-xs text-slate-400">
                    Önce hazırlayan imzası gerekli.
                  </p>
                )}
              </div>
            </div>
          </div>

          {canReview && (
            <div className="space-y-3">
              {isQAIPBlocked && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.98 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="flex items-start gap-3 p-3.5 bg-red-500/15 border-2 border-red-500/50 rounded-xl"
                >
                  <div className="w-6 h-6 rounded-md bg-red-500/25 border border-red-500/50 flex items-center justify-center flex-shrink-0 mt-0.5">
                    <Lock size={12} className="text-red-400" />
                  </div>
                  <div>
                    <p className="text-xs font-bold text-red-300 leading-tight mb-1">
                      İMZA ENGELLENDİ: QAIP Kalite Puanı ({qaipScore}){' '}
                      eşik değerinin ({QAIP_THRESHOLD}) altında.
                    </p>
                    <p className="text-[11px] text-red-300/80 leading-relaxed">
                      Gözden geçirme notları temizlenmeli ve kalite metrikleri iyileştirilmelidir.
                      Denetimi kapatmak için önce kalite sorunlarını giderin.{' '}
                      <span className="font-bold">(GIAS 2024 Kuralı)</span>
                    </p>
                  </div>
                </motion.div>
              )}

              <button
                onClick={() => handleSignOff('reviewed')}
                disabled={submitting === 'reviewed' || isQAIPBlocked}
                title={
                  isQAIPBlocked
                    ? `QAIP puanı ${qaipScore}/100 — eşik değeri ${QAIP_THRESHOLD} altında`
                    : undefined
                }
                className={clsx(
                  'w-full flex items-center justify-center gap-2 px-4 py-2.5 text-sm font-bold rounded-lg transition-all',
                  isQAIPBlocked
                    ? 'bg-slate-700/60 text-slate-500 cursor-not-allowed border border-slate-600/40'
                    : submitting === 'reviewed'
                      ? 'bg-emerald-600 text-white opacity-70 cursor-wait'
                      : 'bg-emerald-600 text-white hover:bg-emerald-700',
                )}
              >
                {submitting === 'reviewed' ? (
                  <>
                    <Loader2 size={14} className="animate-spin" />
                    İmzalanıyor...
                  </>
                ) : isQAIPBlocked ? (
                  <>
                    <Lock size={14} />
                    İmza Engellendi — QAIP {qaipScore}/{QAIP_THRESHOLD}
                  </>
                ) : (
                  <>
                    <Shield size={14} />
                    İmzala ve Denetimi Kapat
                  </>
                )}
              </button>
            </div>
          )}
        </motion.div>
      </div>

      {isPrepared && isReviewed && (
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="bg-gradient-to-r from-emerald-50 to-teal-50 border-2 border-emerald-300 rounded-xl p-4 text-center"
        >
          <div className="w-12 h-12 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-2">
            <CheckCircle2 className="text-emerald-600" size={24} />
          </div>
          <h4 className="text-sm font-bold text-emerald-900 mb-1">Workpaper Tamamlandı</h4>
          <p className="text-xs text-emerald-700">
            Bu workpaper hem hazırlayan hem de gözden geçiren tarafından onaylandı.
          </p>
        </motion.div>
      )}

      <div className="bg-blue-50 border border-blue-200 rounded-xl p-3">
        <div className="flex items-start gap-2">
          <Shield size={14} className="text-blue-600 mt-0.5 shrink-0" />
          <div className="text-xs text-blue-900 leading-relaxed space-y-1">
            <p className="font-bold">İmza Süreci Hakkında:</p>
            <ul className="list-disc list-inside space-y-0.5 text-blue-800 ml-1">
              <li>Hazırlayan imzası: Workpaper'ı hazırlayan denetçi tarafından atılır</li>
              <li>Gözden Geçiren imzası: Süpervizör veya kıdemli denetçi tarafından atılır</li>
              <li>Kapatma imzası QAIP eşik değeri ({QAIP_THRESHOLD}) karşılanmadan atanamaz</li>
              <li>Her imza kalıcıdır ve değiştirilemez — GIAS 2024 uyumlu</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
