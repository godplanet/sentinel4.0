/**
 * TEMPLATE LOADER MODAL
 * Select and load standard audit procedures into workpaper
 */

import { useState, useEffect } from 'react';
import { X, FileText, ChevronRight, Loader2, CheckCircle2, Search, Folder } from 'lucide-react';
import {
  getProcedureCategories,
  applyTemplateToWorkpaper,
  applyCategoryToWorkpaper,
  getWorkpaperStepsCount,
  type TemplateCategory,
  type ProcedureTemplate,
} from '../template-engine';

interface TemplateLoaderModalProps {
  workpaperId: string;
  onClose: () => void;
  onSuccess: () => void;
}

export function TemplateLoaderModal({
  workpaperId,
  onClose,
  onSuccess,
}: TemplateLoaderModalProps) {
  const [categories, setCategories] = useState<TemplateCategory[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [selectedProcedures, setSelectedProcedures] = useState<Set<string>>(new Set());
  const [searchQuery, setSearchQuery] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [isApplying, setIsApplying] = useState(false);
  const [currentStepsCount, setCurrentStepsCount] = useState(0);
  const [result, setResult] = useState<{ success: boolean; count: number } | null>(null);

  useEffect(() => {
    loadData();
  }, [workpaperId]);

  const loadData = async () => {
    setIsLoading(true);
    const cats = await getProcedureCategories();
    setCategories(cats);
    const count = await getWorkpaperStepsCount(workpaperId);
    setCurrentStepsCount(count);
    setIsLoading(false);
  };

  const filteredCategories = searchQuery
    ? categories.filter(
        (cat) =>
          cat.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          cat.procedures.some((p) =>
            p.title.toLowerCase().includes(searchQuery.toLowerCase())
          )
      )
    : categories;

  const selectedCategoryData = categories.find((c) => c.name === selectedCategory);

  const handleToggleProcedure = (procedureId: string) => {
    const newSelected = new Set(selectedProcedures);
    if (newSelected.has(procedureId)) {
      newSelected.delete(procedureId);
    } else {
      newSelected.add(procedureId);
    }
    setSelectedProcedures(newSelected);
  };

  const handleSelectAllInCategory = () => {
    if (!selectedCategoryData) return;
    const newSelected = new Set(selectedProcedures);
    selectedCategoryData.procedures.forEach((p) => newSelected.add(p.id));
    setSelectedProcedures(newSelected);
  };

  const handleApply = async () => {
    setIsApplying(true);
    try {
      const applyResult = await applyTemplateToWorkpaper(workpaperId, Array.from(selectedProcedures));
      if (applyResult.success) {
        setResult({ success: true, count: applyResult.steps_created });
        setTimeout(() => {
          onSuccess();
          onClose();
        }, 2000);
      } else {
        alert(`Failed to apply template: ${applyResult.errors.join(', ')}`);
      }
    } catch (error) {
      console.error('Failed to apply template:', error);
      alert('Failed to apply template. Check console for details.');
    } finally {
      setIsApplying(false);
    }
  };

  const handleQuickLoadCategory = async (categoryName: string) => {
    setIsApplying(true);
    try {
      const applyResult = await applyCategoryToWorkpaper(workpaperId, categoryName);
      if (applyResult.success) {
        setResult({ success: true, count: applyResult.steps_created });
        setTimeout(() => {
          onSuccess();
          onClose();
        }, 2000);
      } else {
        alert(`Failed to load category: ${applyResult.errors.join(', ')}`);
      }
    } catch (error) {
      console.error('Failed to load category:', error);
      alert('Failed to load category. Check console for details.');
    } finally {
      setIsApplying(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-6">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-5xl max-h-[90vh] overflow-hidden flex flex-col">
        <div className="flex items-center justify-between p-6 border-b border-slate-200">
          <div>
            <h2 className="text-2xl font-bold text-slate-900 flex items-center gap-3">
              <FileText className="w-7 h-7 text-blue-600" />
              Load Standard Program
            </h2>
            <p className="text-slate-600 text-sm mt-1">
              {currentStepsCount > 0 ? `${currentStepsCount} existing steps` : 'No test steps yet'}
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-slate-100 rounded-lg transition-colors"
          >
            <X className="w-6 h-6 text-slate-600" />
          </button>
        </div>

        {!result ? (
          <>
            <div className="flex-1 overflow-hidden flex">
              <div className="w-1/3 border-r border-slate-200 overflow-y-auto">
                <div className="p-4 border-b border-slate-200">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                    <input
                      type="text"
                      placeholder="Search categories..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                </div>

                {isLoading ? (
                  <div className="flex items-center justify-center h-64">
                    <Loader2 className="w-8 h-8 text-blue-600 animate-spin" />
                  </div>
                ) : (
                  <div className="divide-y divide-slate-100">
                    {filteredCategories.map((category) => (
                      <button
                        key={category.name}
                        onClick={() => setSelectedCategory(category.name)}
                        className={`w-full p-4 text-left hover:bg-slate-50 transition-colors flex items-center justify-between group ${
                          selectedCategory === category.name ? 'bg-blue-50' : ''
                        }`}
                      >
                        <div className="flex-1">
                          <div className="font-semibold text-slate-900 mb-1 flex items-center gap-2">
                            <Folder className="w-4 h-4 text-slate-400" />
                            {category.name}
                          </div>
                          <div className="text-xs text-slate-500">
                            {category.count} procedure{category.count !== 1 ? 's' : ''}
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleQuickLoadCategory(category.name);
                            }}
                            className="opacity-0 group-hover:opacity-100 text-xs px-3 py-1 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-all"
                          >
                            Load All
                          </button>
                          <ChevronRight className="w-5 h-5 text-slate-400" />
                        </div>
                      </button>
                    ))}
                  </div>
                )}
              </div>

              <div className="flex-1 overflow-y-auto p-6">
                {selectedCategoryData ? (
                  <>
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="text-lg font-bold text-slate-900">
                        {selectedCategoryData.name}
                      </h3>
                      <button
                        onClick={handleSelectAllInCategory}
                        className="text-sm text-blue-600 hover:text-blue-700 font-semibold"
                      >
                        Select All
                      </button>
                    </div>

                    <div className="space-y-3">
                      {selectedCategoryData.procedures.map((procedure) => (
                        <label
                          key={procedure.id}
                          className="flex items-start gap-3 p-4 border border-slate-200 rounded-lg hover:border-blue-300 hover:bg-blue-50/50 cursor-pointer transition-colors"
                        >
                          <input
                            type="checkbox"
                            checked={selectedProcedures.has(procedure.id)}
                            onChange={() => handleToggleProcedure(procedure.id)}
                            className="mt-1 w-4 h-4 text-blue-600 rounded focus:ring-2 focus:ring-blue-500"
                          />
                          <div className="flex-1 min-w-0">
                            <div className="font-semibold text-slate-900 mb-1">
                              {procedure.title}
                            </div>
                            <div className="text-sm text-slate-600 line-clamp-2">
                              {procedure.description}
                            </div>
                            {procedure.tags.length > 0 && (
                              <div className="flex flex-wrap gap-1 mt-2">
                                {procedure.tags.slice(0, 3).map((tag) => (
                                  <span
                                    key={tag}
                                    className="text-xs px-2 py-0.5 bg-slate-100 text-slate-600 rounded-full"
                                  >
                                    {tag}
                                  </span>
                                ))}
                              </div>
                            )}
                          </div>
                        </label>
                      ))}
                    </div>
                  </>
                ) : (
                  <div className="flex flex-col items-center justify-center h-full text-slate-400">
                    <Folder className="w-16 h-16 mb-4" />
                    <p>Select a category to view procedures</p>
                  </div>
                )}
              </div>
            </div>

            <div className="border-t border-slate-200 p-6 flex items-center justify-between bg-slate-50">
              <div className="text-sm text-slate-600">
                <span className="font-semibold text-slate-900">
                  {selectedProcedures.size}
                </span>{' '}
                procedure{selectedProcedures.size !== 1 ? 's' : ''} selected
              </div>
              <div className="flex items-center gap-3">
                <button
                  onClick={onClose}
                  className="px-6 py-3 bg-white border border-slate-300 text-slate-700 rounded-xl font-semibold hover:bg-slate-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleApply}
                  disabled={isApplying || selectedProcedures.size === 0}
                  className="px-8 py-3 bg-blue-600 text-white rounded-xl font-semibold hover:bg-blue-700 transition-colors shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                >
                  {isApplying ? (
                    <>
                      <Loader2 className="w-5 h-5 animate-spin" />
                      Loading...
                    </>
                  ) : (
                    <>
                      <FileText className="w-5 h-5" />
                      Load {selectedProcedures.size} Step{selectedProcedures.size !== 1 ? 's' : ''}
                    </>
                  )}
                </button>
              </div>
            </div>
          </>
        ) : (
          <div className="flex-1 flex items-center justify-center p-12">
            <div className="text-center">
              <CheckCircle2 className="w-20 h-20 text-green-500 mx-auto mb-6" />
              <h3 className="text-2xl font-bold text-slate-900 mb-2">
                {result.count} Steps Loaded
              </h3>
              <p className="text-slate-600">
                Standard procedures have been added to the workpaper
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
