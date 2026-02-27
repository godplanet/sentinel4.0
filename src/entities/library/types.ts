export interface ProgramTemplate {
  id: string;
  tenant_id: string;
  title: string;
  framework: 'COSO' | 'ISO31000' | 'COBIT' | 'GIAS2024' | 'SOX' | 'NIST';
  description: string;
  estimated_hours: number;
  category: string;
  is_active: boolean;
  created_by?: string;
  created_at: string;
  updated_at: string;
}

export interface TemplateStep {
  id: string;
  tenant_id: string;
  template_id: string;
  step_order: number;
  control_id: string;
  control_title: string;
  test_procedure: string;
  risk_id?: string;
  expected_evidence: string;
  testing_method: 'Inquiry' | 'Inspection' | 'Observation' | 'Reperformance' | 'Analytical';
  sample_size_guidance?: string;
  is_key_control: boolean;
  created_at: string;
  updated_at: string;
}

export interface ProgramTemplateWithSteps extends ProgramTemplate {
  steps: TemplateStep[];
  step_count: number;
}

export interface CreateProgramTemplateInput {
  title: string;
  framework: ProgramTemplate['framework'];
  description: string;
  estimated_hours: number;
  category: string;
}

export interface CreateTemplateStepInput {
  template_id: string;
  step_order: number;
  control_id: string;
  control_title: string;
  test_procedure: string;
  risk_id?: string;
  expected_evidence: string;
  testing_method: TemplateStep['testing_method'];
  sample_size_guidance?: string;
  is_key_control: boolean;
}

export interface UpdateTemplateStepInput extends Partial<CreateTemplateStepInput> {
  id: string;
}
