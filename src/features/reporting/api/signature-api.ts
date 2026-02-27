import { supabase } from '@/shared/api/supabase';
import type {
  ReportSignature,
  CreateSignatureData,
  SignatureChainStatus,
  ReportSnapshot,
  SignatureStep,
} from '@/entities/report/model/types';

const SIGNATURE_WORKFLOW: SignatureStep[] = [
  {
    role: 'CREATOR',
    title: 'Hazırlayan',
    description: 'Raporu hazırlayan denetçi',
    order_index: 0,
    required: true,
  },
  {
    role: 'MANAGER',
    title: 'Yönetici',
    description: 'Denetim yöneticisi / Kıdemli denetçi',
    order_index: 1,
    required: true,
  },
  {
    role: 'CAE',
    title: 'Teftiş Kurulu Başkanı',
    description: 'Baş denetçi / CAE',
    order_index: 2,
    required: true,
  },
];

export async function getReportSignatures(reportId: string): Promise<ReportSignature[]> {
  const { data, error } = await supabase
    .from('report_signatures')
    .select('*')
    .eq('report_id', reportId)
    .order('order_index', { ascending: true });

  if (error) throw error;
  return data || [];
}

export async function getSignatureChainStatus(
  reportId: string
): Promise<SignatureChainStatus> {
  const signatures = await getReportSignatures(reportId);

  const signedOrDissent = signatures.filter(
    (s) => s.status === 'signed' || s.status === 'signed_with_dissent'
  );

  const hasRejection = signatures.some((s) => s.status === 'rejected');

  const signedRoles = new Set(signedOrDissent.map((s) => s.signer_role));
  const pendingRoles = SIGNATURE_WORKFLOW.filter(
    (step) => !signedRoles.has(step.role)
  ).map((step) => step.role);

  const currentStep = signedOrDissent.length;
  const totalSteps = SIGNATURE_WORKFLOW.length;

  const completed = currentStep === totalSteps && !hasRejection;
  const canPublish = completed;

  return {
    completed,
    current_step: currentStep,
    total_steps: totalSteps,
    signatures,
    pending_roles: pendingRoles,
    can_publish: canPublish,
  };
}

export async function addSignature(data: CreateSignatureData): Promise<ReportSignature> {
  const { data: tenants } = await supabase.from('tenants').select('id').limit(1).single();
  const tenantId = tenants?.id;

  if (!tenantId) throw new Error('Tenant not found');

  const { data: result, error } = await supabase.rpc('add_report_signature', {
    p_tenant_id: tenantId,
    p_report_id: data.report_id,
    p_user_id: data.user_id || null,
    p_signer_name: data.signer_name,
    p_signer_role: data.signer_role,
    p_signer_title: data.signer_title,
    p_status: data.status,
    p_order_index: data.order_index,
    p_dissent_comment: data.dissent_comment || null,
  });

  if (error) throw error;

  const signatures = await getReportSignatures(data.report_id);
  return signatures.find((s) => s.order_index === data.order_index)!;
}

export async function approveReport(
  reportId: string,
  signerName: string,
  signerRole: string,
  signerTitle: string,
  orderIndex: number,
  userId?: string
): Promise<ReportSignature> {
  return addSignature({
    report_id: reportId,
    user_id: userId,
    signer_name: signerName,
    signer_role: signerRole as any,
    signer_title: signerTitle,
    status: 'signed',
    order_index: orderIndex,
  });
}

export async function approveWithDissent(
  reportId: string,
  signerName: string,
  signerRole: string,
  signerTitle: string,
  orderIndex: number,
  dissentComment: string,
  userId?: string
): Promise<ReportSignature> {
  return addSignature({
    report_id: reportId,
    user_id: userId,
    signer_name: signerName,
    signer_role: signerRole as any,
    signer_title: signerTitle,
    status: 'signed_with_dissent',
    order_index: orderIndex,
    dissent_comment: dissentComment,
  });
}

export async function rejectReport(
  reportId: string,
  signerName: string,
  signerRole: string,
  signerTitle: string,
  orderIndex: number,
  rejectionReason: string,
  userId?: string
): Promise<ReportSignature> {
  return addSignature({
    report_id: reportId,
    user_id: userId,
    signer_name: signerName,
    signer_role: signerRole as any,
    signer_title: signerTitle,
    status: 'rejected',
    order_index: orderIndex,
    dissent_comment: rejectionReason,
  });
}

export async function createReportSnapshot(
  reportId: string,
  snapshotData: ReportSnapshot,
  publishedBy?: string
): Promise<void> {
  const { error } = await supabase.rpc('create_report_snapshot', {
    p_report_id: reportId,
    p_snapshot_data: snapshotData as any,
    p_published_by: publishedBy || null,
  });

  if (error) throw error;
}

export async function getReportSnapshot(reportId: string): Promise<ReportSnapshot | null> {
  const { data, error } = await supabase
    .from('reports')
    .select('snapshot_data')
    .eq('id', reportId)
    .single();

  if (error) throw error;
  return data?.snapshot_data || null;
}

export async function publishReport(
  reportId: string,
  snapshotData: ReportSnapshot,
  publishedBy?: string
): Promise<void> {
  const chainStatus = await getSignatureChainStatus(reportId);

  if (!chainStatus.can_publish) {
    throw new Error('Signature chain incomplete. All approvals required before publishing.');
  }

  await createReportSnapshot(reportId, snapshotData, publishedBy);
}

export function getSignatureWorkflow(): SignatureStep[] {
  return SIGNATURE_WORKFLOW;
}

export function getNextSignatureStep(
  currentSignatures: ReportSignature[]
): SignatureStep | null {
  const signedRoles = new Set(
    currentSignatures
      .filter((s) => s.status === 'signed' || s.status === 'signed_with_dissent')
      .map((s) => s.signer_role)
  );

  return SIGNATURE_WORKFLOW.find((step) => !signedRoles.has(step.role)) || null;
}
