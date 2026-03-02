/**
 * Varsayılan Risk Anayasası — Tek kaynak (Birim Karnesi fallback + seed.sql ile uyumlu).
 * risk_constitution_v3 tablosunda veri yokken veya seed sonrası varsayılan değerler.
 */

import type { RiskConstitutionData } from './types';

export const DEFAULT_RISK_CONSTITUTION: RiskConstitutionData = {
  id: 'fallback',
  tenant_id: '',
  is_active: true,
  version: '1.0',
  dimensions: [],
  impact_matrix: [],
  veto_rules: [],
  risk_ranges: [
    { label: 'A', min: 80, max: 100, color: '#22c55e' },
    { label: 'B', min: 60, max: 79, color: '#eab308' },
    { label: 'C', min: 40, max: 59, color: '#f97316' },
    { label: 'D', min: 20, max: 39, color: '#ef4444' },
    { label: 'E', min: 0, max: 19, color: '#991b1b' },
  ],
  created_at: new Date().toISOString(),
  updated_at: new Date().toISOString(),
};
