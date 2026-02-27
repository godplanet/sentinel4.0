import type { AuditTask } from '@/features/audit-creation/types';

export interface HealthComponent {
  key: string;
  label: string;
  score: number;
  weight: number;
  weighted: number;
  gap: string;
}

export interface FileHealthResult {
  score: number;
  zone: 'GREEN' | 'YELLOW' | 'RED';
  components: HealthComponent[];
  qualityGaps: HealthComponent[];
  passesGate: boolean;
}

const GATE_THRESHOLD = 85;

function daysBetween(a: string, b: string): number {
  const msPerDay = 86_400_000;
  return Math.abs(new Date(b).getTime() - new Date(a).getTime()) / msPerDay;
}

function evidenceDensity(tasks: AuditTask[]): HealthComponent {
  const done = tasks.filter((t) => t.status === 'DONE');
  if (done.length === 0) {
    return { key: 'evidence', label: 'Kanit Yogunlugu', score: 0, weight: 0.3, weighted: 0, gap: 'Tamamlanan gorev yok' };
  }
  const withEvidence = done.filter((t) => Array.isArray(t.evidence_links) && t.evidence_links.length > 0).length;
  const score = Math.round((withEvidence / done.length) * 100);
  const gap = score < 100 ? `${done.length - withEvidence} gorevde kanit eksik` : '';
  return { key: 'evidence', label: 'Kanit Yogunlugu', score, weight: 0.3, weighted: Math.round(score * 0.3), gap };
}

function logicCheck(tasks: AuditTask[]): HealthComponent {
  const done = tasks.filter((t) => t.status === 'DONE');
  if (done.length === 0) {
    return { key: 'logic', label: 'Mantik Kontrolu', score: 0, weight: 0.3, weighted: 0, gap: 'Tamamlanan gorev yok' };
  }
  const passing = done.filter((t) => t.description && t.description.length > 50).length;
  const score = Math.round((passing / done.length) * 100);
  const gap = score < 100 ? `${done.length - passing} gorevde aciklama yetersiz (<50 karakter)` : '';
  return { key: 'logic', label: 'Mantik Kontrolu', score, weight: 0.3, weighted: Math.round(score * 0.3), gap };
}

function cycleTime(tasks: AuditTask[]): HealthComponent {
  const inProgress = tasks.filter((t) => t.status === 'IN_PROGRESS');
  if (inProgress.length === 0) {
    return { key: 'cycle', label: 'Dongu Suresi', score: 100, weight: 0.2, weighted: 20, gap: '' };
  }
  const now = new Date().toISOString();
  const withinLimit = inProgress.filter((t) => {
    const days = daysBetween(t.updated_at || t.created_at, now);
    return days <= 5;
  }).length;
  const score = Math.round((withinLimit / inProgress.length) * 100);
  const overdue = inProgress.length - withinLimit;
  const gap = overdue > 0 ? `${overdue} gorev 5 gunden fazla suruyor` : '';
  return { key: 'cycle', label: 'Dongu Suresi', score, weight: 0.2, weighted: Math.round(score * 0.2), gap };
}

function supervisorReview(tasks: AuditTask[]): HealthComponent {
  const done = tasks.filter((t) => t.status === 'DONE');
  if (done.length === 0) {
    return { key: 'review', label: 'Denetci Onay', score: 0, weight: 0.2, weighted: 0, gap: 'Tamamlanan gorev yok' };
  }
  const validated = done.filter((t) => t.validation_status === 'VALIDATED').length;
  const score = Math.round((validated / done.length) * 100);
  const gap = score < 100 ? `${done.length - validated} gorev henuz onaylanmadi` : '';
  return { key: 'review', label: 'Denetci Onay', score, weight: 0.2, weighted: Math.round(score * 0.2), gap };
}

export function calculateFileHealth(tasks: AuditTask[]): FileHealthResult {
  const components = [
    evidenceDensity(tasks),
    logicCheck(tasks),
    cycleTime(tasks),
    supervisorReview(tasks),
  ];

  const score = components.reduce((sum, c) => sum + c.weighted, 0);
  const zone: FileHealthResult['zone'] = score >= 85 ? 'GREEN' : score >= 70 ? 'YELLOW' : 'RED';
  const qualityGaps = [...components]
    .filter((c) => c.gap)
    .sort((a, b) => a.score - b.score)
    .slice(0, 3);

  return { score, zone, components, qualityGaps, passesGate: score >= GATE_THRESHOLD };
}

export const GATE_MIN_SCORE = GATE_THRESHOLD;
