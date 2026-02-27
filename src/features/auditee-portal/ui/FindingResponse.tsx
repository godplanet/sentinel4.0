import { useState } from 'react';
import { assignmentApi, actionStepApi, type Assignment, type ActionStep } from '@/entities/finding';
import { CheckCircle2, Plus, Save, Trash2, XCircle } from 'lucide-react';

interface FindingResponseProps {
  assignment: Assignment;
  onSave?: () => void;
  onCancel?: () => void;
}

export function FindingResponse({ assignment, onSave, onCancel }: FindingResponseProps) {
  const [responseType, setResponseType] = useState<'AGREED' | 'DISAGREED'>(
    assignment.portal_status === 'DISAGREED' ? 'DISAGREED' : 'AGREED'
  );
  const [auditeeOpinion, setAuditeeOpinion] = useState(assignment.auditee_opinion || '');
  const [rejectionReason, setRejectionReason] = useState(assignment.rejection_reason || '');
  const [actionSteps, setActionSteps] = useState<Partial<ActionStep>[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  function addActionStep() {
    setActionSteps([
      ...actionSteps,
      {
        description: '',
        due_date: '',
        status: 'OPEN',
      },
    ]);
  }

  function removeActionStep(index: number) {
    setActionSteps(actionSteps.filter((_, i) => i !== index));
  }

  function updateActionStep(index: number, field: string, value: string) {
    const updated = [...actionSteps];
    updated[index] = { ...updated[index], [field]: value };
    setActionSteps(updated);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      await assignmentApi.update(assignment.id, {
        portal_status: responseType,
        auditee_opinion: auditeeOpinion,
        rejection_reason: responseType === 'DISAGREED' ? rejectionReason : undefined,
      });

      if (responseType === 'AGREED') {
        for (const step of actionSteps) {
          if (step.description && step.due_date) {
            await actionStepApi.create({
              assignment_id: assignment.id,
              description: step.description,
              due_date: step.due_date,
              status: 'OPEN',
            });
          }
        }
      }

      onSave?.();
    } catch (error) {
      console.error('Failed to submit response:', error);
      alert('Yanıt gönderilemedi');
    } finally {
      setIsSubmitting(false);
    }
  }

  const isLocked = assignment.is_locked;

  return (
    <form onSubmit={handleSubmit} className="bg-white rounded-lg border border-slate-200 overflow-hidden">
      <div className="bg-gradient-to-r from-slate-50 to-slate-100 px-6 py-4 border-b border-slate-200">
        <h3 className="text-lg font-semibold text-slate-900">
          {isLocked ? 'Yanıt (Kilitli)' : 'Yanıtınız'}
        </h3>
      </div>

      <div className="p-6 space-y-6">
        <div className="flex gap-4">
          <button
            type="button"
            disabled={isLocked}
            onClick={() => setResponseType('AGREED')}
            className={`flex-1 flex items-center justify-center gap-2 px-4 py-3 rounded-lg border-2 transition-all ${
              responseType === 'AGREED'
                ? 'bg-green-50 border-green-500 text-green-800'
                : 'bg-white border-slate-200 text-slate-600 hover:border-green-300'
            } disabled:opacity-50 disabled:cursor-not-allowed`}
          >
            <CheckCircle2 className="w-5 h-5" />
            <span className="font-medium">Kabul Ediyorum</span>
          </button>

          <button
            type="button"
            disabled={isLocked}
            onClick={() => setResponseType('DISAGREED')}
            className={`flex-1 flex items-center justify-center gap-2 px-4 py-3 rounded-lg border-2 transition-all ${
              responseType === 'DISAGREED'
                ? 'bg-red-50 border-red-500 text-red-800'
                : 'bg-white border-slate-200 text-slate-600 hover:border-red-300'
            } disabled:opacity-50 disabled:cursor-not-allowed`}
          >
            <XCircle className="w-5 h-5" />
            <span className="font-medium">Kabul Etmiyorum</span>
          </button>
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium text-slate-700">
            {responseType === 'AGREED' ? 'Kök Neden Görüşünüz' : 'Görüşünüz'}
          </label>
          <textarea
            required
            disabled={isLocked}
            value={auditeeOpinion}
            onChange={(e) => setAuditeeOpinion(e.target.value)}
            rows={4}
            className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-slate-50 disabled:cursor-not-allowed"
            placeholder={
              responseType === 'AGREED'
                ? 'Bulgunun kök nedeni hakkındaki görüşünüz...'
                : 'Bulgu hakkındaki görüşünüz...'
            }
          />
        </div>

        {responseType === 'DISAGREED' && (
          <div className="space-y-2">
            <label className="text-sm font-medium text-slate-700">Red Gerekçesi</label>
            <textarea
              required
              disabled={isLocked}
              value={rejectionReason}
              onChange={(e) => setRejectionReason(e.target.value)}
              rows={3}
              className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-slate-50 disabled:cursor-not-allowed"
              placeholder="Bulguyu neden kabul etmediğinizi açıklayın..."
            />
          </div>
        )}

        {responseType === 'AGREED' && !isLocked && (
          <div className="space-y-4 border-t border-slate-200 pt-6">
            <div className="flex items-center justify-between">
              <h4 className="text-sm font-semibold text-slate-700">Aksiyon Planı</h4>
              <button
                type="button"
                onClick={addActionStep}
                className="flex items-center gap-2 px-3 py-2 text-sm bg-blue-50 text-blue-700 rounded-lg hover:bg-blue-100 transition-colors"
              >
                <Plus className="w-4 h-4" />
                Adım Ekle
              </button>
            </div>

            {actionSteps.length === 0 ? (
              <div className="text-center py-8 text-slate-500 bg-slate-50 rounded-lg border border-dashed border-slate-300">
                Aksiyon adımı eklemek için yukarıdaki butona tıklayın
              </div>
            ) : (
              <div className="space-y-3">
                {actionSteps.map((step, index) => (
                  <div
                    key={index}
                    className="bg-slate-50 border border-slate-200 rounded-lg p-4 space-y-3"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex-1 space-y-3">
                        <input
                          type="text"
                          required
                          value={step.description || ''}
                          onChange={(e) => updateActionStep(index, 'description', e.target.value)}
                          placeholder="Aksiyon açıklaması..."
                          className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                        <input
                          type="date"
                          required
                          value={step.due_date || ''}
                          onChange={(e) => updateActionStep(index, 'due_date', e.target.value)}
                          className="px-3 py-2 bg-white border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                      </div>
                      <button
                        type="button"
                        onClick={() => removeActionStep(index)}
                        className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>

      <div className="bg-slate-50 px-6 py-4 border-t border-slate-200 flex items-center justify-end gap-3">
        <button
          type="button"
          onClick={onCancel}
          className="px-4 py-2 text-slate-700 hover:bg-slate-200 rounded-lg transition-colors"
        >
          İptal
        </button>
        {!isLocked && (
          <button
            type="submit"
            disabled={isSubmitting}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50"
          >
            <Save className="w-4 h-4" />
            {isSubmitting ? 'Gönderiliyor...' : 'Gönder'}
          </button>
        )}
      </div>
    </form>
  );
}
