export interface RiskMapping {
  nodeId: string;
  riskLabel: string;
  severity: 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW';
}

export interface ProcessMap {
  id: string;
  title: string;
  department_id: string | null;
  nodes_json: Array<{
    id: string;
    type?: string;
    data: { label: string };
    position: { x: number; y: number };
  }>;
  edges_json: Array<{
    id: string;
    source: string;
    target: string;
    label?: string;
    animated?: boolean;
  }>;
  risk_mappings: RiskMapping[];
  version_hash: string | null;
  created_at: string;
  updated_at: string;
}

// ─── Canvas düğüm tipleri ─────────────────────────────────────────────────────

export type CanvasNodeType = 'processNode' | 'riskNode' | 'controlNode';

export type NodeSeverity = 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW';

export type ControlType = 'PREVENTIVE' | 'DETECTIVE' | 'CORRECTIVE';

export type ProcessNodeData = {
  label: string;
  description?: string;
} & Record<string, unknown>;

export type RiskNodeData = {
  label: string;
  severity?: NodeSeverity;
  description?: string;
} & Record<string, unknown>;

export type ControlNodeData = {
  label: string;
  controlType?: ControlType;
  description?: string;
} & Record<string, unknown>;
