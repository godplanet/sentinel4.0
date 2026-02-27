import type { RiskConstitutionData } from '@/features/risk-constitution/types';
import type { GradingRules } from '@/features/risk-engine/methodology-types';

export function constitutionToGradingRules(constitution: RiskConstitutionData | null): GradingRules {
  if (!constitution) {
    return {
      deductions: { critical: 25, high: 10, medium: 3, low: 1 },
      capping: [
        { condition: 'count_critical >= 1', field: 'count_critical', operator: '>=', value: 1, max_score: 60, reason: 'Kritik bulgu mevcut - Maksimum not D' },
      ],
      scale: [
        { grade: 'A+', min: 95, max: 100, opinion: 'TAM_GUVENCE', label: 'Tam Guvence' },
        { grade: 'A',  min: 90, max: 94,  opinion: 'TAM_GUVENCE', label: 'Tam Guvence' },
        { grade: 'B+', min: 85, max: 89,  opinion: 'MAKUL_GUVENCE', label: 'Makul Guvence' },
        { grade: 'B',  min: 80, max: 84,  opinion: 'MAKUL_GUVENCE', label: 'Makul Guvence' },
        { grade: 'C+', min: 75, max: 79,  opinion: 'MAKUL_GUVENCE', label: 'Makul Guvence' },
        { grade: 'C',  min: 70, max: 74,  opinion: 'SINIRLI_GUVENCE', label: 'Sinirli Guvence' },
        { grade: 'D',  min: 50, max: 69,  opinion: 'SINIRLI_GUVENCE', label: 'Sinirli Guvence' },
        { grade: 'E',  min: 25, max: 49,  opinion: 'GUVENCE_YOK', label: 'Guvence Yok' },
        { grade: 'F',  min: 0,  max: 24,  opinion: 'GUVENCE_YOK', label: 'Guvence Yok' },
      ],
    };
  }

  const sortedRanges = [...constitution.risk_ranges].sort((a, b) => b.min - a.min);

  const scale = sortedRanges.map((range, idx) => {
    let opinion = 'MAKUL_GUVENCE';
    let grade = 'B';

    if (idx === 0) {
      opinion = 'GUVENCE_YOK';
      grade = 'F';
    } else if (idx === 1) {
      opinion = 'SINIRLI_GUVENCE';
      grade = 'D';
    } else if (idx === sortedRanges.length - 2) {
      opinion = 'MAKUL_GUVENCE';
      grade = 'B';
    } else if (idx === sortedRanges.length - 1) {
      opinion = 'TAM_GUVENCE';
      grade = 'A';
    }

    return {
      grade,
      min: range.min,
      max: range.max,
      opinion,
      label: range.label,
    };
  });

  const activeVetos = constitution.veto_rules.filter(v => v.enabled);
  const capping = activeVetos.map(veto => {
    const parsedCondition = parseVetoCondition(veto.condition);
    return {
      condition: veto.condition,
      field: parsedCondition.field,
      operator: parsedCondition.operator,
      value: parsedCondition.value,
      max_score: veto.override_score,
      reason: veto.name,
    };
  });

  return {
    deductions: {
      critical: 25,
      high: 10,
      medium: 3,
      low: 1,
    },
    capping,
    scale,
  };
}

function parseVetoCondition(condition: string): { field: string; operator: '>=' | '>' | '<=' | '<' | '==' | '!='; value: number } {
  const match = condition.match(/^(\w+)\s*(>=|<=|==|!=|>|<)\s*(.+)$/);
  if (!match) {
    return { field: 'count_critical', operator: '>=', value: 1 };
  }

  const [, field, op, rawVal] = match;
  const value = isNaN(Number(rawVal)) ? 1 : Number(rawVal);

  return {
    field,
    operator: op as '>=' | '>' | '<=' | '<' | '==' | '!=',
    value,
  };
}
