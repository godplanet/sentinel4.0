/**
 * SENTINEL GRC v3.0 — Forensic Evidence Vault: EvidenceUploader
 * ==============================================================
 * GIAS 2025 Standard 14.3 — Soruşturma Kanıt Yönetimi
 *
 * Bu bileşen:
 *   1. Drag-and-drop dosya yükleme alanı
 *   2. SHA-256 hash otomatik hesaplanır
 *   3. Supabase Storage'a yükler + digital_evidence tablosuna yazar
 *   4. Yüklenen kanıtlar "DEĞİŞTİRİLEMEZ (IMMUTABLE)" altın rozetiyle gösterilir
 *
 * Tasarım: Koyu/adli tema, glassmorphism, C-Level
 */

import { useState, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Upload, Lock, Shield, FileText, File, CheckCircle2,
  AlertTriangle, Loader2, Hash, Clock, Trash2
} from 'lucide-react';
import clsx from 'clsx';
import { useCaseEvidence, useUploadEvidence } from '@/entities/investigation/api/evidence-api';
import type { DigitalEvidence, EvidenceType } from '@/entities/investigation/api/evidence-api';

// ─── Yardımcı: Dosya boyutu formatı ──────────────────────────────────────────

function formatBytes(bytes: number | null | undefined): string {
  const b = bytes ?? 0;
  if (b < 1024) return `${b} B`;
  if (b < 1024 * 1024) return `${(b / 1024).toFixed(1)} KB`;
  return `${(b / (1024 * 1024)).toFixed(1)} MB`;
}

function inferEvidenceType(file: File): EvidenceType {
  const mime = file?.type ?? '';
  const name = (file?.name ?? '').toLowerCase();
  if (mime.includes('image') || name.endsWith('.png') || name.endsWith('.jpg')) return 'SCREENSHOT';
  if (name.endsWith('.eml') || name.endsWith('.msg')) return 'EMAIL';
  if (name.endsWith('.log') || name.endsWith('.txt')) return 'LOG';
  if (name.endsWith('.pdf') || name.endsWith('.xlsx') || name.endsWith('.csv')) return 'INVOICE';
  return 'FILE';
}

// ─── Kanıt Satırı ─────────────────────────────────────────────────────────────

interface EvidenceRowProps {
  evidence: DigitalEvidence;
}

