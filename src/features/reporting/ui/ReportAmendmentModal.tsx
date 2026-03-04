/**
 * GIAS: Hata Bildir ve Düzeltme Yayınla (Zeyilname) Modal
 * Mühürlenmiş (PUBLISHED/LOCKED) raporlarda sonradan tespit edilen hatalar için
 * Revoke & Amend akışı. Tehlike/uyarı temalı (Amber/Red).
 */

import React, { useCallback, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { AlertTriangle, FileWarning, X, Loader2 } from 'lucide-react';
import { useAmendReport } from '../api/amend-api';
import { toast } from 'react-hot-toast';

export interface ReportAmendmentModalProps {
  reportId: string;
  reportTitle?: string;
  onClose: () => void;
  onAmended?: (newReportId: string) => void;
}

export const ReportAmendmentModal: React.FC<ReportAmendmentModalProps> = ({
  reportId,
  reportTitle,
  onClose,
  onAmended,
}) => {
  const navigate = useNavigate();
  const [amendmentNote, setAmendmentNote] = useState('');

  const amendMutation = useAmendReport({
    onSuccess: (newReportId) => {
      toast.success('Düzeltme versiyonu oluşturuldu. Taslak rapora yönlendiriliyorsunuz.');
      onAmended?.(newReportId);
      onClose();
      navigate(`/reporting/zen-editor/${newReportId}`, { replace: true });
    },
    onError: (err) => {
      toast.error(err.message ?? 'Düzeltme işlemi başarısız.');
    },
  });

  const handleSubmit = useCallback(() => {
    const note = amendmentNote.trim();
    if (!note) {
      toast.error('Düzeltme gerekçesi zorunludur.');
      return;
    }
    amendMutation.mutate({ reportId, amendmentNote: note });
  }, [reportId, amendmentNote, amendMutation]);

  const isValid = amendmentNote.trim().length > 0;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 backdrop-blur-sm p-4">
      <div className="w-full max-w-lg rounded-2xl border border-amber-800/60 bg-slate-900 shadow-2xl overflow-hidden">
        <div className="px-6 pt-6 pb-4 border-b border-slate-700/60">
          <div className="flex items-start justify-between gap-4">
            <div className="flex items-start gap-3">
              <div className="w-12 h-12 rounded-xl bg-amber-500/20 border border-amber-500/40 flex items-center justify-center shrink-0">
                <FileWarning className="w-6 h-6 text-amber-400" />
              </div>
              <div>
                <h2 className="text-lg font-semibold text-slate-100">
                  GIAS: Hata Bildir ve Düzeltme Yayınla
                </h2>
                <p className="text-xs text-slate-400 mt-0.5 font-mono">
                  Revoke & Amend · Zeyilname
                </p>
              </div>
            </div>
            <button
              type="button"
              onClick={onClose}
              className="p-2 rounded-lg text-slate-400 hover:text-slate-200 hover:bg-slate-800 transition-colors"
              aria-label="Kapat"
            >
              <X size={18} />
            </button>
          </div>
        </div>

        <div className="p-6 space-y-5">
          <div className="flex items-start gap-3 p-4 rounded-xl bg-amber-950/40 border border-amber-800/50">
            <AlertTriangle className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
            <p className="text-sm text-amber-200 leading-relaxed">
              Uluslararası İç Denetim Standartları (GIAS) gereği, mühürlü bir raporda tespit edilen
              önemli hata ve eksiklikler için bir düzeltme versiyonu (Zeyilname) oluşturulmalıdır.
              Orijinal rapor geçersiz kılınacak; silinmeyecek, arşive alınacaktır.
            </p>
          </div>

          {reportTitle && (
            <div className="rounded-xl border border-slate-700/60 bg-slate-800/50 px-4 py-3">
              <p className="text-xs text-slate-500 uppercase tracking-wider mb-1">Rapor</p>
              <p className="text-sm font-medium text-slate-200 truncate">{reportTitle}</p>
            </div>
          )}

          <div>
            <label htmlFor="amendment-note" className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">
              Düzeltme Gerekçesi (Amendment Note) <span className="text-amber-400">*</span>
            </label>
            <textarea
              id="amendment-note"
              value={amendmentNote}
              onChange={(e) => setAmendmentNote(e.target.value)}
              placeholder="Hata veya eksikliğin kısa açıklaması; neden düzeltme yayımlandığı..."
              rows={4}
              className="w-full rounded-xl border border-slate-600 bg-slate-800/80 text-slate-100 placeholder-slate-500
                       px-4 py-3 text-sm font-sans focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent resize-none"
            />
          </div>

          <div className="flex items-center gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-2.5 rounded-xl border border-slate-600 text-slate-300 hover:bg-slate-800 text-sm font-semibold transition-colors"
            >
              İptal
            </button>
            <button
              type="button"
              onClick={handleSubmit}
              disabled={!isValid || amendMutation.isPending}
              className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl
                         bg-amber-600 hover:bg-amber-500 disabled:opacity-50 disabled:pointer-events-none
                         text-white text-sm font-semibold transition-colors"
            >
              {amendMutation.isPending ? (
                <>
                  <Loader2 size={16} className="animate-spin" />
                  İşleniyor...
                </>
              ) : (
                'Düzeltme Yayınla'
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
