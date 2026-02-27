import { useState } from 'react';
import { Plus, Edit2, Trash2, Download, BookOpen, Shield, CheckCircle2, AlertCircle, X, Link2 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/shared/api/supabase';
import toast from 'react-hot-toast';
import {
  useLibraryProcesses,
  useLibraryRisks,
  useLibraryControls,
  useCreateProcess,
  useCreateRisk,
  useCreateControl,
  useUpdateProcess,
  useUpdateRisk,
  useUpdateControl,
  useDeleteProcess,
  useDeleteRisk,
  useDeleteControl,
  useImportToEngagement,
  type CreateProcessDTO,
  type CreateRiskDTO,
  type CreateControlDTO,
  type LibraryProcess,
  type LibraryRisk,
  type LibraryControl,
} from '@/features/library';
import { ComplianceMapper } from '@/widgets/ComplianceMapper';

export function RKMLibrary() {
  const [selectedProcess, setSelectedProcess] = useState<LibraryProcess | null>(null);
  const [selectedRisk, setSelectedRisk] = useState<LibraryRisk | null>(null);
  const [showProcessModal, setShowProcessModal] = useState(false);
  const [showRiskModal, setShowRiskModal] = useState(false);
  const [showControlModal, setShowControlModal] = useState(false);
  const [selectedControls, setSelectedControls] = useState<string[]>([]);
  const [showImportModal, setShowImportModal] = useState(false);
  const [selectedControlForMapping, setSelectedControlForMapping] = useState<LibraryControl | null>(null);

  const { data: processes = [], isLoading: loadingProcesses } = useLibraryProcesses();
  const { data: risks = [], isLoading: loadingRisks } = useLibraryRisks(selectedProcess?.id);
  const { data: controls = [], isLoading: loadingControls } = useLibraryControls(selectedRisk?.id);

  const createProcess = useCreateProcess();
  const createRisk = useCreateRisk();
  const createControl = useCreateControl();
  const deleteProcess = useDeleteProcess();
  const deleteRisk = useDeleteRisk();
  const deleteControl = useDeleteControl();
  const importToEngagement = useImportToEngagement();

  const handleProcessSelect = (process: LibraryProcess) => {
    setSelectedProcess(process);
    setSelectedRisk(null);
  };

  const handleRiskSelect = (risk: LibraryRisk) => {
    setSelectedRisk(risk);
  };

  const handleControlSelect = (controlId: string) => {
    setSelectedControls(prev =>
      prev.includes(controlId)
        ? prev.filter(id => id !== controlId)
        : [...prev, controlId]
    );
  };

  const handleImport = async (engagementId: string) => {
    if (selectedControls.length === 0) return;

    const toastId = toast.loading('Kontroller içe aktarılıyor...');
    try {
      const result = await importToEngagement.mutateAsync({
        engagementId,
        controlIds: selectedControls,
      });
      toast.dismiss(toastId);
      toast.success(`${result.imported} kontrol denetim görevine başarıyla aktarıldı`);
      setSelectedControls([]);
      setShowImportModal(false);
    } catch (error) {
      toast.dismiss(toastId);
      toast.error('İçe aktarma başarısız: ' + (error as Error).message);
    }
  };

  return (
    <div className="flex h-[calc(100vh-8rem)] gap-4">
      {/* COLUMN 1: PROCESSES */}
      <div className="w-1/3 flex flex-col bg-white rounded-lg border border-slate-200 overflow-hidden">
        <div className="p-4 border-b border-slate-200 bg-slate-50">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2">
              <BookOpen className="w-5 h-5 text-slate-600" />
              <h2 className="text-lg font-semibold text-slate-900">Processes</h2>
            </div>
            <button
              onClick={() => setShowProcessModal(true)}
              className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
              title="Add Process"
            >
              <Plus className="w-5 h-5" />
            </button>
          </div>
          <p className="text-sm text-slate-600">{processes.length} processes</p>
        </div>

        <div className="flex-1 overflow-y-auto">
          {loadingProcesses ? (
            <div className="p-4 text-center text-slate-500">Loading...</div>
          ) : processes.length === 0 ? (
            <div className="p-4 text-center text-slate-500">No processes yet</div>
          ) : (
            <div className="divide-y divide-slate-100">
              {processes.map((process) => (
                <button
                  key={process.id}
                  onClick={() => handleProcessSelect(process)}
                  className={`w-full p-4 text-left transition-colors ${
                    selectedProcess?.id === process.id
                      ? 'bg-blue-50 border-l-4 border-blue-600'
                      : 'hover:bg-slate-50'
                  }`}
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-xs font-mono text-slate-500 bg-slate-100 px-2 py-0.5 rounded">
                          {process.code}
                        </span>
                        {process.process_type && (
                          <span className="text-xs text-slate-600 bg-slate-200 px-2 py-0.5 rounded">
                            {process.process_type}
                          </span>
                        )}
                      </div>
                      <div className="font-semibold text-slate-900 mb-1">{process.title}</div>
                      {process.description && (
                        <p className="text-sm text-slate-600 line-clamp-2">{process.description}</p>
                      )}
                      <div className="flex items-center gap-2 mt-2">
                        <span className="text-xs text-slate-500">
                          Weight: {process.risk_weight.toFixed(1)}
                        </span>
                      </div>
                    </div>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        if (confirm(`Delete process "${process.title}"?`)) {
                          deleteProcess.mutate(process.id);
                        }
                      }}
                      className="p-1 text-red-600 hover:bg-red-50 rounded"
                      title="Delete"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* COLUMN 2: RISKS */}
      <div className="w-1/3 flex flex-col bg-white rounded-lg border border-slate-200 overflow-hidden">
        <div className="p-4 border-b border-slate-200 bg-slate-50">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2">
              <AlertCircle className="w-5 h-5 text-slate-600" />
              <h2 className="text-lg font-semibold text-slate-900">Risks</h2>
            </div>
            {selectedProcess && (
              <button
                onClick={() => setShowRiskModal(true)}
                className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                title="Add Risk"
              >
                <Plus className="w-5 h-5" />
              </button>
            )}
          </div>
          <p className="text-sm text-slate-600">
            {selectedProcess ? `${risks.length} risks` : 'Select a process'}
          </p>
        </div>

        <div className="flex-1 overflow-y-auto">
          {!selectedProcess ? (
            <div className="p-8 text-center text-slate-500">
              <AlertCircle className="w-12 h-12 mx-auto mb-2 text-slate-300" />
              <p>Select a process to view risks</p>
            </div>
          ) : loadingRisks ? (
            <div className="p-4 text-center text-slate-500">Loading...</div>
          ) : risks.length === 0 ? (
            <div className="p-4 text-center text-slate-500">No risks yet</div>
          ) : (
            <div className="divide-y divide-slate-100">
              {risks.map((risk) => (
                <button
                  key={risk.id}
                  onClick={() => handleRiskSelect(risk)}
                  className={`w-full p-4 text-left transition-colors ${
                    selectedRisk?.id === risk.id
                      ? 'bg-blue-50 border-l-4 border-blue-600'
                      : 'hover:bg-slate-50'
                  }`}
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        {risk.risk_code && (
                          <span className="text-xs font-mono text-slate-500 bg-slate-100 px-2 py-0.5 rounded">
                            {risk.risk_code}
                          </span>
                        )}
                        <span
                          className={`text-xs font-semibold px-2 py-0.5 rounded ${
                            risk.risk_level === 'CRITICAL'
                              ? 'bg-red-100 text-red-700'
                              : risk.risk_level === 'HIGH'
                              ? 'bg-orange-100 text-orange-700'
                              : risk.risk_level === 'MEDIUM'
                              ? 'bg-yellow-100 text-yellow-700'
                              : 'bg-green-100 text-green-700'
                          }`}
                        >
                          {risk.risk_level}
                        </span>
                      </div>
                      <div className="font-semibold text-slate-900 mb-1">{risk.risk_title}</div>
                      <p className="text-sm text-slate-600 line-clamp-2">{risk.description}</p>
                      {risk.risk_category && (
                        <div className="mt-2 text-xs text-slate-500">
                          Category: {risk.risk_category}
                        </div>
                      )}
                    </div>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        if (confirm(`Delete risk "${risk.risk_title}"?`)) {
                          deleteRisk.mutate(risk.id);
                        }
                      }}
                      className="p-1 text-red-600 hover:bg-red-50 rounded"
                      title="Delete"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* COLUMN 3: CONTROLS */}
      <div className="w-1/3 flex flex-col bg-white rounded-lg border border-slate-200 overflow-hidden">
        <div className="p-4 border-b border-slate-200 bg-slate-50">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2">
              <Shield className="w-5 h-5 text-slate-600" />
              <h2 className="text-lg font-semibold text-slate-900">Controls</h2>
            </div>
            <div className="flex items-center gap-2">
              {selectedControls.length > 0 && (
                <button
                  onClick={() => setShowImportModal(true)}
                  className="px-3 py-2 text-sm bg-green-600 text-white hover:bg-green-700 rounded-lg transition-colors flex items-center gap-2"
                  title="Import to Engagement"
                >
                  <Download className="w-4 h-4" />
                  Import ({selectedControls.length})
                </button>
              )}
              {selectedRisk && (
                <button
                  onClick={() => setShowControlModal(true)}
                  className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                  title="Add Control"
                >
                  <Plus className="w-5 h-5" />
                </button>
              )}
            </div>
          </div>
          <p className="text-sm text-slate-600">
            {selectedRisk ? `${controls.length} controls` : 'Select a risk'}
          </p>
        </div>

        <div className="flex-1 overflow-y-auto">
          {!selectedRisk ? (
            <div className="p-8 text-center text-slate-500">
              <Shield className="w-12 h-12 mx-auto mb-2 text-slate-300" />
              <p>Select a risk to view controls</p>
            </div>
          ) : loadingControls ? (
            <div className="p-4 text-center text-slate-500">Loading...</div>
          ) : controls.length === 0 ? (
            <div className="p-4 text-center text-slate-500">No controls yet</div>
          ) : (
            <div className="divide-y divide-slate-100">
              {controls.map((control) => (
                <div
                  key={control.id}
                  className={`p-4 transition-colors ${
                    selectedControls.includes(control.id) ? 'bg-green-50' : 'hover:bg-slate-50'
                  }`}
                >
                  <div className="flex items-start gap-3">
                    <input
                      type="checkbox"
                      checked={selectedControls.includes(control.id)}
                      onChange={() => handleControlSelect(control.id)}
                      className="mt-1 w-4 h-4 text-blue-600 rounded border-slate-300 focus:ring-blue-500"
                    />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1 flex-wrap">
                        <span className="text-xs font-mono text-slate-500 bg-slate-100 px-2 py-0.5 rounded">
                          {control.code}
                        </span>
                        {control.is_key_control && (
                          <span className="text-xs font-semibold bg-amber-100 text-amber-700 px-2 py-0.5 rounded flex items-center gap-1">
                            <CheckCircle2 className="w-3 h-3" />
                            KEY
                          </span>
                        )}
                      </div>
                      <div className="font-semibold text-slate-900 mb-1">{control.title}</div>
                      <p className="text-sm text-slate-600 mb-2 line-clamp-2">{control.description}</p>

                      <div className="flex items-center gap-2 flex-wrap text-xs mb-2">
                        <span className="bg-blue-100 text-blue-700 px-2 py-0.5 rounded">
                          {control.control_type}
                        </span>
                        <span className="bg-purple-100 text-purple-700 px-2 py-0.5 rounded">
                          {control.automation_type}
                        </span>
                        <span className="bg-slate-100 text-slate-700 px-2 py-0.5 rounded">
                          {control.frequency}
                        </span>
                      </div>

                      <button
                        onClick={() => setSelectedControlForMapping(control)}
                        className="text-xs text-blue-600 hover:text-blue-700 font-medium flex items-center gap-1 hover:underline"
                      >
                        <Link2 className="w-3 h-3" />
                        Map to Compliance Frameworks
                      </button>
                    </div>
                    <button
                      onClick={() => {
                        if (confirm(`Delete control "${control.title}"?`)) {
                          deleteControl.mutate(control.id);
                        }
                      }}
                      className="p-1 text-red-600 hover:bg-red-50 rounded"
                      title="Delete"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* MODALS */}
      {showProcessModal && (
        <ProcessModal
          onClose={() => setShowProcessModal(false)}
          onSave={(data) => {
            createProcess.mutate(data);
            setShowProcessModal(false);
          }}
        />
      )}

      {showRiskModal && selectedProcess && (
        <RiskModal
          processId={selectedProcess.id}
          onClose={() => setShowRiskModal(false)}
          onSave={(data) => {
            createRisk.mutate(data);
            setShowRiskModal(false);
          }}
        />
      )}

      {showControlModal && selectedRisk && (
        <ControlModal
          riskId={selectedRisk.id}
          onClose={() => setShowControlModal(false)}
          onSave={(data) => {
            createControl.mutate(data);
            setShowControlModal(false);
          }}
        />
      )}

      {showImportModal && (
        <ImportModal
          controlCount={selectedControls.length}
          onClose={() => setShowImportModal(false)}
          onImport={handleImport}
        />
      )}

      {/* COMPLIANCE MAPPER MODAL */}
      <AnimatePresence>
        {selectedControlForMapping && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/30 backdrop-blur-sm z-50"
              onClick={() => setSelectedControlForMapping(null)}
            />
            <motion.div
              initial={{ opacity: 0, x: 100 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 100 }}
              className="fixed inset-y-0 right-0 w-full max-w-7xl bg-slate-50 shadow-2xl z-50 overflow-y-auto"
            >
              <div className="sticky top-0 bg-white border-b border-slate-200 p-4 flex items-center justify-between z-10">
                <div>
                  <h2 className="text-lg font-semibold text-slate-900">
                    Compliance Framework Mapping
                  </h2>
                  <p className="text-sm text-slate-600">
                    Map control to regulatory requirements
                  </p>
                </div>
                <button
                  onClick={() => setSelectedControlForMapping(null)}
                  className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-lg transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="p-6">
                <ComplianceMapper
                  controlId={selectedControlForMapping.id}
                  controlTitle={selectedControlForMapping.title}
                  controlDescription={selectedControlForMapping.description}
                />
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}

// PROCESS MODAL
function ProcessModal({
  onClose,
  onSave,
}: {
  onClose: () => void;
  onSave: (data: CreateProcessDTO) => void;
}) {
  const [formData, setFormData] = useState<CreateProcessDTO>({
    code: '',
    title: '',
    description: '',
    risk_weight: 1.0,
    process_type: 'PRIMARY',
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(formData);
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
        <div className="p-6 border-b border-slate-200">
          <h3 className="text-lg font-semibold text-slate-900">Add Process</h3>
        </div>
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">
              Code *
            </label>
            <input
              type="text"
              value={formData.code}
              onChange={(e) => setFormData({ ...formData, code: e.target.value })}
              className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">
              Title *
            </label>
            <input
              type="text"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">
              Description
            </label>
            <textarea
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              rows={3}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">
              Process Type
            </label>
            <select
              value={formData.process_type}
              onChange={(e) => setFormData({ ...formData, process_type: e.target.value as any })}
              className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="PRIMARY">Primary</option>
              <option value="SUPPORT">Support</option>
              <option value="MANAGEMENT">Management</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">
              Risk Weight (0-5)
            </label>
            <input
              type="number"
              step="0.1"
              min="0"
              max="5"
              value={formData.risk_weight}
              onChange={(e) => setFormData({ ...formData, risk_weight: parseFloat(e.target.value) })}
              className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
          <div className="flex justify-end gap-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-slate-700 hover:bg-slate-100 rounded-lg transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-blue-600 text-white hover:bg-blue-700 rounded-lg transition-colors"
            >
              Create Process
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

// RISK MODAL
function RiskModal({
  processId,
  onClose,
  onSave,
}: {
  processId: string;
  onClose: () => void;
  onSave: (data: CreateRiskDTO) => void;
}) {
  const [formData, setFormData] = useState<CreateRiskDTO>({
    process_id: processId,
    risk_code: '',
    risk_title: '',
    description: '',
    risk_level: 'MEDIUM',
    risk_type: 'OPERATIONAL',
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(formData);
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
        <div className="p-6 border-b border-slate-200">
          <h3 className="text-lg font-semibold text-slate-900">Add Risk</h3>
        </div>
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">
              Risk Code
            </label>
            <input
              type="text"
              value={formData.risk_code}
              onChange={(e) => setFormData({ ...formData, risk_code: e.target.value })}
              className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">
              Risk Title *
            </label>
            <input
              type="text"
              value={formData.risk_title}
              onChange={(e) => setFormData({ ...formData, risk_title: e.target.value })}
              className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">
              Description *
            </label>
            <textarea
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              rows={3}
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">
              Risk Level
            </label>
            <select
              value={formData.risk_level}
              onChange={(e) => setFormData({ ...formData, risk_level: e.target.value as any })}
              className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="LOW">Low</option>
              <option value="MEDIUM">Medium</option>
              <option value="HIGH">High</option>
              <option value="CRITICAL">Critical</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">
              Risk Type
            </label>
            <select
              value={formData.risk_type}
              onChange={(e) => setFormData({ ...formData, risk_type: e.target.value as any })}
              className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="STRATEGIC">Strategic</option>
              <option value="OPERATIONAL">Operational</option>
              <option value="FINANCIAL">Financial</option>
              <option value="COMPLIANCE">Compliance</option>
              <option value="REPUTATIONAL">Reputational</option>
              <option value="TECHNOLOGY">Technology</option>
            </select>
          </div>
          <div className="flex justify-end gap-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-slate-700 hover:bg-slate-100 rounded-lg transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-blue-600 text-white hover:bg-blue-700 rounded-lg transition-colors"
            >
              Create Risk
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

// CONTROL MODAL (with v2 fields)
function ControlModal({
  riskId,
  onClose,
  onSave,
}: {
  riskId: string;
  onClose: () => void;
  onSave: (data: CreateControlDTO) => void;
}) {
  const [formData, setFormData] = useState<CreateControlDTO>({
    risk_id: riskId,
    code: '',
    title: '',
    description: '',
    control_type: 'Detective',
    automation_type: 'Manual',
    frequency: 'Monthly',
    is_key_control: false,
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(formData);
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
        <div className="p-6 border-b border-slate-200">
          <h3 className="text-lg font-semibold text-slate-900">Add Control</h3>
        </div>
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">
              Control Code *
            </label>
            <input
              type="text"
              value={formData.code}
              onChange={(e) => setFormData({ ...formData, code: e.target.value })}
              className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">
              Control Title *
            </label>
            <input
              type="text"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">
              Description *
            </label>
            <textarea
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              rows={3}
              required
            />
          </div>

          {/* v2 CRITICAL FIELDS */}
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">
              Control Type *
            </label>
            <select
              value={formData.control_type}
              onChange={(e) => setFormData({ ...formData, control_type: e.target.value as any })}
              className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              required
            >
              <option value="Preventive">Preventive</option>
              <option value="Detective">Detective</option>
              <option value="Corrective">Corrective</option>
              <option value="Directive">Directive</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">
              Automation Type *
            </label>
            <select
              value={formData.automation_type}
              onChange={(e) => setFormData({ ...formData, automation_type: e.target.value as any })}
              className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              required
            >
              <option value="Manual">Manual</option>
              <option value="Automated">Automated</option>
              <option value="IT-Dependent">IT-Dependent</option>
              <option value="Hybrid">Hybrid</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">
              Frequency *
            </label>
            <select
              value={formData.frequency}
              onChange={(e) => setFormData({ ...formData, frequency: e.target.value as any })}
              className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              required
            >
              <option value="Continuous">Continuous</option>
              <option value="Daily">Daily</option>
              <option value="Weekly">Weekly</option>
              <option value="Monthly">Monthly</option>
              <option value="Quarterly">Quarterly</option>
              <option value="Annual">Annual</option>
              <option value="Event-Driven">Event-Driven</option>
            </select>
          </div>

          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              id="is_key_control"
              checked={formData.is_key_control}
              onChange={(e) => setFormData({ ...formData, is_key_control: e.target.checked })}
              className="w-4 h-4 text-blue-600 rounded border-slate-300 focus:ring-blue-500"
            />
            <label htmlFor="is_key_control" className="text-sm font-medium text-slate-700">
              Mark as Key Control
            </label>
          </div>

          <div className="flex justify-end gap-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-slate-700 hover:bg-slate-100 rounded-lg transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-blue-600 text-white hover:bg-blue-700 rounded-lg transition-colors"
            >
              Create Control
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

// IMPORT MODAL
function ImportModal({
  controlCount,
  onClose,
  onImport,
}: {
  controlCount: number;
  onClose: () => void;
  onImport: (engagementId: string) => void;
}) {
  const [engagementId, setEngagementId] = useState('');

  const { data: engagements = [], isLoading } = useQuery({
    queryKey: ['engagements-for-import'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('audit_engagements')
        .select('id, title, status, start_date')
        .in('status', ['PLANNING', 'IN_PROGRESS', 'FIELDWORK'])
        .order('start_date', { ascending: false })
        .limit(50);
      if (error) throw error;
      return data || [];
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (engagementId) {
      onImport(engagementId);
    }
  };

  const statusLabel: Record<string, string> = {
    PLANNING: 'Planlama',
    IN_PROGRESS: 'Devam Ediyor',
    FIELDWORK: 'Saha Çalışması',
  };

  const statusColor: Record<string, string> = {
    PLANNING: 'bg-blue-100 text-blue-700',
    IN_PROGRESS: 'bg-amber-100 text-amber-700',
    FIELDWORK: 'bg-emerald-100 text-emerald-700',
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-md">
        <div className="p-6 border-b border-slate-200">
          <h3 className="text-lg font-semibold text-slate-900">Denetim Görevine İçe Aktar</h3>
          <p className="text-sm text-slate-500 mt-1">
            <strong>{controlCount}</strong> kontrol seçili
          </p>
        </div>
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">
              Denetim Görevi *
            </label>
            {isLoading ? (
              <div className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm text-slate-500">
                Görevler yükleniyor...
              </div>
            ) : engagements.length === 0 ? (
              <div className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm text-slate-500 bg-slate-50">
                Aktif denetim görevi bulunamadı
              </div>
            ) : (
              <select
                value={engagementId}
                onChange={(e) => setEngagementId(e.target.value)}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
                required
              >
                <option value="">— Denetim görevi seçin —</option>
                {engagements.map((eng) => (
                  <option key={eng.id} value={eng.id}>
                    {eng.title} [{statusLabel[eng.status] ?? eng.status}]
                  </option>
                ))}
              </select>
            )}
            {engagementId && (() => {
              const selected = engagements.find(e => e.id === engagementId);
              return selected ? (
                <div className="mt-2 flex items-center gap-2 text-xs">
                  <span className={`px-2 py-0.5 rounded font-medium ${statusColor[selected.status] ?? 'bg-slate-100 text-slate-700'}`}>
                    {statusLabel[selected.status] ?? selected.status}
                  </span>
                  <span className="text-slate-500">
                    {selected.start_date ? new Date(selected.start_date).toLocaleDateString('tr-TR') : ''}
                  </span>
                </div>
              ) : null;
            })()}
            <p className="mt-1 text-xs text-slate-500">
              Kontroller bu görevin çalışma programına eklenecektir
            </p>
          </div>
          <div className="flex justify-end gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-slate-700 hover:bg-slate-100 rounded-lg transition-colors text-sm"
            >
              İptal
            </button>
            <button
              type="submit"
              disabled={!engagementId}
              className="px-4 py-2 bg-green-600 text-white hover:bg-green-700 rounded-lg transition-colors text-sm font-semibold disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Kontrolleri Aktar
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
