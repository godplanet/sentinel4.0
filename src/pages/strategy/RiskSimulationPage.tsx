import React, { useState, useMemo } from 'react';
import { 
  Target, Activity, ShieldAlert, BrainCircuit, Info, Zap, 
  Download, Filter, MousePointerSquareDashed, Flame, ArrowUpRight
} from 'lucide-react';
import { PageHeader } from '@/shared/ui/PageHeader';
import clsx from 'clsx';
import { motion, AnimatePresence } from 'framer-motion';

// --- KERD-2026 RİSK HIZI (VELOCITY) TİPLERİ ---
type VelocityType = 'Düşük Hız (Aylar)' | 'Normal Hız (Haftalar)' | 'Yüksek Hız (Günler)' | 'Kritik Hız (Saatler)';

interface StrategicRisk {
  id: string;
  code: string;
  title: string;
  category: string;
  impact: number;      
  likelihood: number;  
  baseVelocity: number; // Riskin kendi doğal hızı (0.0 - 1.0)
  shariah_related?: boolean;
}

// Blueprint'teki Sistem Hız Çarpanları
const VELOCITY_MULTIPLIERS: Record<VelocityType, number> = {
  'Düşük Hız (Aylar)': 0.0,
  'Normal Hız (Haftalar)': 0.15,
  'Yüksek Hız (Günler)': 0.35,
  'Kritik Hız (Saatler)': 0.60
};

// --- MOCK VERİLER (Banka Risk Kütüğü) ---
const MOCK_RISKS: StrategicRisk[] = [
  { id: 'r1', code: 'RSK-001', title: 'Siber Saldırı ve Veri Sızıntısı', category: 'BT / Siber Güvenlik', impact: 5, likelihood: 3, baseVelocity: 1.0 }, // Çok hızlı (1.0)
  { id: 'r2', code: 'RSK-002', title: 'Murabaha Teverruk İhlali', category: 'Uyum / Şer\'i', impact: 5, likelihood: 2, baseVelocity: 0.5, shariah_related: true }, // Şer'i -> Direkt Veto
  { id: 'r3', code: 'RSK-003', title: 'Makroekonomik Kur Şoku', category: 'Finansal', impact: 4, likelihood: 4, baseVelocity: 0.8 },
  { id: 'r4', code: 'RSK-004', title: 'Şube Kasa Limit Aşımları', category: 'Operasyonel', impact: 3, likelihood: 4, baseVelocity: 0.2 },
  { id: 'r5', code: 'RSK-005', title: 'MASAK / KYC Yükümlülük İhlali', category: 'Uyum / Yasal', impact: 4, likelihood: 3, baseVelocity: 0.6 },
  { id: 'r6', code: 'RSK-006', title: 'Bulut Servis Kesintisi (Downtime)', category: 'BT / Siber Güvenlik', impact: 4, likelihood: 2, baseVelocity: 0.9 },
  { id: 'r7', code: 'RSK-007', title: 'Personel Devir Hızı (Turnover)', category: 'Stratejik', impact: 2, likelihood: 3, baseVelocity: 0.1 }, // Yavaş risk (0.1)
];

