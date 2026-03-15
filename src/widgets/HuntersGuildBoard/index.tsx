import { useGuildActivityLogs, useLeaderboard } from '@/features/gamification/api';
import clsx from 'clsx';
import { Award, Crosshair, Crown, Eye, ShieldAlert, Star, Swords, Target, Trophy, Zap } from 'lucide-react';

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------
const ICON_MAP: Record<string, any> = {
 Eye: Eye,
 ShieldAlert: ShieldAlert,
 Trophy: Trophy,
 Target: Target,
 Zap: Zap,
 Swords: Swords,
 Award: Award,
 Star: Star,
 Crosshair: Crosshair
};

function getRarityStyle(rarity: string) {
 switch (rarity) {
 case 'LEGENDARY': return 'bg-amber-100 border-amber-300 text-amber-700 shadow-amber-200/50';
 case 'EPIC': return 'bg-purple-100 border-purple-300 text-purple-700 shadow-purple-200/50';
 case 'RARE': return 'bg-blue-100 border-blue-300 text-blue-700 shadow-blue-200/50';
 default: return 'bg-slate-100 border-slate-300 text-slate-700 shadow-slate-200/50';
 }
}

function getRankBadge(index: number) {
 if (index === 0) return <Crown size={20} className="text-amber-500 drop-shadow-md" />;
 if (index === 1) return <div className="text-slate-400 font-black text-lg">2</div>;
 if (index === 2) return <div className="text-amber-700 font-black text-lg">3</div>;
 return null;
}

