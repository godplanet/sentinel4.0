/**
 * Mevzuat Kütüphanesi API — CRUD + Doküman Yönetimi
 *
 * Veritabanı: compliance_regulations tablosu
 *   (20260210192339_create_compliance_regulations_table.sql)
 *
 * Doküman yükleme: Supabase Storage 'regulation-docs' bucket'ı kullanılır.
 * Dosya meta verileri regulation kaydının metadata.documents JSONB alanında tutulur.
 * (Hard-delete yasaktır — is_active=false ile soft-delete yapılır.)
 */

import { supabase } from '@/shared/api/supabase';

// ─── Tipler ──────────────────────────────────────────────────────────────────

export type RegCategory = 'BDDK' | 'TCMB' | 'MASAK' | 'SPK' | 'KVKK' | 'DIGER';
export type RegSeverity = 'critical' | 'high' | 'medium' | 'low';

export interface RegulationDocument {
  id: string;
  name: string;
  storage_path: string;
  public_url: string;
  mime_type: string;
  size_bytes: number;
  uploaded_at: string;
  uploaded_by?: string;
}

export interface ComplianceRegulation {
  id: string;
  tenant_id?: string;
  code: string;
  title: string;
  category: RegCategory;
  article?: string | null;
  description: string;
  severity: RegSeverity;
  framework?: string | null;
  is_active: boolean;
  metadata: {
    documents?: RegulationDocument[];
    [key: string]: unknown;
  };
  created_at: string;
  updated_at: string;
}

export interface RegulationFilters {
  search?: string;
  categories?: RegCategory[];
  severities?: RegSeverity[];
  framework?: string;
  is_active?: boolean;
}

export interface CreateRegulationInput {
  code: string;
  title: string;
  category: RegCategory;
  article?: string;
  description: string;
  severity: RegSeverity;
  framework?: string;
}

// ─── Storage Bucket Sabitler ─────────────────────────────────────────────────

const STORAGE_BUCKET = 'regulation-docs';

/** Yüklemeye izin verilen MIME tipleri ve uzantılar */
export const ALLOWED_MIME_TYPES: Record<string, string> = {
  'application/pdf': 'PDF',
  'application/msword': 'Word',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document': 'Word',
  'application/vnd.ms-excel': 'Excel',
  'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet': 'Excel',
  'application/vnd.ms-powerpoint': 'PowerPoint',
  'application/vnd.openxmlformats-officedocument.presentationml.presentation': 'PowerPoint',
  'text/html': 'HTML',
  'text/plain': 'Metin',
  'application/rtf': 'RTF',
};

export const ALLOWED_EXTENSIONS = '.pdf,.doc,.docx,.xls,.xlsx,.ppt,.pptx,.html,.txt,.rtf';

// ─── Query Fonksiyonları ──────────────────────────────────────────────────────

/** Tüm aktif/pasif mevzuatları filtreli çeker */
export async function fetchRegulations(
  filters: RegulationFilters = {},
): Promise<ComplianceRegulation[]> {
  let query = supabase
    .from('compliance_regulations')
    .select('*')
    .order('updated_at', { ascending: false });

  if (filters.is_active !== undefined) {
    query = query.eq('is_active', filters.is_active);
  }

  if (filters.categories && filters.categories.length > 0) {
    query = query.in('category', filters.categories);
  }

  if (filters.severities && filters.severities.length > 0) {
    query = query.in('severity', filters.severities);
  }

  if (filters.framework) {
    query = query.ilike('framework', `%${filters.framework}%`);
  }

  if (filters.search) {
    query = query.or(
      `title.ilike.%${filters.search}%,code.ilike.%${filters.search}%,description.ilike.%${filters.search}%`,
    );
  }

  const { data, error } = await query;
  if (error) throw error;
  return (data ?? []) as ComplianceRegulation[];
}

/** Tek bir mevzuatı ID ile çeker */
export async function fetchRegulationById(id: string): Promise<ComplianceRegulation | null> {
  const { data, error } = await supabase
    .from('compliance_regulations')
    .select('*')
    .eq('id', id)
    .maybeSingle();

  if (error) throw error;
  return data as ComplianceRegulation | null;
}

/** Özet istatistikleri döner */
export async function fetchRegulationStats(): Promise<{
  total: number;
  active: number;
  critical: number;
  pending_review: number;
}> {
  const { data, error } = await supabase
    .from('compliance_regulations')
    .select('id, is_active, severity');

  if (error) throw error;
  const rows = data ?? [];
  return {
    total: rows.length,
    active: rows.filter((r) => r.is_active).length,
    critical: rows.filter((r) => r.severity === 'critical').length,
    pending_review: rows.filter((r) => !r.is_active).length,
  };
}

