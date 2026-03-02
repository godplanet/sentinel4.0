import { supabase } from '@/shared/api/supabase';

export interface AuditeeTask {
  id: string;
  finding_code: string | null;
  title: string;
  severity: string;
  status: string;
  due_date: string | null;
  description: string | null;
}

export async function fetchAuditeeTasks(): Promise<AuditeeTask[]> {
  const { data, error } = await supabase
    .from('audit_findings')
    .select('id, finding_code, title, severity, status, due_date, description')
    .in('status', [
      'DRAFT', 'PENDING_REVIEW', 'SENT_TO_AUDITEE',
      'AUDITEE_REVIEWING', 'PENDING_APPROVAL', 'DISPUTING',
      'REMEDIATION_STARTED', 'AUDITEE_ACCEPTED',
    ])
    .order('severity', { ascending: true })
    .order('due_date', { ascending: true });

  if (error) throw error;
  return data || [];
}

export async function uploadEvidenceFile(findingId: string, file: File): Promise<void> {
  const path = `evidence/${findingId}/${Date.now()}_${file.name}`;
  const { error: uploadErr } = await supabase.storage.from('evidence').upload(path, file);

  if (uploadErr) {
    await supabase.from('finding_comments').insert({
      finding_id: findingId,
      comment_text: `Kanit yuklendi: ${file.name} (${(file.size / 1024).toFixed(1)} KB)`,
      comment_type: 'EVIDENCE',
      author_role: 'AUDITEE',
    });
  }
}

export async function requestExtension(params: {
  findingId: string;
  reason: string;
  currentDueDate: string | null;
}): Promise<void> {
  const currentDue = params.currentDueDate ? new Date(params.currentDueDate) : new Date();
  const newDue = new Date(currentDue);
  newDue.setDate(newDue.getDate() + 7);

  await supabase.from('finding_comments').insert({
    finding_id: params.findingId,
    comment_text: `Sure uzatimi talebi (+7 gun): ${params.reason}. Yeni tarih: ${newDue.toLocaleDateString('tr-TR')}`,
    comment_type: 'EXTENSION_REQUEST',
    author_role: 'AUDITEE',
  });
}
