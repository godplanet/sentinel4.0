import {
 useBoardEffectiveness,
 useBoardMembers, useSkillEvaluations
} from '@/features/board-evaluation/api';
import clsx from 'clsx';
import { AlertTriangle, BookOpen, Target, UserCheck } from 'lucide-react';
import { useMemo, useState } from 'react';
import { PolarAngleAxis, PolarGrid, PolarRadiusAxis, Radar, RadarChart, ResponsiveContainer, Tooltip } from 'recharts';

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------
function getAvatarLetters(name: string) {
 return name.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase();
}

function CustomTooltip({ active, payload }: any) {
 if (active && payload && payload.length) {
 const data = payload[0].payload;
 return (
 <div className="bg-white border border-slate-200 p-3 rounded-lg shadow-lg text-sm">
 <p className="font-bold text-indigo-900 mb-1">{data.skill_category}</p>
 <p className="text-indigo-600 font-bold mb-2">Yetenek Skoru: {data.score} / 10</p>
 {data.evaluator_note && (
 <div className="bg-slate-50 p-2 border border-slate-100 rounded text-xs text-slate-700 italic">
 "{data.evaluator_note}"
 </div>
 )}
 </div>
 );
 }
 return null;
}

// ---------------------------------------------------------------------------
// MAIN: Skill Matrix Radar Widget
// ---------------------------------------------------------------------------
export function SkillMatrixRadar() {
 const { data: members = [], isLoading: loadingMembers } = useBoardMembers();
 const { data: allSkills = [], isLoading: loadingSkills } = useSkillEvaluations();
 const { data: scores = [] } = useBoardEffectiveness();

 const [selectedMemberId, setSelectedMemberId] = useState<string | null>(null);

 // Data processing with Math guards
 const radarData = useMemo(() => {
 if (selectedMemberId) {
 return (allSkills || []).filter(s => s.member_id === selectedMemberId);
 }
 
 // Group by category and average for the ENTIRE Board
 const grouped = (allSkills || []).reduce((acc, curr) => {
 if (!acc[curr.skill_category]) {
 acc[curr.skill_category] = { sum: 0, count: 0, notes: [] };
 }
 acc[curr.skill_category].sum += curr.score;
 acc[curr.skill_category].count += 1;
 return acc;
 }, {} as Record<string, { sum: number; count: number; notes: string[] }>);

 return Object.keys(grouped).map(cat => ({
 skill_category: cat,
 // DEFENSIVE MATEMATİK KORUMASI:
 score: Number((grouped[cat].sum / (grouped[cat].count || 1)).toFixed(1)),
 evaluator_note: 'Yönetim Kurulu Ortalaması',
 }));
 }, [allSkills, selectedMemberId]);

 if (loadingMembers || loadingSkills) {
 return (
 <div className="flex items-center justify-center p-12">
 <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-400" />
 </div>
 );
 }

 const selectedMember = members.find(m => m.id === selectedMemberId);

 return (
 <div className="space-y-4">
 
 {/* 1. KPI Scores Grid */}
 <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
 {scores.length === 0 ? (
 <div className="col-span-3 text-center py-4 text-slate-500 border border-dashed rounded-lg">Kayıtlı performans ölçümü yok.</div>
 ) : scores.slice(0, 3).map(score => (
 <div key={score.id} className="bg-indigo-50 border border-indigo-100 p-4 rounded-xl flex items-center justify-between">
 <div>
 <div className="text-[10px] font-bold text-indigo-600 uppercase mb-1">{score.category}</div>
 <div className="text-2xl font-black text-indigo-900">{score.average_score}<span className="text-sm font-medium text-indigo-500 ml-1">/10</span></div>
 </div>
 <Target className="text-indigo-300" size={32} />
 </div>
 ))}
 </div>

 <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
 
 {/* Left Col: Board Members Selector */}
 <div className="lg:col-span-1 space-y-3">
 <h3 className="text-sm font-bold text-slate-800 flex items-center gap-2 mb-4">
 <UserCheck size={18} className="text-indigo-500" /> YK Üyeleri Profilleri
 </h3>
 
 <button
 onClick={() => setSelectedMemberId(null)}
 className={clsx(
 'w-full text-left p-3 rounded-lg border transition-all flex items-center gap-3',
 selectedMemberId === null ? 'bg-indigo-600 border-indigo-700 text-white shadow-md' : 'bg-white border-slate-200 hover:bg-slate-50 text-slate-700'
 )}
 >
 <div className={clsx('w-8 h-8 rounded-full flex items-center justify-center font-bold text-xs', selectedMemberId === null ? 'bg-white/20' : 'bg-indigo-100 text-indigo-600')}>
 YK
 </div>
 <div>
 <div className="font-bold text-sm">Yönetim Kurulu Ortalaması</div>
 <div className={clsx('text-[10px] uppercase font-bold', selectedMemberId === null ? 'text-indigo-200' : 'text-slate-500')}>Genel Görünüm</div>
 </div>
 </button>

 {(members || []).map(member => (
 <button
 key={member.id}
 onClick={() => setSelectedMemberId(member.id)}
 className={clsx(
 'w-full text-left p-3 rounded-lg border transition-all flex items-center gap-3',
 selectedMemberId === member.id ? 'bg-indigo-600 border-indigo-700 text-white shadow-md' : 'bg-white border-slate-200 hover:bg-slate-50 text-slate-700'
 )}
 >
 <div className={clsx('w-8 h-8 rounded-full flex items-center justify-center font-bold text-xs', selectedMemberId === member.id ? 'bg-white/20' : 'bg-slate-100 text-slate-600')}>
 {getAvatarLetters(member.full_name)}
 </div>
 <div className="flex-1">
 <div className="font-bold text-sm">{member.full_name}</div>
 <div className={clsx('text-[10px] uppercase font-bold truncate', selectedMemberId === member.id ? 'text-indigo-200' : 'text-slate-500')}>{member.role_title}</div>
 </div>
 {member.is_independent && (
 <span className={clsx('text-[9px] px-1.5 py-0.5 rounded border uppercase', selectedMemberId === member.id ? 'bg-white/10 border-white/20' : 'bg-emerald-50 text-emerald-600 border-emerald-200')}>
 Bağ.
 </span>
 )}
 </button>
 ))}
 </div>

 {/* Right Col: Spider Matrix Radar */}
 <div className="lg:col-span-2">
 <div className="bg-white border border-slate-200 rounded-xl p-4 h-full min-h-[450px] flex flex-col">
 <h3 className="text-sm font-bold text-slate-800 mb-4 flex items-center gap-2">
 <BookOpen size={18} className="text-indigo-500" /> 
 {selectedMember ? `${selectedMember.full_name} — Bireysel Yetkinlik Matrisi` : 'Kolektif Yönetim Kurulu Matrisi'}
 </h3>
 
 {radarData.length === 0 ? (
 <div className="flex-1 flex flex-col items-center justify-center text-center">
 <AlertTriangle size={32} className="text-slate-300 mb-2"/>
 <p className="text-slate-500 font-medium">Bu görünüm için henüz yetkinlik ölçümü girilmemiş.</p>
 </div>
 ) : (
 <div className="flex-1 w-full h-[350px]">
 <ResponsiveContainer width="100%" height="100%">
 <RadarChart cx="50%" cy="50%" outerRadius="75%" data={radarData}>
 <PolarGrid stroke="#e2e8f0" />
 <PolarAngleAxis dataKey="skill_category" tick={{ fill: '#475569', fontSize: 11, fontWeight: 600 }} />
 <PolarRadiusAxis angle={30} domain={[0, 10]} tick={{ fill: '#94a3b8', fontSize: 10 }} />
 <Tooltip content={<CustomTooltip />} />
 <Radar
 name="Yetenek Skoru"
 dataKey="score"
 stroke="#4f46e5"
 fill="#6366f1"
 fillOpacity={0.3}
 dot={{ r: 4, fill: '#4f46e5' }}
 />
 </RadarChart>
 </ResponsiveContainer>
 </div>
 )}
 </div>
 </div>

 </div>

 </div>
 );
}
