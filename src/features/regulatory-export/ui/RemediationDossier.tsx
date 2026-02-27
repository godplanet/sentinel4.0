import React from 'react';
import { Printer, Shield, CheckCircle2, AlertTriangle } from 'lucide-react';
import type { ActionEvidence, FindingSnapshot } from '@/entities/action/model/types';

interface DossierData {
  dossierRef: string;
  generatedAt: string;
  tenantName: string;
  finding: FindingSnapshot & { entity?: string; control?: string };
  originalDueDate: string;
  actualClosureDate: string;
  isBddkBreach: boolean;
  boardExceptionRef?: string;
  evidence: ActionEvidence & { file_name: string };
  auditorName: string;
  auditorUid: string;
  reviewNote: string;
}

const MOCK_DATA: DossierData = {
  dossierRef: 'SEN-DOSSIER-2026-0042',
  generatedAt: new Date().toLocaleDateString('en-GB', { day: '2-digit', month: 'long', year: 'numeric' }),
  tenantName: 'Türkiye Kalkınma Bankası A.Ş.',
  finding: {
    finding_id: 'FND-2025-0112',
    title: 'Inadequate Network Perimeter Security Controls',
    severity: 'Critical',
    risk_rating: 'High',
    gias_category: 'Technology & Cybersecurity',
    description:
      'The external firewall ruleset has not been reviewed in over 18 months. Legacy rule permitting unrestricted egress on port 8080 identified. Presents a material risk of data exfiltration.',
    created_at: '2025-03-14T09:00:00Z',
    entity: 'IT Infrastructure Division',
    control: 'CTL-NET-042 — External Perimeter Firewall Review',
  },
  originalDueDate: '2025-06-30',
  actualClosureDate: '2025-09-12',
  isBddkBreach: true,
  boardExceptionRef: 'BOARD-EXC-2025-007',
  evidence: {
    id: 'EVD-0081',
    action_id: 'ACT-2025-0334',
    storage_path: 'evidence/firewall_audit_report_q3_2025.pdf',
    file_name: 'firewall_audit_report_q3_2025.pdf',
    file_hash: 'e5b9c3a7f2d14806f9e2c1a3d7b04856f2e9c1d3a5b7e904e5b9c3a7f2d14806',
    ai_confidence_score: 94.7,
    review_note: 'Evidence verified. Firewall ruleset updated and independently validated by external pen-test team.',
    uploaded_by: 'Auditee — IT Infrastructure Division',
    created_at: '2025-09-10T14:22:00Z',
  },
  auditorName: 'Mehmet Yılmaz, CIA, CISA',
  auditorUid: '8f4c-2a1b-9d3e-5f2c',
  reviewNote:
    'All control deficiencies identified in the original finding have been remediated. Firewall rules reviewed, legacy egress rule removed, and quarterly review schedule established.',
};

