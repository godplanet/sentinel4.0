import React, { useState, useMemo } from 'react';
import {
  Building2, Scale, Activity, Search, Filter, Plus, ChevronRight,
  BrainCircuit, Info, Download, Server, ShieldCheck, Flame, Lock,
  TrendingDown, CheckCircle2, AlertTriangle, Loader2, CalendarPlus,
  ArrowRight, CheckSquare, Square, X, Zap,
} from 'lucide-react';
import { PageHeader } from '@/shared/ui/PageHeader';
import clsx from 'clsx';
import { motion, AnimatePresence } from 'framer-motion';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { supabase } from '@/shared/api/supabase';

import { calculateEntityGrade } from '@/features/grading-engine/calculator';

interface AuditEntity {
  id: string;
  name: string;
  type: string;
  path: string;
  weight: number;
  findings: {
    bordo: number;
    kizil: number;
    turuncu: number;
    sari: number;
    gozlem: number;
    shariah_systemic: number;
  };
  lastAudit: string;
}
import { GRADING_THRESHOLDS } from '@/shared/config/constitution';
import { createEngagementsFromEntities, getDefaultPlanId } from '@/features/planning/linkage';
import { useCreateEntity } from '@/entities/universe/api';
import type { EntityType } from '@/entities/universe/model/types';

const TENANT = '11111111-1111-1111-1111-111111111111';

function useAuditUniverseLive() {
  return useQuery<AuditEntity[]>({
    queryKey: ['audit-universe-live'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('audit_entities')
        .select('id, name, type, path, metadata, last_audit_date')
        .eq('tenant_id', TENANT)
        .order('path');
      if (error) throw error;
      return (data || []).map((row: any) => ({
        id: row.id,
        name: row.name,
        type: row.type ?? 'UNIT',
        path: row.path ?? '',
        weight: Number(row.metadata?.weight ?? 1.0),
        findings: {
          bordo: Number(row.metadata?.findings_summary?.bordo ?? 0),
          kizil: Number(row.metadata?.findings_summary?.kizil ?? 0),
          turuncu: Number(row.metadata?.findings_summary?.turuncu ?? 0),
          sari: Number(row.metadata?.findings_summary?.sari ?? 0),
          gozlem: Number(row.metadata?.findings_summary?.gozlem ?? 0),
          shariah_systemic: Number(row.metadata?.findings_summary?.shariah_systemic ?? 0),
        },
        lastAudit: row.metadata?.lastAudit ?? (row.last_audit_date ? String(row.last_audit_date).slice(0, 10) : 'N/A'),
      }));
    },
    staleTime: 2 * 60 * 1000,
  });
}

interface NewEntityForm {
  name: string;
  type: EntityType;
  path: string;
}

