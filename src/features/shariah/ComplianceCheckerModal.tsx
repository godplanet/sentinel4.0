import { useAAOIFIStandards } from '@/entities/shariah/api/shariah-api';
import { GlassCard } from '@/shared/ui/GlassCard';
import { AlertTriangle, CheckCircle, FileText, Shield, X } from 'lucide-react';
import { useState } from 'react';
import type { AAOIFIStandard } from './data/aaoifi_standards';
import { analyzeFindingCompliance } from './rag-engine';

interface ComplianceCheckerModalProps {
 isOpen: boolean;
 onClose: () => void;
 findingDescription?: string;
}

export default function ComplianceCheckerModal({ isOpen, onClose, findingDescription = '' }: ComplianceCheckerModalProps) {
 const [description, setDescription] = useState(findingDescription);
 const [result, setResult] = useState<ReturnType<typeof analyzeFindingCompliance> | null>(null);
 const [loading, setLoading] = useState(false);

 const { data: standards = [], isLoading: isStandardsLoading } = useAAOIFIStandards();

 if (!isOpen) return null;

 const handleAnalyze = async () => {
 if (!description.trim() || isStandardsLoading) return;

 setLoading(true);

 const analysis = analyzeFindingCompliance(description, standards);
 setResult(analysis);
 setLoading(false);
 };

 return (
 <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
 <div className="bg-surface rounded-2xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
 {/* Header */}
 <div className="sticky top-0 bg-gradient-to-r from-emerald-600 to-teal-600 p-4 flex items-center justify-between text-white z-10">
 <div className="flex items-center gap-3">
 <Shield className="w-6 h-6" />
 <div>
 <h2 className="text-xl font-bold">Shari'ah Compliance Checker</h2>
 <p className="text-sm text-emerald-100">Analyze findings for Islamic finance compliance</p>
 </div>
 </div>
 <button
 onClick={onClose}
 className="p-2 hover:bg-surface/20 rounded-lg transition-colors"
 >
 <X className="w-5 h-5" />
 </button>
 </div>

 {/* Content */}
 <div className="p-4 space-y-4">
 {/* Input Section */}
 <div className="space-y-3">
 <label className="block text-sm font-medium text-gray-700 ">
 Finding Description
 </label>
 <textarea
 value={description}
 onChange={(e) => setDescription(e.target.value)}
 placeholder="Paste your finding description here. Example: The bank sells commodities to customers under Murabaha contracts without taking physical possession..."
 className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 bg-surface focus:ring-2 focus:ring-emerald-500 focus:border-transparent resize-none text-primary placeholder-gray-500"
 rows={6}
 />
 <button
 onClick={handleAnalyze}
 disabled={!description.trim() || loading || isStandardsLoading}
 className="w-full py-3 px-4 bg-gradient-to-r from-emerald-500 to-teal-600 text-white rounded-xl font-medium hover:shadow-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
 >
 {loading || isStandardsLoading ? (
 <>
 <div className="animate-spin w-5 h-5 border-2 border-white border-t-transparent rounded-full" />
 Analyzing...
 </>
 ) : (
 <>
 <Shield className="w-5 h-5" />
 Analyze Compliance
 </>
 )}
 </button>
 </div>

 {/* Results Section */}
 {result && (
 <div className="space-y-4">
 {/* Status Card */}
 <GlassCard className={`p-4 border-2 ${
 result.complianceStatus === 'non_compliant' ? 'border-red-500 bg-red-50 ' :
 result.complianceStatus === 'compliant' ? 'border-green-500 bg-green-50 ' :
 'border-yellow-500 bg-yellow-50 '
 }`}>
 <div className="flex items-start gap-4">
 <div className={`p-3 rounded-xl ${
 result.complianceStatus === 'non_compliant' ? 'bg-red-100 ' :
 result.complianceStatus === 'compliant' ? 'bg-green-100 ' :
 'bg-yellow-100 '
 }`}>
 {result.complianceStatus === 'non_compliant' ? <AlertTriangle className="w-6 h-6 text-red-600" /> :
 result.complianceStatus === 'compliant' ? <CheckCircle className="w-6 h-6 text-green-600" /> :
 <AlertTriangle className="w-6 h-6 text-yellow-600" />}
 </div>
 <div className="flex-1">
 <div className="flex items-center gap-2 mb-2">
 <span className={`px-3 py-1 rounded-full text-xs font-semibold uppercase ${
 result.complianceStatus === 'non_compliant' ? 'bg-red-100 text-red-700 ' :
 result.complianceStatus === 'compliant' ? 'bg-green-100 text-green-700 ' :
 'bg-yellow-100 text-yellow-700 '
 }`}>
 {result.complianceStatus.replace('_', ' ')}
 </span>
 <span className={`px-2 py-1 rounded text-xs font-medium ${
 result.severity === 'critical' ? 'bg-red-100 text-red-700 ' :
 result.severity === 'high' ? 'bg-orange-100 text-orange-700 ' :
 'bg-blue-100 text-blue-700 '
 }`}>
 {result.severity.toUpperCase()} SEVERITY
 </span>
 </div>
 <h3 className={`text-lg font-semibold ${
 result.complianceStatus === 'non_compliant' ? 'text-red-900 ' :
 result.complianceStatus === 'compliant' ? 'text-green-900 ' :
 'text-yellow-900 '
 }`}>
 {result.complianceStatus === 'non_compliant' ? 'Shari\'ah Compliance Violations Detected' :
 result.complianceStatus === 'compliant' ? 'No Violations Found' :
 'Manual Review Required'}
 </h3>
 </div>
 </div>
 </GlassCard>

 {/* Violations */}
 {result.violations.length > 0 && (
 <div className="space-y-3">
 <h4 className="font-semibold text-primary flex items-center gap-2">
 <AlertTriangle className="w-5 h-5 text-red-500" />
 Detected Violations ({result.violations.length})
 </h4>
 <div className="space-y-3">
 {(result.violations || []).map((violation) => (
 <ViolationCard key={violation.id} violation={violation} />
 ))}
 </div>
 </div>
 )}

 {/* Recommendations */}
 {result.recommendations.length > 0 && (
 <GlassCard className="p-4">
 <h4 className="font-semibold text-primary mb-3">Recommendations</h4>
 <ul className="space-y-2">
 {(result.recommendations || []).map((rec, idx) => (
 <li key={idx} className="text-sm text-gray-700 flex items-start gap-2">
 <span className="text-emerald-500 mt-1 font-bold">→</span>
 <span>{rec}</span>
 </li>
 ))}
 </ul>
 </GlassCard>
 )}
 </div>
 )}

 {/* Sample Findings */}
 {!result && (
 <GlassCard className="p-4 bg-blue-50 border border-blue-200 ">
 <h4 className="font-semibold text-blue-900 mb-3 flex items-center gap-2">
 <FileText className="w-4 h-4" />
 Sample Findings to Try:
 </h4>
 <div className="space-y-2">
 <SampleButton
 text="The bank sells commodities to customers before taking ownership from the supplier"
 onClick={() => setDescription("The bank sells commodities to customers before taking ownership from the supplier")}
 />
 <SampleButton
 text="Sukuk investors are guaranteed principal repayment at face value regardless of asset performance"
 onClick={() => setDescription("Sukuk investors are guaranteed principal repayment at face value regardless of asset performance")}
 />
 <SampleButton
 text="Organized Tawarruq where the commodity circulates back to original seller"
 onClick={() => setDescription("Organized Tawarruq where the commodity circulates back to original seller")}
 />
 </div>
 </GlassCard>
 )}
 </div>
 </div>
 </div>
 );
}

