import { useState } from 'react';
import {
  FileCheck,
  Clock,
  CheckCircle,
  AlertCircle,
  Plus,
  Calendar,
  Upload,
  Loader2,
} from 'lucide-react';
import clsx from 'clsx';
import type { EvidenceRequest, EvidenceRequestStatus, Questionnaire, QuestionnaireQuestion } from '@/entities/workpaper/model/detail-types';
import { QuestionnairePanel } from './QuestionnairePanel';

interface EvidencePanelProps {
  requests: EvidenceRequest[];
  loading: boolean;
  onStatusChange: (requestId: string, status: EvidenceRequestStatus) => void;
  onAddRequest: (title: string, description: string, dueDate: string | null) => void;
  questionnaires?: Questionnaire[];
  questionnairesLoading?: boolean;
  onCreateQuestionnaire?: (title: string, questions: QuestionnaireQuestion[], sentTo: string) => Promise<void>;
  onSimulateResponse?: (questionnaireId: string, questions: QuestionnaireQuestion[]) => Promise<void>;
  onMarkReviewed?: (questionnaireId: string) => Promise<void>;
}

const STATUS_CONFIG: Record<EvidenceRequestStatus, { label: string; icon: typeof Clock; color: string; bg: string; border: string }> = {
  pending: { label: 'Bekliyor', icon: Clock, color: 'text-amber-700', bg: 'bg-amber-50', border: 'border-amber-200' },
  submitted: { label: 'Gonderildi', icon: Upload, color: 'text-blue-700', bg: 'bg-blue-50', border: 'border-blue-200' },
  accepted: { label: 'Onaylandi', icon: CheckCircle, color: 'text-emerald-700', bg: 'bg-emerald-50', border: 'border-emerald-200' },
};

