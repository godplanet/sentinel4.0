export interface QuantScenario {
  id: string;
  title: string;
  description: string | null;
  min_loss: number;
  likely_loss: number;
  max_loss: number;
  probability: number;
  simulated_var_95: number;
  tenant_id: string;
  created_at: string;
}

export interface CreateQuantScenarioInput {
  title: string;
  description?: string;
  min_loss: number;
  likely_loss: number;
  max_loss: number;
  probability: number;
  simulated_var_95?: number;
}

export interface SimulationResult {
  value: number;
  probability: number;
}

export interface MonteCarloOutput {
  histogram: SimulationResult[];
  mean: number;
  var_95: number;
  var_99: number;
  ale: number;
}
