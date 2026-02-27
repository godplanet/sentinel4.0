import { useDocumentVersions } from '@/entities/office';
import type { OfficeVersion } from '@/entities/office';
import { Lock, Clock, Hash, Loader2, GitBranch } from 'lucide-react';
import clsx from 'clsx';

interface Props {
  documentId: string | null;
  currentVersionId: string | null;
  onRestore?: (version: OfficeVersion) => void;
}

export function VersionHistory({ documentId, currentVersionId, onRestore }: Props) {
  const { data: versions, isLoading } = useDocumentVersions(documentId);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-8">
        <Loader2 className="w-4 h-4 animate-spin text-slate-400" />
      </div>
    );
  }

  if (!versions?.length) {
    return (
      <div className="text-center py-8 text-xs text-slate-400">
        Versiyon gecmisi bulunamadi
      </div>
    );
  }

  return (
    <div className="space-y-1">
      <div className="flex items-center gap-2 px-3 py-2 text-xs font-bold text-slate-500">
        <GitBranch size={12} />
        <span>Cryo-Chamber ({versions.length} versiyon)</span>
      </div>
      {versions.map((ver) => {
        const isCurrent = ver.id === currentVersionId;
        return (
          <div
            key={ver.id}
            className={clsx(
              'flex items-start gap-3 px-3 py-2.5 rounded-lg border transition-colors',
              isCurrent
                ? 'bg-blue-50 border-blue-200'
                : 'bg-white border-slate-100 hover:border-slate-200',
            )}
          >
            <div className="flex flex-col items-center gap-1 pt-0.5">
              <div className={clsx(
                'w-6 h-6 rounded-full flex items-center justify-center text-[9px] font-black',
                isCurrent ? 'bg-blue-600 text-white' : 'bg-slate-200 text-slate-600',
              )}>
                v{ver.version_number}
              </div>
              {ver.is_frozen && <Lock size={8} className="text-slate-300" />}
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold text-slate-700">
                  {ver.change_summary || `Versiyon ${ver.version_number}`}
                </span>
                {isCurrent && (
                  <span className="text-[9px] font-bold bg-blue-600 text-white px-1.5 py-0.5 rounded">
                    GUNCEL
                  </span>
                )}
              </div>
              <div className="flex items-center gap-3 mt-1 text-[10px] text-slate-400">
                <span className="flex items-center gap-1">
                  <Clock size={9} />
                  {new Date(ver.created_at).toLocaleString('tr-TR', {
                    day: '2-digit', month: '2-digit', year: 'numeric',
                    hour: '2-digit', minute: '2-digit',
                  })}
                </span>
                <span>{ver.created_by_name}</span>
              </div>
              <div className="flex items-center gap-1 mt-1 text-[9px] font-mono text-slate-300">
                <Hash size={8} />
                {ver.content_hash.slice(0, 16)}...
              </div>
              {!isCurrent && onRestore && (
                <button
                  onClick={() => onRestore(ver)}
                  className="mt-1.5 text-[10px] font-bold text-blue-600 hover:underline"
                >
                  Bu versiyona geri don
                </button>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}