function EvidenceRow({ evidence }: EvidenceRowProps) {
  const snapshot = evidence?.content_snapshot ?? {};
  const fileName = (snapshot?.file_name as string) ?? evidence?.source_system ?? 'Bilinmeyen Dosya';
  const fileSize = (snapshot?.file_size as number) ?? null;
  const mimeType = (snapshot?.mime_type as string) ?? '';
  const publicUrl = (snapshot?.public_url as string) ?? null;

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      className="flex items-center gap-3 p-3 rounded-xl group"
      style={{
        background: 'rgba(255,255,255,0.03)',
        border: '1px solid rgba(255,255,255,0.06)',
      }}
    >
      {/* Dosya ikonu */}
      <div
        className="w-9 h-9 rounded-lg flex items-center justify-center flex-shrink-0"
        style={{ background: evidence?.locked ? 'rgba(146,64,14,0.2)' : 'rgba(71,85,105,0.3)' }}
      >
        <File size={16} className={evidence?.locked ? 'text-amber-400' : 'text-slate-400'} />
      </div>

      {/* Dosya bilgileri */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <p className="text-xs font-bold text-slate-200 truncate">{fileName}</p>

          {/* IMMUTABLE Rozeti */}
          {evidence?.locked && (
            <span
              className="flex-shrink-0 flex items-center gap-1 px-1.5 py-0.5 rounded text-[9px] font-black tracking-widest uppercase"
              style={{
                background: 'linear-gradient(90deg, rgba(180,83,9,0.3), rgba(146,64,14,0.4))',
                border: '1px solid rgba(251,191,36,0.25)',
                color: '#fbbf24',
                boxShadow: '0 0 8px rgba(251,191,36,0.1)',
              }}
            >
              <Lock size={7} />
              İMMÜTABLE
            </span>
          )}
        </div>
        <div className="flex items-center gap-3 mt-0.5">
          <span className="text-[10px] text-slate-500 flex items-center gap-1">
            <Hash size={8} />
            <span className="font-mono">{(evidence?.hash_sha256 ?? '').slice(0, 16)}…</span>
          </span>
          {fileSize && (
            <span className="text-[10px] text-slate-600">{formatBytes(fileSize)}</span>
          )}
          <span className="text-[10px] text-slate-600 flex items-center gap-1">
            <Clock size={8} />
            {evidence?.created_at
              ? new Date(evidence.created_at).toLocaleDateString('tr-TR')
              : '—'}
          </span>
          {mimeType && (
            <span className="text-[10px] text-slate-600 font-mono">{mimeType.replace('application/', '')}</span>
          )}
        </div>
      </div>

      {/* İndirme linki */}
      {publicUrl && (
        <a
          href={publicUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="flex-shrink-0 p-1.5 rounded-lg text-slate-600 hover:text-amber-400 hover:bg-white/5 transition-colors opacity-0 group-hover:opacity-100"
          title="Kanıtı görüntüle"
        >
          <FileText size={13} />
        </a>
      )}

      {/* Kilitleniş ikonu */}
      <Shield
        size={13}
        className={clsx(
          'flex-shrink-0',
          evidence?.locked ? 'text-amber-500' : 'text-slate-700'
        )}
      />
    </motion.div>
  );
}

// ─── Ana Bileşen ───────────────────────────────────────────────────────────────

interface EvidenceUploaderProps {
  caseId: string;
  uploadedBy?: string;
}

export function EvidenceUploader({ caseId, uploadedBy = '' }: EvidenceUploaderProps) {
  const [isDragging, setIsDragging] = useState(false);
  const [pendingFiles, setPendingFiles] = useState<File[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const {
    data: evidenceList = [],
    isLoading,
    isError,
    error,
    refetch,
  } = useCaseEvidence(caseId);

  const { mutate: upload, isPending: isUploading } = useUploadEvidence(caseId);

  const handleDrop = useCallback(
    (e: React.DragEvent<HTMLDivElement>) => {
      e.preventDefault();
      setIsDragging(false);
      const files = Array.from(e.dataTransfer?.files ?? []);
      if (files.length) setPendingFiles((prev) => [...prev, ...files]);
    },
    []
  );

  const handleFileChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const files = Array.from(e.target?.files ?? []);
      if (files.length) setPendingFiles((prev) => [...prev, ...files]);
      if (e.target) e.target.value = '';
    },
    []
  );

  const handleUploadAll = async () => {
    if (!(pendingFiles || []).length || isUploading) return;

    for (const file of (pendingFiles || [])) {
      await new Promise<void>((resolve) => {
        upload(
          {
            case_id: caseId,
            file,
            evidence_type: inferEvidenceType(file),
            source_system: 'manual-upload',
            uploaded_by: uploadedBy,
          },
          { onSettled: () => resolve() }
        );
      });
    }
    setPendingFiles([]);
  };

  return (
    <div className="flex flex-col gap-4">
      {/* ─── Yükleme Alanı ──────────────────────────────────────────────────── */}
      <div
        onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
        onDragLeave={() => setIsDragging(false)}
        onDrop={handleDrop}
        onClick={() => fileInputRef.current?.click()}
        className={clsx(
          'relative rounded-xl border-2 border-dashed cursor-pointer transition-all p-6 text-center',
          isDragging
            ? 'border-amber-500/60 bg-amber-500/5'
            : 'border-slate-700 hover:border-slate-500 hover:bg-white/2'
        )}
        style={{ minHeight: '120px' }}
      >
        <input
          ref={fileInputRef}
          type="file"
          multiple
          className="hidden"
          onChange={handleFileChange}
        />
        <motion.div
          animate={{ scale: isDragging ? 1.05 : 1 }}
          className="flex flex-col items-center gap-2"
        >
          <div
            className="w-10 h-10 rounded-xl flex items-center justify-center"
            style={{
              background: isDragging ? 'rgba(251,191,36,0.15)' : 'rgba(71,85,105,0.3)',
            }}
          >
            <Upload size={20} className={isDragging ? 'text-amber-400' : 'text-slate-500'} />
          </div>
          <div>
            <p className="text-xs font-bold text-slate-300">
              {isDragging ? 'Bırakın — Adli Kasaya yükleniyor...' : 'Dosyaları sürükleyin veya tıklayın'}
            </p>
            <p className="text-[10px] text-slate-600 mt-0.5">
              SHA-256 hash otomatik hesaplanır · Yükleme anında kilitlenir
            </p>
          </div>
        </motion.div>
      </div>

      {/* ─── Bekleyen Dosyalar ───────────────────────────────────────────────── */}
      <AnimatePresence>
        {(pendingFiles || []).length > 0 && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="rounded-xl overflow-hidden"
            style={{ border: '1px solid rgba(251,191,36,0.2)', background: 'rgba(251,191,36,0.04)' }}
          >
            <div className="px-4 py-3 border-b border-amber-500/10 flex items-center justify-between">
              <span className="text-xs font-bold text-amber-300">
                {(pendingFiles || []).length} dosya yüklenmeyi bekliyor
              </span>
              <button
                onClick={() => setPendingFiles([])}
                className="text-slate-600 hover:text-slate-400 transition-colors"
              >
                <Trash2 size={12} />
              </button>
            </div>
            <div className="p-3 space-y-1.5">
              {(pendingFiles || []).map((f, i) => (
                <div key={i} className="flex items-center gap-2 text-xs text-slate-400">
                  <File size={11} className="text-slate-600" />
                  <span className="truncate">{f?.name ?? '—'}</span>
                  <span className="ml-auto text-slate-600">{formatBytes(f?.size ?? 0)}</span>
                </div>
              ))}
            </div>
            <div className="px-4 pb-3">
              <button
                disabled={isUploading}
                onClick={handleUploadAll}
                className={clsx(
                  'w-full py-2.5 rounded-lg text-xs font-black flex items-center justify-center gap-2 transition-all',
                  isUploading
                    ? 'bg-slate-800 text-slate-600 cursor-not-allowed'
                    : 'bg-amber-500 hover:bg-amber-400 text-slate-900 shadow-lg shadow-amber-500/20'
                )}
              >
                {isUploading ? (
                  <>
                    <Loader2 size={13} className="animate-spin" />
                    Adli Kasaya Yükleniyor...
                  </>
                ) : (
                  <>
                    <Shield size={13} />
                    Hepsini Adli Kasaya Yükle ve Mühürle
                  </>
                )}
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ─── Mevcut Kanıtlar ─────────────────────────────────────────────────── */}
      <div>
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2">
            <Lock size={12} className="text-amber-500" />
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">
              Adli Kasa — {(evidenceList || []).length} Kanıt
            </span>
          </div>
          {(evidenceList || []).filter((e) => e?.locked).length > 0 && (
            <span
              className="text-[9px] font-black uppercase tracking-widest px-2 py-0.5 rounded"
              style={{
                background: 'linear-gradient(90deg, rgba(180,83,9,0.3), rgba(146,64,14,0.4))',
                border: '1px solid rgba(251,191,36,0.2)',
                color: '#fbbf24',
              }}
            >
              {(evidenceList || []).filter((e) => e?.locked).length} İmmütable
            </span>
          )}
        </div>

        {isLoading && (
          <div className="flex items-center justify-center py-8">
            <Loader2 size={22} className="animate-spin text-slate-600" />
          </div>
        )}

        {isError && (
          <div
            className="rounded-xl p-4 flex items-start gap-3"
            style={{ background: 'rgba(127,29,29,0.2)', border: '1px solid rgba(153,27,27,0.3)' }}
          >
            <AlertTriangle size={16} className="text-red-400 flex-shrink-0 mt-0.5" />
            <div>
              <p className="text-xs font-bold text-red-300">Kanıtlar yüklenemedi</p>
              <p className="text-[10px] text-red-400 mt-0.5">
                {error instanceof Error ? error.message : 'Veritabanı bağlantı hatası'}
              </p>
              <button
                onClick={() => refetch()}
                className="text-[10px] text-red-300 underline mt-1"
              >
                Yeniden dene
              </button>
            </div>
          </div>
        )}

        {!isLoading && !isError && (evidenceList || []).length === 0 && (
          <div className="text-center py-8">
            <CheckCircle2 size={24} className="mx-auto text-slate-700 mb-2" />
            <p className="text-xs text-slate-600">Henüz kanıt yüklenmemiş.</p>
          </div>
        )}

        <div className="space-y-2">
          {(evidenceList || []).map((ev) => (
            <EvidenceRow key={ev?.id ?? Math.random()} evidence={ev} />
          ))}
        </div>
      </div>
    </div>
  );
}
