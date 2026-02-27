import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { PageHeader } from '@/shared/ui/PageHeader';
import { GlassCard } from '@/shared/ui/GlassCard';
import {
  fetchProgramTemplate,
  updateTemplateStep,
  createTemplateStep,
  deleteTemplateStep,
  reorderTemplateSteps,
} from '@/entities/library/api';
import type { ProgramTemplateWithSteps, TemplateStep } from '@/entities/library/types';
import {
  GripVertical,
  Plus,
  Trash2,
  Save,
  AlertTriangle,
  Shield,
  Sparkles,
  ArrowLeft,
  Link2,
} from 'lucide-react';
import clsx from 'clsx';

export default function ProgramBuilderPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [template, setTemplate] = useState<ProgramTemplateWithSteps | null>(null);
  const [steps, setSteps] = useState<TemplateStep[]>([]);
  const [selectedStep, setSelectedStep] = useState<TemplateStep | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (id && id !== 'new') {
      loadTemplate();
    } else {
      setLoading(false);
    }
  }, [id]);

  const loadTemplate = async () => {
    if (!id || id === 'new') return;

    setLoading(true);
    try {
      const data = await fetchProgramTemplate(id);
      if (data) {
        setTemplate(data);
        setSteps(data.steps);
        if (data.steps.length > 0) {
          setSelectedStep(data.steps[0]);
        }
      }
    } catch (error) {
      console.error('Failed to load template:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSaveStep = async () => {
    if (!selectedStep) return;

    setSaving(true);
    try {
      const updated = await updateTemplateStep(selectedStep);
      setSteps(steps.map((s) => (s.id === updated.id ? updated : s)));
      setSelectedStep(updated);
    } catch (error) {
      console.error('Failed to save step:', error);
    } finally {
      setSaving(false);
    }
  };

  const handleAddStep = async () => {
    if (!template) return;

    const newStep: Omit<TemplateStep, 'id' | 'created_at' | 'updated_at' | 'tenant_id'> = {
      template_id: template.id,
      step_order: steps.length + 1,
      control_id: `CTRL-${steps.length + 1}`,
      control_title: 'New Control',
      test_procedure: 'Enter test procedure here...',
      expected_evidence: 'List expected evidence',
      testing_method: 'Inspection',
      is_key_control: false,
    };

    try {
      const created = await createTemplateStep(newStep as any);
      setSteps([...steps, created]);
      setSelectedStep(created);
    } catch (error) {
      console.error('Failed to add step:', error);
    }
  };

  const handleDeleteStep = async (stepId: string) => {
    if (!confirm('Delete this test step?')) return;

    try {
      await deleteTemplateStep(stepId);
      const updatedSteps = steps.filter((s) => s.id !== stepId);
      setSteps(updatedSteps);
      if (selectedStep?.id === stepId && updatedSteps.length > 0) {
        setSelectedStep(updatedSteps[0]);
      }
    } catch (error) {
      console.error('Failed to delete step:', error);
    }
  };

  const handleReorder = async (fromIndex: number, toIndex: number) => {
    const reordered = [...steps];
    const [moved] = reordered.splice(fromIndex, 1);
    reordered.splice(toIndex, 0, moved);

    setSteps(reordered);

    try {
      await reorderTemplateSteps(
        template!.id,
        reordered.map((s) => s.id)
      );
    } catch (error) {
      console.error('Failed to reorder:', error);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-4 border-b-4 border-blue-500 mx-auto mb-4"></div>
          <p>Loading template...</p>
        </div>
      </div>
    );
  }

  if (!template && id !== 'new') {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <GlassCard className="p-8 text-center">
          <AlertTriangle className="w-16 h-16 text-amber-500 mx-auto mb-4" />
          <h2 className="text-2xl font-bold mb-2">Template Not Found</h2>
          <p className="text-slate-600 mb-4">The requested program template does not exist.</p>
          <button
            onClick={() => navigate('/library/programs')}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            Back to Library
          </button>
        </GlassCard>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800 p-6">
      <PageHeader
        title={template?.title || 'Program Builder'}
        subtitle="Design and customize audit programs with GIAS 2024 risk linkage"
        actions={
          <div className="flex items-center gap-3">
            <button
              onClick={() => navigate('/library/programs')}
              className="flex items-center gap-2 px-4 py-2 bg-slate-700 text-white rounded-lg hover:bg-slate-800 transition-colors"
            >
              <ArrowLeft size={16} />
              Back to Library
            </button>
            <button
              onClick={handleSaveStep}
              disabled={!selectedStep || saving}
              className="flex items-center gap-2 px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-colors disabled:opacity-50"
            >
              <Save size={16} />
              {saving ? 'Saving...' : 'Save Changes'}
            </button>
          </div>
        }
      />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* LEFT PANEL: Step List */}
        <div className="lg:col-span-1">
          <GlassCard className="p-4">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-bold text-slate-900 dark:text-white">
                Test Steps ({steps.length})
              </h3>
              <button
                onClick={handleAddStep}
                className="p-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                title="Add Step"
              >
                <Plus size={16} />
              </button>
            </div>

            <div className="space-y-2 max-h-[calc(100vh-300px)] overflow-y-auto">
              {steps.map((step, index) => (
                <div
                  key={step.id}
                  onClick={() => setSelectedStep(step)}
                  className={clsx(
                    'p-3 rounded-lg border-2 cursor-pointer transition-all group',
                    selectedStep?.id === step.id
                      ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
                      : 'border-slate-200 dark:border-slate-700 hover:border-blue-300 dark:hover:border-blue-700'
                  )}
                >
                  <div className="flex items-start gap-2">
                    <button
                      className="p-1 hover:bg-slate-200 dark:hover:bg-slate-700 rounded cursor-grab"
                      title="Drag to reorder"
                    >
                      <GripVertical size={14} className="text-slate-400" />
                    </button>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-xs font-mono font-bold text-slate-600 dark:text-slate-400">
                          {step.control_id}
                        </span>
                        {step.is_key_control && (
                          <Shield size={12} className="text-amber-500" title="Key Control" />
                        )}
                        {!step.risk_id && (
                          <AlertTriangle
                            size={12}
                            className="text-red-500"
                            title="No Risk Linked"
                          />
                        )}
                      </div>
                      <div className="text-sm font-medium text-slate-900 dark:text-white line-clamp-2">
                        {step.control_title}
                      </div>
                    </div>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDeleteStep(step.id);
                      }}
                      className="p-1 opacity-0 group-hover:opacity-100 hover:bg-red-100 dark:hover:bg-red-900/20 rounded transition-all"
                      title="Delete"
                    >
                      <Trash2 size={14} className="text-red-600" />
                    </button>
                  </div>
                </div>
              ))}
            </div>

            {steps.length === 0 && (
              <div className="text-center py-8 text-slate-500">
                <p className="mb-3">No test steps yet</p>
                <button
                  onClick={handleAddStep}
                  className="flex items-center gap-2 mx-auto px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                  <Plus size={16} />
                  Add First Step
                </button>
              </div>
            )}
          </GlassCard>
        </div>

        {/* RIGHT PANEL: Step Editor */}
        <div className="lg:col-span-2">
          {selectedStep ? (
            <GlassCard className="p-6">
              <div className="space-y-6">
                <div>
                  <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2">
                    Control ID
                  </label>
                  <input
                    type="text"
                    value={selectedStep.control_id}
                    onChange={(e) =>
                      setSelectedStep({ ...selectedStep, control_id: e.target.value })
                    }
                    className="w-full px-4 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
                    placeholder="e.g., AC-01, CM-03"
                  />
                </div>

                <div>
                  <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2">
                    Control Title
                  </label>
                  <input
                    type="text"
                    value={selectedStep.control_title}
                    onChange={(e) =>
                      setSelectedStep({ ...selectedStep, control_title: e.target.value })
                    }
                    className="w-full px-4 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
                    placeholder="e.g., User Access Review"
                  />
                </div>

                <div>
                  <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2">
                    Test Procedure
                  </label>
                  <textarea
                    value={selectedStep.test_procedure}
                    onChange={(e) =>
                      setSelectedStep({ ...selectedStep, test_procedure: e.target.value })
                    }
                    className="w-full px-4 py-3 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-800 text-slate-900 dark:text-white min-h-[200px]"
                    placeholder="Describe the detailed test procedure..."
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2">
                      Expected Evidence
                    </label>
                    <input
                      type="text"
                      value={selectedStep.expected_evidence}
                      onChange={(e) =>
                        setSelectedStep({ ...selectedStep, expected_evidence: e.target.value })
                      }
                      className="w-full px-4 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
                      placeholder="List required evidence"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2">
                      Testing Method
                    </label>
                    <select
                      value={selectedStep.testing_method}
                      onChange={(e) =>
                        setSelectedStep({
                          ...selectedStep,
                          testing_method: e.target.value as any,
                        })
                      }
                      className="w-full px-4 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
                    >
                      <option value="Inquiry">Inquiry</option>
                      <option value="Inspection">Inspection</option>
                      <option value="Observation">Observation</option>
                      <option value="Reperformance">Reperformance</option>
                      <option value="Analytical">Analytical</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="flex items-center gap-2 text-sm font-bold text-slate-700 dark:text-slate-300 mb-2">
                    <Link2 size={16} className="text-purple-500" />
                    GIAS 2024 Risk Linkage
                  </label>
                  <div className="flex items-center gap-3">
                    <select
                      value={selectedStep.risk_id || ''}
                      onChange={(e) =>
                        setSelectedStep({
                          ...selectedStep,
                          risk_id: e.target.value || undefined,
                        })
                      }
                      className="flex-1 px-4 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
                    >
                      <option value="">-- No Risk Linked --</option>
                      <option value="mock-risk-1">Credit Risk - Loan Underwriting</option>
                      <option value="mock-risk-2">Operational Risk - Fraud</option>
                      <option value="mock-risk-3">Compliance Risk - AML</option>
                    </select>

                    {!selectedStep.risk_id && (
                      <div className="flex items-center gap-2 px-3 py-2 bg-amber-100 dark:bg-amber-900/20 rounded-lg">
                        <AlertTriangle size={16} className="text-amber-600" />
                        <span className="text-xs font-medium text-amber-700 dark:text-amber-400">
                          Orphaned Step
                        </span>
                      </div>
                    )}
                  </div>
                  <p className="text-xs text-slate-500 mt-1">
                    Link this test step to an audit risk for GIAS 2024 traceability
                  </p>
                </div>

                <div className="flex items-center gap-3">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={selectedStep.is_key_control}
                      onChange={(e) =>
                        setSelectedStep({ ...selectedStep, is_key_control: e.target.checked })
                      }
                      className="w-4 h-4 text-blue-600"
                    />
                    <Shield size={16} className="text-amber-500" />
                    <span className="text-sm font-medium text-slate-700 dark:text-slate-300">
                      Key Control
                    </span>
                  </label>
                </div>

                <div className="pt-4 border-t border-slate-200 dark:border-slate-700">
                  <button
                    onClick={() => {
                      /* Mock AI generate */
                      alert('AI Step Generation: Coming Soon!');
                    }}
                    className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-lg hover:from-purple-700 hover:to-pink-700 transition-colors"
                  >
                    <Sparkles size={16} />
                    Generate with AI
                  </button>
                </div>
              </div>
            </GlassCard>
          ) : (
            <GlassCard className="p-12 text-center">
              <Shield className="w-16 h-16 text-slate-400 mx-auto mb-4" />
              <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-2">
                No Step Selected
              </h3>
              <p className="text-slate-600 dark:text-slate-400">
                Select a test step from the left panel to edit it
              </p>
            </GlassCard>
          )}
        </div>
      </div>
    </div>
  );
}
