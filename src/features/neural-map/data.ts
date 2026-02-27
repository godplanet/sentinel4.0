/**
 * Neural Map Mock Data
 * Realistic bank department network for demo purposes
 */

import type { NeuralNode, NeuralEdge } from './types';

export const MOCK_NEURAL_NODES: NeuralNode[] = [
  {
    id: 'treasury',
    label: 'Hazine',
    type: 'department',
    baseRisk: 65,
    effectiveRisk: 65,
    contagionImpact: 0,
    metadata: {
      headcount: 45,
      budget: 12000000,
      criticalSystems: ['SWIFT', 'Bloomberg Terminal'],
    },
  },
  {
    id: 'it',
    label: 'Bilgi Teknolojileri',
    type: 'department',
    baseRisk: 92, // High inherent risk
    effectiveRisk: 92,
    contagionImpact: 0,
    metadata: {
      headcount: 120,
      budget: 25000000,
      criticalSystems: ['Core Banking', 'Network Infrastructure', 'Security Operations'],
    },
  },
  {
    id: 'digital',
    label: 'Dijital Bankacılık',
    type: 'department',
    baseRisk: 55,
    effectiveRisk: 55,
    contagionImpact: 0,
    metadata: {
      headcount: 80,
      budget: 18000000,
      criticalSystems: ['Mobile App', 'Web Banking', 'API Gateway'],
    },
  },
  {
    id: 'branches',
    label: 'Şube Ağı',
    type: 'department',
    baseRisk: 48,
    effectiveRisk: 48,
    contagionImpact: 0,
    metadata: {
      headcount: 850,
      budget: 45000000,
      criticalSystems: ['Branch Automation', 'ATM Network'],
    },
  },
  {
    id: 'credit',
    label: 'Kredi Riski Yönetimi',
    type: 'department',
    baseRisk: 72,
    effectiveRisk: 72,
    contagionImpact: 0,
    metadata: {
      headcount: 35,
      budget: 8000000,
      criticalSystems: ['Credit Scoring Engine', 'Portfolio Analytics'],
    },
  },
  {
    id: 'compliance',
    label: 'Uyum ve Mevzuat',
    type: 'department',
    baseRisk: 58,
    effectiveRisk: 58,
    contagionImpact: 0,
    metadata: {
      headcount: 28,
      budget: 6000000,
      criticalSystems: ['AML System', 'Regulatory Reporting'],
    },
  },
  {
    id: 'operations',
    label: 'Operasyon',
    type: 'department',
    baseRisk: 61,
    effectiveRisk: 61,
    contagionImpact: 0,
    metadata: {
      headcount: 200,
      budget: 32000000,
      criticalSystems: ['Payment Processing', 'Settlement System'],
    },
  },
  {
    id: 'cybersec',
    label: 'Siber Güvenlik',
    type: 'department',
    baseRisk: 88,
    effectiveRisk: 88,
    contagionImpact: 0,
    metadata: {
      headcount: 42,
      budget: 15000000,
      criticalSystems: ['SIEM', 'Firewall', 'DLP'],
    },
  },
];

export const MOCK_NEURAL_EDGES: NeuralEdge[] = [
  // IT dependencies (high impact)
  {
    id: 'it-digital',
    source: 'it',
    target: 'digital',
    dependencyWeight: 0.9, // Digital banking heavily depends on IT
    type: 'operational',
  },
  {
    id: 'it-branches',
    source: 'it',
    target: 'branches',
    dependencyWeight: 0.85,
    type: 'operational',
  },
  {
    id: 'it-operations',
    source: 'it',
    target: 'operations',
    dependencyWeight: 0.8,
    type: 'operational',
  },

  // Cybersecurity dependencies
  {
    id: 'cybersec-it',
    source: 'cybersec',
    target: 'it',
    dependencyWeight: 0.7,
    type: 'operational',
  },
  {
    id: 'cybersec-digital',
    source: 'cybersec',
    target: 'digital',
    dependencyWeight: 0.75,
    type: 'operational',
  },

  // Treasury dependencies
  {
    id: 'treasury-credit',
    source: 'treasury',
    target: 'credit',
    dependencyWeight: 0.6,
    type: 'financial',
  },
  {
    id: 'treasury-operations',
    source: 'treasury',
    target: 'operations',
    dependencyWeight: 0.5,
    type: 'financial',
  },

  // Credit risk dependencies
  {
    id: 'credit-branches',
    source: 'credit',
    target: 'branches',
    dependencyWeight: 0.55,
    type: 'data',
  },
  {
    id: 'credit-digital',
    source: 'credit',
    target: 'digital',
    dependencyWeight: 0.6,
    type: 'data',
  },

  // Compliance dependencies
  {
    id: 'compliance-operations',
    source: 'compliance',
    target: 'operations',
    dependencyWeight: 0.65,
    type: 'regulatory',
  },
  {
    id: 'compliance-digital',
    source: 'compliance',
    target: 'digital',
    dependencyWeight: 0.55,
    type: 'regulatory',
  },

  // Operations dependencies
  {
    id: 'operations-branches',
    source: 'operations',
    target: 'branches',
    dependencyWeight: 0.7,
    type: 'operational',
  },
];
