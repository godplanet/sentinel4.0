import { create } from 'zustand';
import type {
  BankGoal,
  AuditObjective,
  StrategyAlignment,
  StrategicGoal,
  AuditObjectiveSimple,
} from './types';
import { fetchStrategicGoals, fetchAuditObjectivesSimple } from '../api/goals';

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
  setGoals: (goals: ExtendedStrategicGoal[]) => void;
  setObjectives: (objectives: ExtendedAuditObjective[]) => void;

  getAlignmentsForGoal: (goalId: string) => StrategyAlignment[];

  /** strategic_bank_goals ve strategic_audit_objectives tablolarından veri çeker. */
  initialize: () => Promise<void>;
}

export const useStrategyStore = create<StrategyStore>((set, get) => ({
  bankGoals: [],
  auditObjectives: [],
  alignments: [],

  goals: [],
  objectives: [],
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

  setGoals: (goals) => set({ goals }),

  setObjectives: (objectives) => set({ objectives }),

  getAlignmentsForGoal: (goalId) => {
    return get().alignments.filter((a) => a.bank_goal_id === goalId);
  },

  initialize: async () => {
    const [goals, objectives] = await Promise.all([
      fetchStrategicGoals(),
      fetchAuditObjectivesSimple(),
    ]);
    set({ goals, objectives });
  },
}));