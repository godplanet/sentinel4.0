/**
 * Iron Vault Report Sealer — WORM Mühürleme Bileşeni
 *
 * Browser'ın native crypto.subtle API'si üzerinden gerçek SHA-256 üretir.
 * Simülasyon, sahte hash veya setTimeout gecikmeleri KESİNLİKLE YASAKTIR.
 *
 * DB Gereksinimleri (reports tablosu):
 *   hash_seal TEXT, published_at TIMESTAMPTZ, status CHECK(...'PUBLISHED'...)
 */

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ShieldCheck, Lock, Loader2, AlertTriangle,
  CheckCircle2, Hash, ChevronDown, ChevronUp, FileX2,
} from 'lucide-react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  fetchReportsAwaitingPublish,
  fetchReportForSealing,
  sealReport,
  verifyReportSeal,
} from '@/features/reporting/api/seal-api';
import { usePersonaStore } from '@/entities/user/model/persona-store';

interface ReportSealerProps {
  /** Belirli bir raporu doğrudan mühürlemek için opsiyonel ID. */
  preselectedReportId?: string;
}

export const ReportSealerSimulator: React.FC<ReportSealerProps> = ({
  preselectedReportId,
}) => {
  const queryClient = useQueryClient();
  const currentPersona = usePersonaStore((s) => s.currentPersona);
  const isCae = currentPersona === 'CAE';

  const [selectedId, setSelectedId] = useState<string | null>(
    preselectedReportId ?? null,
  );
  const [showDropdown, setShowDropdown] = useState(false);
  const [sealResult, setSealResult] = useState<{ hash: string; verifiedAt: string } | null>(null);
  const [sealError, setSealError] = useState<string | null>(null);
  const [integrityOk, setIntegrityOk] = useState<boolean | null>(null);

  const { data: pendingReports = [], isLoading: loadingList } = useQuery({
    queryKey: ['reports-awaiting-publish'],
    queryFn: fetchReportsAwaitingPublish,
    staleTime: 30_000,
    enabled: !preselectedReportId,
  });

  const { data: selectedReport, isLoading: loadingReport } = useQuery({
    queryKey: ['report-for-seal', selectedId],
    queryFn: () => fetchReportForSealing(selectedId!),
    enabled: !!selectedId,
    staleTime: 0,
  });

  const sealMutation = useMutation({
    mutationFn: async () => {
      if (!selectedReport) throw new Error('Rapor bulunamadı.');
      return sealReport(selectedReport);
    },
    onSuccess: async (hash) => {
      const now = new Date().toLocaleString('tr-TR', {
        day: '2-digit', month: 'long', year: 'numeric',
        hour: '2-digit', minute: '2-digit',
      });
      setSealResult({ hash, verifiedAt: now });
      setSealError(null);

      // Yayınlanan raporu yeniden çek ve bütünlüğünü doğrula
      await queryClient.invalidateQueries({ queryKey: ['report-for-seal', selectedId] });
      await queryClient.invalidateQueries({ queryKey: ['reports-awaiting-publish'] });
      await queryClient.invalidateQueries({ queryKey: ['reports'] });

      const freshReport = await fetchReportForSealing(selectedId!);
      if (freshReport) {
        const ok = await verifyReportSeal(freshReport);
        setIntegrityOk(ok);
      }
    },
    onError: (err: Error) => {
      setSealError(err.message ?? 'Bilinmeyen hata.');
    },
  });

  const isPublished = selectedReport?.status === 'PUBLISHED' || !!sealResult;
  const alreadySealed = selectedReport?.status === 'PUBLISHED' && !!selectedReport.hash_seal;

  return (
    <div className="bg-surface/70 backdrop-blur-md border border-slate-200 shadow-sm rounded-2xl overflow-hidden">
      {/* Başlık */}
      <div className="px-6 pt-6 pb-4 border-b border-slate-100">
        <div className="flex items-start gap-3">
          <div className="w-10 h-10 rounded-xl bg-emerald-50 border border-emerald-200 flex items-center justify-center flex-shrink-0">
            <Lock size={18} className="text-emerald-700" />
          </div>
          <div>
            <h3 className="font-serif text-primary text-lg leading-snug">
              Iron Vault — WORM Rapor Mühürleyici
            </h3>
            <p className="text-xs text-slate-500 mt-0.5 font-sans">
              SHA-256 kriptografik mühür · Adli ispat zinciri
            </p>
          </div>
        </div>
      </div>

      <div className="p-6 space-y-5">
        {/* CAE Yetki Uyarısı */}
        {!isCae && (
          <div className="flex items-start gap-2.5 p-3 rounded-xl bg-amber-50 border border-amber-200">
            <AlertTriangle size={15} className="text-amber-600 mt-0.5 flex-shrink-0" />
            <p className="text-xs text-amber-800 font-sans">
              WORM mühürleme işlemi yalnızca <strong>Baş Denetçi (CAE)</strong> rolüyle
              gerçekleştirilebilir. Şu an salt-izleme modundasınız.
            </p>
          </div>
        )}

        {/* Rapor Seçici */}
        {!preselectedReportId && (
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-slate-600 uppercase tracking-wide font-sans">
              Mühürlenecek Rapor
            </label>
            {loadingList ? (
              <div className="flex items-center gap-2 text-xs text-slate-400">
                <Loader2 size={12} className="animate-spin" />
                Onay bekleyen raporlar yükleniyor...
              </div>
            ) : pendingReports.length === 0 ? (
              <div className="flex items-center gap-2 text-xs text-slate-400 italic p-3 bg-canvas rounded-lg border border-slate-100">
                <FileX2 size={14} />
                CAE onayına gönderilmiş rapor bulunamadı.
              </div>
            ) : (
              <div className="relative">
                <button
                  onClick={() => setShowDropdown(!showDropdown)}
                  className="w-full flex items-center justify-between px-3 py-2.5 rounded-xl border border-slate-200 bg-canvas/60 text-sm font-sans text-slate-700 hover:border-slate-300 transition-colors"
                >
                  <span className="truncate">
                    {selectedReport?.title ?? 'Rapor seçin...'}
                  </span>
                  {showDropdown ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
                </button>
                <AnimatePresence>
                  {showDropdown && (
                    <motion.div
                      initial={{ opacity: 0, y: -4 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -4 }}
                      className="absolute z-20 top-full mt-1 w-full bg-surface border border-slate-200 rounded-xl shadow-lg overflow-hidden"
                    >
                      {pendingReports.map((r) => (
                        <button
                          key={r.id}
                          onClick={() => {
                            setSelectedId(r.id);
                            setShowDropdown(false);
                            setSealResult(null);
                            setSealError(null);
                            setIntegrityOk(null);
                          }}
                          className="w-full px-3 py-2.5 text-left text-xs font-sans hover:bg-canvas transition-colors text-slate-700 border-b border-slate-100 last:border-0"
                        >
                          {r.title}
                        </button>
                      ))}
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            )}
          </div>
        )}

        {/* Seçili Rapor Bilgisi */}
        {loadingReport && (
          <div className="flex items-center gap-2 text-xs text-slate-400">
            <Loader2 size={12} className="animate-spin" />
            Rapor içeriği yükleniyor...
          </div>
        )}

        {/* Mühürlü Durum — Read-Only WORM */}
        <AnimatePresence>
          {(alreadySealed || sealResult) && (
            <motion.div
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              className="rounded-2xl border border-emerald-300 bg-emerald-50 overflow-hidden"
            >
              <div className="px-5 py-4 flex items-start gap-3">
                <ShieldCheck size={22} className="text-emerald-700 flex-shrink-0 mt-0.5" />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-bold text-emerald-900 font-sans">
                    WORM Mühürü Aktif — Salt Okunur
                  </p>
                  <p className="text-xs text-emerald-700 mt-0.5 font-sans">
                    {sealResult
                      ? `${sealResult.verifiedAt} tarihinde mühürlendi.`
                      : selectedReport?.published_at
                      ? `${new Date(selectedReport.published_at).toLocaleString('tr-TR')} tarihinde mühürlendi.`
                      : 'Mühürleme tarihi bilinmiyor.'}
                    {' '}Bu rapor artık düzenlenemez.
                  </p>
                </div>
              </div>

              {/* SHA-256 Hash Göstergesi */}
              <div className="px-5 py-3 border-t border-emerald-200 bg-emerald-900/5">
                <div className="flex items-start gap-2">
                  <Hash size={13} className="text-emerald-600 mt-0.5 flex-shrink-0" />
                  <div className="min-w-0">
                    <p className="text-[10px] text-emerald-700 font-semibold uppercase tracking-widest mb-1 font-sans">
                      SHA-256 Kriptografik Mühür
                    </p>
                    <p className="text-[11px] font-mono text-emerald-800 break-all leading-relaxed">
                      {sealResult?.hash ?? selectedReport?.hash_seal ?? '—'}
                    </p>
                  </div>
                </div>
              </div>

              {/* Bütünlük Doğrulama */}
              {integrityOk !== null && (
                <div className={`px-5 py-2.5 border-t text-xs font-sans flex items-center gap-2
                  ${integrityOk
                    ? 'border-emerald-200 bg-emerald-100/50 text-emerald-800'
                    : 'border-red-300 bg-red-50 text-red-700'
                  }`}
                >
                  {integrityOk
                    ? <><CheckCircle2 size={12} /> Bütünlük doğrulandı — Adli zincir sağlam.</>
                    : <><AlertTriangle size={12} /> Uyarı: Hash uyuşmazlığı — İçerik mühürleme sonrası değişmiş olabilir!</>
                  }
                </div>
              )}
            </motion.div>
          )}
        </AnimatePresence>

        {/* Hata Mesajı */}
        <AnimatePresence>
          {sealError && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="flex items-start gap-2.5 p-3 rounded-xl bg-red-50 border border-red-200"
            >
              <AlertTriangle size={14} className="text-red-600 mt-0.5 flex-shrink-0" />
              <p className="text-xs text-red-700 font-sans">{sealError}</p>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Mühürleme Butonu */}
        {!isPublished && (
          <button
            onClick={() => sealMutation.mutate()}
            disabled={!selectedId || !selectedReport || sealMutation.isPending || !isCae}
            className="w-full flex items-center justify-center gap-2.5 px-5 py-3 rounded-xl text-sm font-medium font-sans transition-all
              bg-surface/70 backdrop-blur-md border border-emerald-300 text-emerald-800
              hover:bg-emerald-50 hover:border-emerald-400 hover:shadow-md
              disabled:opacity-50 disabled:cursor-not-allowed shadow-sm"
          >
            {sealMutation.isPending ? (
              <>
                <Loader2 size={16} className="animate-spin text-emerald-700" />
                SHA-256 hesaplanıyor &amp; mühürleniyor...
              </>
            ) : (
              <>
                <Lock size={16} className="text-emerald-700" />
                Raporu Yayınla ve WORM Mühürle (CAE)
              </>
            )}
          </button>
        )}

        {/* Yayınlandı - Düzenleme Yasağı Notu */}
        {isPublished && (
          <p className="text-center text-xs text-slate-400 font-sans italic">
            WORM protokolü gereği mühürlü raporlar düzenlenemez, silinemez ve yeniden yayınlanamaz.
          </p>
        )}
      </div>
    </div>
  );
};
