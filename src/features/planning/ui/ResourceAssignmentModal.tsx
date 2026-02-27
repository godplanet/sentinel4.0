import { useState, useEffect } from 'react';
import {
  X, User, CheckCircle2, Sparkles, AlertTriangle, ChevronDown, ChevronUp,
  Loader2, Star, TrendingUp, DollarSign, Zap,
} from 'lucide-react';
import { usePlanningStore } from '@/entities/planning/model/store';
import type { AuditEngagement } from '@/entities/planning/model/types';
import { fetchProfilesWithSkills } from '@/features/talent-os/api';
import type { TalentProfileWithSkills } from '@/features/talent-os/types';
import {
  suggestAuditors,
  formatCost,
  isHighCost,
  type AllocationResult,
  type SortMode,
} from '@/features/planning/lib/ResourceAllocator';

interface ResourceAssignmentModalProps {
  engagement: AuditEngagement;
  onClose: () => void;
}

const ENGAGEMENT_SKILLS: Record<string, string[]> = {
  COMPREHENSIVE: ['Risk Değerlendirme', 'Kontrol Testi', 'Raporlama', 'Veri Analizi'],
  TARGETED:      ['Kontrol Testi', 'IT Denetim', 'Veri Analizi'],
  FOLLOW_UP:     ['Raporlama', 'Mülakat Tekniği'],
};

function FitScoreBadge({ score }: { score: number }) {
  const color = score >= 70
    ? 'text-emerald-600 bg-emerald-50 border-emerald-200'
    : score >= 45
      ? 'text-amber-600 bg-amber-50 border-amber-200'
      : 'text-rose-600 bg-rose-50 border-rose-200';
  return (
    <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full border text-[11px] font-bold ${color}`}>
      <Star size={9} />
      {score}
    </span>
  );
}

function CostBadge({ cost, currency }: { cost: number; currency: string }) {
  const highCost = isHighCost(cost, currency);
  return (
    <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full border text-[11px] font-bold ${
      highCost
        ? 'text-rose-600 bg-rose-50 border-rose-200'
        : 'text-slate-600 bg-slate-50 border-slate-200'
    }`}>
      {highCost && <AlertTriangle size={9} />}
      {cost === 0 ? '—' : formatCost(cost, currency)}
    </span>
  );
}

