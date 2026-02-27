/**
 * SENTINEL v3.0 - FINDING SUPABASE API
 *
 * Bulgu yönetimi için Supabase CRUD operasyonları.
 * Mock data yerine gerçek veritabanı bağlantısı.
 */

import { supabase } from '@/shared/api/supabase';
import { ACTIVE_TENANT_ID } from '@/shared/lib/constants';
import type { ComprehensiveFinding } from '../model/types';

// =====================================================
// TYPE MAPPING (Database → UI)
// =====================================================

interface DBFinding {
  id: string;
  engagement_id: string;
  title: string;
  severity: string;
  details: any; // JSONB
  status: string;
  state?: string;

  // Risk Scoring
  impact_score?: number;
  likelihood_score?: number;
  impact_financial?: number;
  impact_legal?: number;
  impact_reputation?: number;
  impact_operational?: number;
  control_effectiveness?: number;
  calculated_score?: number;
  final_severity?: string;
  is_veto_triggered?: boolean;

  // GIAS & BDDK
  gias_category?: string;
  financial_impact?: number;
  asset_criticality?: string;

  // Workflow
  auditee_id?: string;
  auditee_department?: string;
  assigned_to?: string;
  remediation_date?: string;
  negotiation_started_at?: string;
  agreed_at?: string;
  finalized_at?: string;
  sla_type?: string;

  // Metadata
  created_at: string;
  updated_at?: string;
}

/**
 * Veritabanından gelen ham veriyi UI için uyumlu formata dönüştürür
 */
function mapDBToUI(dbFinding: DBFinding): ComprehensiveFinding {
  const details = dbFinding.details || {};

  return {
    id: dbFinding.id,
    title: dbFinding.title,
    status: dbFinding.state || dbFinding.status?.toLowerCase() || 'draft',

    // Risk Data
    impact: dbFinding.impact_score || 1,
    likelihood: dbFinding.likelihood_score || 1,
    control_effectiveness: dbFinding.control_effectiveness || 1,
    severity: dbFinding.final_severity || dbFinding.severity,
    risk_score: dbFinding.calculated_score || 0,

    // 5C Content (JSONB'den çekiyoruz)
    criteria: details.criteria || details.condition || '',
    condition: details.condition || '',
    cause: details.cause || details.root_cause?.description || '',
    consequence: details.consequence || details.impact || '',
    corrective_action: details.corrective_action || details.recommendation || '',

    // Metadata
    category: dbFinding.gias_category || details.category || '',
    department: dbFinding.auditee_department || details.department || '',
    tags: details.tags || [],

    // Framework Detection
    audit_framework: details.audit_framework || 'STANDARD',
    bddk_deficiency_type: details.bddk_deficiency_type || null,

    // GIS 2024 Metadata
    risk_category: details.risk_category || '',
    process_id: details.process_id || '',
    subprocess_id: details.subprocess_id || '',
    control_id: details.control_id || '',

    // Evidence
    evidence_files: details.evidence_files || [],

    // Cross-Linking
    related_items: details.related_items || [],

    // Activity Log (Şimdilik details'den, ileride ayrı tablo)
    activity_log: details.activity_log || [],

    // Workflow
    target_date: dbFinding.remediation_date || '',
    rejection_reason: details.rejection_reason || '',

    // Secrets (Hassas Bilgiler)
    secrets: details.secrets || {},
    internal_notes: details.internal_notes || '',

    // Müzakere
    action_plans: details.action_plans || [],

    // Timestamps
    created_at: dbFinding.created_at,
    updated_at: dbFinding.updated_at,
  };
}

/**
 * UI'dan gelen veriyi veritabanı formatına dönüştürür
 */
function mapUIToDB(uiFinding: Partial<ComprehensiveFinding>): Partial<DBFinding> {
  const details: any = {
    // 5C Content
    criteria: uiFinding.criteria || '',
    condition: uiFinding.condition || '',
    cause: uiFinding.cause || '',
    consequence: uiFinding.consequence || '',
    corrective_action: uiFinding.corrective_action || '',

    // Metadata
    category: uiFinding.category || '',
    department: uiFinding.department || '',
    tags: uiFinding.tags || [],

    // Framework
    audit_framework: uiFinding.audit_framework || 'STANDARD',
    bddk_deficiency_type: uiFinding.bddk_deficiency_type || null,

    // GIS 2024
    risk_category: uiFinding.risk_category || '',
    process_id: uiFinding.process_id || '',
    subprocess_id: uiFinding.subprocess_id || '',
    control_id: uiFinding.control_id || '',

    // Evidence
    evidence_files: uiFinding.evidence_files || [],

    // Cross-Linking
    related_items: uiFinding.related_items || [],

    // Activity Log
    activity_log: uiFinding.activity_log || [],

    // Workflow
    rejection_reason: uiFinding.rejection_reason || '',

    // Secrets
    secrets: uiFinding.secrets || {},
    internal_notes: uiFinding.internal_notes || '',

    // Müzakere
    action_plans: uiFinding.action_plans || [],
  };

  return {
    title: uiFinding.title,
    severity: uiFinding.severity?.toUpperCase() || 'LOW',
    status: uiFinding.status?.toUpperCase() || 'DRAFT',
    state: uiFinding.status || 'DRAFT',
    details,

    // Risk Scoring
    impact_score: uiFinding.impact || 1,
    likelihood_score: uiFinding.likelihood || 1,
    control_effectiveness: uiFinding.control_effectiveness || 1,
    calculated_score: uiFinding.risk_score || 0,
    final_severity: uiFinding.severity,
    is_veto_triggered: (uiFinding.impact || 1) * (uiFinding.likelihood || 1) > 20,

    // GIAS
    gias_category: uiFinding.category,

    // Workflow
    auditee_department: uiFinding.department,
    remediation_date: uiFinding.target_date,
  };
}

