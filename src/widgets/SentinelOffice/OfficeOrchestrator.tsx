import { useState, useCallback, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  X, GitBranch, ChevronLeft, Loader2,
} from 'lucide-react';
import clsx from 'clsx';
import { useLatestVersion } from '@/entities/office';
import type { OfficeDocument, OfficeVersion } from '@/entities/office';
import type { SpreadsheetState } from './types';
import { SentinelSheets } from './Sheets';
import { SentinelDocs } from './Docs';
import { DocumentList } from './DocumentList';
import { VersionHistory } from './VersionHistory';

interface Props {
  workpaperId?: string | null;
  isOpen: boolean;
  onClose: () => void;
}

export function OfficeOrchestrator({ workpaperId, isOpen, onClose }: Props) {
  const [activeDoc, setActiveDoc] = useState<OfficeDocument | null>(null);
  const [showHistory, setShowHistory] = useState(false);
  const [restoredContent, setRestoredContent] = useState<any>(null);

  const { data: latestVersion, isLoading: versionLoading } = useLatestVersion(activeDoc?.id ?? null);

  const handleOpen = useCallback((doc: OfficeDocument) => {
    setActiveDoc(doc);
    setShowHistory(false);
    setRestoredContent(null);
  }, []);

  const handleBack = useCallback(() => {
    setActiveDoc(null);
    setShowHistory(false);
    setRestoredContent(null);
  }, []);

  const handleRestore = useCallback((version: OfficeVersion) => {
    setRestoredContent(version.content_data);
    setShowHistory(false);
  }, []);

  useEffect(() => {
    if (!isOpen) {
      setActiveDoc(null);
      setShowHistory(false);
      setRestoredContent(null);
    }
  }, [isOpen]);

  const contentData = restoredContent || latestVersion?.content_data || null;

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={activeDoc ? undefined : onClose}
            className="fixed inset-0 bg-black/40 backdrop-blur-sm z-[190]"
          />

          <motion.div
            initial={{ opacity: 0, scale: 0.97 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.97 }}
            transition={{ type: 'spring', damping: 30, stiffness: 350 }}
            className="fixed inset-4 sm:inset-8 bg-white/95 backdrop-blur-xl rounded-2xl shadow-2xl border border-white/60 z-[191] flex flex-col overflow-hidden"
          >
            <div className="shrink-0 bg-white border-b border-slate-200 px-5 py-3 flex items-center justify-between">
              <div className="flex items-center gap-3">
                {activeDoc && (
                  <button
                    onClick={handleBack}
                    className="p-1.5 hover:bg-slate-100 rounded-lg transition-colors text-slate-400"
                  >
                    <ChevronLeft size={18} />
                  </button>
                )}
                <div>
                  <h2 className="text-sm font-black text-slate-800">
                    {activeDoc ? activeDoc.title : 'Sentinel Office'}
                  </h2>
                  <span className="text-[10px] text-slate-400">
                    {activeDoc
                      ? `${activeDoc.doc_type === 'SPREADSHEET' ? 'Tablo' : 'Belge'} - Cryo-Chamber Korunmali`
                      : 'Belgelerim - Immutable Versiyon Kontrolu'
                    }
                  </span>
                </div>
              </div>

              <div className="flex items-center gap-2">
                {activeDoc && (
                  <button
                    onClick={() => setShowHistory(!showHistory)}
                    className={clsx(
                      'flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold border transition-colors',
                      showHistory
                        ? 'bg-blue-50 border-blue-200 text-blue-700'
                        : 'border-slate-200 text-slate-500 hover:bg-slate-50',
                    )}
                  >
                    <GitBranch size={12} />
                    Gecmis
                  </button>
                )}
                <button
                  onClick={onClose}
                  className="p-1.5 hover:bg-slate-100 rounded-lg transition-colors text-slate-400"
                >
                  <X size={18} />
                </button>
              </div>
            </div>

            <div className="flex-1 flex overflow-hidden">
              <div className="flex-1 overflow-hidden">
                {!activeDoc ? (
                  <div className="p-6 overflow-y-auto h-full">
                    <DocumentList workpaperId={workpaperId} onOpen={handleOpen} />
                  </div>
                ) : versionLoading ? (
                  <div className="flex items-center justify-center h-full">
                    <Loader2 className="w-6 h-6 animate-spin text-slate-400" />
                  </div>
                ) : activeDoc.doc_type === 'SPREADSHEET' ? (
                  <SentinelSheets
                    workpaperId={null}
                    documentId={activeDoc.id}
                    initialData={contentData as SpreadsheetState | null}
                    isFullScreen={false}
                  />
                ) : (
                  <SentinelDocs
                    reportId={null}
                    documentId={activeDoc.id}
                    initialContent={contentData}
                    isFullScreen={false}
                  />
                )}
              </div>

              <AnimatePresence>
                {showHistory && activeDoc && (
                  <motion.div
                    initial={{ width: 0, opacity: 0 }}
                    animate={{ width: 280, opacity: 1 }}
                    exit={{ width: 0, opacity: 0 }}
                    transition={{ duration: 0.2 }}
                    className="shrink-0 border-l border-slate-200 bg-slate-50/50 overflow-hidden"
                  >
                    <div className="w-[280px] h-full overflow-y-auto p-3">
                      <VersionHistory
                        documentId={activeDoc.id}
                        currentVersionId={activeDoc.current_version_id}
                        onRestore={handleRestore}
                      />
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
