import React from 'react';
import { cn } from '@/shared/utils/cn';
import { CheckCircle2, Circle, AlertCircle, FileText } from 'lucide-react';

interface QAPhaseProps {
  finding: any;
  onUpdate: (field: string, value: any) => void;
}

const QA_CHECKLIST = [
  { id: 'c1', label: '5N1K Kuralı: Ne, nerede, ne zaman, nasıl, neden ve kim sorularının cevabı net mi?' },
  { id: 'c2', label: 'Kök Neden Doğrulaması: Kök neden analizi sadece sempoma değil asıl soruna mı işaret ediyor?' },
  { id: 'c3', label: 'Kanıt Yeterliliği: Sunulan kanıtlar bulguyu %100 oranında doğruluyor mu?' },
  { id: 'c4', label: 'Aksiyon Planı Realliği: Önerilen düzeltici aksiyon gerçekleştirilebilir ve ölçülebilir mi?' },
  { id: 'c5', label: 'Kurum Kültürü Uyum: Kullanılan dil yapıcı, objektif ve denetim standartlarına uygun mu?' }
];

export const QAPhase: React.FC<QAPhaseProps> = ({ finding, onUpdate }) => {
  const checklist = finding?.qa_checklist || [];
  const notes = finding?.qa_notes || '';

  const toggleCheck = (id: string) => {
    if (checklist.includes(id)) {
      onUpdate('qa_checklist', checklist.filter((i: string) => i !== id));
    } else {
      onUpdate('qa_checklist', [...checklist, id]);
    }
  };

  const isComplete = checklist.length === QA_CHECKLIST.length;

  return (
    <div className="space-y-4">
      <div className="p-4 bg-white/70 backdrop-blur-lg border border-slate-200 shadow-sm rounded-xl hover:shadow-[0_0_15px_rgba(79,70,229,0.05)] transition-shadow">
        <div className="flex items-center gap-2 mb-4">
          <CheckCircle2 size={20} className="text-indigo-600" />
          <h3 className="text-sm font-bold text-slate-800">QAIP Kontrol Listesi</h3>
        </div>
        
        <div className="space-y-3">
          {QA_CHECKLIST.map((item) => {
            const isChecked = checklist.includes(item.id);
            return (
              <div 
                key={item.id}
                onClick={() => toggleCheck(item.id)}
                className={cn(
                  "p-3 rounded-lg border flex items-start gap-3 cursor-pointer transition-all",
                  isChecked 
                    ? "bg-indigo-50/50 border-indigo-200" 
                    : "bg-white border-slate-200 hover:border-indigo-300"
                )}
              >
                {isChecked ? (
                  <CheckCircle2 size={18} className="text-indigo-600 shrink-0 mt-0.5" />
                ) : (
                  <Circle size={18} className="text-slate-300 shrink-0 mt-0.5" />
                )}
                <span className={cn(
                  "text-xs leading-relaxed",
                  isChecked ? "text-slate-700 font-medium" : "text-slate-600"
                )}>
                  {item.label}
                </span>
              </div>
            );
          })}
        </div>
      </div>

      <div className="p-4 bg-white/70 backdrop-blur-lg border border-slate-200 shadow-sm rounded-xl">
        <div className="flex items-center gap-2 mb-4">
          <FileText size={20} className="text-slate-600" />
          <h3 className="text-sm font-bold text-slate-800">İnceleme Notları</h3>
        </div>
        <textarea
          value={notes}
          onChange={(e) => onUpdate('qa_notes', e.target.value)}
          placeholder="Varsa QA (Quality Assurance) ek notlarınızı buraya yazın..."
          className="w-full p-3 text-sm border border-slate-200 rounded-lg min-h-[120px] resize-none focus:ring-2 focus:ring-indigo-500 outline-none bg-white/90"
        />
      </div>

      {isComplete ? (
        <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-lg flex items-start gap-3 animate-in fade-in">
          <CheckCircle2 size={20} className="text-emerald-600 shrink-0" />
          <div>
            <h4 className="text-sm font-bold text-emerald-800">Kalite Kontrol Tamamlandı</h4>
            <p className="text-xs text-emerald-700 mt-1">Bulgu onaylanmak veya bir sonraki aşamaya geçmek için hazır.</p>
          </div>
        </div>
      ) : (
        <div className="p-4 bg-amber-50 border border-amber-200 rounded-lg flex items-start gap-3">
          <AlertCircle size={20} className="text-amber-600 shrink-0" />
          <div>
            <h4 className="text-sm font-bold text-amber-800">Onay Zırhı Aktif</h4>
            <p className="text-xs text-amber-700 mt-1">Tüm maddeler kontrol edilmeden bulgu "QA Onaylandı" statüsüne geçemez.</p>
          </div>
        </div>
      )}
    </div>
  );
};
