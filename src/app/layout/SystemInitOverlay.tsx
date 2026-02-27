import { motion } from 'framer-motion';
import { Loader2, Database, CheckCircle2, AlertCircle } from 'lucide-react';

interface SystemInitOverlayProps {
  progress: string;
  error: string | null;
}

export function SystemInitOverlay({ progress, error }: SystemInitOverlayProps) {
  return (
    <div className="fixed inset-0 bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900 z-50 flex items-center justify-center">
      <div className="text-center space-y-8">
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.5 }}
        >
          <div className="mb-6">
            <Database className="w-20 h-20 text-blue-400 mx-auto mb-4" />
            <h1 className="text-4xl font-bold text-white mb-2">
              Sentinel GRC v3.0
            </h1>
            <p className="text-blue-200 text-lg">
              Participation Banking Audit Platform
            </p>
          </div>

          {error ? (
            <div className="flex items-center justify-center gap-3 text-red-400">
              <AlertCircle className="w-6 h-6" />
              <p className="text-lg">{error}</p>
            </div>
          ) : progress ? (
            <div className="flex items-center justify-center gap-3">
              <Loader2 className="w-6 h-6 text-blue-400 animate-spin" />
              <p className="text-blue-100 text-lg">{progress}</p>
            </div>
          ) : (
            <div className="flex items-center justify-center gap-3 text-green-400">
              <CheckCircle2 className="w-6 h-6" />
              <p className="text-lg">Sistem Hazır</p>
            </div>
          )}
        </motion.div>

        <div className="max-w-md mx-auto">
          <motion.div
            className="h-2 bg-blue-900/50 rounded-full overflow-hidden"
            initial={{ width: 0 }}
            animate={{ width: '100%' }}
            transition={{ duration: 0.5 }}
          >
            <motion.div
              className="h-full bg-gradient-to-r from-blue-500 to-cyan-400"
              initial={{ width: '0%' }}
              animate={{ width: error ? '0%' : progress ? '75%' : '100%' }}
              transition={{ duration: 2, ease: 'easeInOut' }}
            />
          </motion.div>
        </div>

        <div className="text-blue-300 text-sm">
          <p>Kuruluş: Sentinel Katılım Bankası A.Ş.</p>
          <p className="mt-1">Demo veriler yükleniyor...</p>
        </div>
      </div>
    </div>
  );
}
