import { supabase } from '@/shared/api/supabase';
import type {
  TestStep,
  EvidenceRequest,
  EvidenceRequestStatus,
  WorkpaperFindingRow,
  ReviewNote,
  ActivityLog,
  ActivityActionType,
  ProcedureItem,
  Questionnaire,
  QuestionnaireQuestion,
} from '../model/detail-types';

export async function fetchTestSteps(workpaperId: string): Promise<TestStep[]> {
  const { data, error } = await supabase
    .from('workpaper_test_steps')
    .select('*')
    .eq('workpaper_id', workpaperId)
    .order('step_order', { ascending: true });

  if (error) throw error;
  return (data as TestStep[]) || [];
}

export async function toggleTestStep(stepId: string, isCompleted: boolean): Promise<void> {
  const { error } = await supabase
    .from('workpaper_test_steps')
    .update({ is_completed: isCompleted, updated_at: new Date().toISOString() })
    .eq('id', stepId);

  if (error) throw error;
}

export async function updateStepComment(stepId: string, comment: string): Promise<void> {
  const { error } = await supabase
    .from('workpaper_test_steps')
    .update({ auditor_comment: comment, updated_at: new Date().toISOString() })
    .eq('id', stepId);

  if (error) throw error;
}

export async function addTestStep(workpaperId: string, description: string, order: number): Promise<TestStep> {
  const { data, error } = await supabase
    .from('workpaper_test_steps')
    .insert({ workpaper_id: workpaperId, description, step_order: order })
    .select()
    .maybeSingle();

  if (error) throw error;
  return data as TestStep;
}

export async function fetchEvidenceRequests(workpaperId: string): Promise<EvidenceRequest[]> {
  const { data, error } = await supabase
    .from('evidence_requests')
    .select('*')
    .eq('workpaper_id', workpaperId)
    .order('created_at', { ascending: true });

  if (error) throw error;
  return (data as EvidenceRequest[]) || [];
}

export async function updateEvidenceStatus(requestId: string, status: EvidenceRequestStatus): Promise<void> {
  const { error } = await supabase
    .from('evidence_requests')
    .update({ status, updated_at: new Date().toISOString() })
    .eq('id', requestId);

  if (error) throw error;
}

export async function addEvidenceRequest(
  workpaperId: string,
  title: string,
  description: string,
  dueDate: string | null,
): Promise<EvidenceRequest> {
  const { data, error } = await supabase
    .from('evidence_requests')
    .insert({
      workpaper_id: workpaperId,
      title,
      description,
      due_date: dueDate,
    })
    .select()
    .maybeSingle();

  if (error) throw error;
  return data as EvidenceRequest;
}

export async function fetchWorkpaperFindings(workpaperId: string): Promise<WorkpaperFindingRow[]> {
  const { data, error } = await supabase
    .from('workpaper_findings')
    .select('*')
    .eq('workpaper_id', workpaperId)
    .order('created_at', { ascending: false });

  if (error) throw error;
  return (data as WorkpaperFindingRow[]) || [];
}

export async function addWorkpaperFinding(
  workpaperId: string,
  title: string,
  description: string,
  severity: string,
  sourceRef: string,
): Promise<WorkpaperFindingRow> {
  const { data, error } = await supabase
    .from('workpaper_findings')
    .insert({
      workpaper_id: workpaperId,
      title,
      description,
      severity,
      source_ref: sourceRef,
    })
    .select()
    .maybeSingle();

  if (error) throw error;
  return data as WorkpaperFindingRow;
}

export async function deleteWorkpaperFinding(findingId: string): Promise<void> {
  const { error } = await supabase
    .from('workpaper_findings')
    .delete()
    .eq('id', findingId);

  if (error) throw error;
}

export async function signOffWorkpaperAsPrepared(workpaperId: string, userId: string, displayName?: string): Promise<void> {
  const { error } = await supabase
    .from('workpapers')
    .update({
      prepared_by_user_id: userId,
      prepared_at: new Date().toISOString(),
      prepared_by_name: displayName || 'Denetci',
      approval_status: 'prepared',
    })
    .eq('id', workpaperId);

  if (error) throw error;
}

