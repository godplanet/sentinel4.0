export interface UniverseNode {
  id: string;
  name: string;
  path: string;
  type: string;
  inherent_risk: number;
  residual_risk: number;
  owner_id: string | null;
  tenant_id?: string;
  cascade_risk?: number;
  risk_velocity?: number;
  shariah_impact?: number;
  esg_impact?: number;
  children?: UniverseNode[];
}

export type EntityType =
  | 'HOLDING'
  | 'BANK'
  | 'GROUP'
  | 'UNIT'
  | 'PROCESS'
  | 'BRANCH'
  | 'DEPARTMENT'
  | 'HEADQUARTERS'
  | 'SUBSIDIARY'
  | 'VENDOR'
  | 'IT_ASSET';

export interface BranchMetadata {
  turnover_rate?: number;
  transaction_volume?: number;
  staff_count?: number;
  region?: string;
}

export interface ITAssetMetadata {
  criticality_level?: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  cpe_id?: string;
  last_patch_date?: string;
  system_type?: string;
  owner_team?: string;
}

export interface VendorMetadata {
  contract_date?: string;
  contract_expiry?: string;
  risk_rating?: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  contract_status?: 'ACTIVE' | 'EXPIRED' | 'PENDING';
  service_type?: string;
  annual_spend?: number;
}

export interface SubsidiaryMetadata {
  ownership_percentage?: number;
  country?: string;
  industry?: string;
  consolidated?: boolean;
}

export type AuditFrequency = 'Yıllık' | '2 Yılda Bir' | '3 Yılda Bir' | 'Sürekli';

export interface AuditCycleInfo {
  last_audit_date?: string | null;
  audit_frequency?: AuditFrequency | null;
  next_audit_due?: string | null;
}

export interface RiskComponents {
  risk_operational?: number | null;
  risk_it?: number | null;
  risk_compliance?: number | null;
  risk_financial?: number | null;
}

export interface AuditEntity {
  id: string;
  tenant_id: string;
  path: string;
  name: string;
  type: EntityType;
  risk_score: number;
  velocity_multiplier: number;
  owner_id?: string;
  parent_id?: string | null;
  status?: string;
  metadata: Record<string, any> & Partial<BranchMetadata & ITAssetMetadata & VendorMetadata & SubsidiaryMetadata>;
  created_at: string;
  updated_at: string;
  children?: AuditEntity[];
  is_synced?: boolean;
  sync_source?: string;
  risk_signals?: string[];
  last_audit_date?: string | null;
  audit_frequency?: string | null;
  next_audit_due?: string | null;
  risk_operational?: number | null;
  risk_it?: number | null;
  risk_compliance?: number | null;
  risk_financial?: number | null;
}

export interface UniverseTreeNode extends AuditEntity {
  level: number;
  parent_path: string | null;
  effective_risk: number;
}

export interface UniverseFilters {
  type?: EntityType[];
  min_risk?: number;
  max_risk?: number;
  search?: string;
}

export interface UniverseStats {
  total_entities: number;
  by_type: Record<EntityType, number>;
  avg_risk: number;
  high_risk_count: number;
}
