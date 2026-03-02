/**
 * Sihirli Link ve Adli Okundu (Read-Receipt) API
 *
 * Gerekli DB tabloları (backend takımı DDL eklemeli):
 *
 *   CREATE TABLE IF NOT EXISTS report_magic_links (
 *     id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
 *     tenant_id UUID NOT NULL,
 *     report_id UUID NOT NULL REFERENCES reports(id) ON DELETE CASCADE,
 *     access_token TEXT NOT NULL UNIQUE DEFAULT encode(gen_random_bytes(32), 'hex'),
 *     created_by UUID,
 *     created_by_name TEXT,
 *     recipient_name TEXT,
 *     expires_at TIMESTAMPTZ NOT NULL DEFAULT (now() + interval '30 days'),
 *     created_at TIMESTAMPTZ NOT NULL DEFAULT now()
 *   );
 *
 *   CREATE TABLE IF NOT EXISTS report_read_receipts (
 *     id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
 *     magic_link_id UUID NOT NULL REFERENCES report_magic_links(id) ON DELETE CASCADE,
 *     report_id UUID NOT NULL,
 *     reader_name TEXT,
 *     reader_ip TEXT,
 *     read_at TIMESTAMPTZ NOT NULL DEFAULT now()
 *   );
 *
 * Rapor PDF olarak e-posta ile gönderme YASAKTIR (BDDK gizlilik kuralı).
 * Bunun yerine bu token tabanlı link mekanizması kullanılır.
 */

import { supabase } from '@/shared/api/supabase';

export interface MagicLink {
  id: string;
  report_id: string;
  access_token: string;
  created_by_name: string | null;
  recipient_name: string | null;
  expires_at: string;
  created_at: string;
}

export interface ReadReceipt {
  id: string;
  magic_link_id: string;
  report_id: string;
  reader_name: string | null;
  reader_ip: string | null;
  read_at: string;
}

/** Bir rapor için Sihirli Link oluşturur (30 gün geçerli). */
export async function createMagicLink(params: {
  reportId: string;
  recipientName?: string;
  createdByName?: string;
}): Promise<MagicLink> {
  const { data: tenantRow } = await supabase
    .from('tenants')
    .select('id')
    .limit(1)
    .single();

  const tenantId = tenantRow?.id;
  if (!tenantId) throw new Error('Tenant bulunamadı.');

  const expiresAt = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString();

  const { data, error } = await supabase
    .from('report_magic_links')
    .insert({
      tenant_id: tenantId,
      report_id: params.reportId,
      recipient_name: params.recipientName ?? null,
      created_by_name: params.createdByName ?? null,
      expires_at: expiresAt,
    })
    .select('*')
    .single();

  if (error) throw error;
  return data as MagicLink;
}

/** Bir rapora ait tüm magic link'leri getirir. */
export async function fetchMagicLinks(reportId: string): Promise<MagicLink[]> {
  const { data, error } = await supabase
    .from('report_magic_links')
    .select('*')
    .eq('report_id', reportId)
    .order('created_at', { ascending: false });

  if (error) throw error;
  return (data ?? []) as MagicLink[];
}

/** Bir rapora ait tüm okundu kayıtlarını getirir. */
export async function fetchReadReceipts(reportId: string): Promise<ReadReceipt[]> {
  const { data, error } = await supabase
    .from('report_read_receipts')
    .select('*')
    .eq('report_id', reportId)
    .order('read_at', { ascending: false });

  if (error) throw error;
  return (data ?? []) as ReadReceipt[];
}