export const RemediationDossier: React.FC = () => {
  const d = MOCK_DATA;
  const isOverdue = new Date(d.actualClosureDate) > new Date(d.originalDueDate);

  return (
    <div className="min-h-screen bg-slate-100 py-8 px-4 print:bg-white print:py-0 print:px-0">
      <div className="print:hidden fixed top-6 right-6 z-50">
        <button
          onClick={() => window.print()}
          className="flex items-center gap-2 px-4 py-2.5 bg-slate-900 text-white text-sm font-medium rounded-xl shadow-lg hover:bg-slate-800 transition-colors"
        >
          <Printer size={16} />
          Print to PDF
        </button>
      </div>

      <div className="max-w-4xl mx-auto bg-white p-12 shadow-sm border border-slate-300 print:shadow-none print:border-none print:max-w-full">
        <header className="flex items-start justify-between pb-8 border-b-2 border-slate-900 mb-10">
          <div>
            <p className="font-mono text-[10px] text-slate-500 tracking-widest uppercase mb-2">
              {d.tenantName}
            </p>
            <h1 className="font-serif text-3xl font-bold text-slate-900 tracking-widest uppercase leading-tight">
              Official Remediation Dossier
            </h1>
            <p className="font-mono text-xs text-slate-500 mt-2 tracking-wide">
              Ref: {d.dossierRef} &nbsp;|&nbsp; Issued: {d.generatedAt}
            </p>
          </div>
          <div className="flex flex-col items-end gap-1">
            <div className="w-12 h-12 bg-slate-900 rounded-lg flex items-center justify-center">
              <Shield size={24} className="text-white" />
            </div>
            <span className="font-mono text-[9px] text-slate-400 tracking-widest uppercase">Sentinel v3.0</span>
          </div>
        </header>

        <section className="mb-10">
          <SectionHeader number="I" title="The Genesis" subtitle="Original finding record — immutable snapshot at time of action creation" />
          <div className="border border-slate-300 rounded-lg overflow-hidden mt-4">
            <div className="bg-slate-50 border-b border-slate-200 px-5 py-3 flex items-center justify-between">
              <span className="font-mono text-xs text-slate-600 tracking-wide">{d.finding.finding_id}</span>
              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-red-100 text-red-800 border border-red-200">
                {d.finding.severity}
              </span>
            </div>
            <div className="px-5 py-5 space-y-4">
              <div>
                <p className="text-xs font-medium text-slate-400 uppercase tracking-widest mb-1">Finding Title</p>
                <p className="font-serif text-lg text-slate-900">{d.finding.title}</p>
              </div>
              <div className="grid grid-cols-3 gap-4">
                <MetaField label="GIAS Category" value={d.finding.gias_category ?? '—'} />
                <MetaField label="Risk Rating" value={d.finding.risk_rating} />
                <MetaField label="Responsible Entity" value={d.finding.entity ?? '—'} />
              </div>
              <div>
                <p className="text-xs font-medium text-slate-400 uppercase tracking-widest mb-1">Description</p>
                <p className="text-sm text-slate-700 font-serif leading-relaxed">{d.finding.description}</p>
              </div>
              <MetaField label="Affected Control" value={d.finding.control ?? '—'} />
            </div>
          </div>
        </section>

        <section className="mb-10">
          <SectionHeader number="II" title="Execution & Aging" subtitle="Chronological record of the remediation lifecycle" />
          <div className="mt-4 grid grid-cols-2 gap-5">
            <DateBlock
              label="Original Due Date"
              value={formatDate(d.originalDueDate)}
              sub="Immutable BDDK benchmark"
              variant="neutral"
            />
            <DateBlock
              label="Actual Closure Date"
              value={formatDate(d.actualClosureDate)}
              sub={isOverdue ? `${daysBetween(d.originalDueDate, d.actualClosureDate)} days overdue` : 'Closed on schedule'}
              variant={isOverdue ? 'warning' : 'success'}
            />
          </div>

          {d.isBddkBreach && (
            <div className="mt-5 border border-amber-300 rounded-lg bg-amber-50 px-5 py-4">
              <div className="flex items-start gap-3">
                <AlertTriangle size={18} className="text-amber-700 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="font-serif text-sm font-bold text-amber-900 uppercase tracking-wide">
                    BDDK Red-Line Breach — Board Exception on Record
                  </p>
                  <p className="text-xs text-amber-800 mt-1 leading-relaxed font-sans">
                    This action exceeded the 365-day BDDK performance threshold. A formal Board Exception was approved
                    to authorise the extended remediation period. All regulatory obligations fulfilled under exception
                    reference: <span className="font-mono font-bold">{d.boardExceptionRef}</span>.
                  </p>
                </div>
              </div>
            </div>
          )}
        </section>

        <section className="mb-10">
          <SectionHeader number="III" title="Cryptographic Evidence" subtitle="Immutable audit trail — file integrity sealed via SHA-256" />
          <div className="mt-4 border border-slate-200 rounded-lg overflow-hidden">
            <div className="bg-slate-50 border-b border-slate-200 px-5 py-3">
              <p className="text-xs font-medium text-slate-500 tracking-widest uppercase">Evidence Record — {d.evidence.id}</p>
            </div>
            <div className="px-5 py-5 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <MetaField label="File Name" value={d.evidence.file_name} />
                <MetaField label="Uploaded By" value={d.evidence.uploaded_by ?? '—'} />
                <MetaField label="AI Confidence Score" value={`${d.evidence.ai_confidence_score?.toFixed(1)}%`} />
                <MetaField label="Review Date" value={formatDate(d.evidence.created_at.split('T')[0])} />
              </div>
              <div>
                <p className="text-xs font-medium text-slate-400 uppercase tracking-widest mb-2">SHA-256 Integrity Hash</p>
                <div className="bg-slate-100 rounded-lg px-4 py-3 border border-slate-200">
                  <p className="font-mono text-xs text-slate-700 break-all leading-relaxed">
                    {d.evidence.file_hash}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className="mb-10">
          <SectionHeader number="IV" title="Auditor Sign-Off" subtitle="Formal closure attestation and digital signature record" />
          <div className="mt-4 space-y-4">
            <div className="border border-slate-200 rounded-lg px-5 py-4">
              <p className="text-xs font-medium text-slate-400 uppercase tracking-widest mb-2">Review Note</p>
              <p className="font-serif text-sm text-slate-800 leading-relaxed italic">
                &ldquo;{d.reviewNote}&rdquo;
              </p>
            </div>

            <div className="border border-slate-300 rounded-lg px-6 py-5 bg-slate-50">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-xs font-medium text-slate-400 uppercase tracking-widest mb-2">Digital Signature</p>
                  <p className="font-serif text-base text-slate-900 font-semibold">{d.auditorName}</p>
                  <p className="font-mono text-xs text-slate-500 mt-1">
                    Signed cryptographically by Auditor UID: {d.auditorUid}
                  </p>
                  <p className="font-mono text-[10px] text-slate-400 mt-0.5">
                    Timestamp: {new Date().toISOString()} &nbsp;|&nbsp; Platform: Sentinel v3.0
                  </p>
                </div>
                <CheckCircle2 size={36} className="text-emerald-600" />
              </div>
            </div>
          </div>
        </section>

        <footer className="border-t border-slate-200 pt-6 mt-8">
          <p className="text-[10px] font-mono text-slate-400 text-center leading-relaxed tracking-wide">
            This document constitutes an official record of the Sentinel GRC v3.0 platform. It is legally binding under the
            organisation&apos;s internal audit charter. Unauthorised alteration is prohibited and cryptographically detectable.
            &nbsp;|&nbsp; {d.dossierRef}
          </p>
        </footer>
      </div>
    </div>
  );
};