// ─── Mutation Fonksiyonları ───────────────────────────────────────────────────

/** Yeni mevzuat kaydı oluşturur */
export async function createRegulation(
  input: CreateRegulationInput,
): Promise<ComplianceRegulation> {
  const { data: tenantRow } = await supabase
    .from('tenants')
    .select('id')
    .limit(1)
    .single();

  const { data, error } = await supabase
    .from('compliance_regulations')
    .insert({
      ...input,
      tenant_id: tenantRow?.id ?? null,
      is_active: true,
      metadata: { documents: [] },
    })
    .select('*')
    .single();

  if (error) throw error;
  return data as ComplianceRegulation;
}

/** Mevzuat kaydını günceller */
export async function updateRegulation(
  id: string,
  input: Partial<CreateRegulationInput>,
): Promise<void> {
  const { error } = await supabase
    .from('compliance_regulations')
    .update({ ...input, updated_at: new Date().toISOString() })
    .eq('id', id);

  if (error) throw error;
}

/** Soft-delete: is_active = false (hard delete yasaktır — adli iz) */
export async function archiveRegulation(id: string): Promise<void> {
  const { error } = await supabase
    .from('compliance_regulations')
    .update({ is_active: false, updated_at: new Date().toISOString() })
    .eq('id', id);

  if (error) throw error;
}

/** Arşivlenmiş kaydı yeniden aktif eder */
export async function restoreRegulation(id: string): Promise<void> {
  const { error } = await supabase
    .from('compliance_regulations')
    .update({ is_active: true, updated_at: new Date().toISOString() })
    .eq('id', id);

  if (error) throw error;
}

// ─── Doküman Yükleme ─────────────────────────────────────────────────────────

/**
 * Dosyayı Supabase Storage'a yükler ve mevzuat kaydının metadata.documents
 * dizisine ekler.
 *
 * Bucket: regulation-docs (oluşturulmalı — Supabase Dashboard > Storage)
 */
export async function uploadRegulationDocument(
  regulationId: string,
  file: File,
  uploadedBy?: string,
): Promise<RegulationDocument> {
  const ext = file.name.split('.').pop() ?? '';
  const storagePath = `${regulationId}/${Date.now()}_${file.name.replace(/\s+/g, '_')}`;

  // 1. Dosyayı Storage'a yükle
  const { error: uploadError } = await supabase.storage
    .from(STORAGE_BUCKET)
    .upload(storagePath, file, {
      contentType: file.type,
      upsert: false,
    });

  if (uploadError) throw uploadError;

  // 2. Public URL al
  const { data: urlData } = supabase.storage
    .from(STORAGE_BUCKET)
    .getPublicUrl(storagePath);

  const newDoc: RegulationDocument = {
    id: crypto.randomUUID(),
    name: file.name,
    storage_path: storagePath,
    public_url: urlData.publicUrl,
    mime_type: file.type,
    size_bytes: file.size,
    uploaded_at: new Date().toISOString(),
    uploaded_by: uploadedBy,
  };

  // 3. Mevcut metadata.documents dizisine ekle
  const existing = await fetchRegulationById(regulationId);
  const existingDocs = existing?.metadata?.documents ?? [];

  const { error: updateError } = await supabase
    .from('compliance_regulations')
    .update({
      metadata: { ...(existing?.metadata ?? {}), documents: [...existingDocs, newDoc] },
      updated_at: new Date().toISOString(),
    })
    .eq('id', regulationId);

  if (updateError) throw updateError;

  return newDoc;
}

/** Dokümanı Storage'dan siler ve metadata dizisinden kaldırır */
export async function deleteRegulationDocument(
  regulationId: string,
  docId: string,
): Promise<void> {
  const existing = await fetchRegulationById(regulationId);
  if (!existing) throw new Error('Mevzuat kaydı bulunamadı.');

  const doc = existing.metadata.documents?.find((d) => d.id === docId);
  if (!doc) throw new Error('Doküman bulunamadı.');

  // Storage'dan sil
  await supabase.storage.from(STORAGE_BUCKET).remove([doc.storage_path]);

  // Metadata'dan çıkar
  const updatedDocs = (existing.metadata.documents ?? []).filter((d) => d.id !== docId);
  await supabase
    .from('compliance_regulations')
    .update({
      metadata: { ...existing.metadata, documents: updatedDocs },
      updated_at: new Date().toISOString(),
    })
    .eq('id', regulationId);
}
