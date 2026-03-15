import { ArrowRight } from 'lucide-react';
import { useEffect, useState } from 'react';
import { useDelphiStore } from '../store';
import type { Vote } from '../types';
import { ZenSlider } from './ZenSlider';

const DEFAULT_VOTE: Vote = { likelihood: 3, impact: 3, velocity: 3 };

export function OracleBoard() {
 const { risks, currentRiskIndex, round, submitVote } = useDelphiStore();
 const currentRisk = risks[currentRiskIndex];

 const [vote, setVote] = useState<Vote>(DEFAULT_VOTE);

 useEffect(() => {
 if (currentRisk?.currentVote) {
 setVote(currentRisk.currentVote);
 } else {
 setVote(DEFAULT_VOTE);
 }
 }, [currentRisk?.id]);

 const handleSubmit = () => {
 submitVote(currentRisk.id, vote);
 setVote(DEFAULT_VOTE);
 };

 if (!currentRisk) {
 return (
 <div className="text-center py-12 text-slate-500 text-sm">
 Oylanacak risk yok. RKM’de en az bir aktif risk tanımlı olmalıdır.
 </div>
 );
 }

 return (
 <div className="w-full max-w-xl mx-auto">
 <div className="flex items-center justify-between mb-10">
 <div className="flex items-center gap-2">
 {(risks || []).map((_, i) => (
 <div
 key={i}
 className={`h-1.5 rounded-full transition-all duration-500 ${
 i < currentRiskIndex
 ? 'bg-slate-900 w-6'
 : i === currentRiskIndex
 ? 'bg-slate-900 w-8'
 : 'bg-slate-200 w-6'
 }`}
 />
 ))}
 </div>
 <span className="text-xs font-medium text-slate-400 tabular-nums">
 {currentRiskIndex + 1} / {risks.length}
 </span>
 </div>

 <div className="mb-4">
 <span className="inline-block text-[11px] font-semibold tracking-widest text-slate-400 uppercase mb-3">
 Tur {round} &mdash; {currentRisk.category}
 </span>
 <h1 className="text-3xl font-light tracking-tight text-primary mb-3 leading-snug">
 {currentRisk.title}
 </h1>
 <p className="text-sm text-slate-500 leading-relaxed max-w-lg">
 {currentRisk.description}
 </p>
 </div>

 <div className="bg-surface rounded-2xl border border-slate-100 shadow-sm p-7 space-y-7 mb-4">
 <ZenSlider
 label="Etki"
 subLabel="Impact"
 value={vote.impact}
 onChange={v => setVote(prev => ({ ...prev, impact: v }))}
 />
 <div className="border-t border-slate-50" />
 <ZenSlider
 label="Olasılık"
 subLabel="Likelihood"
 value={vote.likelihood}
 onChange={v => setVote(prev => ({ ...prev, likelihood: v }))}
 />
 <div className="border-t border-slate-50" />
 <ZenSlider
 label="Risk Hızı"
 subLabel="Velocity — speed of onset"
 value={vote.velocity}
 onChange={v => setVote(prev => ({ ...prev, velocity: v }))}
 />
 </div>

 <div className="flex items-center justify-between">
 <div className="text-xs text-slate-400">
 Oylama gizli tutulmaktadır
 </div>
 <button
 onClick={handleSubmit}
 className="inline-flex items-center gap-2.5 bg-slate-900 text-white text-sm font-semibold hover:bg-slate-800 active:scale-95 rounded-full px-6 py-3 transition-all duration-150"
 >
 {currentRiskIndex < risks.length - 1 ? 'Onayla & Sonraki' : 'Tamamla'}
 <ArrowRight size={15} />
 </button>
 </div>
 </div>
 );
}