export async function signOffWorkpaperAsReviewed(workpaperId: string, userId: string, displayName?: string): Promise<void> {
  const { error } = await supabase
    .from('workpapers')
    .update({
      reviewed_by_user_id: userId,
      reviewed_at: new Date().toISOString(),
      reviewed_by_name: displayName || 'Supervizor',
      approval_status: 'reviewed',
    })
    .eq('id', workpaperId);

  if (error) throw error;
}

export async function fetchReviewNotes(workpaperId: string): Promise<ReviewNote[]> {
  const { data, error } = await supabase
    .from('review_notes')
    .select('*')
    .eq('workpaper_id', workpaperId)
    .order('created_at', { ascending: true });

  if (error) throw error;
  return (data as ReviewNote[]) || [];
}

export async function addReviewNote(
  workpaperId: string,
  noteText: string,
  authorName: string,
): Promise<ReviewNote> {
  const { data, error } = await supabase
    .from('review_notes')
    .insert({
      workpaper_id: workpaperId,
      note_text: noteText,
      author_name: authorName,
      status: 'Open',
    })
    .select()
    .maybeSingle();

  if (error) throw error;
  return data as ReviewNote;
}

export async function resolveReviewNote(noteId: string): Promise<void> {
  const { error } = await supabase
    .from('review_notes')
    .update({
      status: 'Resolved',
      resolved_at: new Date().toISOString(),
    })
    .eq('id', noteId);

  if (error) throw error;
}

export async function fetchActivityLogs(workpaperId: string): Promise<ActivityLog[]> {
  const { data, error } = await supabase
    .from('workpaper_activity_logs')
    .select('*')
    .eq('workpaper_id', workpaperId)
    .order('created_at', { ascending: false });

  if (error) throw error;
  return (data as ActivityLog[]) || [];
}

export async function addActivityLog(
  workpaperId: string,
  actionType: ActivityActionType,
  details: string,
  userName: string = 'Denetci',
): Promise<void> {
  const { error } = await supabase
    .from('workpaper_activity_logs')
    .insert({
      workpaper_id: workpaperId,
      action_type: actionType,
      details,
      user_name: userName,
    });

  if (error) throw error;
}

export async function fetchProcedureLibrary(): Promise<ProcedureItem[]> {
  const { data, error } = await supabase
    .from('procedure_library')
    .select('*')
    .order('category', { ascending: true });

  if (error) throw error;
  return (data as ProcedureItem[]) || [];
}

export async function fetchQuestionnaires(workpaperId: string): Promise<Questionnaire[]> {
  const { data, error } = await supabase
    .from('questionnaires')
    .select('*')
    .eq('workpaper_id', workpaperId)
    .order('created_at', { ascending: false });

  if (error) throw error;
  return (data as Questionnaire[]) || [];
}

export async function createQuestionnaire(
  workpaperId: string,
  title: string,
  questions: QuestionnaireQuestion[],
  sentTo: string,
): Promise<Questionnaire> {
  const { data, error } = await supabase
    .from('questionnaires')
    .insert({
      workpaper_id: workpaperId,
      title,
      questions_json: questions,
      sent_to: sentTo,
      status: 'Sent',
    })
    .select()
    .maybeSingle();

  if (error) throw error;
  return data as Questionnaire;
}

export async function updateQuestionnaireAnswers(
  questionnaireId: string,
  questions: QuestionnaireQuestion[],
): Promise<void> {
  const { error } = await supabase
    .from('questionnaires')
    .update({
      questions_json: questions,
      status: 'Responded',
      responded_at: new Date().toISOString(),
    })
    .eq('id', questionnaireId);

  if (error) throw error;
}

export async function markQuestionnaireReviewed(questionnaireId: string): Promise<void> {
  const { error } = await supabase
    .from('questionnaires')
    .update({ status: 'Reviewed' })
    .eq('id', questionnaireId);

  if (error) throw error;
}
