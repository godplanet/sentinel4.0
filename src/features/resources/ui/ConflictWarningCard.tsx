/**
 * CONFLICT WARNING CARD
 *
 * Displays overlap and fatigue warnings when assigning auditors.
 * GIAS 9.2: Yönetim Kuruluna eskale butonu ve onay modalı.
 */

import { useState } from 'react';
import { AlertTriangle, Calendar, Activity, Send, CheckCircle2 } from 'lucide-react';
import type { ConflictCheck } from '../conflicts';
import {
  useEscalateToBoard,
  buildEscalationSummary,
} from '../escalation-api';

interface ConflictWarningCardProps {
  conflictCheck: ConflictCheck;
}

export function ConflictWarningCard({ conflictCheck }: ConflictWarningCardProps) {
  const [showEscalateModal, setShowEscalateModal] = useState(false);
  const [escalationSealed, setEscalationSealed] = useState(false);
  const escalateMutation = useEscalateToBoard();

  if (!conflictCheck.hasConflict && conflictCheck.warnings.length === 0) {
    return (
      <div className="rounded-lg border border-green-200 bg-green-50 p-4">
        <div className="flex items-center gap-2 text-green-800">
          <div className="h-2 w-2 rounded-full bg-green-500" />
          <span className="font-medium">No conflicts detected</span>
        </div>
      </div>
    );
  }

  const getBurnoutColor = (zone: string) => {
    if (zone === 'RED') return 'text-red-700 bg-red-100 border-red-300';
    if (zone === 'AMBER') return 'text-amber-700 bg-amber-100 border-amber-300';
    return 'text-green-700 bg-green-100 border-green-300';
  };

  return (
    <div className="space-y-3">
      {conflictCheck.warnings.map((warning, idx) => (
        <div
          key={idx}
          className="rounded-lg border border-amber-200 bg-amber-50 p-4"
        >
          <div className="flex items-start gap-3">
            <AlertTriangle className="h-5 w-5 text-amber-600 flex-shrink-0 mt-0.5" />
            <div className="flex-1">
              <p className="text-sm font-medium text-amber-900">{warning}</p>
            </div>
          </div>
        </div>
      ))}

      {conflictCheck.overlappingEngagements.length > 0 && (
        <div className="rounded-lg border border-slate-200 bg-surface p-4">
          <div className="flex items-center gap-2 mb-3">
            <Calendar className="h-4 w-4 text-slate-600" />
            <span className="text-sm font-semibold text-primary">
              Overlapping Engagements
            </span>
          </div>
          <div className="space-y-2">
            {conflictCheck.overlappingEngagements.map((eng) => (
              <div
                key={eng.id}
                className="rounded border border-slate-200 bg-canvas p-3 text-sm"
              >
                <div className="font-medium text-primary">{eng.title}</div>
                <div className="text-slate-600 mt-1">
                  {new Date(eng.start_date).toLocaleDateString()} -{' '}
                  {new Date(eng.end_date).toLocaleDateString()}
                </div>
                <div className="text-amber-600 font-medium mt-1">
                  {eng.overlap_days} day{eng.overlap_days > 1 ? 's' : ''} overlap
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {conflictCheck.fatigueWarning && (
        <div
          className={`rounded-lg border p-4 ${getBurnoutColor(
            conflictCheck.fatigueWarning.burnout_zone
          )}`}
        >
          <div className="flex items-start gap-3">
            <Activity className="h-5 w-5 flex-shrink-0 mt-0.5" />
            <div className="flex-1">
              <div className="font-semibold mb-2">
                {conflictCheck.fatigueWarning.message}
              </div>
              <div className="space-y-1 text-sm">
                <div className="flex justify-between">
                  <span>Fatigue Score:</span>
                  <span className="font-medium">
                    {conflictCheck.fatigueWarning.fatigue_score}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span>Hours (3 weeks):</span>
                  <span className="font-medium">
                    {conflictCheck.fatigueWarning.active_hours_last_3_weeks}h
                  </span>
                </div>
                <div className="flex justify-between">
                  <span>High-stress streak:</span>
                  <span className="font-medium">
                    {conflictCheck.fatigueWarning.consecutive_high_stress_projects} projects
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {(conflictCheck.hasConflict || conflictCheck.warnings.length > 0) && !escalationSealed && (
        <div className="rounded-lg border-2 border-orange-200 bg-orange-50/80 p-4">
          <button
            type="button"
            onClick={() => setShowEscalateModal(true)}
            className="w-full flex items-center justify-center gap-2 px-4 py-3 rounded-lg bg-gradient-to-r from-orange-500 to-red-500 text-white font-semibold text-sm hover:from-orange-600 hover:to-red-600 transition-all shadow-sm"
          >
            <Send size={16} />
            Yönetim Kuruluna Eskale Et (GIAS 9.2)
          </button>
        </div>
      )}

      {escalationSealed && (
        <div className="rounded-lg border border-emerald-200 bg-emerald-50 p-4 flex items-center gap-2 text-emerald-800">
          <CheckCircle2 size={20} className="text-emerald-600 shrink-0" />
          <span className="font-medium">Eskalasyon Mühürlendi</span>
        </div>
      )}

      {showEscalateModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm">
          <div className="bg-surface rounded-xl border border-slate-200 shadow-xl max-w-md w-full mx-4 overflow-hidden">
            <div className="px-5 py-4 border-b border-slate-200 bg-canvas">
              <h3 className="text-base font-bold text-slate-800">GIAS 9.2 Eskalasyon</h3>
            </div>
            <div className="p-5 space-y-4">
              <p className="text-sm text-slate-600">
                GIAS 9.2 gereği, bu riskleri denetleyecek yeterli bütçe/kapasite olmadığı
                Yönetim Kuruluna bildirilecektir.
              </p>
              <p className="text-xs text-slate-500">
                Özet: {buildEscalationSummary(conflictCheck)}
              </p>
            </div>
            <div className="px-5 py-4 border-t border-slate-200 flex justify-end gap-2 bg-canvas/50">
              <button
                type="button"
                onClick={() => setShowEscalateModal(false)}
                className="px-3 py-2 rounded-lg border border-slate-300 text-slate-700 text-sm font-medium hover:bg-slate-100"
              >
                Vazgeç
              </button>
              <button
                type="button"
                onClick={async () => {
                  try {
                    await escalateMutation.mutateAsync({
                      summary: buildEscalationSummary(conflictCheck),
                      details: {
                        overlappingEngagements: conflictCheck.overlappingEngagements,
                        warnings: conflictCheck.warnings,
                        fatigueWarning: conflictCheck.fatigueWarning ?? null,
                      },
                      report_type: 'GIAS_9_2_CAPACITY',
                    });
                    setShowEscalateModal(false);
                    setEscalationSealed(true);
                  } catch {
                    setShowEscalateModal(false);
                  }
                }}
                disabled={escalateMutation.isPending}
                className="px-3 py-2 rounded-lg bg-red-600 text-white text-sm font-medium hover:bg-red-700 disabled:opacity-50"
              >
                {escalateMutation.isPending ? 'Gönderiliyor…' : 'Onayla ve Gönder'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
