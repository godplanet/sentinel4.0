import { useState } from 'react';
import { X, Save, Calendar, User, Percent, Tag, Target, ListChecks, BarChart3 } from 'lucide-react';
import { useStrategyStore } from '@/entities/strategy/model/store';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  type: 'goal' | 'objective';
}

export const AddStrategyItemModal = ({ isOpen, onClose, type }: Props) => {
  const { addGoal, addObjective } = useStrategyStore();
  
  // GRC & Balanced Scorecard Standardı Form State
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    period_year: new Date().getFullYear(),
    weight: 10,
    owner: '',
    category: 'Finansal', // BSC Boyutu (Financial, Customer, Process, Learning)
    riskAppetite: 'Medium',
    auditType: 'Assurance',
    kpiMetrics: '', // Örn: "%10 Artış"
    status: 'Active' // Draft, Active, OnHold
  });

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (type === 'goal') {
      addGoal({
        title: formData.title,
        description: formData.description,
        riskAppetite: formData.riskAppetite as any,
        period_year: formData.period_year,
        weight: formData.weight,
        owner: formData.owner,
        // Yeni Alanlar store'a eklenmeli (Store güncellemesi gerekebilir ama şimdilik UI'da tutuyoruz)
      });
    } else {
      addObjective({
        title: formData.title,
        type: formData.auditType as any,
      });
    }
    onClose();
    setFormData({ ...formData, title: '', description: '' });
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm transition-all">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-3xl overflow-hidden animate-in fade-in zoom-in-95 duration-200 border border-slate-200 flex flex-col max-h-[90vh]">
        
        {/* Header */}
        <div className="flex justify-between items-center p-6 border-b bg-slate-50">
          <div className="flex items-center gap-3">
            <div className={`p-3 rounded-xl ${type === 'goal' ? 'bg-indigo-100 text-indigo-600' : 'bg-emerald-100 text-emerald-600'}`}>
              {type === 'goal' ? <Target size={24} /> : <ListChecks size={24} />}
            </div>
            <div>
              <h3 className="font-bold text-xl text-slate-800">
                {type === 'goal' ? 'Kurumsal Stratejik Hedef Kartı' : 'İç Denetim Hedefi Oluştur'}
              </h3>
              <p className="text-sm text-slate-500 mt-0.5">
                {type === 'goal' 
                  ? 'Balanced Scorecard perspektifiyle yeni bir kurumsal hedef tanımlayın.' 
                  : 'Denetim evrenini yönlendirecek stratejik amaç.'}
              </p>
            </div>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-slate-200 rounded-full transition-colors text-slate-500 hover:text-slate-800"><X size={24} /></button>
        </div>
        
        {/* Scrollable Form Body */}
        <div className="p-8 overflow-y-auto flex-1 custom-scrollbar">
          <form id="strategyForm" onSubmit={handleSubmit} className="space-y-8">
            
            {/* 1. Kısım: Temel Tanımlar */}
            <div className="space-y-5">
              <h4 className="text-sm font-bold text-slate-400 uppercase tracking-wider border-b pb-2 mb-4">Genel Bilgiler</h4>
              
              <div className="grid grid-cols-1 gap-6">
                <div>
                  <label className="block text-sm font-bold text-slate-700 mb-1.5">Hedef Başlığı <span className="text-rose-500">*</span></label>
                  <input 
                    required
                    className="w-full px-4 py-3 border border-slate-300 rounded-xl focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 outline-none transition-all font-medium text-slate-800 placeholder:font-normal"
                    placeholder={type === 'goal' ? "Örn: Dijital Kanallarda %25 Gelir Artışı" : "Örn: Siber Güvenlik Olgunluk Seviyesinin Artırılması"}
                    value={formData.title}
                    onChange={e => setFormData({...formData, title: e.target.value})}
                  />
                </div>

                {type === 'goal' && (
                  <div>
                    <label className="block text-sm font-bold text-slate-700 mb-1.5">Stratejik Açıklama & Kapsam</label>
                    <textarea 
                      className="w-full px-4 py-3 border border-slate-300 rounded-xl focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 outline-none transition-all resize-none text-slate-600"
                      rows={3}
                      placeholder="Bu hedefin başarısı kuruma ne kazandıracak? Kapsam dışı öğeler neler?"
                      value={formData.description}
                      onChange={e => setFormData({...formData, description: e.target.value})}
                    />
                  </div>
                )}
              </div>
            </div>

            {/* 2. Kısım: Metrikler ve Sahiplik (Sadece Goal İçin) */}
            {type === 'goal' && (
              <div className="space-y-5">
                <h4 className="text-sm font-bold text-slate-400 uppercase tracking-wider border-b pb-2 mb-4 flex items-center gap-2">
                  <BarChart3 size={16} /> Performans & Sahiplik
                </h4>

                <div className="grid grid-cols-2 gap-6">
                  {/* Sol Kolon */}
                  <div className="space-y-5">
                    <div>
                      <label className="flex items-center gap-2 text-sm font-semibold text-slate-700 mb-1.5">
                        <Tag size={16} className="text-indigo-500" /> Stratejik Boyut (BSC)
                      </label>
                      <select 
                        className="w-full px-3 py-2.5 border rounded-xl bg-slate-50 outline-none focus:ring-2 focus:ring-indigo-500 cursor-pointer hover:bg-white transition-colors"
                        value={formData.category}
                        onChange={e => setFormData({...formData, category: e.target.value})}
                      >
                        <option value="Finansal">💰 Finansal Perspektif</option>
                        <option value="Müşteri">👥 Müşteri Perspektifi</option>
                        <option value="Süreç">⚙️ İç Süreçler</option>
                        <option value="Gelişim">🌱 Öğrenme ve Gelişim</option>
                      </select>
                    </div>

                    <div>
                      <label className="flex items-center gap-2 text-sm font-semibold text-slate-700 mb-1.5">
                        <Calendar size={16} className="text-indigo-500" /> Hedef Yılı
                      </label>
                      <div className="grid grid-cols-3 gap-2">
                        {[2026, 2027, 2028].map(year => (
                          <button
                            key={year}
                            type="button"
                            onClick={() => setFormData({...formData, period_year: year})}
                            className={`py-2 rounded-lg text-sm font-bold border transition-all ${
                              formData.period_year === year 
                                ? 'bg-indigo-600 text-white border-indigo-600 shadow-md' 
                                : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'
                            }`}
                          >
                            {year}
                          </button>
                        ))}
                      </div>
                    </div>

                    <div>
                      <label className="flex items-center gap-2 text-sm font-semibold text-slate-700 mb-1.5">
                        <User size={16} className="text-indigo-500" /> Hedef Sahibi (Executive)
                      </label>
                      <input 
                        className="w-full px-3 py-2.5 border rounded-xl outline-none focus:ring-2 focus:ring-indigo-500"
                        placeholder="Örn: Ahmet Yılmaz (GMY)"
                        value={formData.owner}
                        onChange={e => setFormData({...formData, owner: e.target.value})}
                      />
                    </div>
                  </div>

                  {/* Sağ Kolon */}
                  <div className="space-y-5">
                    <div>
                      <label className="flex items-center gap-2 text-sm font-semibold text-slate-700 mb-1.5">
                        <Percent size={16} className="text-indigo-500" /> Stratejik Ağırlık
                      </label>
                      <div className="bg-slate-50 p-4 rounded-xl border border-slate-200">
                        <div className="flex justify-between mb-2">
                          <span className="text-xs font-bold text-slate-500">Etki Oranı</span>
                          <span className="text-sm font-bold text-indigo-600">%{formData.weight}</span>
                        </div>
                        <input 
                          type="range" min="0" max="100" step="5"
                          className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-indigo-600"
                          value={formData.weight}
                          onChange={e => setFormData({...formData, weight: parseInt(e.target.value)})}
                        />
                      </div>
                    </div>

                    <div>
                      <label className="flex items-center gap-2 text-sm font-semibold text-slate-700 mb-1.5">
                        <Tag size={16} className="text-rose-500" /> Risk İştahı
                      </label>
                      <div className="grid grid-cols-3 gap-2">
                        {[
                          { val: 'Low', label: 'Düşük', color: 'bg-emerald-100 text-emerald-700 border-emerald-200' },
                          { val: 'Medium', label: 'Orta', color: 'bg-amber-100 text-amber-700 border-amber-200' },
                          { val: 'High', label: 'Yüksek', color: 'bg-rose-100 text-rose-700 border-rose-200' }
                        ].map(opt => (
                          <button
                            key={opt.val}
                            type="button"
                            onClick={() => setFormData({...formData, riskAppetite: opt.val})}
                            className={`py-2 rounded-lg text-xs font-bold border transition-all ${
                              formData.riskAppetite === opt.val 
                                ? `ring-2 ring-offset-1 ring-slate-400 ${opt.color} shadow-sm` 
                                : 'bg-white text-slate-500 border-slate-200 hover:bg-slate-50'
                            }`}
                          >
                            {opt.label}
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* 2. Kısım: Denetim Tipi (Sadece Objective İçin) */}
            {type === 'objective' && (
              <div>
                <label className="block text-sm font-bold text-slate-700 mb-1.5">Denetim Faaliyet Türü</label>
                <select 
                  className="w-full px-4 py-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none bg-white"
                  value={formData.auditType}
                  onChange={e => setFormData({...formData, auditType: e.target.value})}
                >
                  <option value="Assurance">Güvence (Assurance) - Risk ve Kontrol Odaklı</option>
                  <option value="Advisory">Danışmanlık (Advisory) - Değer Katma Odaklı</option>
                  <option value="Investigation">Soruşturma (Investigation) - İhlal Odaklı</option>
                </select>
              </div>
            )}

          </form>
        </div>

        {/* Footer Actions */}
        <div className="p-6 border-t bg-slate-50 flex justify-between items-center">
          <div className="text-xs text-slate-400 font-medium">
            * Zorunlu alanlar işaretlenmiştir.
          </div>
          <div className="flex gap-3">
            <button 
              type="button" 
              onClick={onClose} 
              className="px-6 py-2.5 text-sm font-bold text-slate-600 hover:bg-white hover:shadow-sm border border-transparent hover:border-slate-200 rounded-xl transition-all"
            >
              Vazgeç
            </button>
            <button 
              onClick={(e) => {
                const form = document.getElementById('strategyForm') as HTMLFormElement;
                if (form.checkValidity()) {
                  handleSubmit(e as any);
                } else {
                  form.reportValidity();
                }
              }}
              className="flex items-center gap-2 px-8 py-2.5 text-sm font-bold text-white bg-indigo-600 hover:bg-indigo-700 rounded-xl shadow-lg shadow-indigo-200 hover:shadow-indigo-300 hover:-translate-y-0.5 active:translate-y-0 active:shadow-none transition-all"
            >
              <Save size={18} />
              Kaydet
            </button>
          </div>
        </div>

      </div>
    </div>
  );
};