import type { ActionRequest } from '@/entities/action/model/types';

export interface RiskAcceptance {
  request: ActionRequest & {
    finding_title: string;
    accepted_by: string;
    risk_description: string;
    acceptance_start: string;
  };
}

const now = new Date();
const addDays = (d: Date, n: number) => new Date(d.getTime() + n * 86400000);
const subDays = (d: Date, n: number) => new Date(d.getTime() - n * 86400000);
const toIso = (d: Date) => d.toISOString().split('T')[0];

export const MOCK_RISK_ACCEPTANCES: RiskAcceptance[] = [
  {
    request: {
      id: 'ra-001',
      action_id: 'ACT-2025-0221',
      type: 'risk_acceptance',
      justification:
        'Third-party vendor SLA prevents immediate remediation. Risk accepted for defined period pending contract renegotiation.',
      expiration_date: toIso(addDays(now, 4)),
      status: 'approved',
      reviewer_id: 'uid-cae-001',
      created_at: toIso(subDays(now, 86)),
      finding_title: 'Unpatched Legacy Authentication Module',
      accepted_by: 'Chief Audit Executive',
      risk_description: 'Authentication bypass vulnerability in legacy system CTL-AUTH-019',
      acceptance_start: toIso(subDays(now, 86)),
    },
  },
  {
    request: {
      id: 'ra-002',
      action_id: 'ACT-2025-0198',
      type: 'risk_acceptance',
      justification:
        'Remediation blocked pending capital project approval. Compensating controls in place. Annual board review scheduled.',
      expiration_date: toIso(addDays(now, 22)),
      status: 'approved',
      reviewer_id: 'uid-cae-001',
      created_at: toIso(subDays(now, 68)),
      finding_title: 'Segregation of Duties — Treasury Operations',
      accepted_by: 'Board Risk Committee',
      risk_description: 'SoD conflict in wire transfer approval chain identified during Q2 audit',
      acceptance_start: toIso(subDays(now, 68)),
    },
  },
  {
    request: {
      id: 'ra-003',
      action_id: 'ACT-2024-0887',
      type: 'risk_acceptance',
      justification:
        'Technology refresh programme underway. Risk mitigated by enhanced monitoring. Board exception active.',
      expiration_date: toIso(addDays(now, 57)),
      status: 'approved',
      reviewer_id: 'uid-cae-001',
      created_at: toIso(subDays(now, 33)),
      finding_title: 'End-of-Life Core Banking Infrastructure',
      accepted_by: 'CRO + Board Audit Committee',
      risk_description:
        'CBS version 6.2 reached vendor end-of-life. Security patches no longer available.',
      acceptance_start: toIso(subDays(now, 33)),
    },
  },
];
