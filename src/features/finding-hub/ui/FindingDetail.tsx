import { useEffect, useState } from 'react';
import { findingApi, actionStepApi, type FindingWithAssignment, type ActionStep } from '@/entities/finding';
import { AlertCircle, Calendar, CheckCircle2, Clock, DollarSign, FileText, User, X } from 'lucide-react';

interface FindingDetailProps {
  findingId: string;
  onClose?: () => void;
}

export function FindingDetail({ findingId, onClose }: FindingDetailProps) {
  const [finding, setFinding] = useState<FindingWithAssignment | null>(null);
  const [actionSteps, setActionSteps] = useState<ActionStep[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadFindingDetail();
  }, [findingId]);

  async function loadFindingDetail() {
    setIsLoading(true);
    try {
      const data = await findingApi.getById(findingId);
      setFinding(data);

      if (data?.assignment) {
        const steps = await actionStepApi.getByAssignment(data.assignment.id);
        setActionSteps(steps);
      }
    } catch (error) {
      console.error('Failed to load finding:', error);
    } finally {
      setIsLoading(false);
    }
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-slate-500">Yükleniyor...</div>
      </div>
    );
  }

  if (!finding) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-slate-500">Bulgu bulunamadı</div>
      </div>
    );
  }

  const severityColors = {
    CRITICAL: 'bg-red-100 text-red-800 border-red-300',
    HIGH: 'bg-orange-100 text-orange-800 border-orange-300',
    MEDIUM: 'bg-yellow-100 text-yellow-800 border-yellow-300',
    LOW: 'bg-blue-100 text-blue-800 border-blue-300',
  };

  const severityLabels = {
    CRITICAL: 'Kritik',
    HIGH: 'Yüksek',
    MEDIUM: 'Orta',
    LOW: 'Düşük',
  };

  return (
    <div className="bg-white rounded-lg border border-slate-200 overflow-hidden">
      <div className="bg-gradient-to-r from-slate-50 to-slate-100 px-6 py-4 border-b border-slate-200 flex items-center justify-between">
        <div className="space-y-1">
          <div className="flex items-center gap-3">
            <span className="text-sm font-mono text-slate-600 bg-white px-3 py-1 rounded border border-slate-200">
              {finding.code}
            </span>
            <span
              className={`text-xs font-medium px-3 py-1 rounded border ${
                severityColors[finding.severity]
              }`}
            >
              {severityLabels[finding.severity]}
            </span>
          </div>
          <h2 className="text-xl font-semibold text-slate-900">{finding.title}</h2>
        </div>
        {onClose && (
          <button
            onClick={onClose}
            className="p-2 hover:bg-slate-200 rounded-lg transition-colors"
          >
            <X className="w-5 h-5 text-slate-600" />
          </button>
        )}
      </div>

      <div className="p-6 space-y-6">
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-1">
            <div className="text-xs font-medium text-slate-500">Durum</div>
            <div className="text-sm font-medium text-slate-900">
              {finding.main_status === 'ACIK' ? 'Açık' : 'Kapalı'}
            </div>
          </div>

          <div className="space-y-1">
            <div className="text-xs font-medium text-slate-500">Aşama</div>
            <div className="text-sm font-medium text-slate-900">
              {finding.process_stage === 'DRAFT'
                ? 'Taslak'
                : finding.process_stage === 'NEGOTIATION'
                ? 'Müzakere'
                : 'Takip'}
            </div>
          </div>

          <div className="space-y-1">
            <div className="text-xs font-medium text-slate-500">Denetim Tipi</div>
            <div className="text-sm font-medium text-slate-900">
              {finding.audit_type === 'SUBE'
                ? 'Şube'
                : finding.audit_type === 'SUREC_BS'
                ? 'Süreç/BS'
                : 'Genel'}
            </div>
          </div>

          {finding.financial_impact > 0 && (
            <div className="space-y-1">
              <div className="text-xs font-medium text-slate-500">Mali Etki</div>
              <div className="flex items-center gap-2 text-sm font-medium text-slate-900">
                <DollarSign className="w-4 h-4 text-green-600" />
                {finding.financial_impact.toLocaleString('tr-TR')} TL
              </div>
            </div>
          )}
        </div>

        {finding.detection_html && (
          <div className="space-y-2">
            <h3 className="text-sm font-semibold text-slate-700 flex items-center gap-2">
              <AlertCircle className="w-4 h-4" />
              Tespit
            </h3>
            <div
              className="prose prose-sm max-w-none text-slate-700"
              dangerouslySetInnerHTML={{ __html: finding.detection_html }}
            />
          </div>
        )}

        {finding.impact_html && (
          <div className="space-y-2">
            <h3 className="text-sm font-semibold text-slate-700 flex items-center gap-2">
              <FileText className="w-4 h-4" />
              Etki
            </h3>
            <div
              className="prose prose-sm max-w-none text-slate-700"
              dangerouslySetInnerHTML={{ __html: finding.impact_html }}
            />
          </div>
        )}

        {finding.recommendation_html && (
          <div className="space-y-2">
            <h3 className="text-sm font-semibold text-slate-700 flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4" />
              Öneri
            </h3>
            <div
              className="prose prose-sm max-w-none text-slate-700"
              dangerouslySetInnerHTML={{ __html: finding.recommendation_html }}
            />
          </div>
        )}

        {finding.assignment && (
          <div className="border-t border-slate-200 pt-6 space-y-4">
            <h3 className="text-sm font-semibold text-slate-700">Atama Bilgileri</h3>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1">
                <div className="text-xs font-medium text-slate-500">Portal Durumu</div>
                <div>
                  <span
                    className={`text-xs px-2 py-1 rounded ${
                      finding.assignment.portal_status === 'AGREED'
                        ? 'bg-green-100 text-green-800'
                        : finding.assignment.portal_status === 'DISAGREED'
                        ? 'bg-red-100 text-red-800'
                        : 'bg-yellow-100 text-yellow-800'
                    }`}
                  >
                    {finding.assignment.portal_status === 'PENDING'
                      ? 'Bekliyor'
                      : finding.assignment.portal_status === 'AGREED'
                      ? 'Kabul Edildi'
                      : 'Reddedildi'}
                  </span>
                </div>
              </div>

              <div className="space-y-1">
                <div className="text-xs font-medium text-slate-500">Öncelik</div>
                <div>
                  <span
                    className={`text-xs px-2 py-1 rounded ${
                      finding.assignment.priority === 'ACIL'
                        ? 'bg-red-100 text-red-800'
                        : finding.assignment.priority === 'ONCELIKLI'
                        ? 'bg-orange-100 text-orange-800'
                        : 'bg-blue-100 text-blue-800'
                    }`}
                  >
                    {finding.assignment.priority}
                  </span>
                </div>
              </div>
            </div>

            {finding.assignment.auditee_opinion && (
              <div className="space-y-2">
                <div className="text-xs font-medium text-slate-500">Denetlenen Görüşü</div>
                <div className="text-sm text-slate-700 bg-slate-50 p-3 rounded border border-slate-200">
                  {finding.assignment.auditee_opinion}
                </div>
              </div>
            )}

            {finding.assignment.rejection_reason && (
              <div className="space-y-2">
                <div className="text-xs font-medium text-slate-500">Red Gerekçesi</div>
                <div className="text-sm text-slate-700 bg-red-50 p-3 rounded border border-red-200">
                  {finding.assignment.rejection_reason}
                </div>
              </div>
            )}
          </div>
        )}

        {actionSteps.length > 0 && (
          <div className="border-t border-slate-200 pt-6 space-y-4">
            <h3 className="text-sm font-semibold text-slate-700">Aksiyon Adımları</h3>
            <div className="space-y-3">
              {actionSteps.map((step) => (
                <div
                  key={step.id}
                  className="flex items-start gap-3 p-3 bg-slate-50 rounded-lg border border-slate-200"
                >
                  <div
                    className={`mt-1 w-5 h-5 rounded-full flex items-center justify-center ${
                      step.status === 'CLOSED'
                        ? 'bg-green-100'
                        : step.status === 'PENDING_VERIFICATION'
                        ? 'bg-yellow-100'
                        : 'bg-slate-100'
                    }`}
                  >
                    {step.status === 'CLOSED' && (
                      <CheckCircle2 className="w-3 h-3 text-green-600" />
                    )}
                    {step.status === 'PENDING_VERIFICATION' && (
                      <Clock className="w-3 h-3 text-yellow-600" />
                    )}
                  </div>
                  <div className="flex-1 space-y-1">
                    <div className="text-sm text-slate-900">{step.description}</div>
                    <div className="flex items-center gap-4 text-xs text-slate-500">
                      <div className="flex items-center gap-1">
                        <Calendar className="w-3 h-3" />
                        Termin: {new Date(step.due_date).toLocaleDateString('tr-TR')}
                      </div>
                      {step.completion_date && (
                        <div className="flex items-center gap-1 text-green-600">
                          <CheckCircle2 className="w-3 h-3" />
                          Tamamlandı: {new Date(step.completion_date).toLocaleDateString('tr-TR')}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
