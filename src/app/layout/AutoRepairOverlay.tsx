/**
 * AUTO-REPAIR OVERLAY
 *
 * Full-screen loading screen shown during database auto-repair
 * Displays progress messages and loading animation
 */

import { Database, Wrench, CheckCircle2 } from 'lucide-react';
import { motion } from 'framer-motion';

interface AutoRepairOverlayProps {
  isRepairing: boolean;
  error?: string | null;
}

export function AutoRepairOverlay({ isRepairing, error }: AutoRepairOverlayProps) {
  if (!isRepairing && !error) return null;

  return (
    <div className="fixed inset-0 z-50 bg-gradient-to-br from-blue-900 via-slate-900 to-slate-950 flex items-center justify-center">
      <div className="max-w-md w-full mx-4">
        {/* Animated Logo */}
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.5 }}
          className="text-center mb-8"
        >
          <div className="inline-flex items-center justify-center w-24 h-24 bg-blue-600/20 rounded-full mb-4">
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 2, repeat: Infinity, ease: 'linear' }}
            >
              <Database className="w-12 h-12 text-blue-400" />
            </motion.div>
          </div>
          <h1 className="text-3xl font-bold text-white mb-2">Sentinel v3.0</h1>
          <p className="text-blue-300 text-sm">Yapay Zeka Destekli İç Denetim Platformu</p>
        </motion.div>

        {/* Status Card */}
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.3 }}
          className="bg-white/10 backdrop-blur-xl border border-white/20 rounded-2xl p-8 shadow-2xl"
        >
          {error ? (
            <>
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 bg-red-500/20 rounded-lg flex items-center justify-center">
                  <Wrench className="w-5 h-5 text-red-400" />
                </div>
                <div>
                  <h2 className="text-lg font-semibold text-white">Onarım Başarısız</h2>
                  <p className="text-sm text-red-300">Veritabanı başlatma hatası</p>
                </div>
              </div>
              <div className="bg-red-500/20 border border-red-500/30 rounded-lg p-4 mb-4">
                <p className="text-sm text-red-200 font-mono">{error}</p>
              </div>
              <button
                onClick={() => window.location.reload()}
                className="w-full py-3 bg-red-600 hover:bg-red-700 text-white rounded-lg font-semibold transition-colors"
              >
                Tekrar Dene
              </button>
            </>
          ) : (
            <>
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 bg-blue-500/20 rounded-lg flex items-center justify-center">
                  <Wrench className="w-5 h-5 text-blue-400" />
                </div>
                <div>
                  <h2 className="text-lg font-semibold text-white">Sistem Başlatılıyor</h2>
                  <p className="text-sm text-blue-300">Veritabanı hazırlanıyor...</p>
                </div>
              </div>

              {/* Progress Steps */}
              <div className="space-y-3 mb-6">
                <ProgressStep
                  label="Mevcut Veriler Temizleniyor"
                  status="in_progress"
                />
                <ProgressStep
                  label="Kullanıcılar ve Profiller Oluşturuluyor"
                  status="pending"
                />
                <ProgressStep
                  label="Denetim Evreni Kuruluyor"
                  status="pending"
                />
                <ProgressStep
                  label="Risk Kütüphanesi Yükleniyor"
                  status="pending"
                />
                <ProgressStep
                  label="Aktif Görevler Yükleniyor"
                  status="pending"
                />
                <ProgressStep
                  label="Bulgular ve Aksiyonlar Oluşturuluyor"
                  status="pending"
                />
              </div>

              {/* Loading Animation */}
              <div className="flex items-center justify-center gap-2 text-blue-400">
                <div className="w-2 h-2 bg-blue-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                <div className="w-2 h-2 bg-blue-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                <div className="w-2 h-2 bg-blue-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
              </div>

              <p className="text-center text-blue-300 text-sm mt-4">
                Bu işlem yaklaşık 5–10 saniye sürecektir...
              </p>
            </>
          )}
        </motion.div>

        {/* Footer */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.6 }}
          className="text-center mt-6 text-blue-400 text-sm"
        >
          <p>Supabase + React + Yapay Zeka ile güçlendirilmiştir</p>
        </motion.div>
      </div>
    </div>
  );
}

interface ProgressStepProps {
  label: string;
  status: 'pending' | 'in_progress' | 'complete';
}

function ProgressStep({ label, status }: ProgressStepProps) {
  return (
    <div className="flex items-center gap-3">
      <div className="flex-shrink-0">
        {status === 'complete' ? (
          <CheckCircle2 className="w-5 h-5 text-green-400" />
        ) : status === 'in_progress' ? (
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
            className="w-5 h-5 border-2 border-blue-400 border-t-transparent rounded-full"
          />
        ) : (
          <div className="w-5 h-5 border-2 border-white/30 rounded-full" />
        )}
      </div>
      <span className={`text-sm ${status === 'complete' ? 'text-green-300' : status === 'in_progress' ? 'text-blue-200' : 'text-white/50'}`}>
        {label}
      </span>
    </div>
  );
}
