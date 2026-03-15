import React, { useState } from 'react';
import { cn } from '@/shared/utils/cn';
import { CheckCircle2, AlertOctagon, FileText } from 'lucide-react';

interface Phase3Props {
  finding: any;
  onUpdate: (field: string, value: any) => void;
  isReadOnly?: boolean;
}

export const Phase3Negotiation: React.FC<Phase3Props> = ({
  finding,
  onUpdate,
  isReadOnly = false
}) => {
  const findingTitle = finding?.title || 'Bulgu';
  const initialStatus = finding?.auditee_status || 'PENDING';
  const [status, setStatus] = useState(initialStatus);
  const [reason, setReason] = useState('');

  const handleAgree = () => {
    if (isReadOnly) return;
    setStatus('AGREED');
    onUpdate('auditee_status', 'AGREED');
    onUpdate('status', 'agreed');
  };

  const handleRiskAccept = () => {
    if (isReadOnly || !reason.trim()) return;
    setStatus('DISAGREED');
    onUpdate('auditee_status', 'DISAGREED');
    onUpdate('auditee_reason', reason);
    onUpdate('status', 'risk_accepted');
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-col md:flex-row gap-4">
        {/* Mutabıkım Button */}
        <button
          onClick={handleAgree}
          disabled={isReadOnly}
          className={cn(
            "flex-1 p-4 rounded-2xl border transition-all duration-300 flex flex-col items-center justify-center gap-3 backdrop-blur-md shadow-sm",
            status === 'AGREED' 
              ? "bg-emerald-50/70 border-emerald-400 ring-2 ring-emerald-100" 
              : "bg-surface/50 border-slate-200 hover:border-emerald-300 hover:bg-emerald-50/30",
            isReadOnly && "opacity-70 cursor-not-allowed hover:border-slate-200 hover:bg-surface/50"
          )}
        >
          <CheckCircle2 size={32} className={status === 'AGREED' ? "text-emerald-600" : "text-slate-400"} />
          <div className="text-center">
            <h3 className={cn("font-bold text-lg", status === 'AGREED' ? "text-emerald-800" : "text-slate-700")}>Mutabıkım</h3>
            <p className="text-xs text-slate-500 mt-1">Bulgu içeriğini kabul ediyorum ve aksiyon alacağım.</p>
          </div>
        </button>

        {/* Risk Kabul Button toggle */}
        <button
          onClick={() => { if (!isReadOnly) setStatus('DISAGREED'); }}
          disabled={isReadOnly}
          className={cn(
            "flex-1 p-4 rounded-2xl border transition-all duration-300 flex flex-col items-center justify-center gap-3 backdrop-blur-md shadow-sm",
            status === 'DISAGREED' 
              ? "bg-rose-50/70 border-rose-400 ring-2 ring-rose-100" 
              : "bg-surface/50 border-slate-200 hover:border-rose-300 hover:bg-rose-50/30",
            isReadOnly && "opacity-70 cursor-not-allowed hover:border-slate-200 hover:bg-surface/50"
          )}
        >
          <AlertOctagon size={32} className={status === 'DISAGREED' ? "text-rose-600" : "text-slate-400"} />
          <div className="text-center">
            <h3 className={cn("font-bold text-lg", status === 'DISAGREED' ? "text-rose-800" : "text-slate-700")}>Risk Kabul</h3>
            <p className="text-xs text-slate-500 mt-1">Bulguya itiraz ediyorum veya riskini kabul ediyorum.</p>
          </div>
        </button>
      </div>

      {/* Risk Kabul Formu (Apple Glass) */}
      {status === 'DISAGREED' && (
        <div className="bg-red-50/50 backdrop-blur-md border border-red-200 rounded-2xl p-4 shadow-sm animate-in slide-in-from-top-2 fade-in duration-300">
          <div className="flex items-center gap-2 mb-4">
            <FileText className="text-red-600" size={20} />
            <h4 className="font-bold text-red-900">Risk Kabul Gerekçesi</h4>
          </div>
          <p className="text-sm text-red-800/80 mb-4 leading-relaxed">
            Lütfen <strong>{findingTitle}</strong> başlıklı bulguya neden mutabık olmadığınızı veya riski neden kabul ettiğinizi detaylıca açıklayınız. Bu gerekçe Denetim Komitesi'ne sunulacaktır.
          </p>
          <textarea
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            disabled={isReadOnly}
            placeholder="Gerekçenizi buraya yazınız..."
            className="w-full h-32 p-4 bg-white/60 backdrop-blur rounded-xl border border-red-200 focus:outline-none focus:ring-2 focus:ring-red-300 resize-none text-sm text-slate-800 disabled:opacity-50"
          />
          {!isReadOnly && (
            <div className="mt-4 flex justify-end">
              <button 
                onClick={handleRiskAccept}
                disabled={reason.length < 10}
                className="px-4 py-2 bg-red-600 hover:bg-red-700 disabled:bg-red-300 text-white font-bold text-sm rounded-xl transition-all shadow-sm"
              >
                Gerekçeyi Yönetime İlet
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
