import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Clock, Loader2, Shield, FileSignature, AlertTriangle, MessageSquare,
  CheckCircle2, Upload, ClipboardCheck, X,
} from 'lucide-react';
import clsx from 'clsx';
import type { ActivityLog, ActivityActionType } from '@/entities/workpaper/model/detail-types';

const ACTION_CONFIG: Record<ActivityActionType, {
  icon: typeof Clock;
  color: string;
  bg: string;
  label: string;
}> = {
  STATUS_CHANGE: { icon: Shield, color: 'text-blue-600', bg: 'bg-blue-100', label: 'Durum Degisikligi' },
  SIGN_OFF: { icon: FileSignature, color: 'text-emerald-600', bg: 'bg-emerald-100', label: 'Imza' },
  UNSIGN: { icon: FileSignature, color: 'text-amber-600', bg: 'bg-amber-100', label: 'Imza Geri Alma' },
  FILE_UPLOAD: { icon: Upload, color: 'text-sky-600', bg: 'bg-sky-100', label: 'Dosya Yukleme' },
  NOTE_ADDED: { icon: MessageSquare, color: 'text-blue-600', bg: 'bg-blue-100', label: 'Not Eklendi' },
  NOTE_RESOLVED: { icon: CheckCircle2, color: 'text-emerald-600', bg: 'bg-emerald-100', label: 'Not Cozuldu' },
  FINDING_ADDED: { icon: AlertTriangle, color: 'text-red-600', bg: 'bg-red-100', label: 'Bulgu Eklendi' },
  STEP_COMPLETED: { icon: ClipboardCheck, color: 'text-teal-600', bg: 'bg-teal-100', label: 'Adim Tamamlandi' },
  EVIDENCE_UPDATE: { icon: Upload, color: 'text-sky-600', bg: 'bg-sky-100', label: 'Kanit Guncellendi' },
  QUESTIONNAIRE_SENT: { icon: ClipboardCheck, color: 'text-blue-600', bg: 'bg-blue-100', label: 'Anket Gonderildi' },
  SAMPLE_CALCULATED: { icon: CheckCircle2, color: 'text-teal-600', bg: 'bg-teal-100', label: 'Orneklem Hesaplandi' },
};

interface ActivityTimelineProps {
  logs: ActivityLog[];
  loading: boolean;
  open: boolean;
  onClose: () => void;
}

export function ActivityTimeline({ logs, loading, open, onClose }: ActivityTimelineProps) {
  const popoverRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (popoverRef.current && !popoverRef.current.contains(e.target as Node)) {
        onClose();
      }
    };
    if (open) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [open, onClose]);

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          ref={popoverRef}
          initial={{ opacity: 0, y: -8, scale: 0.95 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: -8, scale: 0.95 }}
          transition={{ duration: 0.15 }}
          className="absolute right-12 top-2 w-[360px] bg-white rounded-xl shadow-2xl border border-slate-200 z-[60] overflow-hidden"
        >
          <div className="flex items-center justify-between px-4 py-3 bg-slate-50 border-b border-slate-200">
            <div className="flex items-center gap-2">
              <Clock size={14} className="text-slate-600" />
              <h3 className="text-sm font-bold text-slate-900">Aktivite Gecmisi</h3>
            </div>
            <button
              onClick={onClose}
              className="p-1 hover:bg-slate-200 rounded-md transition-colors"
            >
              <X size={14} className="text-slate-400" />
            </button>
          </div>

          <div className="max-h-[400px] overflow-y-auto p-4">
            {loading ? (
              <div className="flex items-center justify-center py-8">
                <Loader2 className="animate-spin text-blue-600 mr-2" size={16} />
                <span className="text-xs text-slate-500">Yukleniyor...</span>
              </div>
            ) : logs.length === 0 ? (
              <div className="text-center py-8">
                <Clock className="mx-auto text-slate-300 mb-2" size={28} />
                <p className="text-xs text-slate-500">Henuz aktivite kaydi yok</p>
              </div>
            ) : (
              <div className="relative">
                <div className="absolute left-[15px] top-2 bottom-2 w-px bg-slate-200" />

                <div className="space-y-4">
                  {logs.map((log, i) => {
                    const config = ACTION_CONFIG[log.action_type] || ACTION_CONFIG.STATUS_CHANGE;
                    const Icon = config.icon;
                    const timeStr = new Date(log.created_at).toLocaleString('tr-TR', {
                      day: '2-digit', month: '2-digit',
                      hour: '2-digit', minute: '2-digit',
                    });

                    return (
                      <motion.div
                        key={log.id}
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: i * 0.03 }}
                        className="flex items-start gap-3 relative"
                      >
                        <div className={clsx(
                          'shrink-0 w-[30px] h-[30px] rounded-full flex items-center justify-center z-10 border-2 border-white shadow-sm',
                          config.bg
                        )}>
                          <Icon size={12} className={config.color} />
                        </div>
                        <div className="flex-1 min-w-0 pt-0.5">
                          <div className="flex items-center gap-1.5 mb-0.5">
                            <span className="text-xs font-bold text-slate-800">{log.user_name}</span>
                            <span className={clsx(
                              'text-[9px] font-bold px-1.5 py-0.5 rounded-full',
                              config.bg, config.color
                            )}>
                              {config.label}
                            </span>
                          </div>
                          <p className="text-xs text-slate-600 leading-relaxed">{log.details}</p>
                          <p className="text-[10px] text-slate-400 mt-0.5">{timeStr}</p>
                        </div>
                      </motion.div>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
