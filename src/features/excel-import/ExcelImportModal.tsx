import { useState, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Upload, X, FileSpreadsheet, CheckCircle2, AlertTriangle,
  Download, ArrowRight, Trash2, Eye
} from 'lucide-react';
import { parseCSVFile, generateRKMTemplate } from '@/shared/lib/excel-utils';
import clsx from 'clsx';

type ImportTarget = 'RISK' | 'FINDING' | 'ACTION' | 'ENTITY';

interface ExcelImportModalProps {
  isOpen: boolean;
  onClose: () => void;
  onImport: (data: any[], target: ImportTarget) => Promise<void>;
  defaultTarget?: ImportTarget;
}

const TARGET_CONFIG = {
  RISK: { label: 'Risk Kaydi', color: 'bg-blue-100 text-blue-700' },
  FINDING: { label: 'Bulgu', color: 'bg-orange-100 text-orange-700' },
  ACTION: { label: 'Aksiyon', color: 'bg-green-100 text-green-700' },
  ENTITY: { label: 'Varlik', color: 'bg-teal-100 text-teal-700' },
} as const;

type Step = 'upload' | 'preview' | 'mapping' | 'import';

export function ExcelImportModal({
  isOpen,
  onClose,
  onImport,
  defaultTarget = 'RISK',
}: ExcelImportModalProps) {
  const [step, setStep] = useState<Step>('upload');
  const [target, setTarget] = useState<ImportTarget>(defaultTarget);
  const [file, setFile] = useState<File | null>(null);
  const [parsedData, setParsedData] = useState<any[]>([]);
  const [errors, setErrors] = useState<string[]>([]);
  const [importing, setImporting] = useState(false);
  const [importResult, setImportResult] = useState<{ success: number; failed: number } | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = useCallback(async (selectedFile: File) => {
    setFile(selectedFile);
    setErrors([]);

    try {
      const data = await parseCSVFile(selectedFile);
      setParsedData(data);

      const validationErrors: string[] = [];
      if (data.length === 0) validationErrors.push('Dosyada veri satiri bulunamadi.');
      if (data.length > 5000) validationErrors.push('Maksimum 5000 satir yuklenebilir.');

      setErrors(validationErrors);
      if (validationErrors.length === 0) setStep('preview');
    } catch (err: any) {
      setErrors([err.message || 'Dosya okunamadi']);
    }
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    const droppedFile = e.dataTransfer.files[0];
    if (droppedFile && (droppedFile.name.endsWith('.csv') || droppedFile.name.endsWith('.xlsx'))) {
      handleFileSelect(droppedFile);
    } else {
      setErrors(['Sadece CSV veya XLSX dosyalari yuklenebilir.']);
    }
  }, [handleFileSelect]);

  const handleImport = async () => {
    try {
      setImporting(true);
      setStep('import');
      await onImport(parsedData, target);
      setImportResult({ success: parsedData.length, failed: 0 });
    } catch (err) {
      setImportResult({ success: 0, failed: parsedData.length });
    } finally {
      setImporting(false);
    }
  };

  const handleReset = () => {
    setStep('upload');
    setFile(null);
    setParsedData([]);
    setErrors([]);
    setImportResult(null);
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
        onClick={onClose}
      >
        <motion.div
          initial={{ scale: 0.95, y: 20 }}
          animate={{ scale: 1, y: 0 }}
          exit={{ scale: 0.95, y: 20 }}
          className="bg-white rounded-2xl shadow-2xl w-full max-w-3xl max-h-[85vh] flex flex-col"
          onClick={e => e.stopPropagation()}
        >
          <div className="bg-gradient-to-r from-emerald-600 to-emerald-700 px-6 py-4 rounded-t-2xl flex items-center justify-between">
            <div className="flex items-center gap-3">
              <FileSpreadsheet size={22} className="text-white" />
              <div>
                <h2 className="text-lg font-bold text-white">Excel / CSV Veri Aktarimi</h2>
                <p className="text-xs text-emerald-200">Toplu veri yukleme sihirbazi</p>
              </div>
            </div>
            <button onClick={onClose} className="w-8 h-8 bg-white/20 rounded-lg flex items-center justify-center hover:bg-white/30">
              <X size={16} className="text-white" />
            </button>
          </div>

          <div className="flex items-center gap-2 px-6 py-3 bg-slate-50 border-b border-slate-200">
            {(['upload', 'preview', 'import'] as Step[]).map((s, i) => (
              <div key={s} className="flex items-center gap-2">
                <div className={clsx(
                  'w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold',
                  step === s ? 'bg-emerald-600 text-white' :
                  (['upload', 'preview', 'import'].indexOf(step) > i) ? 'bg-green-500 text-white' :
                  'bg-slate-200 text-slate-500'
                )}>
                  {['upload', 'preview', 'import'].indexOf(step) > i ? <CheckCircle2 size={14} /> : i + 1}
                </div>
                <span className={clsx('text-xs font-semibold', step === s ? 'text-emerald-700' : 'text-slate-500')}>
                  {s === 'upload' ? 'Dosya Sec' : s === 'preview' ? 'Onizleme' : 'Aktarim'}
                </span>
                {i < 2 && <ArrowRight size={14} className="text-slate-300 mx-1" />}
              </div>
            ))}
          </div>

          <div className="flex-1 overflow-auto p-6">
            {step === 'upload' && (
              <div className="space-y-6">
                <div className="flex items-center gap-3">
                  <span className="text-sm font-semibold text-slate-700">Hedef Modul:</span>
                  <div className="flex gap-2">
                    {(Object.keys(TARGET_CONFIG) as ImportTarget[]).map(t => (
                      <button
                        key={t}
                        onClick={() => setTarget(t)}
                        className={clsx(
                          'px-3 py-1.5 text-xs font-bold rounded-lg border-2 transition-all',
                          target === t ? 'border-emerald-500 bg-emerald-50' : 'border-slate-200'
                        )}
                      >
                        {TARGET_CONFIG[t].label}
                      </button>
                    ))}
                  </div>
                </div>

                <div
                  onDragOver={e => e.preventDefault()}
                  onDrop={handleDrop}
                  className="border-2 border-dashed border-slate-300 rounded-xl p-12 text-center hover:border-emerald-400 hover:bg-emerald-50/50 transition-colors cursor-pointer"
                  onClick={() => fileRef.current?.click()}
                >
                  <Upload className="mx-auto text-slate-400 mb-4" size={48} />
                  <p className="text-sm font-semibold text-slate-700">CSV veya Excel dosyasini surukleyin</p>
                  <p className="text-xs text-slate-500 mt-1">veya dosya secmek icin tiklayin</p>
                  <input
                    ref={fileRef}
                    type="file"
                    accept=".csv,.xlsx"
                    className="hidden"
                    onChange={e => e.target.files?.[0] && handleFileSelect(e.target.files[0])}
                  />
                </div>

                <button
                  onClick={() => generateRKMTemplate()}
                  className="flex items-center gap-2 text-sm text-emerald-700 hover:text-emerald-800 font-semibold"
                >
                  <Download size={14} />
                  Ornek CSV Sablonu Indir
                </button>

                {errors.length > 0 && (
                  <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                    {errors.map((e, i) => (
                      <p key={i} className="text-sm text-red-700 flex items-center gap-2">
                        <AlertTriangle size={14} /> {e}
                      </p>
                    ))}
                  </div>
                )}
              </div>
            )}

            {step === 'preview' && (
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-semibold text-slate-800">{file?.name}</p>
                    <p className="text-xs text-slate-500">{parsedData.length} satir okundu</p>
                  </div>
                  <button onClick={handleReset} className="flex items-center gap-1 text-xs text-red-600 hover:text-red-700 font-semibold">
                    <Trash2 size={12} /> Degistir
                  </button>
                </div>

                <div className="overflow-x-auto border border-slate-200 rounded-lg">
                  <table className="w-full text-xs">
                    <thead className="bg-slate-50">
                      <tr>
                        <th className="px-3 py-2 text-left font-semibold text-slate-500">#</th>
                        {parsedData.length > 0 && Object.keys(parsedData[0]).slice(0, 8).map(key => (
                          <th key={key} className="px-3 py-2 text-left font-semibold text-slate-500 whitespace-nowrap">{key}</th>
                        ))}
                        {parsedData.length > 0 && Object.keys(parsedData[0]).length > 8 && (
                          <th className="px-3 py-2 text-left font-semibold text-slate-400">+{Object.keys(parsedData[0]).length - 8} alan</th>
                        )}
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {parsedData.slice(0, 10).map((row, idx) => (
                        <tr key={idx} className="hover:bg-slate-50">
                          <td className="px-3 py-2 text-slate-400">{idx + 1}</td>
                          {Object.values(row).slice(0, 8).map((val, i) => (
                            <td key={i} className="px-3 py-2 text-slate-700 max-w-[120px] truncate">
                              {String(val || '-')}
                            </td>
                          ))}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                {parsedData.length > 10 && (
                  <p className="text-xs text-slate-500 text-center">
                    ... ve {parsedData.length - 10} satir daha
                  </p>
                )}
              </div>
            )}

            {step === 'import' && (
              <div className="text-center py-12">
                {importing ? (
                  <div className="space-y-4">
                    <div className="w-16 h-16 border-4 border-emerald-200 border-t-emerald-600 rounded-full animate-spin mx-auto" />
                    <p className="text-sm font-semibold text-slate-700">Veriler aktariliyor...</p>
                    <p className="text-xs text-slate-500">{parsedData.length} kayit isleniyor</p>
                  </div>
                ) : importResult ? (
                  <div className="space-y-4">
                    <div className={clsx(
                      'w-16 h-16 rounded-full flex items-center justify-center mx-auto',
                      importResult.failed === 0 ? 'bg-green-100' : 'bg-amber-100'
                    )}>
                      {importResult.failed === 0 ? (
                        <CheckCircle2 size={32} className="text-green-600" />
                      ) : (
                        <AlertTriangle size={32} className="text-amber-600" />
                      )}
                    </div>
                    <p className="text-lg font-bold text-slate-900">Aktarim Tamamlandi</p>
                    <div className="flex items-center justify-center gap-6">
                      <div className="text-center">
                        <p className="text-2xl font-black text-green-600">{importResult.success}</p>
                        <p className="text-xs text-slate-500">Basarili</p>
                      </div>
                      {importResult.failed > 0 && (
                        <div className="text-center">
                          <p className="text-2xl font-black text-red-600">{importResult.failed}</p>
                          <p className="text-xs text-slate-500">Basarisiz</p>
                        </div>
                      )}
                    </div>
                  </div>
                ) : null}
              </div>
            )}
          </div>

          <div className="bg-slate-50 px-6 py-4 border-t border-slate-200 rounded-b-2xl flex items-center justify-between">
            <button onClick={step === 'upload' ? onClose : handleReset} className="px-5 py-2 bg-white border border-slate-300 text-slate-700 rounded-lg font-medium text-sm">
              {step === 'upload' ? 'Kapat' : step === 'import' && !importing ? 'Kapat' : 'Geri'}
            </button>
            {step === 'preview' && (
              <button
                onClick={handleImport}
                className="flex items-center gap-2 px-5 py-2 bg-emerald-600 text-white rounded-lg font-semibold text-sm hover:bg-emerald-700"
              >
                <Upload size={14} />
                {parsedData.length} Kaydi Aktar
              </button>
            )}
            {step === 'import' && !importing && (
              <button onClick={onClose} className="px-5 py-2 bg-emerald-600 text-white rounded-lg font-semibold text-sm">
                Tamam
              </button>
            )}
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