function ViolationCard({ violation }: { violation: AAOIFIStandard }) {
 return (
 <div className="p-4 rounded-lg border-2 border-red-300 bg-red-50 ">
 <div className="flex items-start justify-between mb-2">
 <div>
 <h5 className="font-semibold text-red-900 ">
 AAOIFI Standard No. {violation.standard_no}: {violation.standard_name}
 </h5>
 <p className="text-xs text-red-700 ">
 Article {violation.article_no} • {violation.section}
 </p>
 </div>
 <span className={`px-2 py-1 rounded text-xs font-medium ${
 violation.ruling === 'prohibited' ? 'bg-red-200 text-red-900 ' :
 'bg-orange-200 text-orange-900 '
 }`}>
 {violation.ruling.toUpperCase()}
 </span>
 </div>
 <p className="text-sm text-gray-700 leading-relaxed">
 {violation.text}
 </p>
 {violation.references && violation.references.length > 0 && (
 <div className="mt-2 pt-2 border-t border-red-200 ">
 <p className="text-xs text-red-700 ">
 <span className="font-semibold">References:</span> {violation.references.join(', ')}
 </p>
 </div>
 )}
 </div>
 );
}

function SampleButton({ text, onClick }: { text: string; onClick: () => void }) {
 return (
 <button
 onClick={onClick}
 className="w-full text-left px-3 py-2 rounded-lg text-xs text-blue-700 hover:bg-blue-100 :bg-blue-900/30 transition-colors"
 >
 {text}
 </button>
 );
}