export default function AuditUniversePage() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const [searchTerm, setSearchTerm] = useState('');
  const [selectedEntity, setSelectedEntity] = useState<AuditEntity | null>(null);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [showBulkModal, setShowBulkModal] = useState(false);
  const [isBulkCreating, setIsBulkCreating] = useState(false);
  const [showNewEntityModal, setShowNewEntityModal] = useState(false);
  const [newEntityForm, setNewEntityForm] = useState<NewEntityForm>({ name: '', type: 'UNIT', path: '' });

  const { data: liveUniverse, isLoading } = useAuditUniverseLive();
  const universe = liveUniverse ?? [];
  const createEntity = useCreateEntity();

  const { rwaScore, rwaGrade, rwaOpinion, totalWeight, cappedCount } = useMemo(() => {
    let weightedSum = 0; let weightTotal = 0; let caps = 0;
    universe.forEach(e => {
      const { finalScore, vetoReason } = calculateEntityGrade(e);
      weightedSum += (finalScore * e.weight);
      weightTotal += e.weight;
      if (vetoReason) caps++;
    });
    const score = weightTotal > 0 ? (weightedSum / weightTotal) : 0;
    const gradeData = GRADING_THRESHOLDS.find(g => score >= g.min) || GRADING_THRESHOLDS[GRADING_THRESHOLDS.length - 1];
    return { rwaScore: score.toFixed(2), rwaGrade: gradeData.grade, rwaOpinion: gradeData.opinion, totalWeight: weightTotal, cappedCount: caps };
  }, [universe]);

  const filteredUniverse = universe.filter(e =>
    e.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    e.path.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const toggleSelect = (id: string) => {
    setSelectedIds(prev => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const toggleSelectAll = () => {
    if (selectedIds.size === filteredUniverse.length) {
      setSelectedIds(new Set());
    } else {
      setSelectedIds(new Set(filteredUniverse.map(e => e.id)));
    }
  };

  const handleBulkCreate = async () => {
    if (selectedIds.size === 0) return;
    setIsBulkCreating(true);
    const toastId = toast.loading(`${selectedIds.size} varlık için denetim görevleri oluşturuluyor...`);
    try {
      const planId = await getDefaultPlanId();
      const result = await createEngagementsFromEntities({
        entity_ids: Array.from(selectedIds),
        plan_id: planId,
        year: new Date().getFullYear(),
      });

      toast.dismiss(toastId);
      if (result.success) {
        toast.success(
          `${result.created_count} denetim görevi oluşturuldu! Toplam tahmini saat: ${result.summary.total_hours}`,
          { duration: 5000 }
        );
        queryClient.invalidateQueries({ queryKey: ['audit-engagements-list'] });
        setSelectedIds(new Set());
        setShowBulkModal(false);
        navigate('/strategy/annual-plan');
      } else {
        toast.error('Bazı görevler oluşturulamadı.');
      }
    } catch (err: any) {
      toast.dismiss(toastId);
      toast.error(`Hata: ${err?.message || 'Bilinmeyen hata'}`);
    } finally {
      setIsBulkCreating(false);
    }
  };

  const handleCreateEntity = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newEntityForm.name || !newEntityForm.path) return;
    try {
      await createEntity.mutateAsync({
        name: newEntityForm.name,
        type: newEntityForm.type,
        path: newEntityForm.path,
        risk_score: 50,
        velocity_multiplier: 1.0,
        status: 'ACTIVE',
      });
      toast.success(`"${newEntityForm.name}" evrene eklendi.`);
      setShowNewEntityModal(false);
      setNewEntityForm({ name: '', type: 'UNIT', path: '' });
    } catch (err: any) {
      toast.error(`Hata: ${err?.message}`);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="w-8 h-8 text-slate-400 animate-spin" />
      </div>
    );
  }

  const selectedEntities = universe.filter(e => selectedIds.has(e.id));

  return (
    <div className="w-full max-w-full px-6 py-8 space-y-6 bg-slate-50 min-h-screen font-sans">

      {/* HEADER */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <PageHeader
          title="Denetim Evreni (Audit Universe)"
          description="KERD-2026 Çerçevesi & IIA 2024: Kısıt Bazlı Kesinti Modeli ve RWA Konsolidasyonu"
          icon={Building2}
        />
        <div className="flex items-center gap-3">
          <button
            onClick={() => navigate('/strategy/annual-plan')}
            className="flex items-center gap-2 px-4 py-2.5 bg-white border border-slate-300 text-slate-700 rounded-lg hover:bg-slate-50 transition-colors font-medium shadow-sm text-sm"
          >
            <CalendarPlus size={16} />
            Stratejik Plan
            <ArrowRight size={14} className="text-slate-400" />
          </button>
          <button
            onClick={() => setShowNewEntityModal(true)}
            className="flex items-center gap-2 px-5 py-2.5 bg-slate-900 text-white rounded-lg hover:bg-slate-800 transition-colors font-medium shadow-sm"
          >
            <Plus size={18} /> Yeni Varlık Ekle
          </button>
        </div>
      </div>

      {/* KPI CARDS */}
      <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        <div className="bg-gradient-to-br from-slate-900 to-slate-800 rounded-xl p-6 shadow-md border border-slate-700 relative overflow-hidden flex flex-col justify-between">
          <div className="absolute -right-6 -top-6 text-white/5"><Scale size={160} /></div>
          <div className="relative z-10">
            <h2 className="text-slate-300 text-xs font-bold uppercase tracking-widest mb-1 flex items-center gap-2">
              <ShieldCheck size={16} className="text-emerald-400"/> Banka Geneli Güvence
            </h2>
            <p className="text-slate-500 text-xs font-medium">Risk Ağırlıklı Ortalama (RWA)</p>
          </div>
          <div className="mt-6 flex items-end gap-4 relative z-10">
            <div className="text-6xl font-black text-white tracking-tighter">{rwaScore}</div>
            <div className="mb-2">
              <div className={clsx("inline-flex px-2.5 py-0.5 rounded text-sm font-bold border", Number(rwaScore) < 50 ? 'bg-fuchsia-900/50 text-fuchsia-300 border-fuchsia-800' : Number(rwaScore) < 70 ? 'bg-orange-500/20 text-orange-400 border-orange-500/30' : 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30')}>
                {rwaGrade}
              </div>
              <div className="text-sm text-slate-300 mt-1 font-medium">{rwaOpinion}</div>
            </div>
          </div>
        </div>

        <div className="xl:col-span-2 bg-gradient-to-br from-slate-800 to-slate-900 rounded-xl p-6 shadow-md border border-slate-700/50 flex flex-col justify-center relative overflow-hidden">
          <div className="absolute -right-20 -bottom-20 w-64 h-64 bg-blue-500 rounded-full opacity-10 blur-3xl pointer-events-none"></div>
          <div className="flex items-start gap-4 relative z-10">
            <div className="p-3 bg-blue-500/20 rounded-xl border border-blue-500/30 shrink-0"><BrainCircuit className="w-6 h-6 text-blue-300" /></div>
            <div className="flex-1">
              <div className="flex items-center justify-between mb-2">
                <h3 className="text-blue-200 font-bold flex items-center gap-2">
                  Sentinel AI Stratejik Gözlem
                  {Number(rwaScore) < 60 && <span className="px-2 py-0.5 bg-rose-500/20 text-rose-300 text-[10px] rounded-full border border-rose-500/30 uppercase tracking-wide animate-pulse">Sistemik Risk Uyarısı</span>}
                </h3>
                <div className="text-xs text-blue-300/70 font-mono flex items-center gap-2"><span>Aktif Veto: {cappedCount}</span><span>|</span><span>Toplam Ağırlık: {totalWeight.toFixed(1)}</span></div>
              </div>
              <p className="text-slate-300 text-sm leading-relaxed">
                Aritmetik ortalamalar yanıltıcıdır. <strong>Hazine Bölümü (Risk Ağırlığı: 10.0)</strong> tarafındaki <em>Şer'i İhlal Vetosu</em> ve <strong>IT Bölümündeki</strong> <em>Yüksek Hacim Tavanı</em>, Banka Genel RWA Puanını <strong className="text-rose-400">{rwaScore} ({rwaOpinion})</strong> seviyesine çekmiştir. Yönetim Kurulu'na acil durum raporlaması önerilir.
              </p>
            </div>
          </div>
        </div>
      </motion.div>

      {/* INFO BANNER */}
      <div className="bg-blue-50 border border-blue-100 rounded-lg p-4 flex items-start gap-3 shadow-sm">
        <Info className="w-5 h-5 text-blue-600 mt-0.5 flex-shrink-0" />
        <div className="text-sm text-blue-900 leading-relaxed"><strong>Kısıt Bazlı Kesinti Modeli (IIA Std 14.5):</strong> Doğrusal puanlama reddedilmiştir. Bir varlığın ham puanı yüksek olsa dahi, <em>Kritik Bulgu Varlığı</em> (Max D), <em>Yüksek Hacim</em> (Max C) veya <em>Şer'i İhlal</em> (Sıfırlama) gibi kurallar Nihai Notu ezer. Varlıkları seçip denetim görevine dönüştürebilirsiniz.</div>
      </div>

      {/* TABLE */}
      <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden flex flex-col">
        <div className="p-4 border-b border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white">
          <div className="flex items-center gap-3">
            <div className="relative max-w-md w-full">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4" />
              <input
                type="text"
                placeholder="Varlık adı veya yoluna göre filtrele..."
                className="w-full pl-9 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-md text-sm focus:outline-none focus:bg-white focus:border-blue-500 transition-all"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            {selectedIds.size > 0 && (
              <div className="flex items-center gap-2 px-3 py-2 bg-blue-50 border border-blue-200 rounded-lg text-blue-700 text-sm font-semibold">
                <CheckSquare size={16} />
                {selectedIds.size} varlık seçildi
              </div>
            )}
          </div>
          <div className="flex items-center gap-2">
            {selectedIds.size > 0 && (
              <button
                onClick={() => setShowBulkModal(true)}
                className="flex items-center gap-2 px-4 py-2 bg-emerald-600 text-white rounded-lg text-sm font-semibold hover:bg-emerald-700 transition-colors shadow-sm"
              >
                <CalendarPlus size={16} />
                Denetim Planla ({selectedIds.size})
              </button>
            )}
            <button className="flex items-center gap-2 px-3 py-2 bg-white border border-slate-200 text-slate-600 rounded-md text-sm font-medium hover:bg-slate-50 transition-colors shadow-sm">
              <Filter size={16} /> Detaylı Filtre
            </button>
            <button className="flex items-center gap-2 px-3 py-2 bg-white border border-slate-200 text-slate-600 rounded-md text-sm font-medium hover:bg-slate-50 transition-colors shadow-sm">
              <Download size={16} /> Excel
            </button>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm whitespace-nowrap">
            <thead className="bg-slate-50 text-slate-600 font-semibold uppercase tracking-wider text-[11px] border-b border-slate-200">
              <tr>
                <th className="px-4 py-4 w-10">
                  <button onClick={toggleSelectAll} className="text-slate-400 hover:text-slate-700 transition-colors">
                    {selectedIds.size === filteredUniverse.length && filteredUniverse.length > 0
                      ? <CheckSquare size={16} className="text-blue-600" />
                      : <Square size={16} />
                    }
                  </button>
                </th>
                <th className="px-6 py-4">Birim / Varlık (LTree Path)</th>
                <th className="px-6 py-4 text-center">Risk Ağırlığı</th>
                <th className="px-6 py-4 text-center">Ham Puan</th>
                <th className="px-6 py-4">Durdurma (Veto) Kısıtı</th>
                <th className="px-6 py-4 text-center">Nihai Not</th>
                <th className="px-6 py-4">Güvence Görüşü (IIA)</th>
                <th className="px-6 py-4 text-center" title="Bordo/Kızıl/Turuncu/Sarı">Bulgu Dağılımı</th>
                <th className="px-6 py-4"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-800">
              {filteredUniverse.map((entity) => {
                const { rawScore, finalScore, vetoReason, grade, opinion, color, freq } = calculateEntityGrade(entity);
                const isCapped = rawScore !== finalScore;
                const isSelected = selectedIds.has(entity.id);

                return (
                  <React.Fragment key={entity.id}>
                    <tr
                      className={clsx(
                        "hover:bg-blue-50/50 transition-colors group cursor-pointer",
                        isSelected ? "bg-blue-50 border-l-2 border-blue-500" : "",
                        selectedEntity?.id === entity.id ? "bg-blue-50/50" : ""
                      )}
                    >
                      <td className="px-4 py-4" onClick={(e) => e.stopPropagation()}>
                        <button
                          onClick={() => toggleSelect(entity.id)}
                          className="text-slate-400 hover:text-blue-600 transition-colors"
                        >
                          {isSelected
                            ? <CheckSquare size={16} className="text-blue-600" />
                            : <Square size={16} />
                          }
                        </button>
                      </td>
                      <td
                        className="px-6 py-4"
                        onClick={() => setSelectedEntity(selectedEntity?.id === entity.id ? null : entity)}
                      >
                        <div className="flex items-center gap-3">
                          <div className={clsx("w-8 h-8 rounded flex items-center justify-center text-white flex-shrink-0 shadow-sm", entity.type.includes('Hazine') ? 'bg-amber-600' : entity.type.includes('BT') ? 'bg-slate-600' : entity.type.includes('Bölge') ? 'bg-blue-500' : 'bg-emerald-500')}>
                            {entity.type.includes('BT') ? <Server size={14} /> : <Building2 size={14} />}
                          </div>
                          <div>
                            <div className="font-bold text-slate-900 group-hover:text-blue-700 transition-colors">{entity.name}</div>
                            <div className="text-[11px] text-slate-400 font-mono mt-0.5">{entity.path}</div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-center">
                        <span className="inline-flex items-center justify-center px-2 py-1 rounded bg-slate-100 text-slate-700 font-mono text-xs font-bold border border-slate-200">{entity.weight.toFixed(1)}x</span>
                      </td>
                      <td className="px-6 py-4 text-center">
                        <span className={clsx("font-mono font-medium", isCapped ? "line-through text-slate-400" : "text-slate-700")}>{rawScore.toFixed(1)}</span>
                      </td>
                      <td className="px-6 py-4">
                        {vetoReason ? (
                          <span className={clsx("inline-flex items-center gap-1.5 px-2 py-1 rounded text-[10px] font-bold w-max border shadow-sm", vetoReason.includes("Şer'i") ? "bg-fuchsia-50 text-fuchsia-700 border-fuchsia-200" : vetoReason.includes("Kritik") ? "bg-red-50 text-red-700 border-red-200" : "bg-orange-50 text-orange-700 border-orange-200")}>
                            {vetoReason.includes("Şer'i") ? <Flame size={12} className="animate-pulse" /> : vetoReason.includes("Kritik") ? <AlertTriangle size={12} /> : <TrendingDown size={12} />}
                            {vetoReason}
                          </span>
                        ) : (
                          <span className="text-xs font-medium text-slate-400 flex items-center gap-1"><CheckCircle2 size={12} /> Kısıt Yok</span>
                        )}
                      </td>
                      <td className="px-6 py-4 text-center">
                        <span className={clsx("inline-flex items-center justify-center w-8 h-8 rounded font-bold border text-sm shadow-sm", color)}>{grade}</span>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex flex-col">
                          <span className={clsx("font-bold", vetoReason?.includes("Şer'i") ? "text-fuchsia-700" : "text-slate-800")}>{opinion}</span>
                          <span className="text-[11px] text-slate-500 mt-0.5">Sıklık: {freq}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center justify-center gap-1 font-mono text-[11px]">
                          <span className={clsx("w-5 h-5 flex items-center justify-center rounded font-bold border", entity.findings.bordo > 0 ? "bg-fuchsia-950 text-white border-fuchsia-900" : "bg-slate-50 text-slate-300 border-slate-200")} title="Bordo (Kritik)">{entity.findings.bordo}</span>
                          <span className={clsx("w-5 h-5 flex items-center justify-center rounded font-bold border", entity.findings.kizil > 0 ? "bg-red-600 text-white border-red-700" : "bg-slate-50 text-slate-300 border-slate-200")} title="Kızıl (Yüksek)">{entity.findings.kizil}</span>
                          <span className={clsx("w-5 h-5 flex items-center justify-center rounded font-bold border", entity.findings.turuncu > 0 ? "bg-orange-500 text-white border-orange-600" : "bg-slate-50 text-slate-300 border-slate-200")} title="Turuncu (Orta)">{entity.findings.turuncu}</span>
                          <span className={clsx("w-5 h-5 flex items-center justify-center rounded font-bold border", entity.findings.sari > 0 ? "bg-yellow-400 text-slate-900 border-yellow-500" : "bg-slate-50 text-slate-300 border-slate-200")} title="Sarı (Düşük)">{entity.findings.sari}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <button
                          onClick={() => setSelectedEntity(selectedEntity?.id === entity.id ? null : entity)}
                          className="text-slate-400 group-hover:text-blue-600 transition-colors p-1 hover:bg-blue-100 rounded"
                        >
                          <ChevronRight size={18} className={clsx("transition-transform", selectedEntity?.id === entity.id ? "rotate-90" : "")} />
                        </button>
                      </td>
                    </tr>

                    <AnimatePresence>
                      {selectedEntity?.id === entity.id && (
                        <tr className="bg-slate-50/80 border-b border-slate-200">
                          <td colSpan={9} className="p-0">
                            <motion.div
                              initial={{ height: 0, opacity: 0 }}
                              animate={{ height: 'auto', opacity: 1 }}
                              exit={{ height: 0, opacity: 0 }}
                              className="overflow-hidden"
                            >
                              <div className="p-6 grid grid-cols-1 lg:grid-cols-2 gap-6 border-t border-slate-200 shadow-inner">
                                <div className="bg-white border border-slate-200 rounded-lg p-5 shadow-sm">
                                  <h5 className="text-[11px] font-bold text-slate-400 uppercase tracking-widest mb-4 flex items-center gap-2">
                                    <Activity size={14} className="text-blue-500"/> Kesinti Matematiği
                                  </h5>
                                  <div className="space-y-3 font-mono text-sm text-slate-700">
                                    <div className="flex justify-between border-b border-slate-100 pb-2"><span className="text-slate-500">Başlangıç Puanı:</span><span className="font-medium">100.00</span></div>
                                    <div className="flex justify-between text-rose-600 border-b border-slate-100 pb-2"><span>Bulgu Kesintileri:</span><span>-{(100 - rawScore).toFixed(2)}</span></div>
                                    <div className="flex justify-between font-bold pt-1 text-slate-900"><span>Ham Puan:</span><span>{rawScore.toFixed(2)}</span></div>
                                  </div>
                                </div>
                                <div className="bg-white border border-slate-200 rounded-lg p-5 shadow-sm flex flex-col justify-between">
                                  <div>
                                    <h5 className="text-[11px] font-bold text-slate-400 uppercase tracking-widest mb-4 flex items-center gap-2">
                                      <Lock size={14} className="text-slate-500"/> Tavan & Veto Kararı
                                    </h5>
                                    {vetoReason ? (
                                      <div className={clsx("p-4 border rounded-lg text-sm leading-relaxed", vetoReason.includes("Şer'i") ? "bg-fuchsia-50 border-fuchsia-200 text-fuchsia-900" : vetoReason.includes("Kritik") ? "bg-red-50 border-red-200 text-red-900" : "bg-orange-50 border-orange-200 text-orange-900")}>
                                        <strong>İHLAL TESPİTİ:</strong> Sentinel algoritması, <strong>"{vetoReason}"</strong> sebebiyle {rawScore.toFixed(2)} olan puanı geçersiz kılmış ve Nihai Notu <strong>{grade} ({finalScore.toFixed(2)})</strong> seviyesine sabitlemiştir.
                                      </div>
                                    ) : (
                                      <div className="p-4 bg-emerald-50 border border-emerald-100 rounded-lg text-emerald-800 text-sm flex items-center gap-3">
                                        <ShieldCheck size={24} className="text-emerald-600 flex-shrink-0" />
                                        <div><strong>Kısıt Yok.</strong><br/>Tavan (Capping) veya Veto kuralı tetiklenmemiştir.</div>
                                      </div>
                                    )}
                                  </div>
                                  {/* CRITICAL FIX: e.stopPropagation() added here */}
                                  <button
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      setSelectedIds(new Set([entity.id]));
                                      setShowBulkModal(true);
                                    }}
                                    className="mt-3 flex items-center gap-2 px-3 py-2 bg-emerald-600 text-white rounded-lg text-xs font-semibold hover:bg-emerald-700 transition-colors w-full justify-center"
                                  >
                                    <CalendarPlus size={14} />
                                    Bu Varlık için Denetim Planla
                                  </button>
                                </div>
                              </div>
                            </motion.div>
                          </td>
                        </tr>
                      )}
                    </AnimatePresence>
                  </React.Fragment>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* FLOATING SELECTION BAR */}
      <AnimatePresence>
        {selectedIds.size > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 60 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 60 }}
            className="fixed bottom-8 left-1/2 -translate-x-1/2 z-40 bg-slate-900 text-white rounded-2xl shadow-2xl px-6 py-4 flex items-center gap-6 border border-slate-700"
          >
            <div className="flex items-center gap-2 text-sm">
              <CheckSquare size={18} className="text-blue-400" />
              <span className="font-semibold">{selectedIds.size} varlık seçildi</span>
            </div>
            <div className="w-px h-6 bg-slate-700" />
            <button
              onClick={() => setShowBulkModal(true)}
              className="flex items-center gap-2 px-4 py-2 bg-emerald-500 text-white rounded-xl text-sm font-semibold hover:bg-emerald-400 transition-colors"
            >
              <Zap size={16} />
              Denetim Görevi Oluştur
            </button>
            <button
              onClick={() => setSelectedIds(new Set())}
              className="p-1.5 text-slate-400 hover:text-white hover:bg-slate-700 rounded-lg transition-colors"
            >
              <X size={16} />
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* BULK CREATE MODAL - CRITICAL FIX: Changed absolute positioning to flex-center layout */}
      <AnimatePresence>
        {showBulkModal && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 bg-black/50 backdrop-blur-sm"
              onClick={() => !isBulkCreating && setShowBulkModal(false)}
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="bg-white rounded-2xl shadow-2xl w-full max-w-lg flex flex-col max-h-[90vh] overflow-hidden relative z-10"
            >
              <div className="flex items-center justify-between p-6 border-b border-slate-100 shrink-0">
                <div>
                  <h3 className="text-xl font-bold text-slate-900">Denetim Görevi Oluştur</h3>
                  <p className="text-sm text-slate-500 mt-1">Risk bazlı otomatik kapsam ve bütçe hesaplanır</p>
                </div>
                <button
                  onClick={() => !isBulkCreating && setShowBulkModal(false)}
                  className="p-2 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-lg transition-colors"
                >
                  <X size={18} />
                </button>
              </div>

              <div className="p-6 overflow-y-auto flex-1 bg-slate-50/50">
                <div className="bg-white rounded-xl border border-slate-200 p-4 mb-5">
                  <div className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-3">Seçili Varlıklar</div>
                  <div className="space-y-2">
                    {selectedEntities.map(e => {
                      const { grade, color } = calculateEntityGrade(e);
                      return (
                        <div key={e.id} className="flex items-center justify-between gap-3 bg-slate-50 border border-slate-100 rounded-lg px-3 py-2">
                          <div className="flex items-center gap-2">
                            <Building2 size={14} className="text-slate-400" />
                            <span className="text-sm font-semibold text-slate-800">{e.name}</span>
                            <span className="text-[10px] text-slate-400 font-mono">{e.path}</span>
                          </div>
                          <span className={clsx("inline-flex items-center justify-center w-7 h-7 rounded font-bold border text-xs bg-white", color)}>{grade}</span>
                        </div>
                      );
                    })}
                  </div>
                </div>

                <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 text-sm text-blue-900">
                  <strong>Risk Tabanlı Kapsam:</strong> Her varlık için risk skoru, hız çarpanı ve varlık tipi dikkate alınarak tahmini saat ve denetim türü otomatik hesaplanacaktır. Görevler aktif yıllık plana eklenecektir.
                </div>
              </div>

              <div className="flex gap-3 p-6 border-t border-slate-100 shrink-0 bg-white">
                <button
                  onClick={() => !isBulkCreating && setShowBulkModal(false)}
                  disabled={isBulkCreating}
                  className="flex-1 px-4 py-3 text-slate-700 bg-white border border-slate-300 rounded-xl hover:bg-slate-50 transition-colors font-medium disabled:opacity-50"
                >
                  İptal
                </button>
                <button
                  onClick={handleBulkCreate}
                  disabled={isBulkCreating}
                  className="flex-1 flex items-center justify-center gap-2 px-4 py-3 bg-emerald-600 text-white rounded-xl hover:bg-emerald-700 transition-colors font-semibold disabled:opacity-50"
                >
                  {isBulkCreating ? (
                    <><Loader2 size={16} className="animate-spin" /> Oluşturuluyor...</>
                  ) : (
                    <><CalendarPlus size={16} /> {selectedEntities.length} Görev Oluştur</>
                  )}
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* NEW ENTITY MODAL - CRITICAL FIX: Changed absolute positioning to flex-center layout */}
      <AnimatePresence>
        {showNewEntityModal && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 bg-black/50 backdrop-blur-sm"
              onClick={() => setShowNewEntityModal(false)}
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white rounded-2xl shadow-2xl w-full max-w-md flex flex-col max-h-[90vh] overflow-hidden relative z-10"
            >
              <div className="flex items-center justify-between p-6 border-b border-slate-100 shrink-0">
                <h3 className="text-xl font-bold text-slate-900">Yeni Varlık Ekle</h3>
                <button onClick={() => setShowNewEntityModal(false)} className="p-2 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-lg transition-colors">
                  <X size={18} />
                </button>
              </div>
              <form onSubmit={handleCreateEntity} className="flex flex-col flex-1 overflow-hidden">
                <div className="p-6 space-y-4 overflow-y-auto flex-1 bg-slate-50/50">
                  <div>
                    <label className="block text-sm font-semibold text-slate-700 mb-1.5">Varlık Adı *</label>
                    <input
                      type="text"
                      value={newEntityForm.name}
                      onChange={e => setNewEntityForm(f => ({ ...f, name: e.target.value }))}
                      placeholder="örn. Kurumsal Bankacılık Direktörlüğü"
                      className="w-full px-3 py-2.5 bg-white border border-slate-200 rounded-lg text-sm focus:outline-none focus:border-blue-500 transition-all shadow-sm"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-slate-700 mb-1.5">LTree Path *</label>
                    <input
                      type="text"
                      value={newEntityForm.path}
                      onChange={e => setNewEntityForm(f => ({ ...f, path: e.target.value }))}
                      placeholder="örn. bank.corporate_banking"
                      className="w-full px-3 py-2.5 bg-white border border-slate-200 rounded-lg text-sm font-mono focus:outline-none focus:border-blue-500 transition-all shadow-sm"
                      required
                    />
                    <p className="text-xs text-slate-500 mt-1">Nokta ile ayrılmış hiyerarşik yol (ltree formatı)</p>
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-slate-700 mb-1.5">Varlık Tipi</label>
                    <select
                      value={newEntityForm.type}
                      onChange={e => setNewEntityForm(f => ({ ...f, type: e.target.value as EntityType }))}
                      className="w-full px-3 py-2.5 bg-white border border-slate-200 rounded-lg text-sm focus:outline-none focus:border-blue-500 transition-all shadow-sm"
                    >
                      <option value="HOLDING">HOLDING</option>
                      <option value="BANK">BANK</option>
                      <option value="GROUP">GROUP</option>
                      <option value="UNIT">UNIT</option>
                      <option value="PROCESS">PROCESS</option>
                      <option value="BRANCH">BRANCH</option>
                    </select>
                  </div>
                </div>
                <div className="flex gap-3 p-6 border-t border-slate-100 bg-white shrink-0">
                  <button type="button" onClick={() => setShowNewEntityModal(false)} className="flex-1 px-4 py-2.5 text-slate-700 bg-white border border-slate-300 rounded-xl hover:bg-slate-50 transition-colors font-medium">
                    İptal
                  </button>
                  <button
                    type="submit"
                    disabled={createEntity.isPending}
                    className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 bg-slate-900 text-white rounded-xl hover:bg-slate-800 transition-colors font-semibold disabled:opacity-50 shadow-md"
                  >
                    {createEntity.isPending ? <Loader2 size={15} className="animate-spin" /> : <Plus size={15} />}
                    Ekle
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}