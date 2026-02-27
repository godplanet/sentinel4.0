import { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Shield,
  CheckCircle2,
  ChevronDown,
  ChevronRight,
  Link as LinkIcon,
  X,
  Plus,
} from 'lucide-react';
import {
  useFrameworks,
  useFrameworkRequirements,
  useCreateMapping,
  useDeleteMapping,
  type FrameworkRequirement,
  type ControlMapping,
} from '@/features/compliance/api/useFrameworks';
import { supabase } from '@/shared/api/supabase';
import { useQuery } from '@tanstack/react-query';

interface ComplianceMapperProps {
  controlId: string;
  controlTitle: string;
  controlDescription?: string;
}

export function ComplianceMapper({ controlId, controlTitle, controlDescription }: ComplianceMapperProps) {
  const [expandedFrameworks, setExpandedFrameworks] = useState<Set<string>>(new Set());
  const [selectedRequirement, setSelectedRequirement] = useState<FrameworkRequirement | null>(null);
  const [mappingModalOpen, setMappingModalOpen] = useState(false);
  const [matchScore, setMatchScore] = useState(80);
  const [coverage, setCoverage] = useState<'FULL' | 'PARTIAL' | 'WEAK'>('FULL');
  const [notes, setNotes] = useState('');

  const { data: frameworks = [] } = useFrameworks();
  const { data: controlMappings = [] } = useQuery({
    queryKey: ['control-ref-mappings', controlId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('control_requirement_mappings')
        .select('*')
        .eq('control_ref', controlId);
      if (error) throw error;
      return (data || []) as ControlMapping[];
    },
  });

  const createMapping = useCreateMapping();
  const deleteMapping = useDeleteMapping();

  const toggleFramework = (frameworkId: string) => {
    setExpandedFrameworks((prev) => {
      const next = new Set(prev);
      if (next.has(frameworkId)) next.delete(frameworkId);
      else next.add(frameworkId);
      return next;
    });
  };

  const handleRequirementClick = (requirement: FrameworkRequirement) => {
    setSelectedRequirement(requirement);
    setMatchScore(80);
    setCoverage('FULL');
    setNotes('');
    setMappingModalOpen(true);
  };

  const handleSaveMapping = async () => {
    if (!selectedRequirement) return;
    try {
      await createMapping.mutateAsync({
        control_ref: controlId,
        control_title: controlTitle,
        requirement_id: selectedRequirement.id,
        coverage_strength: coverage,
        match_score: matchScore,
        notes,
      });
      setMappingModalOpen(false);
      setSelectedRequirement(null);
    } catch (error) {
      console.error('Failed to save mapping:', error);
    }
  };

  const handleDeleteMapping = async (mappingId: string) => {
    try {
      await deleteMapping.mutateAsync(mappingId);
    } catch (error) {
      console.error('Failed to delete mapping:', error);
    }
  };

  const mappedIds = useMemo(() => new Set(controlMappings.map((m) => m.requirement_id)), [controlMappings]);

  return (
    <div className="flex h-full gap-4">
      <div className="w-2/5 flex flex-col">
        <div className="bg-white border border-slate-200 rounded-lg p-6 shadow-sm">
          <div className="flex items-start gap-3 mb-4">
            <div className="w-10 h-10 rounded-lg bg-blue-100 flex items-center justify-center flex-shrink-0">
              <Shield className="w-5 h-5 text-blue-600" />
            </div>
            <div className="flex-1 min-w-0">
              <h3 className="text-lg font-semibold text-slate-900 mb-1">{controlTitle}</h3>
              {controlDescription && <p className="text-sm text-slate-600">{controlDescription}</p>}
            </div>
          </div>

          {controlMappings.length > 0 && (
            <div className="mt-4 pt-4 border-t border-slate-100">
              <div className="text-xs font-medium text-slate-600 mb-2">Eslenen Gereksinimler</div>
              <div className="flex flex-wrap gap-2">
                {controlMappings.map((mapping) => (
                  <motion.div
                    key={mapping.id}
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-medium ${
                      mapping.coverage_strength === 'FULL'
                        ? 'text-emerald-600 bg-emerald-50'
                        : mapping.coverage_strength === 'PARTIAL'
                          ? 'text-amber-600 bg-amber-50'
                          : 'text-rose-600 bg-rose-50'
                    }`}
                  >
                    <LinkIcon className="w-3.5 h-3.5" />
                    <span>%{mapping.match_score}</span>
                    <button onClick={() => handleDeleteMapping(mapping.id)} className="ml-1 hover:opacity-70">
                      <X className="w-3 h-3" />
                    </button>
                  </motion.div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      <div className="flex-1 flex flex-col">
        <div className="bg-white border border-slate-200 rounded-lg shadow-sm overflow-hidden">
          <div className="p-4 border-b border-slate-200 bg-slate-50">
            <h3 className="text-sm font-semibold text-slate-900">Regulasyon Cerceveleri</h3>
            <p className="text-xs text-slate-600 mt-0.5">Gereksinime tikla ve kontrol esle</p>
          </div>

          <div className="overflow-y-auto max-h-[600px]">
            {frameworks.map((framework) => (
              <FrameworkAccordion
                key={framework.id}
                framework={framework}
                isExpanded={expandedFrameworks.has(framework.id)}
                onToggle={() => toggleFramework(framework.id)}
                onRequirementClick={handleRequirementClick}
                mappedRequirementIds={mappedIds}
              />
            ))}
          </div>
        </div>
      </div>

      <AnimatePresence>
        {mappingModalOpen && selectedRequirement && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/30 backdrop-blur-sm z-50"
              onClick={() => setMappingModalOpen(false)}
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="fixed inset-0 z-50 flex items-center justify-center p-4"
            >
              <div className="bg-white rounded-xl shadow-2xl max-w-lg w-full p-6" onClick={(e) => e.stopPropagation()}>
                <h3 className="text-lg font-semibold text-slate-900 mb-4">Kontrol Esle</h3>

                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">Gereksinim</label>
                    <div className="text-sm text-slate-900 font-medium">
                      {selectedRequirement.code} - {selectedRequirement.title}
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">
                      Kapsam Skoru: %{matchScore}
                    </label>
                    <input
                      type="range"
                      min="0"
                      max="100"
                      step="5"
                      value={matchScore}
                      onChange={(e) => setMatchScore(Number(e.target.value))}
                      className="w-full accent-blue-600"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">Kapsam Gucu</label>
                    <div className="grid grid-cols-3 gap-2">
                      {(['FULL', 'PARTIAL', 'WEAK'] as const).map((type) => (
                        <button
                          key={type}
                          onClick={() => setCoverage(type)}
                          className={`px-3 py-2 rounded-lg text-xs font-medium transition-colors ${
                            coverage === type ? 'bg-blue-600 text-white' : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                          }`}
                        >
                          {type === 'FULL' ? 'Tam' : type === 'PARTIAL' ? 'Kismi' : 'Zayif'}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">Notlar</label>
                    <textarea
                      value={notes}
                      onChange={(e) => setNotes(e.target.value)}
                      placeholder="Esleme gereksesi..."
                      className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm resize-none"
                      rows={2}
                    />
                  </div>

                  <div className="flex gap-2 justify-end pt-2">
                    <button
                      onClick={() => setMappingModalOpen(false)}
                      className="px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-100 rounded-lg"
                    >
                      Iptal
                    </button>
                    <button
                      onClick={handleSaveMapping}
                      disabled={createMapping.isPending}
                      className="px-4 py-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-lg disabled:opacity-50"
                    >
                      {createMapping.isPending ? 'Kaydediliyor...' : 'Kaydet'}
                    </button>
                  </div>
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}

interface FrameworkAccordionProps {
  framework: any;
  isExpanded: boolean;
  onToggle: () => void;
  onRequirementClick: (req: FrameworkRequirement) => void;
  mappedRequirementIds: Set<string>;
}

function FrameworkAccordion({ framework, isExpanded, onToggle, onRequirementClick, mappedRequirementIds }: FrameworkAccordionProps) {
  const { data: requirements = [] } = useFrameworkRequirements(isExpanded ? framework.id : undefined);

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'CRITICAL': return 'text-rose-600 bg-rose-50';
      case 'HIGH': return 'text-orange-600 bg-orange-50';
      case 'MEDIUM': return 'text-amber-600 bg-amber-50';
      default: return 'text-slate-600 bg-slate-50';
    }
  };

  return (
    <div className="border-b border-slate-200 last:border-b-0">
      <button onClick={onToggle} className="w-full px-4 py-3 flex items-center justify-between hover:bg-slate-50">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-slate-100 flex items-center justify-center">
            {isExpanded ? <ChevronDown className="w-4 h-4 text-slate-600" /> : <ChevronRight className="w-4 h-4 text-slate-600" />}
          </div>
          <div className="text-left">
            <div className="text-sm font-medium text-slate-900">{framework.name}</div>
            <div className="text-xs text-slate-500">{framework.authority} {framework.version && `| v${framework.version}`}</div>
          </div>
        </div>
      </button>

      <AnimatePresence>
        {isExpanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="overflow-hidden"
          >
            <div className="px-4 pb-3 space-y-2">
              {requirements.map((req) => {
                const isMapped = mappedRequirementIds.has(req.id);
                return (
                  <button
                    key={req.id}
                    onClick={() => onRequirementClick(req)}
                    className={`w-full text-left p-3 rounded-lg border transition-all ${
                      isMapped ? 'bg-emerald-50 border-emerald-200' : 'bg-white border-slate-200 hover:border-blue-300 hover:shadow-sm'
                    }`}
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="text-xs font-mono font-medium text-slate-900">{req.code}</span>
                          <span className={`px-2 py-0.5 rounded text-xs font-medium ${getPriorityColor(req.priority)}`}>{req.priority}</span>
                        </div>
                        <div className="text-sm font-medium text-slate-900 mb-1">{req.title}</div>
                        <div className="text-xs text-slate-600 line-clamp-2">{req.description}</div>
                      </div>
                      {isMapped ? <CheckCircle2 className="w-5 h-5 text-emerald-600 flex-shrink-0" /> : <Plus className="w-5 h-5 text-slate-400 flex-shrink-0" />}
                    </div>
                  </button>
                );
              })}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
