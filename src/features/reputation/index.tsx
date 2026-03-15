/**
 * ReputationalRiskPage — Ana Sayfa (Wave 73)
 * features/reputation/index.tsx
 *
 * Sosyal Medya Duygu Analizi (Solda) + Sentiment Oracle (Sağda).
 * C-Level · Apple Glassmorphism · %100 Light Mode
 */

import { SentimentOracle } from '@/widgets/SentimentOracle';
import { motion } from 'framer-motion';
import {
 Activity,
 AlertOctagon,
 AtSign,
 Hash,
 Heart,
 MessageSquare,
 Search,
 Smartphone,
 ThumbsUp,
 TrendingDown,
 Zap
} from 'lucide-react';
import React, { useState } from 'react';
import {
 formatCompact,
 useCrisisAlerts, useReputationKPI,
 useSentimentFeeds,
 type SentimentFeed
} from './api';

// ─── Sabitler ─────────────────────────────────────────────────────────────────

const PLATFORM_ICONS: Record<string, React.ElementType> = {
 X: AtSign,
 LINKEDIN: BriefcaseBusinessIcon,
 NEWS: MessageSquare,
 FORUM: Hash,
 APP_STORES: Smartphone,
 OTHER: Search
};

function BriefcaseBusinessIcon(props: any) {
 return <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}><path d="M12 12h.01"/><path d="M16 6V4a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v2"/><path d="M22 13a18.15 18.15 0 0 1-20 0"/><rect width="20" height="14" x="2" y="6" rx="2"/></svg>
}

const SENTIMENT_COLORS = {
 POSITIVE: { bg: 'bg-emerald-50', text: 'text-emerald-700', border: 'border-emerald-200' },
 NEUTRAL: { bg: 'bg-slate-50', text: 'text-slate-600', border: 'border-slate-200' },
 NEGATIVE: { bg: 'bg-rose-50', text: 'text-rose-700', border: 'border-rose-200' },
 TOXIC: { bg: 'bg-red-100 text-white', text: 'text-red-800', border: 'border-red-300' },
};

// ─── Feed Kartı ───────────────────────────────────────────────────────────────

