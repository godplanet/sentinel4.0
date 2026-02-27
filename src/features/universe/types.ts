export interface UniverseEntityRow {
  id: string;
  parent_id: string | null;
  path: string;
  name: string;
  type: 'DIVISION' | 'DEPARTMENT' | 'PROCESS' | 'ASSET';
  category: 'BUSINESS' | 'IT' | 'SUPPORT' | 'REGULATION';
  manager: string | null;
  risk_weight: number;
  created_at: string;
}

export interface UniverseNode extends UniverseEntityRow {
  children: UniverseNode[];
  stats: {
    totalRiskScore: number;
    auditGrade: 'A' | 'B' | 'C' | 'D' | 'F' | '-';
    lastAuditDate: string | null;
    findingCount: number;
  };
  computed: {
    depth: number;
    isLeaf: boolean;
  }
}

export interface UniverseFilter {
  type?: UniverseEntityRow['type'];
  minRiskScore?: number;
  searchText?: string;
}

export interface AuditEntity {
  id: string;
  code: string;
  name: string;
  manager: string;
  category: 'IT' | 'Business' | 'Support' | 'Regulation';
  last_audit: string;
  audit_grade: 'A' | 'B' | 'C' | 'D' | 'F' | '-';
  audit_score: number;
  total_score: number;
  description?: string;
}
