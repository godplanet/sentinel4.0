import { supabase } from '@/shared/api/supabase';

export interface VendorToken {
  id: string;
  vendor_id: string;
  assessment_id: string;
  token: string;
  expires_at: string;
  is_used: boolean;
  created_at: string;
}

export interface VendorPortalData {
  vendor: {
    id: string;
    name: string;
    email: string | null;
    contact_person: string | null;
  };
  assessment: {
    id: string;
    title: string;
    status: string;
    due_date: string | null;
  };
  questions: Array<{
    id: string;
    question_text: string;
    vendor_response: string | null;
    category: string | null;
  }>;
}

export async function validateToken(token: string): Promise<{
  valid: boolean;
  tokenData?: VendorToken;
  error?: string;
}> {
  const { data, error } = await supabase
    .from('vendor_access_tokens')
    .select('*')
    .eq('token', token)
    .maybeSingle();

  if (error) return { valid: false, error: 'Dogrulama hatasi.' };
  if (!data) return { valid: false, error: 'Gecersiz erisim anahtari.' };

  const tokenData = data as VendorToken;

  if (tokenData.is_used) {
    return { valid: false, error: 'Bu erisim anahtari daha once kullanilmis.' };
  }

  if (new Date(tokenData.expires_at) < new Date()) {
    return { valid: false, error: 'Bu erisim anahtarinin suresi dolmus.' };
  }

  return { valid: true, tokenData };
}

export async function loadPortalData(vendorId: string, assessmentId: string): Promise<VendorPortalData | null> {
  const [vendorRes, assessmentRes, questionsRes] = await Promise.all([
    supabase.from('tprm_vendors').select('id, name, email, contact_person').eq('id', vendorId).maybeSingle(),
    supabase.from('tprm_assessments').select('id, title, status, due_date').eq('id', assessmentId).maybeSingle(),
    supabase.from('tprm_assessment_answers').select('id, question_text, vendor_response, category').eq('assessment_id', assessmentId).order('created_at', { ascending: true }),
  ]);

  if (vendorRes.error || !vendorRes.data) return null;
  if (assessmentRes.error || !assessmentRes.data) return null;

  return {
    vendor: vendorRes.data,
    assessment: assessmentRes.data,
    questions: questionsRes.data || [],
  };
}

export async function submitVendorResponses(
  assessmentId: string,
  responses: Array<{ id: string; vendor_response: string }>,
) {
  const updates = responses.map((r) =>
    supabase
      .from('tprm_assessment_answers')
      .update({ vendor_response: r.vendor_response, updated_at: new Date().toISOString() })
      .eq('id', r.id),
  );

  await Promise.all(updates);

  await supabase
    .from('tprm_assessments')
    .update({ status: 'In Progress', updated_at: new Date().toISOString() })
    .eq('id', assessmentId);
}

export async function markTokenUsed(tokenId: string) {
  await supabase
    .from('vendor_access_tokens')
    .update({ is_used: true })
    .eq('id', tokenId);
}

export async function generateToken(vendorId: string, assessmentId: string, expiresInDays = 7): Promise<string> {
  const token = `vp-${Date.now()}-${Math.random().toString(36).slice(2, 10)}`;
  const expires = new Date();
  expires.setDate(expires.getDate() + expiresInDays);

  await supabase.from('vendor_access_tokens').insert({
    vendor_id: vendorId,
    assessment_id: assessmentId,
    token,
    expires_at: expires.toISOString(),
  });

  return token;
}