function FeedCard({ feed, index }: { feed: SentimentFeed; index: number }) {
 const PlatformIcon = PLATFORM_ICONS[feed.source_platform] ?? Search;
 const colors = SENTIMENT_COLORS[feed.sentiment_type] ?? SENTIMENT_COLORS.NEUTRAL;

 return (
 <motion.div
 initial={{ opacity: 0, y: 8 }}
 animate={{ opacity: 1, y: 0 }}
 transition={{ delay: Math.min(index * 0.05, 0.5) }}
 className={`bg-white rounded-2xl p-4 border shadow-sm transition-shadow hover:shadow-md ${colors.border}`}
 >
 <div className="flex items-center justify-between mb-2 pb-2 border-b border-slate-100">
 <div className="flex items-center gap-2">
 <div className={`p-1.5 rounded-lg ${colors.bg} ${colors.text}`}>
 <PlatformIcon size={14} />
 </div>
 <div>
 <p className="text-[11px] font-black text-slate-700">
 {feed.source_platform} {feed.author_handle && <span className="text-indigo-600 ml-1">{feed.author_handle}</span>}
 </p>
 <p className="text-[9px] text-slate-400">
 {new Date(feed.published_at).toLocaleString('tr-TR', { hour12: false, month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
 </p>
 </div>
 </div>
 <div className="text-right">
 <span className={`text-[9px] font-black px-2 py-0.5 rounded-full border ${colors.bg} ${colors.text} ${colors.border}`}>
 Skor: {feed.sentiment_score}/100
 </span>
 </div>
 </div>
 
 <p className="text-xs text-slate-700 font-medium leading-relaxed italic border-l-2 pl-3 mt-1 
 border-slate-200 line-clamp-3">"{feed.content_snippet}"</p>
 
 <div className="flex items-center justify-between mt-3 pt-2 bg-slate-50/50 rounded-lg px-2 py-1.5 border border-slate-100">
 <div className="flex items-center gap-1.5">
 <Zap size={11} className="text-amber-500" />
 <span className="text-[10px] font-black text-slate-600">{formatCompact(feed.impact_reach)} <span className="font-normal text-slate-400">Erişim</span></span>
 </div>
 {feed.target_entity && (
 <span className="text-[9px] font-bold text-slate-500 bg-white px-2 py-0.5 rounded border border-slate-200 shadow-sm">
 Hedef: {feed.target_entity}
 </span>
 )}
 </div>
 </motion.div>
 );
}

// ─── Ana Dashboard ────────────────────────────────────────────────────────────

export function ReputationalRiskPage() {
 const [filterType, setFilterType] = useState<string>('ALL');

 const { data: feeds = [], isLoading: feedsLoading } = useSentimentFeeds(
 filterType !== 'ALL' ? { type: filterType } : undefined
 );
 const { data: alerts = [] } = useCrisisAlerts();
 
 const safeFeeds = feeds || [];
 const safeAlerts = alerts || [];
 const kpi = useReputationKPI(safeFeeds, safeAlerts);

 return (
 <div className="h-full flex flex-col bg-slate-50/50 overflow-auto">
 {/* Header */}
 <div className="px-4 pt-4 pb-4 bg-white/70 backdrop-blur-lg border-b border-slate-200 shadow-sm z-10">
 <div className="flex items-center gap-3 mb-4">
 <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-indigo-500 to-rose-600 flex items-center justify-center shadow-lg shadow-indigo-500/20">
 <Heart size={22} className="text-white fill-white/20" />
 </div>
 <div>
 <h1 className="text-2xl font-black text-slate-800 tracking-tight">Reputational Risk & Sentiment</h1>
 <p className="text-xs text-slate-500 mt-0.5">Sosyal Medya Dinleme ve Kurumsal İtibar Radarı · Wave 73</p>
 </div>
 </div>

 {/* C-Level KPI Bant */}
 <div className="grid grid-cols-5 gap-3">
 {[
 { label: 'Sağlık Skoru', value: `%${kpi.overallHealthPct}`, icon: Activity, color: kpi.overallHealthPct < 70 ? 'text-rose-600' : 'text-emerald-600', bg: kpi.overallHealthPct < 70 ? 'bg-rose-50' : 'bg-emerald-50' },
 { label: 'Negatif Mention', value: kpi.totalNegativeMentions, icon: TrendingDown,color: 'text-red-700', bg: 'bg-red-50' },
 { label: 'Ort. Sentiment', value: `${kpi.avgSentimentScore}/100`, icon: ThumbsUp, color: 'text-indigo-700', bg: 'bg-indigo-50' },
 { label: 'Aktif Kriz Alarmi', value: kpi.activeCrises, icon: AlertOctagon,color: 'text-rose-600', bg: 'bg-rose-50' },
 { label: 'Toplam Görüntülenme', value: formatCompact(kpi.totalReach), icon: Search, color: 'text-slate-700', bg: 'bg-slate-100' },
 ].map(({ label, value, icon: Icon, color, bg }) => (
 <div key={label} className="bg-white/80 border border-slate-200 rounded-xl px-4 py-3 text-center flex flex-col items-center justify-center">
 <div className={`p-1.5 rounded-lg ${bg} mb-1.5`}>
 <Icon size={14} className={color} />
 </div>
 <p className="text-lg font-black text-slate-800 tabular-nums leading-none">{value}</p>
 <p className="text-[9px] text-slate-500 font-bold uppercase leading-tight mt-1">{label}</p>
 </div>
 ))}
 </div>
 </div>

 <div className="flex-1 overflow-hidden flex gap-0">
 {/* Left: Social Listening Stream */}
 <div className="flex-1 overflow-y-auto p-4 flex flex-col">
 <div className="flex items-center justify-between mb-4">
 <h2 className="text-sm font-black text-slate-800 uppercase tracking-wider flex items-center gap-1.5">
 <MessageSquare size={16} className="text-indigo-500" />
 Canlı Sosyal Akış (Son Gönderiler)
 </h2>
 <div className="flex gap-1.5">
 {['ALL', 'POSITIVE', 'NEUTRAL', 'NEGATIVE', 'TOXIC'].map((s) => (
 <button
 key={s}
 onClick={() => setFilterType(s)}
 className={`px-3 py-1.5 rounded-lg text-[10px] font-bold transition-all ${
 filterType === s ? 'bg-indigo-600 text-white shadow-sm' : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50'
 }`}
 >
 {s === 'ALL' ? 'Tümü' : s}
 </button>
 ))}
 </div>
 </div>

 {feedsLoading ? (
 <div className="flex-1 flex items-center justify-center py-20 bg-white/50 rounded-2xl border border-slate-200">
 <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600" />
 </div>
 ) : safeFeeds.length === 0 ? (
 <div className="flex-1 flex flex-col items-center justify-center py-20 bg-white/50 rounded-2xl border border-slate-200">
 <Search size={32} className="text-slate-300 mb-2" />
 <p className="text-sm font-semibold text-slate-500">Bu filtrelere uygun gönderi bulunamadı.</p>
 </div>
 ) : (
 <div className="grid grid-cols-1 xl:grid-cols-2 gap-4 pb-4">
 {(safeFeeds || []).map((feed, i) => (
 <FeedCard key={feed.id} feed={feed} index={i} />
 ))}
 </div>
 )}
 </div>

 {/* Right: Crisis/Sentiment Oracle Widget */}
 <div className="w-[420px] shrink-0 border-l border-slate-200 bg-slate-100/30 p-5 overflow-y-auto">
 <SentimentOracle />
 </div>
 </div>
 </div>
 );
}
