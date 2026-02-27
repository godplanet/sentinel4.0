import React, { useState } from 'react';
import toast from 'react-hot-toast';
import { XPEngine, formatXPToast, getRiskLevelFromSeverity } from '@/features/talent-os/lib/XPEngine';
import {
  Activity,
  Tags,
  Building,
  AlertTriangle,
  Layers,
  X,
  GitPullRequestArrow,
  HelpCircle,
  Gavel,    // YENİ: BDDK İkonu
  Globe,    // YENİ: Global İkonu
  Info,      // YENİ: Gözlem İkonu
  Send,     // GÖREV 1: Workflow advance butonu
  Link,     // GÖREV 2: Cross-linking
  Plus
} from 'lucide-react';
import { cn } from '@/shared/utils/cn';
import { QAIPChecklistModal } from './QAIPChecklistModal';

// --- Types ---
interface FindingFormWidgetProps {
  finding: any; // ComprehensiveFinding
  onUpdate: (field: string, value: any) => void;
  onAdvanceWorkflow?: () => void; // GÖREV 1: Workflow callback
}

// --- Constants & Mappings (BDDK & GIAS 2024) ---

const BDDK_MAPPING = {
  'OK': { label: 'Önemli Kontrol Eksikliği (ÖK)', impact: 5, likelihood: 5, severity: 'CRITICAL', color: 'bg-rose-600' },
  'KD': { label: 'Kayda Değer Kontrol Eksikliği (KD)', impact: 4, likelihood: 4, severity: 'HIGH', color: 'bg-orange-500' },
  'KZ': { label: 'Kontrol Zayıflığı (KZ)', impact: 3, likelihood: 3, severity: 'MEDIUM', color: 'bg-amber-500' }
};

const SEVERITY_COLORS = {
  'CRITICAL': 'text-rose-600 bg-rose-50 border-rose-200 ring-rose-100',
  'HIGH': 'text-orange-600 bg-orange-50 border-orange-200 ring-orange-100',
  'MEDIUM': 'text-amber-600 bg-amber-50 border-amber-200 ring-amber-100',
  'LOW': 'text-emerald-600 bg-emerald-50 border-emerald-200 ring-emerald-100',
  'OBSERVATION': 'text-slate-600 bg-slate-100 border-slate-200 ring-slate-100' // Nötr
};

// --- Mock Data ---
const CATEGORIES = [
  'Bilgi Teknolojileri (IT)',
  'Kredi Riski',
  'Operasyonel Risk',
  'Uyum ve Mevzuat',
  'İnsan Kaynakları',
  'Finansal Raporlama'
];

const DEPARTMENTS = [
  'Genel Müdürlük',
  'Yazılım Geliştirme',
  'Sistem ve Ağ Yönetimi',
  'Krediler Tahsis',
  'Şube Operasyonları'
];

// --- GIS 2024 Expansion: Risk Universe ---
const RISK_TYPES = [
  { id: 'credit', label: 'Kredi Riski', icon: '💳' },
  { id: 'market', label: 'Piyasa Riski', icon: '📊' },
  { id: 'operational', label: 'Operasyonel Risk', icon: '⚙️' },
  { id: 'liquidity', label: 'Likidite Riski', icon: '💧' },
  { id: 'compliance', label: 'Uyum Riski', icon: '⚖️' },
  { id: 'strategic', label: 'Stratejik Risk', icon: '🎯' },
  { id: 'reputation', label: 'İtibar Riski', icon: '🛡️' }
];

// --- Process Map (Simplified) ---
const PROCESSES = [
  { id: 'lending', label: 'Kredi Süreçleri', subprocesses: ['Bireysel Kredi', 'Ticari Kredi', 'Kredi Tahsis'] },
  { id: 'treasury', label: 'Hazine İşlemleri', subprocesses: ['FX İşlemleri', 'Türev Ürünler', 'Likidite Yönetimi'] },
  { id: 'operations', label: 'Operasyon', subprocesses: ['Ödeme Sistemleri', 'Mutabakat', 'Hesap İşlemleri'] },
  { id: 'it', label: 'Bilgi Teknolojileri', subprocesses: ['Yazılım Geliştirme', 'Siber Güvenlik', 'IT Operasyon'] },
  { id: 'compliance', label: 'Uyum', subprocesses: ['AML/CFT', 'KYC', 'Mevzuat Takibi'] }
];