export default function RiskSimulationPage() {
  const [selectedVelocity, setSelectedVelocity] = useState<VelocityType>('Düşük Hız (Aylar)');
  const [selectedCell, setSelectedCell] = useState<{i: number, l: number} | null>(null);

  // --- HESAPLAMA MOTORU (Blueprint Formülü: Skor = (Etki x Olasılık) * (1 + Hız_Faktörü)) ---
  const calculatedRisks = useMemo(() => {
    return MOCK_RISKS.map(risk => {
      const baseScore = risk.impact * risk.likelihood;
      
      // Hız Faktörü = (Seçilen Senaryo Çarpanı) * (Riskin Kendi Doğal Hızı)
      const speedFactor = VELOCITY_MULTIPLIERS[selectedVelocity] * risk.baseVelocity;
      const dynamicScore = baseScore * (1 + speedFactor);

      // Renk ve Kategori Belirleme (Blueprint Taksonomisi)
      let category = 'Sarı (Düşük)';
      let colorClass = 'bg-yellow-400 text-slate-900 border-yellow-500';

      if (risk.shariah_related) {
        category = 'Bordo (Batıl)';
        colorClass = 'bg-fuchsia-950 text-white border-fuchsia-900'; // Şer'i veto
      } else if (dynamicScore >= 20) {
        category = 'Bordo (Kritik)';
        colorClass = 'bg-fuchsia-950 text-white border-fuchsia-900';
      } else if (dynamicScore >= 15) {
        category = 'Kırmızı (Yüksek)';
        colorClass = 'bg-red-600 text-white border-red-700';
      } else if (dynamicScore >= 8) {
        category = 'Turuncu (Orta)';
        colorClass = 'bg-orange-500 text-white border-orange-600';
      } else {
        category = 'Sarı (Düşük)';
        colorClass = 'bg-amber-300 text-slate-900 border-amber-400';
      }

      return { ...risk, baseScore, dynamicScore, speedFactor, category, colorClass };
    }).sort((a, b) => b.dynamicScore - a.dynamicScore); // En yüksek dinamik risk en üstte
  }, [selectedVelocity]);

  // Haritaya riskleri dağıtma
  const matrixData = useMemo(() => {
    const matrix: Record<string, typeof calculatedRisks> = {};
    for (let i = 1; i <= 5; i++) {
      for (let l = 1; l <= 5; l++) {
        matrix[`${i}-${l}`] = [];
      }
    }
    calculatedRisks.forEach(risk => {
      matrix[`${risk.impact}-${risk.likelihood}`].push(risk);
    });
    return matrix;
  }, [calculatedRisks]);

  // --- EKSİK OLAN YARDIMCI FONKSİYON BURAYA EKLENDİ ---
  const getRisksForCell = (impact: number, likelihood: number) => {
    return matrixData[`${impact}-${likelihood}`] || [];
  };

  // Hücre Rengini Belirleme (O hücredeki EN YÜKSEK dinamik skora göre)
  const getCellColor = (impact: number, likelihood: number) => {
    const risks = getRisksForCell(impact, likelihood);
    
    // Hücre boşsa, sadece statik x*y puanına göre açık bir zemin rengi ver
    if (risks.length === 0) {
      const baseScore = impact * likelihood;
      if (baseScore >= 20) return 'bg-rose-50 border-rose-100';
      if (baseScore >= 15) return 'bg-red-50 border-red-100';
      if (baseScore >= 8) return 'bg-orange-50 border-orange-100';
      return 'bg-emerald-50 border-emerald-100';
    }

    // Hücre doluysa, içindeki en tehlikeli riske göre hücreyi boya
    const maxScore = Math.max(...risks.map(r => r.dynamicScore));
    const hasShariah = risks.some(r => r.shariah_related);
    
    if (hasShariah || maxScore >= 20) return 'bg-fuchsia-100 border-fuchsia-300 shadow-inner';
    if (maxScore >= 15) return 'bg-red-100 border-red-300 shadow-inner';
    if (maxScore >= 8) return 'bg-orange-100 border-orange-300 shadow-inner';
    return 'bg-emerald-100 border-emerald-300 shadow-inner';
  };

  const activeRisks = selectedCell ? getRisksForCell(selectedCell.i, selectedCell.l) : calculatedRisks;

  return (
    <div className="w-full max-w-full px-6 py-8 space-y-6 bg-slate-50 min-h-screen font-sans">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <PageHeader
          title="Stratejik Risk Haritası"
          description="Basel IV & KERD-2026: Dinamik Hız (Velocity) Entegrasyonlu Stres Testi"
          icon={Target}
        />
        <div className="flex items-center gap-2">
          <button className="flex items-center gap-2 px-4 py-2 bg-white border border-slate-300 text-slate-700 rounded-md text-sm font-medium hover:bg-slate-50 shadow-sm transition-colors">
            <Download size={16} /> Matris Raporu
          </button>
        </div>
      </div>

      {/* --- 1. VİTRİN: SENTINEL AI & VELOCITY STRES TESTİ --- */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Sol Panel: Kriz Senaryosu Slider */}
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 flex flex-col justify-center">
          <h3 className="text-sm font-bold text-slate-800 uppercase tracking-widest mb-1 flex items-center gap-2">
            <Zap size={16} className="text-amber-500"/> Kriz Senaryosu (Hız Çarpanı)
          </h3>
          <p className="text-xs text-slate-500 mb-4">Sistemin genel risk materyalize olma hızını artırarak stres testi uygulayın.</p>
          
          <div className="space-y-2">
            {(Object.keys(VELOCITY_MULTIPLIERS) as VelocityType[]).map((v) => (
              <button
                key={v}
                onClick={() => setSelectedVelocity(v)}
                className={clsx(
                  "w-full flex items-center justify-between p-3 rounded-lg border text-sm transition-all",
                  selectedVelocity === v 
                    ? "bg-slate-900 border-slate-900 text-white shadow-md" 
                    : "bg-white border-slate-200 text-slate-600 hover:border-slate-400"
                )}
              >
                <span className="font-medium">{v}</span>
                <span className={clsx("font-mono font-bold", selectedVelocity === v ? "text-amber-400" : "text-slate-400")}>
                  +{ (VELOCITY_MULTIPLIERS[v] * 100).toFixed(0) }%
                </span>
              </button>
            ))}
          </div>
        </div>

        {/* Sağ Panel: Sentinel AI Yorumu */}
        <div className="lg:col-span-2 bg-gradient-to-br from-indigo-950 to-slate-900 rounded-xl p-6 shadow-md border border-indigo-900/50 flex flex-col justify-center relative overflow-hidden">
          <div className="absolute -left-20 -top-20 w-64 h-64 bg-indigo-500 rounded-full opacity-10 blur-3xl pointer-events-none"></div>
          <div className="flex items-start gap-4 relative z-10">
            <div className="p-3 bg-indigo-500/20 rounded-xl border border-indigo-500/30 shrink-0">
              <BrainCircuit className="w-6 h-6 text-indigo-300" />
            </div>
            <div className="flex-1">
              <h3 className="text-indigo-200 font-bold flex items-center gap-2 mb-2">
                Sentinel AI Kinetik Risk Analizi
                {selectedVelocity === 'Kritik Hız (Saatler)' && (
                  <span className="px-2 py-0.5 bg-fuchsia-500/20 text-fuchsia-300 text-[10px] rounded-full border border-fuchsia-500/30 uppercase tracking-wide animate-pulse">
                    Yüksek Volatilite
                  </span>
                )}
              </h3>
              <p className="text-slate-300 text-sm leading-relaxed">
                Geleneksel matrisler riskin <strong>hızını (velocity)</strong> göremez. Siber güvenlik gibi risklerin gerçekleşme süresi saatler ile ölçülürken, personel devir hızı (turnover) aylara yayılır. Yandaki <em>Kriz Senaryosunu</em> "Kritik Hız"a getirdiğinizde, kinetik enerjisi çok yüksek olan <strong>RSK-001 (Siber Saldırı)</strong> riskinin, zemin puanına eklenen <strong>+{ (VELOCITY_MULTIPLIERS[selectedVelocity] * 100).toFixed(0) }% Hız Çarpanı</strong> ile aniden <span className="text-fuchsia-400 font-bold">Bordo (Kritik)</span> bölgeye sıçradığını, "Turnover" riskinin ise hız faktörü düşük olduğu için yerinde kaldığını gözlemleyebilirsiniz.
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="bg-blue-50 border border-blue-100 rounded-lg p-4 flex items-start gap-3 shadow-sm">
        <Info className="w-5 h-5 text-blue-600 mt-0.5 flex-shrink-0" />
        <div className="text-sm text-blue-900 leading-relaxed">
          <strong>Formül: Risk Skoru = (Olasılık × Etki) × (1 + Hız_Faktörü)</strong> (KERD-2026 Anayasası). Sentinel v3.0, saatler içinde gerçekleşen riskleri, aylar süren risklerden matematiksel olarak ayırır. Şer'i riskler hıza bakılmaksızın <em>Batıl (Bordo Veto)</em> kabul edilir.
        </div>
      </div>

      {/* --- 2. MUTFAK: ENTERPRISE CLEAN MATRİS VE LİSTE --- */}
      <div className="grid grid-cols-1 xl:grid-cols-4 gap-6">
        
        {/* Sol Taraf: 5x5 Grid Matris */}
        <div className="xl:col-span-2 bg-white p-6 rounded-xl shadow-sm border border-slate-200">
          <div className="flex">
            {/* Olasılık Eksen Etiketi */}
            <div className="flex flex-col justify-center items-center mr-2 w-6">
              <div className="transform -rotate-90 text-[10px] font-bold text-slate-400 uppercase tracking-widest whitespace-nowrap">
                Olasılık (Likelihood)
              </div>
            </div>

            {/* Matris Izgarası */}
            <div className="flex-1">
              <div className="grid grid-cols-5 gap-1.5 aspect-square">
                {[5, 4, 3, 2, 1].map(l => (
                  <React.Fragment key={`row-${l}`}>
                    {[1, 2, 3, 4, 5].map(i => {
                      const isSelected = selectedCell?.i === i && selectedCell?.l === l;
                      const risksInCell = getRisksForCell(i, l);

                      return (
                        <motion.div
                          layout
                          key={`${i}-${l}`}
                          onClick={() => setSelectedCell(isSelected ? null : {i, l})}
                          className={clsx(
                            "relative rounded-md cursor-pointer transition-all border flex flex-col items-center justify-center",
                            getCellColor(i, l),
                            isSelected ? "border-slate-900 scale-105 z-10 shadow-xl ring-2 ring-blue-500/20" : "shadow-sm hover:brightness-95"
                          )}
                        >
                          {/* Arkaplandaki Statik Çarpım Skoru (Silik) */}
                          <div className="absolute top-1 left-1.5 text-[9px] font-mono font-bold text-slate-500/40">
                            {i * l}
                          </div>
                          
                          {/* Hücrenin içindeki Risk Baloncukları */}
                          {risksInCell.length > 0 && (
                            <div className="flex flex-wrap items-center justify-center gap-1 p-1 z-10">
                              {risksInCell.map(r => (
                                <div key={r.id} className={clsx("w-6 h-6 rounded-full flex items-center justify-center text-[9px] font-bold border shadow-sm", r.colorClass)}>
                                  {r.code.split('-')[1]}
                                </div>
                              ))}
                            </div>
                          )}
                        </motion.div>
                      );
                    })}
                  </React.Fragment>
                ))}
              </div>

              {/* Etki Eksen Etiketi */}
              <div className="grid grid-cols-5 gap-1.5 mt-2 text-center text-[10px] font-bold text-slate-400">
                <div>1</div><div>2</div><div>3</div><div>4</div><div>5</div>
              </div>
              <div className="text-center mt-1 text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                Etki (Impact)
              </div>
            </div>
          </div>
        </div>

        {/* Sağ Taraf: Detaylı Risk Veri Tablosu */}
        <div className="xl:col-span-2 bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden flex flex-col h-[500px]">
          <div className="p-4 bg-slate-50 border-b border-slate-200 flex justify-between items-center">
            <h3 className="text-sm font-bold text-slate-800 uppercase tracking-wider flex items-center gap-2">
              <MousePointerSquareDashed size={16} className="text-blue-600"/> 
              {selectedCell ? `Hücre [E:${selectedCell.i}, O:${selectedCell.l}] Riskleri` : 'Dinamik Risk Kütüğü'}
            </h3>
            <span className="text-xs font-bold text-slate-500 bg-white border px-2 py-1 rounded shadow-sm">
              {activeRisks.length} Kayıt
            </span>
          </div>
          
          <div className="flex-1 overflow-y-auto">
            <table className="w-full text-left text-sm whitespace-nowrap">
              <thead className="bg-white text-slate-400 font-bold uppercase tracking-widest text-[10px] border-b border-slate-200 sticky top-0 z-10 shadow-sm">
                <tr>
                  <th className="px-4 py-3">Risk Kodu & Adı</th>
                  <th className="px-4 py-3 text-center">Baz Skor</th>
                  <th className="px-4 py-3 text-center text-blue-600">Hız Faktörü</th>
                  <th className="px-4 py-3 text-center">Dinamik Skor</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-slate-800">
                <AnimatePresence>
                  {activeRisks.map((risk) => (
                    <motion.tr 
                      layout
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      key={risk.id}
                      className="hover:bg-slate-50 transition-colors"
                    >
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2">
                          <span className={clsx("w-2 h-2 rounded-full flex-shrink-0", risk.colorClass.split(' ')[0])}></span>
                          <div>
                            <div className="font-bold text-slate-900">{risk.code}</div>
                            <div className="text-[11px] text-slate-500 max-w-[200px] truncate" title={risk.title}>{risk.title}</div>
                          </div>
                          {risk.shariah_related && (
                            <Flame size={14} className="text-fuchsia-600 ml-1 flex-shrink-0" title="Şer'i Hassasiyet (Veto)" />
                          )}
                        </div>
                      </td>
                      <td className="px-4 py-3 text-center">
                        <span className="font-mono text-slate-400 line-through decoration-slate-300">{risk.baseScore}</span>
                      </td>
                      <td className="px-4 py-3 text-center">
                        <div className="inline-flex items-center justify-center px-1.5 py-0.5 rounded bg-blue-50 text-blue-700 font-mono text-[11px] border border-blue-100">
                          <ArrowUpRight size={10} className="mr-0.5" />
                          +{(risk.speedFactor * 100).toFixed(0)}%
                        </div>
                      </td>
                      <td className="px-4 py-3 text-center">
                        <span className={clsx(
                          "inline-flex items-center justify-center px-2 py-1 rounded font-bold text-xs border min-w-[3.5rem] shadow-sm",
                          risk.colorClass
                        )}>
                          {risk.shariah_related ? 'VETO' : risk.dynamicScore.toFixed(1)}
                        </span>
                      </td>
                    </motion.tr>
                  ))}
                  {activeRisks.length === 0 && (
                    <tr>
                      <td colSpan={4} className="px-4 py-8 text-center text-slate-400 text-sm italic">
                        Seçili alanda risk bulunmuyor.
                      </td>
                    </tr>
                  )}
                </AnimatePresence>
              </tbody>
            </table>
          </div>
        </div>

      </div>
    </div>
  );
}