export function EvidencePanel({
  requests, loading, onStatusChange, onAddRequest,
  questionnaires = [], questionnairesLoading = false,
  onCreateQuestionnaire, onSimulateResponse, onMarkReviewed,
}: EvidencePanelProps) {
  const [showAddForm, setShowAddForm] = useState(false);
  const [newTitle, setNewTitle] = useState('');
  const [newDesc, setNewDesc] = useState('');
  const [newDueDate, setNewDueDate] = useState('');

  const pending = requests.filter(r => r.status === 'pending').length;
  const submitted = requests.filter(r => r.status === 'submitted').length;
  const accepted = requests.filter(r => r.status === 'accepted').length;

  const handleAdd = () => {
    if (!newTitle.trim()) return;
    onAddRequest(newTitle.trim(), newDesc.trim(), newDueDate || null);
    setNewTitle('');
    setNewDesc('');
    setNewDueDate('');
    setShowAddForm(false);
  };

  const formatDate = (dateStr: string | null) => {
    if (!dateStr) return '-';
    return new Date(dateStr).toLocaleDateString('tr-TR', { day: 'numeric', month: 'short', year: 'numeric' });
  };

  const isOverdue = (dateStr: string | null) => {
    if (!dateStr) return false;
    return new Date(dateStr) < new Date();
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-16">
        <Loader2 className="animate-spin text-blue-600 mr-2" size={20} />
        <span className="text-sm text-slate-500">Yukleniyor...</span>
      </div>
    );
  }

  return (
    <div className="space-y-5">
      <div className="grid grid-cols-3 gap-3">
        <div className="bg-amber-50 border border-amber-200 rounded-xl p-3 text-center">
          <p className="text-2xl font-bold text-amber-700">{pending}</p>
          <p className="text-[10px] font-bold text-amber-600 uppercase tracking-wider">Bekliyor</p>
        </div>
        <div className="bg-blue-50 border border-blue-200 rounded-xl p-3 text-center">
          <p className="text-2xl font-bold text-blue-700">{submitted}</p>
          <p className="text-[10px] font-bold text-blue-600 uppercase tracking-wider">Gonderildi</p>
        </div>
        <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-3 text-center">
          <p className="text-2xl font-bold text-emerald-700">{accepted}</p>
          <p className="text-[10px] font-bold text-emerald-600 uppercase tracking-wider">Onaylandi</p>
        </div>
      </div>

      <div className="space-y-3">
        {requests.map((req) => {
          const cfg = STATUS_CONFIG[req.status as EvidenceRequestStatus];
          const StatusIcon = cfg.icon;
          const overdue = req.status === 'pending' && isOverdue(req.due_date);

          return (
            <div
              key={req.id}
              className={clsx(
                'border rounded-xl p-4 transition-all',
                overdue ? 'border-red-300 bg-red-50/50' : `${cfg.border} ${cfg.bg}/30`,
              )}
            >
              <div className="flex items-start gap-3">
                <div className={clsx('mt-0.5 p-2 rounded-lg shrink-0', cfg.bg)}>
                  <StatusIcon size={16} className={cfg.color} />
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-2 mb-1">
                    <h4 className="text-sm font-bold text-slate-900">{req.title}</h4>
                    {overdue && (
                      <span className="shrink-0 flex items-center gap-1 px-2 py-0.5 bg-red-100 text-red-700 text-[10px] font-bold rounded-full border border-red-300">
                        <AlertCircle size={10} />
                        Gecikti
                      </span>
                    )}
                  </div>

                  {req.description && (
                    <p className="text-xs text-slate-600 leading-relaxed mb-2">{req.description}</p>
                  )}

                  <div className="flex items-center gap-4 text-[11px] text-slate-500">
                    {req.due_date && (
                      <span className={clsx('flex items-center gap-1', overdue && 'text-red-600 font-semibold')}>
                        <Calendar size={11} />
                        {formatDate(req.due_date)}
                      </span>
                    )}
                    <span className={clsx('flex items-center gap-1 font-semibold', cfg.color)}>
                      <StatusIcon size={11} />
                      {cfg.label}
                    </span>
                  </div>

                  <div className="flex items-center gap-2 mt-3">
                    {req.status === 'pending' && (
                      <button
                        onClick={() => onStatusChange(req.id, 'submitted')}
                        className="flex items-center gap-1.5 px-3 py-1.5 bg-blue-600 text-white text-xs font-semibold rounded-lg hover:bg-blue-700 transition-colors"
                      >
                        <Upload size={12} />
                        Gonderildi Isaretle
                      </button>
                    )}
                    {req.status === 'submitted' && (
                      <button
                        onClick={() => onStatusChange(req.id, 'accepted')}
                        className="flex items-center gap-1.5 px-3 py-1.5 bg-emerald-600 text-white text-xs font-semibold rounded-lg hover:bg-emerald-700 transition-colors"
                      >
                        <CheckCircle size={12} />
                        Kabul Et
                      </button>
                    )}
                    {req.status === 'accepted' && (
                      <span className="flex items-center gap-1.5 px-3 py-1.5 bg-emerald-100 text-emerald-700 text-xs font-semibold rounded-lg border border-emerald-300">
                        <FileCheck size={12} />
                        Tamamlandi
                      </span>
                    )}
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {requests.length === 0 && !showAddForm && (
        <div className="text-center py-10 border-2 border-dashed border-slate-200 rounded-xl">
          <FileCheck className="mx-auto text-slate-300 mb-3" size={36} />
          <p className="text-sm text-slate-500 font-medium">Henuz kanit talebi yok</p>
          <p className="text-xs text-slate-400 mt-1">Yeni bir PBC talebi ekleyin</p>
        </div>
      )}

      {showAddForm ? (
        <div className="border border-blue-200 bg-blue-50/30 rounded-xl p-4 space-y-3">
          <div>
            <label className="block text-xs font-bold text-slate-600 mb-1">Talep Basligi</label>
            <input
              type="text"
              value={newTitle}
              onChange={(e) => setNewTitle(e.target.value)}
              placeholder="orn. Mart 2026 Genel Mizan"
              className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
              autoFocus
            />
          </div>
          <div>
            <label className="block text-xs font-bold text-slate-600 mb-1">Aciklama</label>
            <textarea
              rows={2}
              value={newDesc}
              onChange={(e) => setNewDesc(e.target.value)}
              placeholder="Talep edilen belgenin detaylari..."
              className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none bg-white"
            />
          </div>
          <div>
            <label className="block text-xs font-bold text-slate-600 mb-1">Son Tarih</label>
            <input
              type="date"
              value={newDueDate}
              onChange={(e) => setNewDueDate(e.target.value)}
              className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
            />
          </div>
          <div className="flex items-center gap-2 pt-1">
            <button
              onClick={handleAdd}
              disabled={!newTitle.trim()}
              className="px-4 py-2 bg-blue-600 text-white text-sm font-semibold rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              Talep Olustur
            </button>
            <button
              onClick={() => { setShowAddForm(false); setNewTitle(''); setNewDesc(''); setNewDueDate(''); }}
              className="px-4 py-2 text-slate-600 text-sm font-medium hover:bg-slate-100 rounded-lg transition-colors"
            >
              Iptal
            </button>
          </div>
        </div>
      ) : (
        <button
          onClick={() => setShowAddForm(true)}
          className="w-full flex items-center justify-center gap-2 px-4 py-3 border-2 border-dashed border-slate-200 rounded-xl text-sm font-medium text-slate-500 hover:border-blue-300 hover:text-blue-600 hover:bg-blue-50/50 transition-all"
        >
          <Plus size={16} />
          Yeni Kanit Talebi (PBC)
        </button>
      )}

      {onCreateQuestionnaire && onSimulateResponse && onMarkReviewed && (
        <div className="border-t border-slate-200 pt-5">
          <QuestionnairePanel
            questionnaires={questionnaires}
            loading={questionnairesLoading}
            onCreateQuestionnaire={onCreateQuestionnaire}
            onSimulateResponse={onSimulateResponse}
            onMarkReviewed={onMarkReviewed}
          />
        </div>
      )}
    </div>
  );
}
