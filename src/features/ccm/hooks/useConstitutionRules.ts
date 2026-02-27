/**
 * CONSTITUTION-LINKED GOLDEN RULES
 *
 * Dynamically reads thresholds from Risk Constitution instead of hardcoded values
 * Enables centralized risk parameter management
 */

import { useRiskConstitution } from '@/features/risk-constitution';
import type { CCMTransaction } from '@/entities/ccm/types';
import { detectStructuring } from '../golden-rules';
import type { StructuringCluster } from '../types';

export function useConstitutionRules() {
  const { config } = useRiskConstitution();

  const getStructuringLimit = (): number => {
    const materialityThreshold = config?.dimensions?.find(
      (d) => d.name === 'Impact' || d.name === 'Financial'
    );

    if (materialityThreshold && materialityThreshold.weights) {
      const highThreshold = materialityThreshold.weights.find((w) => w.level === 4);
      if (highThreshold && highThreshold.threshold !== undefined) {
        return highThreshold.threshold * 1000;
      }
    }

    return 50000;
  };

  const getHighValueTransactionThreshold = (): number => {
    const materialityLimit = config?.vetoRules?.find(
      (v) => v.dimension === 'Impact' || v.dimension === 'Financial'
    );

    if (materialityLimit && materialityLimit.threshold !== undefined) {
      return materialityLimit.threshold * 1000;
    }

    return 100000;
  };

  const getTimeWindowHours = (): number => {
    return 24;
  };

  const detectStructuringWithConstitution = (
    transactions: CCMTransaction[]
  ): StructuringCluster[] => {
    const limit = getStructuringLimit();
    const windowHours = getTimeWindowHours();

    return detectStructuring(transactions, limit, windowHours);
  };

  const checkHighValueTransaction = (amount: number): boolean => {
    const threshold = getHighValueTransactionThreshold();
    return amount >= threshold;
  };

  const getRiskThresholds = () => {
    return {
      structuring: {
        limit: getStructuringLimit(),
        windowHours: getTimeWindowHours(),
      },
      highValue: {
        threshold: getHighValueTransactionThreshold(),
      },
      benford: {
        chiSquaredCritical: 15.507,
      },
      ghostEmployee: {
        accessLogMinimum: 1,
        activeStatusRequired: true,
      },
    };
  };

  const getConstitutionSummary = () => {
    return {
      structuringLimit: `$${getStructuringLimit().toLocaleString()}`,
      highValueThreshold: `$${getHighValueTransactionThreshold().toLocaleString()}`,
      source: config ? 'Risk Constitution' : 'Default Values',
      lastUpdated: config?.lastUpdated || 'Never',
    };
  };

  return {
    detectStructuringWithConstitution,
    checkHighValueTransaction,
    getRiskThresholds,
    getConstitutionSummary,
    structuringLimit: getStructuringLimit(),
    highValueThreshold: getHighValueTransactionThreshold(),
  };
}
