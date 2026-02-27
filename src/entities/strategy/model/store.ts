import { create } from 'zustand';
import type {
  BankGoal,
  AuditObjective,
  StrategyAlignment,
  StrategicGoal,
  AuditObjectiveSimple,
} from './types';
import { MOCK_STRATEGIC_GOALS, MOCK_AUDIT_OBJECTIVES_SIMPLE } from '../api/mock-data';

interface ExtendedStrategicGoal extends StrategicGoal {
  period_year?: number;
  weight?: number;
  owner?: string;
}

interface ExtendedAuditObjective extends AuditObjectiveSimple {
  relatedEngagementIds?: string[];
}

interface StrategyStore {
  bankGoals: BankGoal[];
  auditObjectives: AuditObjective[];
  alignments: StrategyAlignment[];

  goals: ExtendedStrategicGoal[];
  objectives: ExtendedAuditObjective[];
  riskWeights: { impact: number; likelihood: number; velocity: number };

  addGoal: (goal: Omit<ExtendedStrategicGoal, 'id' | 'linkedAuditObjectives' | 'progress'>) => void;
  addObjective: (objective: Omit<ExtendedAuditObjective, 'id' | 'status'>) => void;
  updateRiskWeights: (weights: { impact: number; likelihood: number; velocity: number }) => void;

  getAlignmentsForGoal: (goalId: string) => StrategyAlignment[];
}

export const useStrategyStore = create<StrategyStore>((set, get) => ({
  bankGoals: [],
  auditObjectives: [],
  alignments: [],

  goals: MOCK_STRATEGIC_GOALS || [],
  objectives: MOCK_AUDIT_OBJECTIVES_SIMPLE || [],
  riskWeights: { impact: 40, likelihood: 40, velocity: 20 },

  addGoal: (newGoalData) => set((state) => ({
    goals: [...state.goals, {
      ...newGoalData,
      id: crypto.randomUUID(),
      linkedAuditObjectives: [],
      progress: 0,
      riskAppetite: newGoalData.riskAppetite || 'Medium'
    }]
  })),

  addObjective: (newObjData) => set((state) => ({
    objectives: [...state.objectives, {
      ...newObjData,
      id: crypto.randomUUID(),
      status: 'On Track',
      type: newObjData.type || 'Assurance',
      relatedEngagementIds: newObjData.relatedEngagementIds || []
    }]
  })),

  updateRiskWeights: (weights) => set({ riskWeights: weights }),

  getAlignmentsForGoal: (goalId) => {
    return get().alignments.filter((a) => a.bank_goal_id === goalId);
  },
}));