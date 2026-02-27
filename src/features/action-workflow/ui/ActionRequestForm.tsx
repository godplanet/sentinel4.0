import { useState } from 'react';
import { motion } from 'framer-motion';
import {
  Send, AlertTriangle, Calendar, FileText, Loader2, CheckCircle2,
} from 'lucide-react';
import clsx from 'clsx';
import { toast } from 'react-hot-toast';
import { submitRequest } from '@/entities/action/api/action-api';
import type { ActionAgingMetrics, ActionRequestType } from '@/entities/action/model/types';

interface Props {
  action: ActionAgingMetrics;
  onSuccess?: () => void;
}

export function ActionRequestForm({ action, onSuccess }: Props) {
  const isBddk = action.is_bddk_breach;

  const [requestType, setRequestType] = useState<ActionRequestType>(
    isBddk ? 'board_exception' : 'extension',
  );
  const [justification, setJustification] = useState('');
  const [requestedDate, setRequestedDate] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!justification.trim()) {
      toast.error('Gerekçe zorunludur.');
      return;
    }
    if (requestType === 'extension' && !requestedDate) {
      toast.error('Uzatma talebi için yeni tarih seçmelisiniz.');
      return;
    }

    setSubmitting(true);
    try {
      await submitRequest({
        action_id:      action.id,
        type:           requestType,
        justification:  justification.trim(),
        requested_date: requestedDate || undefined,
      });
      setSubmitted(true);
      toast.success('Talep başarıyla iletildi.');
      onSuccess?.();
    } catch (err) {
      console.error(err);
      toast.error('Talep gönderilemedi. Lütfen tekrar deneyin.');
    } finally {
      setSubmitting(false);
    }
  };

  if (submitted) {
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="flex flex-col items-center gap-3 py-10 px-6 bg-emerald-50 border border-emerald-200 rounded-xl text-center"
      >
        <CheckCircle2 size={40} className="text-emerald-500" />
        <div>
          <p className="font-bold text-emerald-800 text-sm">Talep İletildi</p>
          <p className="text-xs text-emerald-600 mt-0.5">
            Denetçi tarafından incelendikten sonra size bildirim gönderilecektir.
          </p>
        </div>
      </motion.div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      {isBddk && (
        <motion.div
          initial={{ opacity: 0, x: -4 }}
          animate={{ opacity: 1, x: 0 }}
          className="bg-[#700000]/10 border-l-4 border-[#700000] p-4 rounded-r-xl"
        >
          <div className="flex items-start gap-3">
            <AlertTriangle
              size={18}
              className="text-[#700000] shrink-0 mt-0.5 animate-pulse"
            />
            <div>
              <p className="text-sm font-black text-[#700000] mb-1">
                BDDK KIRMIZI ÇİZGİ PROTOKOLÜ
              </p>
              <p className="text-xs text-[#700000]/90 leading-relaxed">
                Bu aksiyon son tarihten <strong>{action.performance_delay_days} gün</strong> gecikmeli
                ve BDDK kapsamındadır. Yasal mevzuat gereği standart süre uzatımı{' '}
                <strong>yasaklıdır</strong>. Yalnızca <strong>Yönetim Kurulu İstisnası</strong> talep
                edebilirsiniz.
              </p>
            </div>
          </div>
        </motion.div>
      )}

      {!isBddk && (
        <div>
          <label className="block text-xs font-bold text-slate-600 uppercase tracking-wider mb-2">
            Talep Türü
          </label>
          <div className="flex gap-2">
            {(
              [
                { value: 'extension', label: 'Süre Uzatımı' },
                { value: 'risk_acceptance', label: 'Risk Kabulü' },
                { value: 'board_exception', label: 'Yönetim Kurulu İstisnası' },
              ] as { value: ActionRequestType; label: string }[]
            ).map(({ value, label }) => (
              <button
                key={value}
                type="button"
                onClick={() => setRequestType(value)}
                className={clsx(
                  'flex-1 py-2 px-3 rounded-lg text-xs font-bold border transition-all',
                  requestType === value
                    ? 'bg-blue-600 text-white border-blue-600'
                    : 'bg-white text-slate-600 border-slate-200 hover:border-blue-400',
                )}
              >
                {label}
              </button>
            ))}
          </div>
        </div>
      )}

      {requestType === 'extension' && !isBddk && (
        <div>
          <label className="block text-xs font-bold text-slate-600 uppercase tracking-wider mb-2">
            Talep Edilen Yeni Tarih
          </label>
          <div className="flex items-center gap-2 px-4 py-2.5 bg-white border border-slate-200 rounded-xl focus-within:border-blue-500 focus-within:ring-1 focus-within:ring-blue-500 transition-all">
            <Calendar size={15} className="text-slate-400 shrink-0" />
            <input
              type="date"
              required
              value={requestedDate}
              onChange={(e) => setRequestedDate(e.target.value)}
              min={new Date().toISOString().split('T')[0]}
              className="bg-transparent border-none outline-none text-sm text-slate-800 w-full"
            />
          </div>
        </div>
      )}

      {isBddk && (
        <div>
          <label className="block text-xs font-bold text-slate-600 uppercase tracking-wider mb-2">
            Talep Türü
          </label>
          <div className="flex items-center gap-2 px-4 py-3 bg-[#700000]/5 border border-[#700000]/30 rounded-xl">
            <FileText size={15} className="text-[#700000] shrink-0" />
            <span className="text-sm font-bold text-[#700000]">Yönetim Kurulu İstisnası</span>
            <span className="ml-auto text-[10px] bg-[#700000] text-white px-2 py-0.5 rounded font-bold">
              Zorunlu
            </span>
          </div>
        </div>
      )}

      <div>
        <label className="block text-xs font-bold text-slate-600 uppercase tracking-wider mb-2">
          Gerekçe <span className="text-rose-500">*</span>
        </label>
        <textarea
          required
          rows={4}
          value={justification}
          onChange={(e) => setJustification(e.target.value)}
          placeholder={
            isBddk
              ? 'Yönetim Kurulu İstisnası için detaylı yasal ve operasyonel gerekçenizi açıklayın...'
              : 'Talebinizin gerekçesini açıklayın...'
          }
          className="w-full px-4 py-3 bg-white border border-slate-200 rounded-xl text-sm text-slate-800 placeholder:text-slate-400 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all resize-none"
        />
      </div>

      <button
        type="submit"
        disabled={submitting}
        className={clsx(
          'w-full py-3 rounded-xl font-bold text-sm flex items-center justify-center gap-2 transition-all',
          isBddk
            ? 'bg-[#700000] hover:bg-[#500000] text-white shadow-sm'
            : 'bg-blue-600 hover:bg-blue-700 text-white shadow-sm',
          submitting && 'opacity-60 cursor-not-allowed',
        )}
      >
        {submitting ? (
          <Loader2 size={16} className="animate-spin" />
        ) : (
          <Send size={16} />
        )}
        {isBddk ? 'Yönetim Kuruluna İlet' : 'Talebi Gönder'}
      </button>
    </form>
  );
}