// --- Control Library (Mock) ---
const CONTROLS = [
  { id: 'C001', title: '4-Göz Prensibi (Maker-Checker)', category: 'Preventive' },
  { id: 'C002', title: 'Sistem Otomasyon Kontrolleri', category: 'Detective' },
  { id: 'C003', title: 'Günlük Log İzleme', category: 'Detective' },
  { id: 'C004', title: 'Erişim Yetkilendirme Matrisi', category: 'Preventive' },
  { id: 'C005', title: 'Üst Limit Onayı', category: 'Preventive' }
];

export const FindingFormWidget: React.FC<FindingFormWidgetProps> = ({ finding, onUpdate, onAdvanceWorkflow }) => {
  // Local state for Tag Input
  const [tagInput, setTagInput] = useState('');

  // GÖREV 1: QAIP Modal State
  const [isQAIPModalOpen, setIsQAIPModalOpen] = useState(false);

  // GÖREV 2: Cross-Linking State
  const [isLinkModalOpen, setIsLinkModalOpen] = useState(false);
  const [linkSearchQuery, setLinkSearchQuery] = useState('');

  // --- Logic Extraction ---
  
  // Framework Detection (Default to Standard if missing)
  const auditFramework = finding.audit_framework || 'STANDARD';

  // Derived Values
  const impact = finding.impact || 1;
  const likelihood = finding.likelihood || 1;
  const controlEffectiveness = finding.control_effectiveness || 1;
  const riskScore = impact * likelihood;
  const isVetoed = riskScore >= 20;

  // Helper: Get Label based on Mode
  const getSeverityLabel = () => {
    if (finding.severity === 'OBSERVATION') return 'GÖZLEM (OBS)';
    
    if (auditFramework === 'BDDK' && finding.bddk_deficiency_type) {
      return finding.bddk_deficiency_type; // ÖK, KD, KZ
    }
    
    // Standard Labels
    if (riskScore >= 20) return 'KRİTİK (VETO)';
    if (riskScore >= 12) return 'YÜKSEK';
    if (riskScore >= 6) return 'ORTA';
    return 'DÜŞÜK';
  };

  // Helper: Get Color based on Mode
  const getRiskColorClass = () => {
    if (finding.severity === 'OBSERVATION') return SEVERITY_COLORS['OBSERVATION'];
    // Use pre-calculated severity or calculate on fly
    const currentSeverity = finding.severity || (riskScore >= 20 ? 'CRITICAL' : riskScore >= 12 ? 'HIGH' : riskScore >= 6 ? 'MEDIUM' : 'LOW');
    return SEVERITY_COLORS[currentSeverity as keyof typeof SEVERITY_COLORS] || SEVERITY_COLORS['LOW'];
  };

  // --- Handlers ---

  const handleFrameworkChange = (fw: 'STANDARD' | 'BDDK') => {
    onUpdate('audit_framework', fw);
    // Reset BDDK type if switching to standard, or handle conversions if needed
    if (fw === 'STANDARD') {
      onUpdate('bddk_deficiency_type', null);
    }
  };

  const handleBDDKSelection = (code: string) => {
    const mapping = BDDK_MAPPING[code as keyof typeof BDDK_MAPPING];
    if (mapping) {
      // Auto-set the underlying math so the "Engine" keeps working
      onUpdate('bddk_deficiency_type', code);
      onUpdate('impact', mapping.impact);
      onUpdate('likelihood', mapping.likelihood);
      onUpdate('severity', mapping.severity);
    }
  };

  const handleSetObservation = () => {
    if (finding.severity === 'OBSERVATION') {
      // Toggle OFF -> Reset to Low defaults
      onUpdate('severity', 'LOW');
      onUpdate('impact', 1);
      onUpdate('likelihood', 1);
    } else {
      // Toggle ON
      onUpdate('impact', 0);
      onUpdate('likelihood', 0);
      onUpdate('severity', 'OBSERVATION');
      onUpdate('bddk_deficiency_type', null);
    }
  };

  const handleAddTag = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && tagInput.trim()) {
      const currentTags = finding.tags || [];
      if (!currentTags.includes(tagInput.trim())) {
        onUpdate('tags', [...currentTags, tagInput.trim()]);
      }
      setTagInput('');
    }
  };

  const removeTag = (tagToRemove: string) => {
    const currentTags = finding.tags || [];
    onUpdate('tags', currentTags.filter((t: string) => t !== tagToRemove));
  };

  return (
    <div className="h-full flex flex-col bg-slate-50 border-r border-slate-200 w-full lg:max-w-xs overflow-y-auto">
      
      {/* --- 0. AUDIT FRAMEWORK TOGGLE (NEW) --- */}
      <div className="p-4 border-b border-slate-200 bg-white">
        <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2 block">
          Denetim Çerçevesi
        </label>
        <div className="flex bg-slate-100 p-1 rounded-lg">
          <button
            onClick={() => handleFrameworkChange('STANDARD')}
            className={cn(
              "flex-1 flex items-center justify-center gap-1.5 py-1.5 rounded-md text-xs font-semibold transition-all",
              auditFramework === 'STANDARD' ? "bg-white text-indigo-600 shadow-sm" : "text-slate-500 hover:text-slate-700"
            )}
          >
            <Globe size={12} /> Global
          </button>
          <button
            onClick={() => handleFrameworkChange('BDDK')}
            className={cn(
              "flex-1 flex items-center justify-center gap-1.5 py-1.5 rounded-md text-xs font-semibold transition-all",
              auditFramework === 'BDDK' ? "bg-white text-rose-700 shadow-sm" : "text-slate-500 hover:text-slate-700"
            )}
          >
            <Gavel size={12} /> BDDK
          </button>
        </div>
      </div>

      {/* --- 1. RISK ENGINE COCKPIT --- */}
      <div className="p-6 border-b border-slate-200 bg-white relative overflow-hidden group">
        
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-2">
            <Activity size={18} className="text-slate-400" />
            <h3 className="text-xs font-bold text-slate-500 uppercase tracking-widest">
              Risk Motoru
            </h3>
          </div>
          
          {/* Observation Toggle */}
          <button 
            onClick={handleSetObservation}
            className={cn(
              "text-[10px] px-2 py-1 rounded border flex items-center gap-1 transition-colors",
              finding.severity === 'OBSERVATION' 
                ? "bg-slate-800 text-white border-slate-800" 
                : "bg-white text-slate-500 border-slate-200 hover:bg-slate-50"
            )}
            title={finding.severity === 'OBSERVATION' ? "Puanlamayı Aç" : "Gözlem Olarak İşaretle"}
          >
            <Info size={10} /> {finding.severity === 'OBSERVATION' ? 'Gözlem' : 'OBS'}
          </button>
        </div>

        {/* Dynamic Gauge */}
        <div className="flex justify-center mb-8 relative">
          <div 
            className={cn(
              "w-32 h-32 rounded-full border-[6px] flex flex-col items-center justify-center transition-all duration-500",
              getRiskColorClass(),
              isVetoed && auditFramework === 'BDDK' ? "animate-pulse shadow-[0_0_20px_rgba(225,29,72,0.4)]" : "shadow-sm"
            )}
          >
            <span className="text-3xl font-black tracking-tighter transition-all text-center">
               {finding.severity === 'OBSERVATION' ? 'OBS' : (auditFramework === 'BDDK' ? getSeverityLabel() : riskScore)}
            </span>
            <span className="text-[10px] font-bold uppercase mt-1 tracking-wider opacity-80 text-center px-2">
               {finding.severity === 'OBSERVATION' ? 'Risk Yok' : (auditFramework === 'BDDK' ? 'Mevzuat Sınıfı' : getSeverityLabel(riskScore))}
            </span>
          </div>

          {/* Shockwave Effect for Veto */}
          {isVetoed && finding.severity !== 'OBSERVATION' && (
             <div className="absolute inset-0 rounded-full border-4 border-rose-500/30 animate-ping pointer-events-none" />
          )}
        </div>

        {/* --- DYNAMIC CONTROLS --- */}
        
        {/* SCENARIO A: BDDK MODE (Buttons) */}
        {auditFramework === 'BDDK' && finding.severity !== 'OBSERVATION' && (
          <div className="space-y-3 animate-in slide-in-from-right-4 duration-300">
             <div className="p-2 bg-rose-50/50 rounded border border-rose-100 text-[10px] text-rose-800 mb-2 leading-tight">
               <strong>BDDK Modu:</strong> Risk puanı, seçilen mevzuat tanımına göre otomatik atanır.
            </div>
            
            {Object.entries(BDDK_MAPPING).map(([code, def]) => (
              <button
                key={code}
                onClick={() => handleBDDKSelection(code)}
                className={cn(
                  "w-full p-2.5 rounded-lg border text-left transition-all flex items-center gap-3",
                  finding.bddk_deficiency_type === code 
                    ? "border-rose-500 bg-rose-50 shadow-sm ring-1 ring-rose-200" 
                    : "border-slate-200 bg-white hover:border-rose-200 hover:bg-rose-50/50"
                )}
              >
                <div className={cn("w-2.5 h-2.5 rounded-full shrink-0", def.color)} />
                <div className="flex flex-col">
                  <span className={cn("text-xs font-bold", finding.bddk_deficiency_type === code ? "text-rose-900" : "text-slate-700")}>
                    [{code}] {def.label.split('(')[0]}
                  </span>
                </div>
              </button>
            ))}
          </div>
        )}

        {/* SCENARIO B: STANDARD MODE (Sliders) */}
        {auditFramework === 'STANDARD' && finding.severity !== 'OBSERVATION' && (
          <div className="space-y-6 animate-in slide-in-from-left-4 duration-300">
            {/* Impact Slider */}
            <div className="space-y-2">
              <div className="flex justify-between text-xs font-medium text-slate-600">
                <span>Etki (Impact)</span>
                <span className="text-slate-900 font-bold">{impact}</span>
              </div>
              <input 
                type="range" min="1" max="5" step="1"
                value={impact}
                onChange={(e) => onUpdate('impact', parseInt(e.target.value))}
                className={cn(
                  "w-full h-2 rounded-lg appearance-none cursor-pointer transition-colors accent-indigo-600 bg-slate-200",
                )}
              />
              <div className="flex justify-between text-[10px] text-slate-400 font-medium px-1">
                <span>Önemsiz</span>
                <span>Felaket</span>
              </div>
            </div>

            {/* Likelihood Slider */}
            <div className="space-y-2">
              <div className="flex justify-between text-xs font-medium text-slate-600">
                <span>Olasılık (Likelihood)</span>
                <span className="text-slate-900 font-bold">{likelihood}</span>
              </div>
              <input 
                type="range" min="1" max="5" step="1"
                value={likelihood}
                onChange={(e) => onUpdate('likelihood', parseInt(e.target.value))}
                className="w-full h-2 rounded-lg appearance-none cursor-pointer bg-slate-200 accent-indigo-600"
              />
              <div className="flex justify-between text-[10px] text-slate-400 font-medium px-1">
                <span>Nadir</span>
                <span>Kesin</span>
              </div>
            </div>
            
             {/* Control Effectiveness */}
             <div className="space-y-2 pt-2 border-t border-slate-100">
              <div className="flex justify-between text-xs font-medium text-slate-500">
                <span className="flex items-center gap-1">Kontrol Etkinliği <HelpCircle size={10} /></span>
                <span className="text-slate-700 font-bold">{controlEffectiveness}/3</span>
              </div>
              <input 
                type="range" min="1" max="3" step="1"
                value={controlEffectiveness}
                onChange={(e) => onUpdate('control_effectiveness', parseInt(e.target.value))}
                className="w-full h-1.5 rounded-lg appearance-none cursor-pointer bg-slate-200 accent-slate-500"
              />
               <div className="flex justify-between text-[10px] text-slate-400 px-1">
                <span>Güçlü</span>
                <span>Zayıf</span>
              </div>
            </div>
          </div>
        )}

        {/* SCENARIO C: OBSERVATION MODE */}
        {finding.severity === 'OBSERVATION' && (
          <div className="p-4 bg-slate-100 rounded-lg text-center animate-in fade-in duration-300 border border-slate-200 border-dashed">
            <Info size={24} className="mx-auto text-slate-400 mb-2" />
            <h4 className="text-sm font-bold text-slate-600">Gözlem Kaydı</h4>
            <p className="text-xs text-slate-500 mt-1 leading-relaxed">
              Bu bulgu bir risk teşkil etmemekte olup, süreç iyileştirme önerisi niteliğindedir. 
              <br/>Puanlama devre dışı bırakıldı.
            </p>
          </div>
        )}
      </div>

      {/* --- 2. METADATA FORM --- */}
      <div className="p-6 space-y-6 flex-1">
        
        {/* Category */}
        <div className="space-y-1.5">
          <label className="text-xs font-semibold text-slate-500 flex items-center gap-1.5">
            <Layers size={14} /> Kategori
          </label>
          <select 
            value={finding.category || ''}
            onChange={(e) => onUpdate('category', e.target.value)}
            className="w-full text-sm p-2.5 rounded-lg border border-slate-200 bg-white focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none shadow-sm transition-all"
          >
            <option value="">Seçiniz...</option>
            {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
          </select>
        </div>

        {/* Department */}
        <div className="space-y-1.5">
          <label className="text-xs font-semibold text-slate-500 flex items-center gap-1.5">
             <Building size={14} /> İlgili Departman
          </label>
          <select 
            value={finding.department || ''}
            onChange={(e) => onUpdate('department', e.target.value)}
            className="w-full text-sm p-2.5 rounded-lg border border-slate-200 bg-white focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none shadow-sm transition-all"
          >
            <option value="">Seçiniz...</option>
            {DEPARTMENTS.map(d => <option key={d} value={d}>{d}</option>)}
          </select>
        </div>

        {/* === GIS 2024 EXPANSION: METADATA SEKMELER === */}

        {/* Risk Universe */}
        <div className="space-y-1.5 pt-4 border-t border-slate-100">
          <label className="text-xs font-semibold text-slate-500 flex items-center gap-1.5">
            <AlertTriangle size={14} /> Risk Türü
          </label>
          <select
            value={finding.risk_category || ''}
            onChange={(e) => onUpdate('risk_category', e.target.value)}
            className="w-full text-sm p-2.5 rounded-lg border border-slate-200 bg-white focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none shadow-sm transition-all"
          >
            <option value="">Seçiniz...</option>
            {RISK_TYPES.map(rt => (
              <option key={rt.id} value={rt.id}>{rt.icon} {rt.label}</option>
            ))}
          </select>
        </div>

        {/* Process Map */}
        <div className="space-y-1.5">
          <label className="text-xs font-semibold text-slate-500 flex items-center gap-1.5">
            <GitPullRequestArrow size={14} /> Süreç
          </label>
          <select
            value={finding.process_id || ''}
            onChange={(e) => onUpdate('process_id', e.target.value)}
            className="w-full text-sm p-2.5 rounded-lg border border-slate-200 bg-white focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none shadow-sm transition-all"
          >
            <option value="">Seçiniz...</option>
            {PROCESSES.map(p => (
              <option key={p.id} value={p.id}>{p.label}</option>
            ))}
          </select>
        </div>

        {/* Subprocess (Conditional) */}
        {finding.process_id && (
          <div className="space-y-1.5 pl-4 border-l-2 border-indigo-200">
            <label className="text-xs font-semibold text-slate-400">Alt Süreç</label>
            <select
              value={finding.subprocess_id || ''}
              onChange={(e) => onUpdate('subprocess_id', e.target.value)}
              className="w-full text-sm p-2 rounded-lg border border-slate-200 bg-slate-50 focus:ring-2 focus:ring-indigo-400 focus:border-indigo-400 outline-none transition-all"
            >
              <option value="">Seçiniz...</option>
              {PROCESSES.find(p => p.id === finding.process_id)?.subprocesses.map(sp => (
                <option key={sp} value={sp}>{sp}</option>
              ))}
            </select>
          </div>
        )}

        {/* Control Library */}
        <div className="space-y-1.5">
          <label className="text-xs font-semibold text-slate-500 flex items-center gap-1.5">
            <HelpCircle size={14} /> İlgili Kontrol
          </label>
          <select
            value={finding.control_id || ''}
            onChange={(e) => onUpdate('control_id', e.target.value)}
            className="w-full text-sm p-2.5 rounded-lg border border-slate-200 bg-white focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none shadow-sm transition-all"
          >
            <option value="">Seçiniz...</option>
            {CONTROLS.map(c => (
              <option key={c.id} value={c.id}>[{c.id}] {c.title}</option>
            ))}
          </select>
        </div>

        {/* Tags (Interactive) */}
        <div className="space-y-1.5 pt-4 border-t border-slate-100">
          <label className="text-xs font-semibold text-slate-500 flex items-center gap-1.5">
             <Tags size={14} /> Etiketler
          </label>
          <div className="bg-white border border-slate-200 rounded-lg p-2 shadow-sm focus-within:ring-2 focus-within:ring-indigo-500 focus-within:border-indigo-500 transition-all">
            <div className="flex flex-wrap gap-2 mb-2">
              {(finding.tags || []).map((tag: string) => (
                <span key={tag} className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-bold bg-slate-100 text-slate-600 border border-slate-200">
                  {tag}
                  <button onClick={() => removeTag(tag)} className="hover:text-rose-500">
                    <X size={10} />
                  </button>
                </span>
              ))}
            </div>
            <input
              type="text"
              value={tagInput}
              onChange={(e) => setTagInput(e.target.value)}
              onKeyDown={handleAddTag}
              placeholder="Etiket ekle + Enter"
              className="w-full text-xs outline-none bg-transparent placeholder:text-slate-300"
            />
          </div>
        </div>

      </div>

      {/* === GÖREV 2: ÇAPRAZ BAĞLANTILAR === */}
      <div className="px-6 pb-6 space-y-3">
        <div className="flex items-center justify-between">
          <label className="text-xs font-semibold text-slate-500 flex items-center gap-1.5">
            <Link size={14} /> İlişkili Kayıtlar
          </label>
          <button
            onClick={() => setIsLinkModalOpen(true)}
            className="p-1.5 rounded hover:bg-slate-100 text-indigo-600 transition-colors"
            title="Kayıt Ekle"
          >
            <Plus size={14} />
          </button>
        </div>

        {/* Related Items List */}
        {finding.related_items && finding.related_items.length > 0 ? (
          <div className="space-y-2">
            {finding.related_items.map((item: any, idx: number) => (
              <div
                key={idx}
                className="p-3 bg-slate-50 rounded-lg border border-slate-200 flex items-start justify-between gap-2 hover:bg-slate-100 transition-colors"
              >
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-[10px] font-bold uppercase px-1.5 py-0.5 rounded bg-indigo-100 text-indigo-700">
                      {item.type}
                    </span>
                  </div>
                  <h4 className="text-xs font-semibold text-slate-700 truncate">{item.title}</h4>
                  <p className="text-[10px] text-slate-500 mt-0.5">ID: {item.id}</p>
                </div>
                <button
                  onClick={() => {
                    const newItems = finding.related_items.filter((_: any, i: number) => i !== idx);
                    onUpdate('related_items', newItems);
                  }}
                  className="p-1 rounded hover:bg-rose-100 text-slate-400 hover:text-rose-600 transition-colors"
                >
                  <X size={12} />
                </button>
              </div>
            ))}
          </div>
        ) : (
          <div className="p-3 bg-slate-50 rounded-lg border border-slate-200 border-dashed text-center">
            <p className="text-xs text-slate-400">Henüz bağlantı yok</p>
          </div>
        )}
      </div>

      {/* --- 3. ACTIONS FOOTER --- */}
      <div className="p-4 border-t border-slate-200 bg-white space-y-2">
        {/* GÖREV 1: İncelemeye Gönder (QAIP Quality Gate) */}
        {finding.status === 'draft' && (
          <button
            onClick={() => setIsQAIPModalOpen(true)}
            className="w-full py-2.5 px-4 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold uppercase tracking-wide rounded-lg flex items-center justify-center gap-2 transition-all active:scale-95 shadow-md"
          >
            <Send size={16} />
            İncelemeye Gönder
          </button>
        )}

        <button
          onClick={() => console.log('Open Root Cause Tool')}
          className="w-full py-2.5 px-4 bg-slate-50 hover:bg-slate-100 text-slate-700 text-xs font-bold uppercase tracking-wide rounded-lg border border-slate-200 flex items-center justify-center gap-2 transition-colors active:scale-95"
        >
          <GitPullRequestArrow size={16} />
          Kök Neden Analizi Başlat
        </button>

        {isVetoed && finding.severity !== 'OBSERVATION' && (
          <div className="mt-3 p-2 bg-rose-50 border border-rose-100 rounded text-[10px] text-rose-600 flex items-start gap-2 leading-tight">
            <AlertTriangle size={12} className="shrink-0 mt-0.5" />
            <span>
              <strong>Dikkat:</strong> 20 puan üzeri riskler otomatik olarak Yönetim Kurulu gündemine alınır.
            </span>
          </div>
        )}
      </div>

      {/* === GÖREV 1: QAIP MODAL === */}
      <QAIPChecklistModal
        isOpen={isQAIPModalOpen}
        onClose={() => setIsQAIPModalOpen(false)}
        onSubmit={() => {
          onUpdate('status', 'review');
          if (onAdvanceWorkflow) onAdvanceWorkflow();
          const riskLevel = getRiskLevelFromSeverity(finding?.severity ?? 'MEDIUM');
          XPEngine.awardFindingXP('00000000-0000-0000-0000-000000000001', riskLevel)
            .then((result) => {
              if (result.awarded) {
                const msg = formatXPToast(result);
                toast.success(`XP Gained! ${msg}`, {
                  icon: '⚡',
                  style: {
                    background: '#0f172a',
                    color: '#4ade80',
                    border: '1px solid rgba(74,222,128,0.3)',
                    fontFamily: 'monospace',
                    fontSize: '13px',
                  },
                  duration: 3500,
                });
              }
            })
            .catch(console.warn);
        }}
        finding={finding}
      />

      {/* === GÖREV 2: LINK MODAL (Simple Inline) === */}
      {isLinkModalOpen && (
        <>
          <div
            className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-[200]"
            onClick={() => setIsLinkModalOpen(false)}
          />
          <div className="fixed inset-0 flex items-center justify-center z-[201] p-4 pointer-events-none">
            <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-md pointer-events-auto">
              <div className="p-6 border-b border-slate-200">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-sm font-bold text-slate-800">İlişkili Kayıt Ekle</h3>
                  <button onClick={() => setIsLinkModalOpen(false)} className="p-1 rounded hover:bg-slate-100">
                    <X size={16} />
                  </button>
                </div>
                <input
                  type="text"
                  value={linkSearchQuery}
                  onChange={(e) => setLinkSearchQuery(e.target.value)}
                  placeholder="Kayıt ID veya başlık ara..."
                  className="w-full p-2.5 text-sm border border-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none"
                />
              </div>
              <div className="p-4 space-y-2 max-h-64 overflow-y-auto">
                {/* Mock Suggestions */}
                {[
                  { id: 'FIND-042', type: 'Finding', title: 'Yetkilendirme Matrisi Eksikliği' },
                  { id: 'POL-018', type: 'Policy', title: 'Bilgi Güvenliği Politikası' },
                  { id: 'ACT-125', type: 'Action', title: 'Firewall Kuralları Revizyonu' }
                ].filter(item =>
                  linkSearchQuery === '' ||
                  item.title.toLowerCase().includes(linkSearchQuery.toLowerCase()) ||
                  item.id.toLowerCase().includes(linkSearchQuery.toLowerCase())
                ).map(item => (
                  <button
                    key={item.id}
                    onClick={() => {
                      const currentLinks = finding.related_items || [];
                      const newLinks = [...currentLinks, item];
                      onUpdate('related_items', newLinks);
                      setIsLinkModalOpen(false);
                      setLinkSearchQuery('');
                    }}
                    className="w-full p-3 text-left rounded-lg border border-slate-200 hover:bg-indigo-50 hover:border-indigo-200 transition-colors"
                  >
                    <div className="flex items-center gap-2">
                      <span className="text-[10px] font-bold uppercase px-1.5 py-0.5 rounded bg-slate-100 text-slate-600">
                        {item.type}
                      </span>
                      <span className="text-xs text-slate-500">{item.id}</span>
                    </div>
                    <h4 className="text-sm font-semibold text-slate-700 mt-1">{item.title}</h4>
                  </button>
                ))}
              </div>
            </div>
          </div>
        </>
      )}

    </div>
  );
};