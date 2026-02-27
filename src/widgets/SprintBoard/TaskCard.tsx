import { motion } from 'framer-motion';
import { User, Paperclip, Star, AlertTriangle } from 'lucide-react';
import clsx from 'clsx';
import toast from 'react-hot-toast';
import type { AuditTask } from '@/features/audit-creation/types';
import { PRIORITY_LABELS } from '@/features/audit-creation/types';
import { useFindingStore } from '@/entities/finding/model/store';

interface TaskCardProps {
  task: AuditTask;
  isDragging?: boolean;
}

const PRIORITY_COLORS: Record<string, string> = {
  LOW: 'bg-slate-100 text-slate-600',
  MEDIUM: 'bg-blue-100 text-blue-700',
  HIGH: 'bg-orange-100 text-orange-700',
  CRITICAL: 'bg-red-100 text-red-700',
};

const PRIORITY_BORDER: Record<string, string> = {
  LOW: 'border-l-slate-300',
  MEDIUM: 'border-l-blue-400',
  HIGH: 'border-l-orange-500',
  CRITICAL: 'border-l-red-500',
};

const VALIDATION_BADGE: Record<string, { label: string; color: string }> = {
  OPEN: { label: 'Acik', color: 'bg-slate-100 text-slate-600' },
  CLIENT_REVIEW: { label: 'Musteri Incelemede', color: 'bg-amber-100 text-amber-700' },
  VALIDATED: { label: 'Dogrulandi', color: 'bg-emerald-100 text-emerald-700' },
};

export function TaskCard({ task, isDragging }: TaskCardProps) {
  const draftFindingFromWorkpaper = useFindingStore((s) => s.draftFindingFromWorkpaper);

  const handleDraftFinding = (e: React.MouseEvent) => {
    e.stopPropagation();
    draftFindingFromWorkpaper(task.id, task.title, '');
    toast.success('İzlenebilirlik Bağı Kuruldu! Stüdyoda taslak bulgu oluşturuldu.');
  };

  const initials = task.assigned_name
    ? task.assigned_name.split(' ').map((w) => w[0]).join('').toUpperCase()
    : '?';

  const evidenceCount = Array.isArray(task.evidence_links) ? task.evidence_links.length : 0;
  const validation = VALIDATION_BADGE[task.validation_status] || VALIDATION_BADGE.OPEN;

  return (
    <div
      className={clsx(
        'bg-white rounded-lg border border-slate-200 border-l-4 p-3 transition-all',
        PRIORITY_BORDER[task.priority],
        isDragging ? 'shadow-xl rotate-2 scale-105' : 'shadow-sm hover:shadow-md'
      )}
    >
      <div className="flex items-start justify-between gap-2 mb-2">
        <span className={clsx('text-[10px] font-semibold px-1.5 py-0.5 rounded', PRIORITY_COLORS[task.priority])}>
          {PRIORITY_LABELS[task.priority]}
        </span>
        {task.xp_awarded && (
          <Star size={12} className="text-amber-500 fill-amber-500 flex-shrink-0" />
        )}
      </div>

      <h4 className="text-sm font-semibold text-slate-900 mb-1.5 line-clamp-2">{task.title}</h4>

      {task.description && (
        <p className="text-xs text-slate-500 mb-2 line-clamp-2">{task.description}</p>
      )}

      <div className="flex items-center justify-between mt-2">
        <div className="flex items-center gap-2">
          {task.assigned_to ? (
            <div className="flex items-center gap-1.5">
              <div className="w-6 h-6 rounded-full bg-blue-100 text-blue-700 flex items-center justify-center text-[10px] font-bold">
                {initials}
              </div>
              <span className="text-[11px] text-slate-600 truncate max-w-[80px]">{task.assigned_name}</span>
            </div>
          ) : (
            <div className="flex items-center gap-1 text-slate-400">
              <User size={12} />
              <span className="text-[11px]">Atanmamis</span>
            </div>
          )}
        </div>

        <div className="flex items-center gap-2">
          {evidenceCount > 0 && (
            <span className="flex items-center gap-0.5 text-[10px] text-slate-400">
              <Paperclip size={10} /> {evidenceCount}
            </span>
          )}
          <span className="text-[10px] font-medium bg-slate-100 text-slate-500 px-1.5 py-0.5 rounded">
            {task.story_points} SP
          </span>
        </div>
      </div>

      {task.validation_status !== 'OPEN' && (
        <div className="mt-2 pt-2 border-t border-slate-100">
          <span className={clsx('text-[10px] font-semibold px-1.5 py-0.5 rounded', validation.color)}>
            {validation.label}
          </span>
        </div>
      )}

      <div className="mt-2 pt-2 border-t border-slate-100">
        <button
          onClick={handleDraftFinding}
          className="w-full text-left text-[10px] font-semibold text-red-600 hover:text-red-700 hover:bg-red-50 px-1.5 py-1 rounded transition-colors flex items-center gap-1"
        >
          <AlertTriangle size={10} className="shrink-0" />
          🚨 İstisna Bildir (Taslak Bulgu)
        </button>
      </div>
    </div>
  );
}
