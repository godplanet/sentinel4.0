import React, { useState } from 'react';
import { useFindingTaxonomy } from '@/entities/finding/api';
import { cn } from '@/shared/utils/cn';
import { X, Plus, Link, Tags, HelpCircle, GitPullRequestArrow, AlertTriangle, Building, Layers, Activity, Info, Globe, Gavel, FileText, Search, Scale, Zap, Target, BookOpen } from 'lucide-react';
import { RichTextEditor } from '@/shared/ui/RichTextEditor';

interface DraftPhaseProps {
  finding: any;
  onUpdate: (field: string, value: any) => void;
}

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
  'OBSERVATION': 'text-slate-600 bg-slate-100 border-slate-200 ring-slate-100'
};

const EDITOR_TABS = [
  { id: 'criteria', label: '1. KRİTER', icon: Scale, placeholder: 'Standardı veya mevzuatı giriniz...' },
  { id: 'condition', label: '2. TESPİT', icon: Search, placeholder: 'Mevcut durumu detaylandırın...' },
  { id: 'cause', label: '3. KÖK NEDEN', icon: GitPullRequestArrow, placeholder: 'Bu durum neden oluştu?' },
  { id: 'consequence', label: '4. ETKİ', icon: Zap, placeholder: 'Risk ve etkileri nelerdir?' },
  { id: 'corrective_action', label: '5. ÖNERİ', icon: Target, placeholder: 'Çözüm önerisi nedir?' },
];