// ---------------------------------------------------------------------------
// MAIN: Hunter's Guild Gamification Board
// ---------------------------------------------------------------------------
export function HuntersGuildBoard() {
 const { data: leaderboard = [], isLoading: loadingLeaderboard } = useLeaderboard();
 const { data: feed = [], isLoading: loadingFeed } = useGuildActivityLogs(8);

 const topHunters = leaderboard.slice(0, 3);

 if (loadingLeaderboard || loadingFeed) {
 return (
 <div className="flex items-center justify-center p-24">
 <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-500" />
 </div>
 );
 }

 return (
 <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 h-full min-h-[600px]">
 
 {/* 1. LEFT COL: Leaderboard */}
 <div className="lg:col-span-8 flex flex-col gap-6">
 
 {/* Top 3 Podium (Visual) */}
 {topHunters.length > 0 && (
 <div className="grid grid-cols-3 gap-4 mb-4">
 {/* 2nd Place */}
 {topHunters[1] && (
 <div className="flex flex-col items-center justify-end h-40">
 <div className="w-16 h-16 rounded-full bg-slate-200 border-4 border-white shadow-xl flex items-center justify-center mb-[-16px] z-10 relative">
 {getRankBadge(1)}
 </div>
 <div className="w-full bg-white border border-slate-200 rounded-2xl pt-6 pb-4 px-2 text-center shadow-sm relative overflow-hidden">
 <div className="absolute top-0 left-0 w-full h-1 bg-slate-400"/>
 <div className="font-bold text-slate-800 text-sm truncate">{topHunters[1].full_name}</div>
 <div className="text-slate-500 text-[10px] mt-1">Sviye {topHunters[1].current_level}</div>
 <div className="text-indigo-600 font-black text-lg mt-1">{topHunters[1].total_xp} <span className="text-[10px] font-normal">XP</span></div>
 </div>
 </div>
 )}
 
 {/* 1st Place */}
 {topHunters[0] && (
 <div className="flex flex-col items-center justify-end h-48">
 <div className="w-20 h-20 rounded-full bg-gradient-to-tr from-amber-400 to-yellow-200 border-4 border-white shadow-2xl flex items-center justify-center mb-[-20px] z-10 relative">
 {getRankBadge(0)}
 </div>
 <div className="w-full bg-white border border-amber-200 rounded-2xl pt-8 pb-4 px-2 text-center shadow-lg relative overflow-hidden">
 <div className="absolute top-0 left-0 w-full h-1 bg-amber-400"/>
 <div className="font-bold text-slate-900 text-base truncate">{topHunters[0].full_name}</div>
 <div className="text-amber-600 text-xs font-bold mt-1 uppercase tracking-wider">{topHunters[0].rank_name}</div>
 <div className="text-indigo-700 font-black text-2xl mt-1">{topHunters[0].total_xp} <span className="text-[10px] font-normal">XP</span></div>
 </div>
 </div>
 )}

 {/* 3rd Place */}
 {topHunters[2] && (
 <div className="flex flex-col items-center justify-end h-36">
 <div className="w-14 h-14 rounded-full bg-amber-100 border-4 border-white shadow-xl flex items-center justify-center mb-[-14px] z-10 relative">
 {getRankBadge(2)}
 </div>
 <div className="w-full bg-white border border-slate-200 rounded-2xl pt-5 pb-3 px-2 text-center shadow-sm relative overflow-hidden">
 <div className="absolute top-0 left-0 w-full h-1 bg-amber-700"/>
 <div className="font-bold text-slate-800 text-xs truncate">{topHunters[2].full_name}</div>
 <div className="text-slate-500 text-[9px] mt-1">Sviye {topHunters[2].current_level}</div>
 <div className="text-indigo-600 font-black text-base mt-1">{topHunters[2].total_xp} <span className="text-[9px] font-normal">XP</span></div>
 </div>
 </div>
 )}
 </div>
 )}

 {/* Extended Leaderboard List */}
 <div className="bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden flex-1 flex flex-col">
 <div className="px-6 py-4 bg-slate-50 border-b border-slate-100 flex justify-between items-center">
 <h3 className="font-bold text-slate-800 flex items-center gap-2">
 <Trophy size={18} className="text-indigo-600" />
 Genişletilmiş Denetçi Ligi
 </h3>
 </div>
 
 <div className="flex-1 overflow-y-auto">
 <table className="w-full text-left text-sm">
 <thead className="bg-[#fafafa] text-slate-400 uppercase text-[10px] font-bold sticky top-0 z-10">
 <tr>
 <th className="px-6 py-3 font-medium">Sıra</th>
 <th className="px-6 py-3 font-medium">Denetçi</th>
 <th className="px-6 py-3 font-medium">İlerleme (XP)</th>
 <th className="px-6 py-3 font-medium hidden md:table-cell">Rozetler</th>
 </tr>
 </thead>
 <tbody className="divide-y divide-slate-100 text-slate-700 font-medium">
 {leaderboard.length === 0 ? (
 <tr><td colSpan={4} className="text-center py-5 text-slate-400 italic">Lig tablosunda kayıt bulunmuyor.</td></tr>
 ) : (leaderboard || []).map((prof, index) => {
 // MATH GUARD: Math.min() & (prof.xp_to_next_level || 1) prevents zero division crash
 const progressPct = Math.min((prof.total_xp / (prof.xp_to_next_level || 1)) * 100, 100);
 const isTop3 = index < 3;
 
 return (
 <tr key={prof.id} className="hover:bg-slate-50 transition-colors">
 <td className="px-6 py-4 font-black">
 {isTop3 ? getRankBadge(index) : <span className="text-slate-400">#{index + 1}</span>}
 </td>
 <td className="px-6 py-4">
 <div className={clsx("font-bold", isTop3 ? "text-slate-900" : "text-slate-700")}>{prof.full_name}</div>
 <div className="text-[10px] text-slate-500">{prof.title} - Seviye {prof.current_level}</div>
 </td>
 <td className="px-6 py-4">
 <div className="flex items-center gap-3">
 <div className="w-24 bg-slate-100 rounded-full h-1.5 overflow-hidden">
 <div 
 className="bg-indigo-500 h-1.5 rounded-full transition-all duration-1000" 
 style={{ width: `${progressPct}%` }}
 />
 </div>
 <span className="text-xs font-bold w-12 text-right">{prof.total_xp} xp</span>
 </div>
 </td>
 <td className="px-6 py-4 hidden md:table-cell">
 <div className="flex gap-1.5">
 {prof.badges.slice(0,3).map(b => {
 const IconNode = ICON_MAP[b.badge_icon] || Award;
 return (
 <div key={b.id} className={clsx("p-1.5 rounded-md border shadow-sm", getRarityStyle(b.rarity))} title={b.badge_name}>
 <IconNode size={14} />
 </div>
 )
 })}
 {prof.badges.length > 3 && (
 <div className="p-1.5 rounded-md border bg-slate-50 text-slate-400 text-[10px] font-bold flex items-center justify-center w-7 h-7">
 +{prof.badges.length - 3}
 </div>
 )}
 </div>
 </td>
 </tr>
 );
 })}
 </tbody>
 </table>
 </div>
 </div>
 </div>

 {/* 2. RIGHT COL: Global XP Log Feed */}
 <div className="lg:col-span-4 flex flex-col h-full bg-slate-900 rounded-3xl p-4 shadow-2xl relative overflow-hidden border border-slate-700">
 
 <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-500/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />

 <h3 className="text-sm font-bold text-white mb-4 flex items-center gap-2 relative z-10">
 <Zap size={18} className="text-amber-400 fill-amber-400" /> Küresel Avcı Logları
 </h3>

 <div className="flex-1 overflow-y-auto space-y-4 pr-2 relative z-10 custom-scrollbar-dark">
 {feed.length === 0 ? (
 <div className="text-center py-10 text-slate-500 text-sm italic">Son 24 saat içinde yeni XP kazanımı yok.</div>
 ) : (feed || []).map(log => (
 <div key={log.id} className="bg-slate-800/80 backdrop-blur-sm border border-slate-700/50 p-4 rounded-xl hover:border-indigo-500/50 transition-colors">
 <div className="flex justify-between items-start mb-2">
 <span className="font-bold text-slate-200 text-sm truncate pr-2">{log.auditor.full_name}</span>
 <span className="bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 px-2 py-0.5 rounded text-[10px] font-black whitespace-nowrap">
 +{log.xp_awarded} XP
 </span>
 </div>
 <p className="text-xs text-slate-400 leading-snug">
 {log.description}
 </p>
 <div className="mt-3 text-[9px] text-slate-600 font-medium uppercase tracking-wider">
 {new Date(log.awarded_at).toLocaleTimeString('tr-TR', { hour: '2-digit', minute: '2-digit' })} — {log.action_type.replace(/_/g, ' ')}
 </div>
 </div>
 ))}
 </div>
 
 <div className="relative z-10 mt-4 pt-4 border-t border-slate-800 text-center">
 <div className="text-[10px] text-slate-500 uppercase tracking-widest">Canlı Veri Yayını İşlenmektedir</div>
 </div>
 </div>

 </div>
 );
}