// =====================================================
// CRUD OPERATIONS
// =====================================================

/**
 * Tek bir bulguyu ID ile getirir
 */
export async function fetchFinding(id: string): Promise<ComprehensiveFinding | null> {
  try {
    const { data, error } = await supabase
      .from('audit_findings')
      .select('*')
      .eq('id', id)
      .maybeSingle();

    if (error) {
      console.error('Fetch Finding Error:', error);
      throw new Error(`Bulgu yüklenemedi: ${error.message}`);
    }

    if (!data) {
      return null;
    }

    return mapDBToUI(data as DBFinding);
  } catch (err) {
    console.error('Fetch Finding Exception:', err);
    throw err;
  }
}

/**
 * Yeni bir bulgu oluşturur
 * @param finding - UI Finding object
 * @param engagementId - Bağlı olduğu denetim engagement_id
 */
export async function createFinding(
  finding: Partial<ComprehensiveFinding>,
  engagementId: string
): Promise<ComprehensiveFinding> {
  try {
    const dbData = mapUIToDB(finding);

    const { data, error } = await supabase
      .from('audit_findings')
      .insert({
        ...dbData,
        engagement_id: engagementId,
        tenant_id: ACTIVE_TENANT_ID,
      })
      .select()
      .single();

    if (error) {
      console.error('Create Finding Error:', error);
      throw new Error(`Bulgu oluşturulamadı: ${error.message}`);
    }

    return mapDBToUI(data as DBFinding);
  } catch (err) {
    console.error('Create Finding Exception:', err);
    throw err;
  }
}

/**
 * Mevcut bir bulguyu günceller
 */
export async function updateFinding(
  id: string,
  updates: Partial<ComprehensiveFinding>
): Promise<ComprehensiveFinding> {
  try {
    // Önce mevcut kaydı çek
    const existing = await fetchFinding(id);
    if (!existing) {
      throw new Error('Bulgu bulunamadı');
    }

    // Merge existing details with new updates
    const mergedFinding = { ...existing, ...updates };
    const dbData = mapUIToDB(mergedFinding);

    const { data, error } = await supabase
      .from('audit_findings')
      .update(dbData)
      .eq('id', id)
      .select()
      .single();

    if (error) {
      console.error('Update Finding Error:', error);
      throw new Error(`Bulgu güncellenemedi: ${error.message}`);
    }

    return mapDBToUI(data as DBFinding);
  } catch (err) {
    console.error('Update Finding Exception:', err);
    throw err;
  }
}

/**
 * Engagement'a ait tüm bulguları getirir (Liste görünümü için)
 */
export async function fetchFindingsByEngagement(engagementId: string): Promise<ComprehensiveFinding[]> {
  try {
    const { data, error } = await supabase
      .from('audit_findings')
      .select('*')
      .eq('engagement_id', engagementId)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Fetch Findings Error:', error);
      throw new Error(`Bulgular yüklenemedi: ${error.message}`);
    }

    return (data || []).map((item) => mapDBToUI(item as DBFinding));
  } catch (err) {
    console.error('Fetch Findings Exception:', err);
    throw err;
  }
}

/**
 * Tüm bulguları getirir (Admin/Genel Arama için)
 */
export async function fetchAllFindings(): Promise<ComprehensiveFinding[]> {
  try {
    const { data, error } = await supabase
      .from('audit_findings')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(100); // Performance için limit

    if (error) {
      console.error('Fetch All Findings Error:', error);
      throw new Error(`Bulgular yüklenemedi: ${error.message}`);
    }

    return (data || []).map((item) => mapDBToUI(item as DBFinding));
  } catch (err) {
    console.error('Fetch All Findings Exception:', err);
    throw err;
  }
}

/**
 * Bulguyu siler (Soft Delete - Status'u DELETED yapar)
 */
export async function deleteFinding(id: string): Promise<void> {
  try {
    const { error } = await supabase
      .from('audit_findings')
      .update({ status: 'DELETED' })
      .eq('id', id);

    if (error) {
      console.error('Delete Finding Error:', error);
      throw new Error(`Bulgu silinemedi: ${error.message}`);
    }
  } catch (err) {
    console.error('Delete Finding Exception:', err);
    throw err;
  }
}
