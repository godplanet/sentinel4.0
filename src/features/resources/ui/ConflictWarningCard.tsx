/**
 * CONFLICT WARNING CARD
 *
 * Displays overlap and fatigue warnings when assigning auditors.
 */

import { AlertTriangle, Calendar, Activity } from 'lucide-react';
import type { ConflictCheck } from '../conflicts';

interface ConflictWarningCardProps {
  conflictCheck: ConflictCheck;
}

export function ConflictWarningCard({ conflictCheck }: ConflictWarningCardProps) {
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
        <div className="rounded-lg border border-slate-200 bg-white p-4">
          <div className="flex items-center gap-2 mb-3">
            <Calendar className="h-4 w-4 text-slate-600" />
            <span className="text-sm font-semibold text-slate-900">
              Overlapping Engagements
            </span>
          </div>
          <div className="space-y-2">
            {conflictCheck.overlappingEngagements.map((eng) => (
              <div
                key={eng.id}
                className="rounded border border-slate-200 bg-slate-50 p-3 text-sm"
              >
                <div className="font-medium text-slate-900">{eng.title}</div>
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
    </div>
  );
}
