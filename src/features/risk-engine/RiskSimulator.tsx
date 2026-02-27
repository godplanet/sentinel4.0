import { useState } from 'react';
import { calculateAuditScore, calculateRisk } from './logic';
import { Finding } from './types';
import { cn } from '@/shared/lib/utils';
import { ShieldAlert, TrendingDown, Repeat, Trash2, Info } from 'lucide-react';
import { RiskSeverity } from '@/entities/risk/types';

export const RiskSimulator = () => {
  const [volume, setVolume] = useState(1000000);
  const [impact] = useState(4);
  const [control] = useState(0.5);

  // 2. STATE: Denetim Puanlama Girdileri
  const [processWeight, setProcessWeight] = useState(1.5);
  const [findings, setFindings] = useState<Finding[]>([]);

  // 3. MOTOR ÇAĞRILARI (Real-time Calculation)
  // Logic dosyasındaki calculateAuditScore fonksiyonunu kullanıyoruz
  const auditResult = calculateAuditScore({
    findings: findings,
    methodologyMultiplier: processWeight
  });

  // Logic dosyasındaki calculateRisk fonksiyonunu kullanıyoruz
  const riskResult = calculateRisk({
    baseImpact: impact,
    volume: volume,
    controlEffectiveness: control
  });

  // 4. AKSİYONLAR
  const addFinding = (severity: RiskSeverity) => {
    const newFinding: Finding = {
      id: Math.random().toString(),
      title: 'Simüle Edilmiş Bulgu',
      severity,
      isRepeat: false,
      rootCauseCategory: 'PROCESS'
    };
    setFindings([...findings, newFinding]);
  };

  const toggleRepeat = (id: string) => {
    setFindings(findings.map(f => f.id === id ? { ...f, isRepeat: !f.isRepeat } : f));
  };

  const removeFinding = (id: string) => {
    setFindings(findings.filter(f => f.id !== id));
  };

  return (
    <div className="glass-panel p-6 rounded-2xl space-y-6 border-l-4 border-l-indigo-500 transition-all">
      {/* HEADER */}
      <div className="flex justify-between items-center border-b border-slate-100 pb-4">
        <h3 className="font-bold text-lg flex items-center gap-2 text-slate-800">
          <ShieldAlert className="text-indigo-600" />
          Risk & Denetim Simülatörü
        </h3>
        <span className="text-[10px] font-mono bg-slate-100 px-2 py-1 rounded text-slate-500 border border-slate-200">
          v3.0.2 (Hybrid Engine)
        </span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        
        {/* SOL PANEL: GİRDİLER */}
        <div className="space-y-6">
          
          {/* Hacim Slider */}
          <div>
            <div className="flex justify-between mb-1">
              <label className="text-xs font-bold text-slate-500 uppercase">Süreç Hacmi (TL)</label>
              <span className="text-xs font-mono text-indigo-600">{volume.toLocaleString()}</span>
            </div>
            <input
              type="range"
              min="1000"
              max="100000000"
              step="10000"
              value={volume}
              onChange={(e) => setVolume(Number(e.target.value))}
              className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-indigo-600"
            />
            <p className="text-[10px] text-slate-400 mt-1 flex items-center gap-1">
              <Info size={10} />
              <span>Logaritmik Etki: ln({volume})</span>
            </p>
          </div>

          {/* Süreç Ağırlığı */}
          <div>
            <label className="text-xs font-bold text-slate-500 uppercase">Süreç Ağırlığı</label>
            <div className="flex gap-2 mt-1">
              {[0.5, 1.0, 1.2, 1.5].map(w => (
                <button
                  key={w}
                  onClick={() => setProcessWeight(w)}
                  className={cn(
                    "px-3 py-1 text-xs font-bold rounded border transition-all",
                    processWeight === w
                      ? "bg-indigo-600 text-white border-indigo-600 shadow-sm"
                      : "bg-white text-slate-600 hover:bg-slate-50 border-slate-200"
                  )}
                >
                  {w}x
                </button>
              ))}
            </div>
          </div>

          {/* Bulgu Yönetimi */}
          <div className="pt-4 border-t border-slate-100">
            <div className="flex justify-between items-center mb-2">
              <label className="text-xs font-bold text-slate-500 uppercase">Bulgu Simülasyonu</label>
              <span className="text-[10px] text-slate-400">{findings.length} Kayıt</span>
            </div>
            
            <div className="grid grid-cols-2 gap-2 mb-3">
              <button onClick={() => addFinding('CRITICAL')} className="px-3 py-2 bg-rose-50 text-rose-700 text-xs font-bold rounded hover:bg-rose-100 border border-rose-200 transition-colors">
                + KRİTİK (25p)
              </button>
              <button onClick={() => addFinding('HIGH')} className="px-3 py-2 bg-orange-50 text-orange-700 text-xs font-bold rounded hover:bg-orange-100 border border-orange-200 transition-colors">
                + YÜKSEK (10p)
              </button>
            </div>

            <div className="max-h-48 overflow-y-auto space-y-2 pr-1 custom-scrollbar">
              {findings.map(f => (
                <div key={f.id} className="flex justify-between items-center text-xs p-2 bg-white rounded border border-slate-100 shadow-sm hover:border-slate-300 transition-all">
                   <div className="flex items-center gap-2">
                     <span className={cn(
                       "w-2 h-2 rounded-full",
                       f.severity === 'CRITICAL' ? "bg-rose-500" : "bg-orange-500"
                     )} />
                     <span className="font-semibold text-slate-700">{f.severity}</span>
                   </div>
                   
                   <div className="flex gap-1">
                     <button 
                       onClick={() => toggleRepeat(f.id)} 
                       title="Tekerrür Eden Bulgu"
                       className={cn(
                         "p-1.5 rounded transition-colors", 
                         f.isRepeat ? "bg-purple-100 text-purple-700 ring-1 ring-purple-200" : "text-slate-400 hover:bg-slate-100"
                       )}
                     >
                       <Repeat size={14} />
                     </button>
                     <button 
                       onClick={() => removeFinding(f.id)} 
                       className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded transition-colors"
                     >
                       <Trash2 size={14} />
                     </button>
                   </div>
                </div>
              ))}
              {findings.length === 0 && (
                <div className="text-center py-4 text-slate-400 text-xs italic border-2 border-dashed border-slate-100 rounded-lg">
                  Henüz bulgu eklenmedi.
                </div>
              )}
            </div>
          </div>
        </div>

        {/* SAĞ PANEL: DASHBOARD */}
        <div className="bg-slate-50/50 rounded-xl p-6 flex flex-col items-center justify-center text-center relative overflow-hidden border border-slate-200">
          
          {/* Puan Kartı */}
          <div className={cn(
            "w-36 h-36 rounded-full flex flex-col items-center justify-center border-4 shadow-xl transition-all duration-500 mb-4 bg-white relative z-10",
            auditResult.grade === 'A' ? "border-emerald-500 text-emerald-700" :
            auditResult.grade === 'B' ? "border-blue-500 text-blue-700" :
            auditResult.grade === 'C' ? "border-yellow-500 text-yellow-700" :
            auditResult.grade === 'D' ? "border-orange-500 text-orange-700" :
            "border-rose-500 text-rose-700"
          )}>
            <div>
              <div className="text-5xl font-bold tracking-tighter tabular-nums">{auditResult.finalScore}</div>
              <div className="text-2xl font-bold opacity-80">{auditResult.grade}</div>
            </div>
          </div>

          <div className="text-sm font-bold text-slate-700 mb-4">
            {auditResult.grade === 'A' ? "Mükemmel" :
             auditResult.grade === 'F' ? "BAŞARISIZ" : "Gelişime Açık"}
          </div>

          {/* Limit Uyarısı */}
          {auditResult.isLimited && (
            <div className="mb-6 flex items-center gap-2 text-xs font-bold text-rose-600 bg-rose-100 px-3 py-1.5 rounded-full animate-pulse border border-rose-200">
              <TrendingDown className="w-3 h-3" />
              {auditResult.limitReason}
            </div>
          )}

          {/* Alt Bilgiler */}
          <div className="w-full grid grid-cols-2 gap-3">
             <div className="text-left bg-white p-3 rounded-lg border border-slate-200 shadow-sm">
                <div className="text-[10px] uppercase text-slate-400 font-bold mb-1">Doğal Risk</div>
                <div className="text-lg font-mono font-bold text-slate-700">
                  {riskResult.inherentRisk}
                </div>
             </div>
             <div className="text-left bg-white p-3 rounded-lg border border-slate-200 shadow-sm">
                <div className="text-[10px] uppercase text-slate-400 font-bold mb-1">Tekerrür Cezası</div>
                <div className="text-lg font-mono font-bold text-purple-600">
                  -{auditResult.deductions.repeatPenalty}p
                </div>
             </div>
          </div>

        </div>
      </div>
    </div>
  );
};