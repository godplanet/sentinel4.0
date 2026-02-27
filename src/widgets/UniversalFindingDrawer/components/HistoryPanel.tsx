import { History, CheckCircle2, FileText, User, ShieldAlert, Sparkles } from 'lucide-react';
import clsx from 'clsx';
import type { FindingHistory } from '@/entities/finding/model/types';

interface HistoryPanelProps {
  findingId: string | null;
}

// MOCK DATA: Gerçek bağlantı yapılana kadar
const MOCK_HISTORY: FindingHistory[] = [
  {
    id: 'h1', tenant_id: 't1', finding_id: 'f1',
    previous_state: 'DRAFT', new_state: 'IN_REVIEW',
    change_type: 'STATE_CHANGE',
    change_description: 'Bulgu taslağı tamamlandı ve yönetici incelemesine gönderildi.',
    changed_by: 'Ahmet Yılmaz (Müfettiş)', changed_by_role: 'AUDITOR',
    changed_at: '2026-02-14T09:30:00Z'
  },
  {
    id: 'h2', tenant_id: 't1', finding_id: 'f1',
    previous_state: '', new_state: '',
    change_type: 'AI_GENERATION',
    change_description: 'Sentinel AI tarafından "Benzerlik Analizi" çalıştırıldı. %85 eşleşme bulundu.',
    changed_by: 'Sentinel Prime', changed_by_role: 'SYSTEM',
    changed_at: '2026-02-14T09:35:00Z'
  },
  {
    id: 'h3', tenant_id: 't1', finding_id: 'f1',
    previous_state: '', new_state: '',
    change_type: 'COMMENT_ADDED',
    change_description: 'Mali etki hesaplamasıyla ilgili inceleme notu eklendi.',
    changed_by: 'Mehmet Demir (Yönetici)', changed_by_role: 'AUDIT_MANAGER',
    changed_at: '2026-02-14T10:15:00Z'
  },
];

export function HistoryPanel({ findingId }: HistoryPanelProps) {
  
  const getIcon = (type: string) => {
    switch (type) {
      case 'STATE_CHANGE': return <CheckCircle2 size={16} className="text-blue-600" />;
      case 'AI_GENERATION': return <Sparkles size={16} className="text-purple-600" />;
      case 'SEVERITY_CHANGE': return <ShieldAlert size={16} className="text-orange-600" />;
      default: return <FileText size={16} className="text-slate-600" />;
    }
  };

  return (
    <div className="h-full flex flex-col animate-in fade-in duration-300">
      
      <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 mb-6 shrink-0 flex items-center gap-3">
        <History className="text-slate-500 w-6 h-6" />
        <div>
          <h3 className="font-bold text-slate-800 text-sm">Denetim İzi (Audit Trail)</h3>
          <p className="text-xs text-slate-500">Bu bulgu üzerinde yapılan tüm işlemlerin yasal kayıtları.</p>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto custom-scrollbar pr-2 pb-20">
        <div className="space-y-6 relative before:absolute before:inset-0 before:ml-2.5 before:-translate-x-px before:h-full before:w-0.5 before:bg-slate-200">
          
          {MOCK_HISTORY.map((item) => (
            <div key={item.id} className="relative pl-8 group">
              {/* Timeline Noktası */}
              <div className={clsx(
                "absolute left-0 top-1 w-5 h-5 rounded-full border-2 bg-white flex items-center justify-center z-10 transition-colors",
                item.change_type === 'AI_GENERATION' ? "border-purple-500 group-hover:bg-purple-50" : "border-blue-500 group-hover:bg-blue-50"
              )}>
                <div className={clsx("w-2 h-2 rounded-full", item.change_type === 'AI_GENERATION' ? "bg-purple-500" : "bg-blue-500")} />
              </div>

              {/* Kart */}
              <div className="bg-white border border-slate-200 rounded-lg p-3 shadow-sm group-hover:border-blue-300 transition-all">
                <div className="flex justify-between items-start mb-1">
                  <span className={clsx("text-xs font-bold px-2 py-0.5 rounded", 
                    item.change_type === 'STATE_CHANGE' ? "bg-blue-100 text-blue-700" :
                    item.change_type === 'AI_GENERATION' ? "bg-purple-100 text-purple-700" :
                    "bg-slate-100 text-slate-700"
                  )}>
                    {item.change_type.replace('_', ' ')}
                  </span>
                  <span className="text-[10px] font-medium text-slate-400">
                    {new Date(item.changed_at).toLocaleTimeString('tr-TR', { hour: '2-digit', minute: '2-digit' })}
                  </span>
                </div>
                
                <p className="text-xs text-slate-700 font-medium mb-2 leading-relaxed">
                  {item.change_description}
                </p>

                <div className="flex items-center gap-2 pt-2 border-t border-slate-100">
                  <div className="flex items-center gap-1 text-[10px] font-bold text-slate-500">
                    {item.changed_by_role === 'SYSTEM' ? <Sparkles size={12} /> : <User size={12} />}
                    {item.changed_by}
                  </div>
                  <span className="text-[10px] text-slate-300">•</span>
                  <span className="text-[10px] text-slate-400">{new Date(item.changed_at).toLocaleDateString('tr-TR')}</span>
                </div>
              </div>
            </div>
          ))}

        </div>
        
        <div className="mt-8 text-center">
           <span className="text-[10px] font-bold text-slate-300 uppercase tracking-widest">Kayıtların Sonu</span>
        </div>
      </div>
    </div>
  );
}