function SuggestionCard({ result, rank }: { result: AllocationResult; rank: number }) {
  const { auditor, matchScore, matchedSkills, missingSkills, blocked, blockReason, projectedCost, currency } = result;
  const isBestMatch = rank === 0 && !blocked;
  const highCost = projectedCost > 0 && isHighCost(projectedCost, currency);

  return (
    <div className={`rounded-xl border p-3 transition-all ${
      blocked
        ? 'bg-slate-50 border-slate-200 opacity-60'
        : isBestMatch
          ? 'bg-emerald-50 border-emerald-200 ring-1 ring-emerald-300/50'
          : 'bg-white border-slate-200'
    }`}>
      <div className="flex items-start gap-3">
        <div className="w-9 h-9 rounded-full bg-gradient-to-br from-slate-600 to-slate-700 flex items-center justify-center text-xs font-bold text-white flex-shrink-0">
          {auditor.full_name.charAt(0)}
        </div>

        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-1.5 flex-wrap mb-1">
            <span className="font-semibold text-slate-900 text-sm truncate">{auditor.full_name}</span>
            {isBestMatch && (
              <span className="text-[9px] bg-emerald-600 text-white px-1.5 py-0.5 rounded-full font-bold tracking-wide">
                EN İYİ EŞLEŞME
              </span>
            )}
            {highCost && (
              <span className="text-[9px] bg-rose-100 text-rose-700 border border-rose-200 px-1.5 py-0.5 rounded-full font-bold flex items-center gap-0.5">
                <DollarSign size={8} />
                Yüksek Maliyet
              </span>
            )}
          </div>

          <div className="text-[11px] text-slate-500 mb-2">{auditor.title} · Yorgunluk: {auditor.fatigue_score}%</div>

          <div className="flex items-center gap-2 flex-wrap">
            <FitScoreBadge score={matchScore} />
            {projectedCost > 0 && <CostBadge cost={projectedCost} currency={currency} />}
          </div>

          {blocked && blockReason && (
            <div className="flex items-center gap-1 mt-2 text-[11px] text-rose-600">
              <AlertTriangle size={10} />
              {blockReason}
            </div>
          )}

          {!blocked && (matchedSkills.length > 0 || missingSkills.length > 0) && (
            <div className="flex flex-wrap gap-1 mt-2">
              {matchedSkills.slice(0, 2).map((s) => (
                <span key={s} className="text-[10px] bg-emerald-100 text-emerald-700 px-1.5 py-0.5 rounded border border-emerald-200">
                  {s}
                </span>
              ))}
              {missingSkills.slice(0, 1).map((s) => (
                <span key={s} className="text-[10px] bg-slate-100 text-slate-500 px-1.5 py-0.5 rounded border border-slate-200 line-through">
                  {s}
                </span>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function SortToggle({ mode, onChange }: { mode: SortMode; onChange: (m: SortMode) => void }) {
  return (
    <div className="flex items-center gap-1 bg-slate-100 rounded-lg p-1">
      <button
        onClick={() => onChange('best_match')}
        className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-semibold transition-all ${
          mode === 'best_match'
            ? 'bg-white text-slate-900 shadow-sm'
            : 'text-slate-500 hover:text-slate-700'
        }`}
      >
        <Star size={11} />
        En İyi Eşleşme
      </button>
      <button
        onClick={() => onChange('best_value')}
        className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-semibold transition-all ${
          mode === 'best_value'
            ? 'bg-white text-slate-900 shadow-sm'
            : 'text-slate-500 hover:text-slate-700'
        }`}
      >
        <TrendingUp size={11} />
        En İyi Değer
      </button>
    </div>
  );
}

export function ResourceAssignmentModal({
  engagement,
  onClose,
}: ResourceAssignmentModalProps) {
  const assignAuditor = usePlanningStore((s) => s.assignAuditor);
  const [profiles, setProfiles] = useState<TalentProfileWithSkills[]>([]);
  const [loadingProfiles, setLoadingProfiles] = useState(true);
  const [suggestions, setSuggestions] = useState<AllocationResult[]>([]);
  const [loadingSuggest, setLoadingSuggest] = useState(false);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [estimatedHours, setEstimatedHours] = useState<number>(
    engagement.estimated_hours ?? 80,
  );
  const [sortMode, setSortMode] = useState<SortMode>('best_match');

  useEffect(() => {
    fetchProfilesWithSkills()
      .then(setProfiles)
      .catch(() => setProfiles([]))
      .finally(() => setLoadingProfiles(false));
  }, []);

  const handleAssign = (profile: TalentProfileWithSkills) => {
    assignAuditor(engagement.id, profile.id);
    onClose();
  };

  const handleUnassign = () => {
    assignAuditor(engagement.id, null);
    onClose();
  };

  const handleSuggest = async () => {
    try {
      setLoadingSuggest(true);
      const auditType = (engagement as any).audit_type ?? 'COMPREHENSIVE';
      const required = ENGAGEMENT_SKILLS[auditType] ?? ENGAGEMENT_SKILLS.COMPREHENSIVE;
      const results = suggestAuditors(required, profiles, {
        topN: 6,
        estimatedHours,
        sortMode,
      });
      setSuggestions(results);
      setShowSuggestions(true);
    } catch {
      setSuggestions([]);
    } finally {
      setLoadingSuggest(false);
    }
  };

  const formatDate = (date: string) =>
    new Intl.DateTimeFormat('tr-TR', { day: 'numeric', month: 'long', year: 'numeric' })
      .format(new Date(date));

  const totalCostRange = suggestions.length > 0
    ? { min: Math.min(...suggestions.map((s) => s.projectedCost)), max: Math.max(...suggestions.map((s) => s.projectedCost)) }
    : null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm" onClick={onClose} />

      <div className="relative w-full max-w-lg bg-white rounded-2xl shadow-2xl max-h-[92vh] overflow-y-auto border border-slate-200">
        <div className="sticky top-0 bg-white/95 backdrop-blur-sm border-b border-slate-100 px-6 py-4 flex items-center justify-between z-10 rounded-t-2xl">
          <div>
            <h2 className="text-lg font-bold text-slate-900">Denetçi Ata</h2>
            <p className="text-xs text-slate-500 mt-0.5">Maliyet & Yetkinlik Analizi</p>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-slate-100 rounded-lg transition-colors">
            <X size={18} className="text-slate-500" />
          </button>
        </div>

        <div className="p-6 space-y-4">
          <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl">
            <div className="text-sm font-semibold text-slate-900 mb-1 truncate">{engagement.title}</div>
            <div className="flex items-center gap-3 text-[11px] text-slate-500">
              <span>{formatDate(engagement.start_date)}</span>
              <span>→</span>
              <span>{formatDate(engagement.end_date)}</span>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest block mb-1.5">
                Tahmini Efor (Saat)
              </label>
              <div className="relative">
                <input
                  type="number"
                  min={1}
                  max={5000}
                  value={estimatedHours}
                  onChange={(e) => setEstimatedHours(Math.max(1, parseInt(e.target.value, 10) || 1))}
                  className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm font-mono font-semibold text-slate-900 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-400"
                />
                <span className="absolute right-3 top-1/2 -translate-y-1/2 text-[11px] text-slate-400 pointer-events-none">
                  saat
                </span>
              </div>
            </div>

            <div>
              <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest block mb-1.5">
                Sıralama Modu
              </label>
              <SortToggle mode={sortMode} onChange={setSortMode} />
            </div>
          </div>

          {estimatedHours > 0 && (
            <div className="flex items-center gap-2 px-3 py-2 bg-blue-50 border border-blue-200 rounded-lg text-xs text-blue-700">
              <DollarSign size={13} />
              <span>
                Maliyet aralığı &nbsp;
                <strong>₺1,200 – ₺4,500</strong>/saat bazında hesaplanacak
              </span>
            </div>
          )}

          <button
            onClick={handleSuggest}
            disabled={loadingSuggest}
            className="w-full flex items-center justify-center gap-2 px-4 py-3 rounded-xl text-sm font-bold transition-all disabled:opacity-60 bg-gradient-to-r from-slate-800 to-slate-900 hover:from-slate-700 hover:to-slate-800 text-white shadow-sm hover:shadow-lg"
          >
            {loadingSuggest ? (
              <>
                <Loader2 size={15} className="animate-spin" />
                Analiz ediliyor...
              </>
            ) : (
              <>
                <Sparkles size={15} />
                AI Maliyet & Yetkinlik Analizi
              </>
            )}
          </button>

          {showSuggestions && suggestions.length > 0 && (
            <div className="rounded-xl border border-slate-200 overflow-hidden">
              <button
                className="w-full flex items-center justify-between px-4 py-3 bg-slate-50 border-b border-slate-200 text-sm font-semibold text-slate-700"
                onClick={() => setShowSuggestions((v) => !v)}
              >
                <span className="flex items-center gap-2">
                  <Zap size={14} className="text-amber-500" />
                  AI Önerileri — {sortMode === 'best_value' ? 'En İyi Değer' : 'En İyi Eşleşme'}
                  {totalCostRange && estimatedHours > 0 && (
                    <span className="text-[11px] font-normal text-slate-500">
                      · {formatCost(totalCostRange.min)} – {formatCost(totalCostRange.max)}
                    </span>
                  )}
                </span>
                {showSuggestions ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
              </button>

              <div className="p-3 space-y-2 bg-white">
                {suggestions.map((result, i) => (
                  <SuggestionCard key={result.auditor.id} result={result} rank={i} />
                ))}
              </div>
            </div>
          )}

          <div className="pt-2">
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-3">
              Tüm Denetçiler
            </p>

            {loadingProfiles ? (
              <div className="flex items-center justify-center py-8 text-slate-400">
                <Loader2 size={18} className="animate-spin mr-2" />
                <span className="text-sm">Denetçiler yükleniyor...</span>
              </div>
            ) : profiles.length === 0 ? (
              <p className="text-sm text-slate-400 text-center py-6">Denetçi bulunamadı.</p>
            ) : (
              <div className="space-y-2">
                {profiles.map((profile) => {
                  const isAssigned = engagement.assigned_auditor_id === profile.id;
                  const aiResult = suggestions.find((s) => s.auditor.id === profile.id);
                  const aiRank = suggestions.findIndex((s) => s.auditor.id === profile.id);
                  const isTopAI = aiRank === 0 && suggestions.length > 0;
                  const hasHighCost = aiResult && isHighCost(aiResult.projectedCost, aiResult.currency);

                  return (
                    <button
                      key={profile.id}
                      onClick={() => handleAssign(profile)}
                      className={`w-full flex items-center gap-3 p-3.5 rounded-xl border transition-all text-left ${
                        isAssigned
                          ? 'bg-emerald-50 border-emerald-200 ring-2 ring-emerald-400/20'
                          : isTopAI
                            ? 'bg-blue-50 border-blue-200'
                            : 'bg-white border-slate-200 hover:border-slate-300 hover:bg-slate-50'
                      }`}
                    >
                      {profile.avatar_url ? (
                        <img
                          src={profile.avatar_url}
                          alt={profile.full_name}
                          className="w-10 h-10 rounded-full border-2 border-white shadow-sm flex-shrink-0 object-cover"
                        />
                      ) : (
                        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-slate-600 to-slate-700 flex items-center justify-center text-sm font-bold text-white flex-shrink-0">
                          {profile.full_name.charAt(0)}
                        </div>
                      )}

                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-1.5 flex-wrap">
                          <span className="font-semibold text-slate-900 text-sm truncate">{profile.full_name}</span>
                          {isAssigned && <CheckCircle2 size={14} className="text-emerald-600 flex-shrink-0" />}
                          {isTopAI && !isAssigned && (
                            <span className="text-[9px] bg-blue-600 text-white px-1.5 py-0.5 rounded-full font-bold">
                              AI #1
                            </span>
                          )}
                          {hasHighCost && (
                            <span className="text-[9px] bg-rose-100 text-rose-700 border border-rose-200 px-1.5 py-0.5 rounded-full font-bold flex items-center gap-0.5">
                              <DollarSign size={7} />
                              Yüksek Maliyet
                            </span>
                          )}
                        </div>
                        <div className="flex items-center gap-2 mt-0.5">
                          <span className="text-xs text-slate-500">{profile.title} · Yorgunluk: {profile.fatigue_score}%</span>
                          {aiResult && aiResult.projectedCost > 0 && (
                            <span className="text-[11px] text-slate-400 font-mono">
                              · {formatCost(aiResult.projectedCost, aiResult.currency)}
                            </span>
                          )}
                        </div>
                      </div>

                      {isAssigned && (
                        <span className="text-[11px] bg-emerald-100 text-emerald-700 px-2 py-1 rounded-full font-semibold flex-shrink-0">
                          Atanmış
                        </span>
                      )}
                    </button>
                  );
                })}
              </div>
            )}
          </div>

          {engagement.assigned_auditor_id && (
            <button
              onClick={handleUnassign}
              className="w-full px-4 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl font-medium text-sm transition-colors flex items-center justify-center gap-2 border border-slate-200"
            >
              <User size={15} />
              Atamayı Kaldır
            </button>
          )}

          <button
            onClick={onClose}
            className="w-full px-4 py-2.5 bg-slate-900 hover:bg-slate-800 text-white rounded-xl font-semibold text-sm transition-colors"
          >
            Kapat
          </button>
        </div>
      </div>
    </div>
  );
}
