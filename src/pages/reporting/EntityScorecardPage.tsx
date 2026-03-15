import { useAuditEntities, useEntityFindingCounts, type EntityFindingCounts } from '@/entities/universe';
import { DEFAULT_RISK_CONSTITUTION, useRiskConstitution } from '@/features/risk-constitution';
import { GradingWaterfall } from '@/widgets/charts/GradingWaterfall';
import { VetoStatusCards } from '@/widgets/indicators/VetoStatusCards';
import { GradingScaleTable } from '@/widgets/tables/GradingScaleTable';
import { AlertCircle, Award, Building2, RefreshCw, TrendingUp } from 'lucide-react';
import { useMemo, useState } from 'react';

const DEFAULT_FINDINGS: EntityFindingCounts = { critical: 0, high: 0, medium: 0, low: 0 };

export default function EntityScorecardPage() {
 const { constitution, loading } = useRiskConstitution();
 const { data: entities = [], isLoading: entitiesLoading } = useAuditEntities();
 const { data: findingCountsByEntity = {}, isLoading: countsLoading } = useEntityFindingCounts();

 const [selectedEntityId, setSelectedEntityId] = useState<string | null>(null);

 const effectiveConstitution = constitution ?? DEFAULT_RISK_CONSTITUTION;

 const selectedEntity = useMemo(() => {
 const id = selectedEntityId || entities[0]?.id;
 if (!id) return null;
 const entity = entities.find((e) => e.id === id);
 if (!entity) return null;
 const findings = findingCountsByEntity[entity.id] ?? DEFAULT_FINDINGS;
 return {
 id: entity.id,
 name: entity.name,
 type: entity.type,
 findings,
 };
 }, [entities, selectedEntityId, findingCountsByEntity]);

 const finalScore = useMemo(() => {
 if (!selectedEntity) return 0;

 const baseScore = 100;
 let score = baseScore;

 score -= selectedEntity.findings.critical * 25;
 score -= selectedEntity.findings.high * 10;
 score -= selectedEntity.findings.medium * 3;
 score -= selectedEntity.findings.low * 1;

 score = Math.max(0, score);

 const activeVeto = effectiveConstitution.veto_rules.find((v) => v.enabled);
 if (activeVeto && selectedEntity.findings.critical > 0) {
 score = Math.min(score, activeVeto.override_score);
 }

 return score;
 }, [effectiveConstitution, selectedEntity]);

 const currentGrade = useMemo(() => {
 const sorted = [...effectiveConstitution.risk_ranges].sort((a, b) => b.min - a.min);
 const zone = sorted.find((r) => finalScore >= r.min && finalScore <= r.max) || effectiveConstitution.risk_ranges[0];
 return {
 label: zone?.label ?? 'N/A',
 color: zone?.color ?? '#64748b',
 };
 }, [effectiveConstitution, finalScore]);

 const pageLoading = loading || entitiesLoading || countsLoading;

 if (pageLoading) {
 return (
 <div className="min-h-screen flex items-center justify-center">
 <div className="text-center">
 <RefreshCw className="w-12 h-12 text-blue-400 animate-spin mx-auto mb-4" />
 <div className="text-white font-bold">Birim karnesi yükleniyor...</div>
 </div>
 </div>
 );
 }

 if (!selectedEntity || entities.length === 0) {
 return (
 <div className="min-h-screen flex items-center justify-center">
 <div className="text-center text-white">
 <Building2 className="w-12 h-12 text-slate-400 mx-auto mb-4" />
 <p className="font-bold">Birim bulunamadı</p>
 <p className="text-sm text-slate-400 mt-1">Denetim evreninde (audit_entities) kayıt yok.</p>
 </div>
 </div>
 );
 }

 return (
 <div className="min-h-screen ">
 <div className="w-full px-4 sm:px-6 lg:px-6 py-5 space-y-6">
 <div className="bg-gradient-to-r from-blue-500/20 to-purple-500/20 backdrop-blur-md border border-white/10 rounded-2xl p-5">
 <div className="flex items-start justify-between">
 <div className="flex-1">
 <div className="flex items-center gap-3 mb-4">
 <div className="p-3 bg-blue-500/20 rounded-xl">
 <Award className="w-8 h-8 text-blue-400" />
 </div>
 <div>
 <h1 className="text-3xl font-bold text-white">Birim Karnesi</h1>
 <p className="text-slate-400 text-sm">Entity Risk Scorecard</p>
 </div>
 </div>

 <select
 value={selectedEntityId ?? selectedEntity.id}
 onChange={(e) => setSelectedEntityId(e.target.value)}
 className="bg-surface/10 backdrop-blur-md border border-white/20 text-white px-4 py-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400 text-lg font-medium"
 >
 {(entities || []).map((entity) => (
 <option key={entity.id} value={entity.id} className="bg-slate-800">
 {entity.name}
 </option>
 ))}
 </select>
 </div>

 <div className="text-right">
 <div className="text-sm text-slate-400 mb-2">Final Skor</div>
 <div
 className="w-32 h-32 rounded-2xl flex flex-col items-center justify-center shadow-2xl"
 style={{ backgroundColor: currentGrade.color }}
 >
 <div className="text-5xl font-bold text-white mb-1">{finalScore.toFixed(0)}</div>
 <div className="text-xs text-white/80 font-medium">{currentGrade.label}</div>
 </div>
 </div>
 </div>
 </div>

 <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
 <div className="bg-surface/5 backdrop-blur-md border border-white/10 rounded-xl p-4">
 <div className="flex items-center gap-2 mb-4">
 <Building2 className="w-5 h-5 text-slate-400" />
 <h3 className="text-sm font-bold text-slate-400 uppercase">Birim Bilgisi</h3>
 </div>
 <div className="space-y-3">
 <div>
 <div className="text-xs text-slate-400 mb-1">Birim Adı</div>
 <div className="text-white font-bold">{selectedEntity.name}</div>
 </div>
 <div>
 <div className="text-xs text-slate-400 mb-1">Tip</div>
 <div className="text-white font-medium">{selectedEntity.type}</div>
 </div>
 </div>
 </div>

 <div className="bg-surface/5 backdrop-blur-md border border-white/10 rounded-xl p-4">
 <div className="flex items-center gap-2 mb-4">
 <AlertCircle className="w-5 h-5 text-orange-400" />
 <h3 className="text-sm font-bold text-slate-400 uppercase">Bulgu Özeti</h3>
 </div>
 <div className="grid grid-cols-2 gap-3">
 <div className="bg-red-500/10 rounded-lg p-3">
 <div className="text-xs text-red-300 mb-1">Kritik</div>
 <div className="text-2xl font-bold text-red-400">{selectedEntity.findings.critical}</div>
 </div>
 <div className="bg-orange-500/10 rounded-lg p-3">
 <div className="text-xs text-orange-300 mb-1">Yüksek</div>
 <div className="text-2xl font-bold text-orange-400">{selectedEntity.findings.high}</div>
 </div>
 <div className="bg-yellow-500/10 rounded-lg p-3">
 <div className="text-xs text-yellow-300 mb-1">Orta</div>
 <div className="text-2xl font-bold text-yellow-400">{selectedEntity.findings.medium}</div>
 </div>
 <div className="bg-blue-500/10 rounded-lg p-3">
 <div className="text-xs text-blue-300 mb-1">Düşük</div>
 <div className="text-2xl font-bold text-blue-400">{selectedEntity.findings.low}</div>
 </div>
 </div>
 </div>

 <div className="bg-surface/5 backdrop-blur-md border border-white/10 rounded-xl p-4">
 <div className="flex items-center gap-2 mb-4">
 <TrendingUp className="w-5 h-5 text-green-400" />
 <h3 className="text-sm font-bold text-slate-400 uppercase">Performans</h3>
 </div>
 <div className="space-y-3">
 <div>
 <div className="text-xs text-slate-400 mb-1">Toplam Kesinti</div>
 <div className="text-2xl font-bold text-red-400">
 -{(100 - finalScore).toFixed(0)} puan
 </div>
 </div>
 <div>
 <div className="text-xs text-slate-400 mb-1">Final Skor</div>
 <div className="text-2xl font-bold text-white">{finalScore.toFixed(0)}</div>
 </div>
 </div>
 </div>
 </div>

 <div className="bg-surface/5 backdrop-blur-md border border-white/10 rounded-xl p-4">
 <GradingWaterfall findingCounts={selectedEntity.findings} />
 </div>

 <div className="bg-surface/5 backdrop-blur-md border border-white/10 rounded-xl p-4">
 <VetoStatusCards findingCounts={selectedEntity.findings} />
 </div>

 <div className="bg-surface/5 backdrop-blur-md border border-white/10 rounded-xl p-4">
 <GradingScaleTable currentScore={finalScore} />
 </div>

 <div className="bg-blue-500/10 border border-blue-400/30 rounded-xl p-4">
 <div className="flex items-start gap-4">
 <div className="p-3 bg-blue-500/20 rounded-xl flex-shrink-0">
 <Award className="w-6 h-6 text-blue-400" />
 </div>
 <div className="flex-1">
 <h3 className="text-white font-bold mb-2">Anayasa Modunda Çalışıyor</h3>
 <p className="text-sm text-slate-300 leading-relaxed">
 Bu sayfa <span className="font-bold text-blue-400">Risk Constitution v3.0</span> motoru tarafından çalıştırılmaktadır.
 Tüm hesaplamalar, renk kodları, veto kuralları ve not cetveli canlı olarak Anayasa'dan okunur.
 Ayarlar sayfasından yapacağınız değişiklikler burada anında yansır.
 </p>
 </div>
 </div>
 </div>
 </div>
 </div>
 );
}
