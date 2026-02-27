export type TestDesignResult = 'NOT_STARTED' | 'EFFECTIVE' | 'INEFFECTIVE' | 'N/A';
export type TestEffectivenessResult = 'NOT_STARTED' | 'EFFECTIVE' | 'INEFFECTIVE';
export type ApprovalStatus = 'in_progress' | 'prepared' | 'reviewed';

export interface ControlRow {
  id: string;
  control_id: string;
  title: string;
  description: string;
  category: string;
  tod: TestDesignResult;
  toe: TestEffectivenessResult;
  sample_size: number;
  auditor: {
    id: string;
    name: string;
    initials: string;
    color: string;
  };
  risk_level: 'HIGH' | 'MEDIUM' | 'LOW';
  approval_status?: ApprovalStatus;
}

export const TOD_OPTIONS: { value: TestDesignResult; label: string; color: string; bg: string; border: string }[] = [
  { value: 'NOT_STARTED', label: 'Not Started', color: 'text-slate-600', bg: 'bg-slate-50', border: 'border-slate-200' },
  { value: 'EFFECTIVE', label: 'Effective', color: 'text-emerald-700', bg: 'bg-emerald-50', border: 'border-emerald-300' },
  { value: 'INEFFECTIVE', label: 'Ineffective', color: 'text-red-700', bg: 'bg-red-50', border: 'border-red-300' },
  { value: 'N/A', label: 'N/A', color: 'text-slate-500', bg: 'bg-slate-50', border: 'border-slate-200' },
];

export const TOE_OPTIONS: { value: TestEffectivenessResult; label: string; color: string; bg: string; border: string }[] = [
  { value: 'NOT_STARTED', label: 'Not Started', color: 'text-slate-600', bg: 'bg-slate-50', border: 'border-slate-200' },
  { value: 'EFFECTIVE', label: 'Effective', color: 'text-emerald-700', bg: 'bg-emerald-50', border: 'border-emerald-300' },
  { value: 'INEFFECTIVE', label: 'Ineffective', color: 'text-red-700', bg: 'bg-red-50', border: 'border-red-300' },
];
