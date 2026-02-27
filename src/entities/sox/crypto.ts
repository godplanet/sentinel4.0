import { generateRecordHash } from '@/shared/lib/crypto';

export async function computeSHA256(payload: Record<string, unknown>): Promise<string> {
  return generateRecordHash(payload);
}

export function buildSnapshotPayload(control: {
  code: string;
  description: string;
  category: string;
  risk_weight: number;
  department: string | null;
}, attestation: {
  status: string;
  attester_name: string;
  campaign_period: string;
  manager_comment: string;
}): Record<string, unknown> {
  return {
    control_code: control.code,
    control_desc: control.description,
    control_category: control.category,
    risk_weight: control.risk_weight,
    department: control.department,
    status: attestation.status,
    attester: attestation.attester_name,
    campaign: attestation.campaign_period,
    comment: attestation.manager_comment,
    signed_at: new Date().toISOString(),
    frozen: true,
  };
}
