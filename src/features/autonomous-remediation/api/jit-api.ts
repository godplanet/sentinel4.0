/**
 * Just-In-Time (JIT) Yetki Kilidi API — Oto-Onarım Güvenlik Katmanı
 *
 * DB Gereksinimleri (yeni tablo):
 *
 *   CREATE TABLE IF NOT EXISTS system_jit_tokens (
 *     id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
 *     action_id       TEXT NOT NULL,
 *     target_system   TEXT NOT NULL,
 *     requested_by    TEXT NOT NULL,
 *     token_value     TEXT NOT NULL,
 *     expires_at      TIMESTAMPTZ NOT NULL,
 *     is_revoked      BOOLEAN DEFAULT FALSE,
 *     revoked_at      TIMESTAMPTZ,
 *     created_at      TIMESTAMPTZ DEFAULT NOW()
 *   );
 *
 *   -- RLS: Sadece CAE ve SYSTEM rolleri okuyabilir/yazabilir.
 */

import { supabase } from '@/shared/api/supabase';

export interface JitToken {
  id: string;
  action_id: string;
  target_system: string;
  requested_by: string;
  token_value: string;
  expires_at: string;
  is_revoked: boolean;
  revoked_at: string | null;
  created_at: string;
}

/**
 * 5 dakika ömürlü bir JIT token oluşturur.
 * Token değeri crypto.randomUUID() + timestamp karmasından üretilir.
 */
export async function requestJitToken(
  actionId: string,
  targetSystem: string,
  requestedBy: string,
): Promise<JitToken> {
  const expiresAt = new Date(Date.now() + 5 * 60 * 1000).toISOString();

  // Kriptografik olarak güvenli token değeri
  const rawToken = `${crypto.randomUUID()}-${Date.now()}`;
  const encoder = new TextEncoder();
  const hashBuffer = await crypto.subtle.digest('SHA-256', encoder.encode(rawToken));
  const tokenValue = Array.from(new Uint8Array(hashBuffer))
    .map((b) => b.toString(16).padStart(2, '0'))
    .join('')
    .substring(0, 32);

  const { data, error } = await supabase
    .from('system_jit_tokens')
    .insert({
      action_id: actionId,
      target_system: targetSystem,
      requested_by: requestedBy,
      token_value: tokenValue,
      expires_at: expiresAt,
    })
    .select()
    .single();

  if (error) throw error;
  return data as JitToken;
}

/**
 * Onarım tamamlandıktan sonra JIT token'ı iptal eder.
 * is_revoked = true, revoked_at = now() yazar.
 */
export async function revokeJitToken(tokenId: string): Promise<void> {
  const { error } = await supabase
    .from('system_jit_tokens')
    .update({
      is_revoked: true,
      revoked_at: new Date().toISOString(),
    })
    .eq('id', tokenId);

  if (error) throw error;
}

/**
 * Verilen action_id için aktif (süresi dolmamış, iptal edilmemiş) token kontrolü.
 */
export async function fetchActiveToken(actionId: string): Promise<JitToken | null> {
  const { data, error } = await supabase
    .from('system_jit_tokens')
    .select('*')
    .eq('action_id', actionId)
    .eq('is_revoked', false)
    .gt('expires_at', new Date().toISOString())
    .order('created_at', { ascending: false })
    .limit(1)
    .maybeSingle();

  if (error) throw error;
  return data as JitToken | null;
}