function SectionHeader({ number, title, subtitle }: { number: string; title: string; subtitle: string }) {
  return (
    <div className="flex items-baseline gap-3">
      <span className="font-mono text-xs font-bold text-slate-400 tracking-widest uppercase w-6 flex-shrink-0">
        {number}.
      </span>
      <div>
        <h2 className="font-serif text-xl text-slate-900">{title}</h2>
        <p className="text-xs text-slate-500 font-sans mt-0.5">{subtitle}</p>
      </div>
    </div>
  );
}

function MetaField({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <p className="text-xs font-medium text-slate-400 uppercase tracking-widest mb-0.5">{label}</p>
      <p className="text-sm text-slate-800 font-sans">{value}</p>
    </div>
  );
}

function DateBlock({ label, value, sub, variant }: { label: string; value: string; sub: string; variant: 'neutral' | 'warning' | 'success' }) {
  const bg = variant === 'warning' ? 'bg-amber-50 border-amber-200' : variant === 'success' ? 'bg-emerald-50 border-emerald-200' : 'bg-slate-50 border-slate-200';
  const text = variant === 'warning' ? 'text-amber-900' : variant === 'success' ? 'text-emerald-900' : 'text-slate-900';
  const sub_text = variant === 'warning' ? 'text-amber-700' : variant === 'success' ? 'text-emerald-700' : 'text-slate-500';
  return (
    <div className={`border rounded-lg px-5 py-4 ${bg}`}>
      <p className="text-xs font-medium text-slate-400 uppercase tracking-widest mb-1">{label}</p>
      <p className={`font-serif text-xl font-bold ${text}`}>{value}</p>
      <p className={`text-xs font-sans mt-1 ${sub_text}`}>{sub}</p>
    </div>
  );
}

function formatDate(dateStr: string): string {
  const d = new Date(dateStr);
  return d.toLocaleDateString('en-GB', { day: '2-digit', month: 'long', year: 'numeric' });
}

function daysBetween(from: string, to: string): number {
  const a = new Date(from);
  const b = new Date(to);
  return Math.round((b.getTime() - a.getTime()) / (1000 * 60 * 60 * 24));
}
