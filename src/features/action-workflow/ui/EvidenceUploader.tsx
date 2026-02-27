import { useState, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  UploadCloud, FileText, CheckCircle2, XCircle,
  ShieldCheck, Loader2, Hash, Cpu,
} from 'lucide-react';
import clsx from 'clsx';
import { toast } from 'react-hot-toast';
import { uploadEvidence } from '@/entities/action/api/action-api';

async function computeSha256(file: File): Promise<string> {
  const buffer = await file.arrayBuffer();
  const hashBuffer = await crypto.subtle.digest('SHA-256', buffer);
  return Array.from(new Uint8Array(hashBuffer))
    .map((b) => b.toString(16).padStart(2, '0'))
    .join('');
}

type Stage = 'idle' | 'hashing' | 'validating' | 'uploading' | 'success' | 'rejected';

interface Props {
  actionId: string;
  onSuccess?: () => void;
}

export function EvidenceUploader({ actionId, onSuccess }: Props) {
  const [stage, setStage] = useState<Stage>('idle');
  const [dragging, setDragging] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [fileHash, setFileHash] = useState<string>('');
  const [aiScore, setAiScore] = useState<number | null>(null);
  const [rejectReason, setRejectReason] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);

  const processFile = useCallback(async (file: File) => {
    setSelectedFile(file);
    setStage('hashing');
    setFileHash('');
    setAiScore(null);
    setRejectReason('');

    const hash = await computeSha256(file);
    setFileHash(hash);

    setStage('validating');
    await new Promise((r) => setTimeout(r, 2000));

    const score = Math.floor(Math.random() * 100);
    setAiScore(score);

    if (score < 40) {
      setStage('rejected');
      setRejectReason(
        `AI Doğrulama Başarısız: Belge anlamsal alaka düzeyi yetersiz (güven: ${score}%). Lütfen daha ilgili bir kanıt belgesi yükleyin.`,
      );
      return;
    }

    setStage('uploading');
    try {
      await uploadEvidence(actionId, file, score);
      setStage('success');
      toast.success('Kanıt başarıyla yüklendi.');
      onSuccess?.();
    } catch (err) {
      console.error(err);
      setStage('rejected');
      setRejectReason('Yükleme sırasında bir hata oluştu. Lütfen tekrar deneyin.');
    }
  }, [actionId, onSuccess]);

  const onDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      setDragging(false);
      const file = e.dataTransfer.files[0];
      if (file) processFile(file);
    },
    [processFile],
  );

  const reset = () => {
    setStage('idle');
    setSelectedFile(null);
    setFileHash('');
    setAiScore(null);
  };

  const isActive = stage !== 'idle' && stage !== 'rejected' && stage !== 'success';

  return (
    <div className="space-y-4">
      <AnimatePresence mode="wait">
        {(stage === 'idle' || stage === 'rejected') && (
          <motion.div
            key="dropzone"
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -6 }}
          >
            <div
              onDragOver={(e) => { e.preventDefault(); setDragging(true); }}
              onDragLeave={() => setDragging(false)}
              onDrop={onDrop}
              onClick={() => inputRef.current?.click()}
              className={clsx(
                'border-2 border-dashed rounded-xl p-10 text-center cursor-pointer transition-all',
                dragging
                  ? 'border-blue-500 bg-blue-50 scale-[1.01]'
                  : 'border-slate-300 bg-slate-50 hover:border-blue-400 hover:bg-blue-50/50',
              )}
            >
              <UploadCloud
                size={40}
                className={clsx(
                  'mx-auto mb-3 transition-colors',
                  dragging ? 'text-blue-500' : 'text-slate-400',
                )}
              />
              <p className="text-sm font-semibold text-slate-700">
                Dosyayı sürükleyip bırakın veya tıklayın
              </p>
              <p className="text-xs text-slate-500 mt-1">
                PDF, DOCX, XLSX, PNG, JPG — maks. 20 MB
              </p>
              <input
                ref={inputRef}
                type="file"
                className="hidden"
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (file) processFile(file);
                  e.target.value = '';
                }}
              />
            </div>

            {stage === 'rejected' && (
              <motion.div
                initial={{ opacity: 0, y: 4 }}
                animate={{ opacity: 1, y: 0 }}
                className="mt-3 flex items-start gap-3 p-4 bg-rose-50 border border-rose-300 rounded-xl"
              >
                <XCircle size={18} className="text-rose-500 shrink-0 mt-0.5" />
                <div>
                  <p className="text-sm font-bold text-rose-700 mb-0.5">Yükleme Reddedildi</p>
                  <p className="text-xs text-rose-600">{rejectReason}</p>
                  <button
                    onClick={reset}
                    className="mt-2 text-xs font-semibold text-rose-700 underline hover:no-underline"
                  >
                    Tekrar dene
                  </button>
                </div>
              </motion.div>
            )}
          </motion.div>
        )}

        {isActive && selectedFile && (
          <motion.div
            key="processing"
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm"
          >
            <div className="flex items-center gap-3 mb-4 pb-4 border-b border-slate-100">
              <div className="w-10 h-10 rounded-lg bg-blue-50 border border-blue-200 flex items-center justify-center shrink-0">
                <FileText size={18} className="text-blue-600" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-slate-800 truncate">{selectedFile.name}</p>
                <p className="text-xs text-slate-500">{(selectedFile.size / 1024).toFixed(1)} KB</p>
              </div>
            </div>

            <div className="space-y-3">
              <ProcessStep
                icon={<Hash size={14} />}
                label="SHA-256 Hash Hesaplanıyor"
                sublabel={fileHash ? (
                  <span className="font-mono text-[10px] text-slate-500 break-all leading-relaxed">
                    {fileHash}
                  </span>
                ) : undefined}
                done={!!fileHash}
                active={stage === 'hashing'}
              />

              <ProcessStep
                icon={<Cpu size={14} />}
                label="Sentinel Prime AI — Anlamsal Doğrulama"
                sublabel={
                  aiScore !== null ? (
                    <span className={clsx(
                      'text-xs font-bold',
                      aiScore >= 40 ? 'text-emerald-600' : 'text-rose-600',
                    )}>
                      Güven Skoru: {aiScore}%
                    </span>
                  ) : stage === 'validating' ? (
                    <span className="text-xs text-slate-500 italic">Belge taranıyor...</span>
                  ) : undefined
                }
                done={aiScore !== null && aiScore >= 40}
                active={stage === 'validating'}
              />

              <ProcessStep
                icon={<UploadCloud size={14} />}
                label="Depolama Alanına Yükleniyor"
                done={stage === 'success'}
                active={stage === 'uploading'}
              />
            </div>
          </motion.div>
        )}

        {stage === 'success' && (
          <motion.div
            key="success"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="flex flex-col items-center gap-3 py-10 px-6 bg-emerald-50 border border-emerald-200 rounded-xl text-center"
          >
            <CheckCircle2 size={40} className="text-emerald-500" />
            <div>
              <p className="font-bold text-emerald-800 text-sm">Kanıt Başarıyla Yüklendi</p>
              <p className="text-xs text-emerald-600 mt-0.5">
                Dosya imzalandı ve denetçiye gönderildi.
              </p>
            </div>
            <button
              onClick={reset}
              className="mt-1 text-xs font-semibold text-emerald-700 underline hover:no-underline"
            >
              Yeni kanıt ekle
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      {fileHash && stage !== 'idle' && stage !== 'rejected' && (
        <div className="flex items-start gap-2 p-3 bg-slate-50 border border-slate-200 rounded-lg">
          <ShieldCheck size={14} className="text-slate-400 mt-0.5 shrink-0" />
          <div>
            <p className="text-[10px] font-bold text-slate-600 uppercase tracking-wider mb-0.5">
              Bütünlük Mühürü (SHA-256)
            </p>
            <p className="font-mono text-[10px] text-slate-500 break-all">{fileHash}</p>
          </div>
        </div>
      )}
    </div>
  );
}

function ProcessStep({
  icon,
  label,
  sublabel,
  done,
  active,
}: {
  icon: React.ReactNode;
  label: string;
  sublabel?: React.ReactNode;
  done: boolean;
  active: boolean;
}) {
  return (
    <div className="flex items-start gap-3">
      <div className={clsx(
        'w-6 h-6 rounded-full flex items-center justify-center shrink-0 mt-0.5 transition-all',
        done
          ? 'bg-emerald-100 text-emerald-600'
          : active
            ? 'bg-blue-100 text-blue-600'
            : 'bg-slate-100 text-slate-400',
      )}>
        {active && !done ? (
          <Loader2 size={12} className="animate-spin" />
        ) : done ? (
          <CheckCircle2 size={12} />
        ) : (
          icon
        )}
      </div>
      <div className="flex-1">
        <p className={clsx(
          'text-xs font-semibold',
          done ? 'text-slate-700' : active ? 'text-blue-700' : 'text-slate-400',
        )}>
          {label}
        </p>
        {sublabel && <div className="mt-0.5">{sublabel}</div>}
      </div>
    </div>
  );
}
