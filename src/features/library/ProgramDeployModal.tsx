import { fetchProgramTemplate } from '@/entities/library/api';
import type { ProgramTemplateWithSteps } from '@/entities/library/types';
import clsx from 'clsx';
import { AlertCircle, CheckCircle, Download, Loader2, X } from 'lucide-react';
import { useEffect, useState } from 'react';
import { injectProgramToWorkpaper, previewInjection } from './injection-engine';

interface ProgramDeployModalProps {
 templateId: string | null;
 workpaperId?: string | null;
 onClose: () => void;
 onSuccess?: (stepsInjected: number) => void;
}

export function ProgramDeployModal({
 templateId,
 workpaperId,
 onClose,
 onSuccess,
}: ProgramDeployModalProps) {
 const [template, setTemplate] = useState<ProgramTemplateWithSteps | null>(null);
 const [preview, setPreview] = useState<any>(null);
 const [loading, setLoading] = useState(true);
 const [deploying, setDeploying] = useState(false);
 const [result, setResult] = useState<{ success: boolean; message: string } | null>(null);

 useEffect(() => {
 if (templateId) {
 loadPreview();
 }
 }, [templateId]);

 const loadPreview = async () => {
 if (!templateId) return;

 setLoading(true);
 try {
 const [templateData, previewData] = await Promise.all([
 fetchProgramTemplate(templateId),
 previewInjection(templateId),
 ]);

 setTemplate(templateData);
 setPreview(previewData);
 } catch (error) {
 console.error('Failed to load preview:', error);
 } finally {
 setLoading(false);
 }
 };

 const handleDeploy = async () => {
 if (!templateId || !workpaperId) {
 setResult({ success: false, message: 'Missing template or workpaper ID' });
 return;
 }

 setDeploying(true);
 try {
 const injectionResult = await injectProgramToWorkpaper(templateId, workpaperId);

 if (injectionResult.success) {
 setResult({
 success: true,
 message: `Successfully injected ${injectionResult.stepsInjected} test steps!`,
 });
 if (onSuccess) {
 onSuccess(injectionResult.stepsInjected);
 }
 setTimeout(() => {
 onClose();
 }, 2000);
 } else {
 setResult({
 success: false,
 message: injectionResult.error || 'Deployment failed',
 });
 }
 } catch (error) {
 setResult({
 success: false,
 message: error instanceof Error ? error.message : 'Unknown error',
 });
 } finally {
 setDeploying(false);
 }
 };

 if (!templateId) return null;

 return (
 <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
 <div className="bg-surface rounded-xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
 <div className="sticky top-0 bg-surface border-b border-slate-200 p-4 flex items-center justify-between">
 <h2 className="text-2xl font-bold text-primary ">
 Deploy Audit Program
 </h2>
 <button
 onClick={onClose}
 className="p-2 hover:bg-slate-100 :bg-slate-700 rounded-lg transition-colors"
 >
 <X size={20} />
 </button>
 </div>

 <div className="p-4 space-y-4">
 {loading ? (
 <div className="flex items-center justify-center py-12">
 <Loader2 className="w-8 h-8 animate-spin text-blue-500" />
 </div>
 ) : (
 <>
 {template && (
 <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
 <h3 className="text-lg font-bold text-primary mb-2">
 {template.title}
 </h3>
 <p className="text-sm text-slate-600 mb-3">
 {template.description}
 </p>
 <div className="flex items-center gap-4 text-sm">
 <span className="text-slate-700 ">
 <strong>{preview?.stepCount || 0}</strong> test steps
 </span>
 <span className="text-slate-700 ">
 <strong>{preview?.estimatedHours || 0}h</strong> estimated
 </span>
 <span className="px-2 py-1 bg-blue-600 text-white rounded text-xs font-bold">
 {template.framework}
 </span>
 </div>
 </div>
 )}

 {preview && preview.steps.length > 0 && (
 <div>
 <h4 className="text-sm font-bold text-slate-700 mb-3">
 Test Steps to be Injected:
 </h4>
 <div className="space-y-2 max-h-[300px] overflow-y-auto">
 {(preview.steps || []).map((step: any, idx: number) => (
 <div
 key={idx}
 className="p-3 bg-canvas rounded-lg border border-slate-200 "
 >
 <div className="flex items-start gap-3">
 <span className="flex-shrink-0 w-6 h-6 rounded-full bg-blue-600 text-white text-xs font-bold flex items-center justify-center">
 {step.order}
 </span>
 <div className="flex-1 min-w-0">
 <div className="text-sm font-medium text-primary mb-1">
 {step.title}
 </div>
 <div className="text-xs text-slate-500">{step.description}</div>
 </div>
 </div>
 </div>
 ))}
 </div>
 </div>
 )}

 {result && (
 <div
 className={clsx(
 'p-4 rounded-lg border-2 flex items-start gap-3',
 result.success
 ? 'bg-green-50 border-green-500 '
 : 'bg-red-50 border-red-500 '
 )}
 >
 {result.success ? (
 <CheckCircle className="text-green-600 shrink-0" size={20} />
 ) : (
 <AlertCircle className="text-red-600 shrink-0" size={20} />
 )}
 <div>
 <div
 className={clsx(
 'font-bold mb-1',
 result.success ? 'text-green-900 ' : 'text-red-900 '
 )}
 >
 {result.success ? 'Deployment Successful!' : 'Deployment Failed'}
 </div>
 <div
 className={clsx(
 'text-sm',
 result.success ? 'text-green-700 ' : 'text-red-700 '
 )}
 >
 {result.message}
 </div>
 </div>
 </div>
 )}

 <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
 <div className="flex items-start gap-3">
 <AlertCircle className="text-amber-600 shrink-0 mt-0.5" size={20} />
 <div className="text-sm text-amber-800 ">
 <strong>Important:</strong> This will inject {preview?.stepCount || 0} test
 steps into the selected workpaper. All steps will be marked as "incomplete" and
 ready for execution.
 </div>
 </div>
 </div>
 </>
 )}
 </div>

 <div className="sticky bottom-0 bg-canvas border-t border-slate-200 p-4 flex items-center justify-end gap-3">
 <button
 onClick={onClose}
 disabled={deploying}
 className="px-4 py-2 bg-slate-200 text-primary rounded-lg hover:bg-slate-300 :bg-slate-600 transition-colors disabled:opacity-50"
 >
 Cancel
 </button>
 <button
 onClick={handleDeploy}
 disabled={deploying || !workpaperId || result?.success}
 className="flex items-center gap-2 px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-colors disabled:opacity-50"
 >
 {deploying ? (
 <>
 <Loader2 size={16} className="animate-spin" />
 Deploying...
 </>
 ) : (
 <>
 <Download size={16} />
 Deploy Program
 </>
 )}
 </button>
 </div>
 </div>
 </div>
 );
}