export const DraftPhase: React.FC<DraftPhaseProps> = ({ finding, onUpdate }) => {
  const { data: taxonomy, isLoading: isTaxonomyLoading } = useFindingTaxonomy();
  const [tagInput, setTagInput] = useState('');
  const [isLinkModalOpen, setIsLinkModalOpen] = useState(false);
  const [linkSearchQuery, setLinkSearchQuery] = useState('');
  const [activeTab, setActiveTab] = useState('criteria');

  const CATEGORIES = taxonomy?.categories || [];
  const DEPARTMENTS = taxonomy?.departments || [];
  const RISK_TYPES = taxonomy?.riskTypes || [];
  const PROCESSES = taxonomy?.processes || [];
  const CONTROLS = taxonomy?.controls || [];

  const auditFramework = finding.audit_framework || 'STANDARD';
  const impact = finding.impact || 1;
  const likelihood = finding.likelihood || 1;
  const controlEffectiveness = finding.control_effectiveness || 1;
  const riskScore = impact * likelihood;
  const isVetoed = riskScore >= 20;

  const getSeverityLabel = () => {
    if (finding.severity === 'OBSERVATION') return 'GÖZLEM (OBS)';
    if (auditFramework === 'BDDK' && finding.bddk_deficiency_type) return finding.bddk_deficiency_type;
    if (riskScore >= 20) return 'KRİTİK (VETO)';
    if (riskScore >= 12) return 'YÜKSEK';
    if (riskScore >= 6) return 'ORTA';
    return 'DÜŞÜK';
  };

  const getRiskColorClass = () => {
    if (finding.severity === 'OBSERVATION') return SEVERITY_COLORS['OBSERVATION'];
    const currentSeverity = finding.severity || (riskScore >= 20 ? 'CRITICAL' : riskScore >= 12 ? 'HIGH' : riskScore >= 6 ? 'MEDIUM' : 'LOW');
    return SEVERITY_COLORS[currentSeverity as keyof typeof SEVERITY_COLORS] || SEVERITY_COLORS['LOW'];
  };

  const handleFrameworkChange = (fw: 'STANDARD' | 'BDDK') => {
    onUpdate('audit_framework', fw);
    if (fw === 'STANDARD') onUpdate('bddk_deficiency_type', null);
  };

  const handleBDDKSelection = (code: string) => {
    const mapping = BDDK_MAPPING[code as keyof typeof BDDK_MAPPING];
    if (mapping) {
      onUpdate('bddk_deficiency_type', code);
      onUpdate('impact', mapping.impact);
      onUpdate('likelihood', mapping.likelihood);
      onUpdate('severity', mapping.severity);
    }
  };

  const handleSetObservation = () => {
    if (finding.severity === 'OBSERVATION') {
      onUpdate('severity', 'LOW');
      onUpdate('impact', 1);
      onUpdate('likelihood', 1);
    } else {
      onUpdate('impact', 0);
      onUpdate('likelihood', 0);
      onUpdate('severity', 'OBSERVATION');
      onUpdate('bddk_deficiency_type', null);
    }
  };

  const handleAddTag = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && tagInput.trim()) {
      const currentTags = finding.tags || [];
      if (!currentTags.includes(tagInput.trim())) onUpdate('tags', [...currentTags, tagInput.trim()]);
      setTagInput('');
    }
  };

  const removeTag = (tagToRemove: string) => {
    const currentTags = finding.tags || [];
    onUpdate('tags', (currentTags || []).filter((t: string) => t !== tagToRemove));
  };

  const handleAddLibraryCriteria = () => {
    if (activeTab === 'criteria') {
      const existing = finding.criteria || '';
      onUpdate('criteria', existing + '<p><strong>[KÜTÜPHANE STANDARDI]:</strong> ISO 27001 Madde 9.2 (İç Tetkik)</p>');
    }
  };

  if (isTaxonomyLoading) return <div className="p-4 flex items-center justify-center"><span className="text-sm font-medium text-slate-500 animate-pulse">Taksonomi yükleniyor...</span></div>;

  return (
    <div className="space-y-5 pb-12">
      
      {/* 1. Başlık */}
      <div className="space-y-2">
        <label className="text-xs font-bold text-slate-500 uppercase tracking-widest block">Bulgu Başlığı</label>
        <input
          type="text"
          value={finding.title || ''}
          onChange={(e) => onUpdate('title', e.target.value)}
          placeholder="Bulgunun kısa ve özeti..."
          className="w-full text-xl font-bold bg-white/70 backdrop-blur border border-slate-200 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all shadow-sm text-slate-800"
        />
      </div>

      {/* 2. Zengin Metin Editorü (Feature Parity) */}
      <div className="bg-white/70 backdrop-blur-lg border border-slate-200 shadow-sm rounded-xl overflow-hidden flex flex-col">
        {/* Editor Tabs */}
        <div className="flex bg-slate-50 border-b border-slate-200 overflow-x-auto no-scrollbar">
          {EDITOR_TABS.map(tab => {
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={cn(
                  "flex-1 flex items-center justify-center gap-2 py-3 px-4 text-xs font-bold transition-all border-b-2 whitespace-nowrap",
                  isActive ? "border-indigo-600 text-indigo-700 bg-white" : "border-transparent text-slate-500 hover:text-slate-700 hover:bg-slate-100"
                )}
              >
                <tab.icon size={14} className={isActive ? "text-indigo-600" : "text-slate-400"} />
                {tab.label}
              </button>
            );
          })}
        </div>
        
        {/* Kütüphane Action Area */}
        {activeTab === 'criteria' && (
          <div className="bg-amber-50/50 p-2 border-b border-amber-100 flex justify-end">
            <button 
              onClick={handleAddLibraryCriteria}
              className="flex items-center gap-2 px-3 py-1.5 text-xs font-bold text-amber-700 bg-amber-100/50 hover:bg-amber-200/50 rounded-md transition-all border border-amber-200"
            >
              <BookOpen size={14} /> Kütüphaneden Kriter Ekle
            </button>
          </div>
        )}

        {/* Editor Instance */}
        <div className="p-0 min-h-[300px]">
          <RichTextEditor
            value={finding[activeTab] || ''}
            onChange={(val) => onUpdate(activeTab, val)}
            placeholder={EDITOR_TABS.find(t => t.id === activeTab)?.placeholder}
          />
        </div>
      </div>

      {/* 3. Risk Motoru */}
      <div className="p-4 bg-white/70 backdrop-blur-lg border border-slate-200 shadow-[0_4px_20px_rgba(0,0,0,0.03)] rounded-xl relative overflow-hidden group">
        <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-4 block border-b border-slate-100 pb-2">Denetim Çerçevesi & Puanlama</label>
        
        <div className="flex bg-slate-100 p-1 mb-4 rounded-lg max-w-xs">
          <button
            onClick={() => handleFrameworkChange('STANDARD')}
            className={cn("flex-1 flex items-center justify-center gap-1.5 py-1.5 rounded-md text-[10px] font-bold transition-all uppercase tracking-wider", auditFramework === 'STANDARD' ? "bg-white text-indigo-600 shadow-sm" : "text-slate-500 hover:text-slate-700")}
          >
            <Globe size={12} /> Global
          </button>
          <button
            onClick={() => handleFrameworkChange('BDDK')}
            className={cn("flex-1 flex items-center justify-center gap-1.5 py-1.5 rounded-md text-[10px] font-bold transition-all uppercase tracking-wider", auditFramework === 'BDDK' ? "bg-white text-rose-700 shadow-sm" : "text-slate-500 hover:text-slate-700")}
          >
            <Gavel size={12} /> BDDK
          </button>
        </div>

        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <Activity size={18} className="text-slate-400" />
            <h3 className="text-sm font-bold text-slate-700 uppercase tracking-wide">Risk Motoru</h3>
          </div>
          <button 
            onClick={handleSetObservation}
            className={cn("text-[10px] px-2 py-1.5 rounded border flex items-center gap-1 transition-colors font-bold uppercase", finding.severity === 'OBSERVATION' ? "bg-slate-800 text-white border-slate-800" : "bg-white text-slate-500 border-slate-200 hover:bg-slate-50")}
          >
            <Info size={12} /> {finding.severity === 'OBSERVATION' ? 'Gözlem' : 'OBS'}
          </button>
        </div>

        <div className="flex flex-col md:flex-row gap-5 items-center">
          <div className="flex justify-center relative shrink-0">
            <div className={cn("w-32 h-32 rounded-full border-[6px] flex flex-col items-center justify-center transition-all duration-500 shadow-[0_0_15px_rgba(0,0,0,0.05)]", getRiskColorClass(), isVetoed && auditFramework === 'BDDK' && "animate-pulse")}>
              <span className="text-3xl font-black tracking-tighter text-center">{finding.severity === 'OBSERVATION' ? 'OBS' : (auditFramework === 'BDDK' ? getSeverityLabel() : riskScore)}</span>
              <span className="text-[10px] font-bold uppercase mt-1 tracking-wider opacity-80 text-center px-2">{finding.severity === 'OBSERVATION' ? 'Risk Yok' : (auditFramework === 'BDDK' ? 'Mevzuat Sınıfı' : getSeverityLabel())}</span>
            </div>
          </div>

          <div className="flex-1 w-full relative">
            {auditFramework === 'BDDK' && finding.severity !== 'OBSERVATION' && (
              <div className="space-y-3">
                {Object.entries(BDDK_MAPPING).map(([code, def]) => (
                  <button
                    key={code}
                    onClick={() => handleBDDKSelection(code)}
                    className={cn("w-full p-2.5 rounded-xl border text-left transition-all flex items-center gap-3", finding.bddk_deficiency_type === code ? "border-rose-500 bg-rose-50 shadow-sm ring-2 ring-rose-200" : "border-slate-200 bg-white hover:border-rose-200 hover:bg-rose-50/50")}
                  >
                    <div className={cn("w-2.5 h-2.5 rounded-full shrink-0", def.color)} />
                    <span className={cn("text-xs font-bold", finding.bddk_deficiency_type === code ? "text-rose-900" : "text-slate-700")}>[{code}] {def.label.split('(')[0]}</span>
                  </button>
                ))}
              </div>
            )}

            {auditFramework === 'STANDARD' && finding.severity !== 'OBSERVATION' && (
              <div className="space-y-4">
                <div className="space-y-2">
                  <div className="flex justify-between text-xs font-bold text-slate-600"><span>Etki (Impact)</span><span className="text-indigo-600 text-sm">{impact}/5</span></div>
                  <input type="range" min="1" max="5" value={impact} onChange={(e) => onUpdate('impact', parseInt(e.target.value))} className="w-full h-2 rounded-lg appearance-none cursor-pointer bg-slate-200 accent-indigo-600" />
                </div>
                <div className="space-y-2">
                  <div className="flex justify-between text-xs font-bold text-slate-600"><span>Olasılık (Likelihood)</span><span className="text-indigo-600 text-sm">{likelihood}/5</span></div>
                  <input type="range" min="1" max="5" value={likelihood} onChange={(e) => onUpdate('likelihood', parseInt(e.target.value))} className="w-full h-2 rounded-lg appearance-none cursor-pointer bg-slate-200 accent-indigo-600" />
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* 4. Metadata Form */}
      <div className="p-4 bg-white/70 backdrop-blur-lg border border-slate-200 shadow-[0_4px_20px_rgba(0,0,0,0.03)] rounded-xl">
        <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-4 block border-b border-slate-100 pb-2">Taksonomi ve Etiketler</label>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-1.5"><label className="text-[10px] font-bold uppercase text-slate-500 flex items-center gap-1.5"><Layers size={14} /> Kategori</label><select value={finding.category || ''} onChange={(e) => onUpdate('category', e.target.value)} className="w-full text-sm p-2.5 rounded-lg border border-slate-200 bg-white"><option value="">Seçiniz...</option>{CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}</select></div>
          <div className="space-y-1.5"><label className="text-[10px] font-bold uppercase text-slate-500 flex items-center gap-1.5"><AlertTriangle size={14} /> Risk Türü</label><select value={finding.risk_category || ''} onChange={(e) => onUpdate('risk_category', e.target.value)} className="w-full text-sm p-2.5 rounded-lg border border-slate-200 bg-white"><option value="">Seçiniz...</option>{RISK_TYPES.map(rt => <option key={rt.id} value={rt.id}>{rt.label}</option>)}</select></div>
          <div className="space-y-1.5 md:col-span-2 pt-2 border-t border-slate-100 mt-2">
            <label className="text-[10px] font-bold uppercase text-slate-500 flex items-center gap-1.5"><Tags size={14} /> Etiketler</label>
            <div className="bg-white border border-slate-200 rounded-lg p-3 shadow-sm min-h-[50px]">
              <div className="flex flex-wrap gap-2 mb-2">
                {(finding.tags || []).map((tag: string) => (
                  <span key={tag} className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md text-[10px] font-bold bg-indigo-50 text-indigo-700 border border-indigo-100">{tag}<button onClick={() => removeTag(tag)} className="hover:text-rose-500 ml-1"><X size={12} /></button></span>
                ))}
              </div>
              <input type="text" value={tagInput} onChange={e => setTagInput(e.target.value)} onKeyDown={handleAddTag} placeholder="Yeni Etiket yazın ve Enter'a basın..." className="w-full text-xs font-medium outline-none bg-transparent placeholder:text-slate-400" />
            </div>
          </div>
        </div>
      </div>

      {/* 5. GÖREV 2: ÇAPRAZ BAĞLANTILAR */}
      <div className="p-4 bg-white/70 backdrop-blur-lg border border-slate-200 shadow-[0_4px_20px_rgba(0,0,0,0.03)] rounded-xl space-y-3">
        <div className="flex items-center justify-between border-b border-slate-100 pb-2">
          <label className="text-[10px] font-bold uppercase text-slate-400 flex items-center gap-1.5"><Link size={14} /> İlişkili Kayıtlar</label>
          <button onClick={() => setIsLinkModalOpen(true)} className="p-1.5 rounded-md hover:bg-slate-100 text-indigo-600 transition-colors bg-white border border-slate-200 shadow-sm"><Plus size={14} /></button>
        </div>
        {finding.related_items && finding.related_items.length > 0 ? (
          <div className="space-y-2">
            {(finding.related_items || []).map((item: any, idx: number) => (
              <div key={idx} className="p-3 bg-slate-50 rounded-lg border border-slate-200 flex items-start justify-between gap-2 hover:bg-slate-100 transition-colors shadow-sm">
                <div className="flex-1 min-w-0"><h4 className="text-xs font-bold text-slate-700 truncate">{item.title || 'İsimsiz Bağlantı'}</h4></div>
                <button onClick={() => onUpdate('related_items', (finding.related_items || []).filter((_: any, i: number) => i !== idx))} className="text-slate-400 hover:text-rose-600"><X size={14} /></button>
              </div>
            ))}
          </div>
        ) : (
          <div className="p-4 bg-slate-50 rounded-lg border border-slate-200 border-dashed text-center"><p className="text-xs font-medium text-slate-400">Henüz bağlantı eklenmemiş</p></div>
        )}
      </div>

      {isLinkModalOpen && (
        <div className="fixed inset-0 z-[201] flex items-center justify-center bg-slate-900/40 backdrop-blur-sm p-4">
          <div className="bg-white rounded-2xl shadow-xl border border-slate-200 w-full max-w-md">
            <div className="p-4 border-b border-slate-200 flex justify-between bg-slate-50 rounded-t-2xl">
              <h3 className="text-sm font-bold text-slate-800 flex items-center gap-2"><Link size={16} className="text-indigo-600"/> İlişkili Kayıt Ekle</h3>
              <button onClick={() => setIsLinkModalOpen(false)} className="p-1 rounded bg-white border border-slate-200 shadow-sm hover:bg-slate-50"><X size={16} /></button>
            </div>
            <div className="p-4">
               <input type="text" value={linkSearchQuery} onChange={(e) => setLinkSearchQuery(e.target.value)} placeholder="Bağlantı ara..." className="w-full p-3 text-sm font-medium border border-slate-200 rounded-xl bg-slate-50" disabled />
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
