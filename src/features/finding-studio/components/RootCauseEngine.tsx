import { useState } from 'react';
import { ChevronDown, Plus, X, AlertCircle, Zap, Target } from 'lucide-react';
import clsx from 'clsx';
import type { RootCauseAnalysisData } from './ZenEditor';

interface RootCauseEngineProps {
  data: RootCauseAnalysisData;
  onChange: (data: RootCauseAnalysisData) => void;
}

export function RootCauseEngine({ data, onChange }: RootCauseEngineProps) {
  const [activeTab, setActiveTab] = useState<'five_whys' | 'fishbone' | 'bowtie'>(data.method);

  const handleMethodChange = (method: 'five_whys' | 'fishbone' | 'bowtie') => {
    setActiveTab(method);

    let newData: RootCauseAnalysisData = { ...data, method };

    if (method === 'five_whys' && !newData.five_whys) {
      newData.five_whys = ['', '', '', '', ''];
    } else if (method === 'fishbone' && !newData.fishbone) {
      newData.fishbone = {
        human: [],
        method: [],
        machine: [],
        material: [],
        environment: [],
        measurement: [],
      };
    } else if (method === 'bowtie' && !newData.bowtie) {
      newData.bowtie = {
        threats: [],
        top_event: '',
        consequences: [],
      };
    }

    onChange(newData);
  };

  return (
    <div className="space-y-4">
      <div className="flex gap-2 border-b border-slate-200">
        <button
          onClick={() => handleMethodChange('five_whys')}
          className={clsx(
            'px-4 py-2 font-medium text-sm transition-all border-b-2',
            activeTab === 'five_whys'
              ? 'border-blue-600 text-blue-600'
              : 'border-transparent text-slate-600 hover:text-slate-900'
          )}
        >
          5 Neden (5 Whys)
        </button>
        <button
          onClick={() => handleMethodChange('fishbone')}
          className={clsx(
            'px-4 py-2 font-medium text-sm transition-all border-b-2',
            activeTab === 'fishbone'
              ? 'border-blue-600 text-blue-600'
              : 'border-transparent text-slate-600 hover:text-slate-900'
          )}
        >
          Balık Kılçığı (Ishikawa)
        </button>
        <button
          onClick={() => handleMethodChange('bowtie')}
          className={clsx(
            'px-4 py-2 font-medium text-sm transition-all border-b-2',
            activeTab === 'bowtie'
              ? 'border-blue-600 text-blue-600'
              : 'border-transparent text-slate-600 hover:text-slate-900'
          )}
        >
          Papyon (Bowtie)
        </button>
      </div>

      <div className="p-4 bg-white rounded-lg border border-slate-200">
        {activeTab === 'five_whys' && <FiveWhysTab data={data} onChange={onChange} />}
        {activeTab === 'fishbone' && <FishboneTab data={data} onChange={onChange} />}
        {activeTab === 'bowtie' && <BowtieTab data={data} onChange={onChange} />}
      </div>
    </div>
  );
}

function FiveWhysTab({ data, onChange }: RootCauseEngineProps) {
  const whys = data.five_whys || ['', '', '', '', ''];

  const updateWhy = (index: number, value: string) => {
    const newWhys = [...whys];
    newWhys[index] = value;
    onChange({ ...data, five_whys: newWhys });
  };

  return (
    <div className="space-y-4">
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 text-sm text-blue-900">
        <strong>Metodoloji:</strong> Her "Neden?" sorusunun cevabı, bir sonraki "Neden?" sorusunu
        tetikler. 5. adımda kök nedene ulaşılır.
      </div>

      {whys.map((why, index) => (
        <div key={index} className="flex items-start gap-3">
          <div className="flex-shrink-0 w-8 h-8 rounded-full bg-blue-600 text-white flex items-center justify-center font-bold text-sm mt-1">
            {index + 1}
          </div>
          <div className="flex-1">
            <label className="block text-sm font-medium text-slate-700 mb-1">
              Neden #{index + 1}?
            </label>
            <textarea
              value={why}
              onChange={(e) => updateWhy(index, e.target.value)}
              placeholder={`${
                index === 0
                  ? 'İlk neden: Bulgu neden oluştu?'
                  : index === 4
                  ? 'Kök neden: En temel sebep nedir?'
                  : `${index}. seviye neden...`
              }`}
              className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
              rows={2}
            />
          </div>
          {index < 4 && (
            <ChevronDown className="flex-shrink-0 text-slate-400 mt-8" size={20} />
          )}
        </div>
      ))}

      {whys[4] && (
        <div className="bg-emerald-50 border border-emerald-200 rounded-lg p-4">
          <div className="flex items-center gap-2 text-emerald-900 font-semibold mb-2">
            <Target size={20} />
            Tespit Edilen Kök Neden
          </div>
          <p className="text-sm text-emerald-800">{whys[4]}</p>
        </div>
      )}
    </div>
  );
}

function FishboneTab({ data, onChange }: RootCauseEngineProps) {
  const fishbone = data.fishbone || {
    human: [],
    method: [],
    machine: [],
    material: [],
    environment: [],
    measurement: [],
  };

  const categories = [
    { key: 'human', label: 'İnsan (Human)', icon: '👤', color: 'blue' },
    { key: 'method', label: 'Yöntem (Method)', icon: '📋', color: 'amber' },
    { key: 'machine', label: 'Makine/Sistem (Machine)', icon: '⚙️', color: 'red' },
    { key: 'material', label: 'Malzeme (Material)', icon: '📦', color: 'green' },
    { key: 'environment', label: 'Çevre (Environment)', icon: '🌍', color: 'teal' },
    { key: 'measurement', label: 'Ölçüm (Measurement)', icon: '📊', color: 'purple' },
  ];

  const addItem = (category: string) => {
    const newFishbone = { ...fishbone };
    newFishbone[category as keyof typeof fishbone].push('');
    onChange({ ...data, fishbone: newFishbone });
  };

  const updateItem = (category: string, index: number, value: string) => {
    const newFishbone = { ...fishbone };
    newFishbone[category as keyof typeof fishbone][index] = value;
    onChange({ ...data, fishbone: newFishbone });
  };

  const removeItem = (category: string, index: number) => {
    const newFishbone = { ...fishbone };
    newFishbone[category as keyof typeof fishbone].splice(index, 1);
    onChange({ ...data, fishbone: newFishbone });
  };

  const colorClasses = {
    blue: 'bg-blue-50 border-blue-200',
    amber: 'bg-amber-50 border-amber-200',
    red: 'bg-red-50 border-red-200',
    green: 'bg-green-50 border-green-200',
    teal: 'bg-teal-50 border-teal-200',
    purple: 'bg-purple-50 border-purple-200',
  };

  return (
    <div className="space-y-4">
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 text-sm text-blue-900">
        <strong>Metodoloji:</strong> 6M kategorilerinde olası nedenleri listeleyin. Her kategori
        bulguya katkıda bulunan faktörleri içerir.
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {categories.map((cat) => (
          <div
            key={cat.key}
            className={clsx(
              'border-2 rounded-lg p-4',
              colorClasses[cat.color as keyof typeof colorClasses]
            )}
          >
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <span className="text-2xl">{cat.icon}</span>
                <h4 className="font-semibold text-slate-900">{cat.label}</h4>
              </div>
              <button
                onClick={() => addItem(cat.key)}
                className="p-1 hover:bg-white rounded transition-colors"
              >
                <Plus size={16} className="text-slate-600" />
              </button>
            </div>

            <div className="space-y-2">
              {fishbone[cat.key as keyof typeof fishbone].map((item, index) => (
                <div key={index} className="flex items-center gap-2">
                  <input
                    type="text"
                    value={item}
                    onChange={(e) => updateItem(cat.key, index, e.target.value)}
                    placeholder="Neden ekleyin..."
                    className="flex-1 px-2 py-1.5 text-sm border border-slate-300 rounded bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                  <button
                    onClick={() => removeItem(cat.key, index)}
                    className="p-1 hover:bg-white rounded transition-colors"
                  >
                    <X size={14} className="text-slate-500" />
                  </button>
                </div>
              ))}

              {fishbone[cat.key as keyof typeof fishbone].length === 0 && (
                <p className="text-xs text-slate-500 italic">Henüz neden eklenmedi</p>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function BowtieTab({ data, onChange }: RootCauseEngineProps) {
  const bowtie = data.bowtie || {
    threats: [],
    top_event: '',
    consequences: [],
  };

  const addThreat = () => {
    const newBowtie = { ...bowtie, threats: [...bowtie.threats, ''] };
    onChange({ ...data, bowtie: newBowtie });
  };

  const updateThreat = (index: number, value: string) => {
    const newThreats = [...bowtie.threats];
    newThreats[index] = value;
    onChange({ ...data, bowtie: { ...bowtie, threats: newThreats } });
  };

  const removeThreat = (index: number) => {
    const newThreats = bowtie.threats.filter((_, i) => i !== index);
    onChange({ ...data, bowtie: { ...bowtie, threats: newThreats } });
  };

  const addConsequence = () => {
    const newBowtie = { ...bowtie, consequences: [...bowtie.consequences, ''] };
    onChange({ ...data, bowtie: newBowtie });
  };

  const updateConsequence = (index: number, value: string) => {
    const newConsequences = [...bowtie.consequences];
    newConsequences[index] = value;
    onChange({ ...data, bowtie: { ...bowtie, consequences: newConsequences } });
  };

  const removeConsequence = (index: number) => {
    const newConsequences = bowtie.consequences.filter((_, i) => i !== index);
    onChange({ ...data, bowtie: { ...bowtie, consequences: newConsequences } });
  };

  const updateTopEvent = (value: string) => {
    onChange({ ...data, bowtie: { ...bowtie, top_event: value } });
  };

  return (
    <div className="space-y-4">
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 text-sm text-blue-900">
        <strong>Metodoloji:</strong> Tehditler (sol) → Tepe Olay (merkez) → Sonuçlar (sağ). Risk
        yönetimi ve kontrol noktalarını görselleştirir.
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-red-50 border-2 border-red-200 rounded-lg p-4">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <AlertCircle size={20} className="text-red-600" />
              <h4 className="font-semibold text-slate-900">Tehditler</h4>
            </div>
            <button
              onClick={addThreat}
              className="p-1 hover:bg-white rounded transition-colors"
            >
              <Plus size={16} className="text-slate-600" />
            </button>
          </div>

          <div className="space-y-2">
            {bowtie.threats.map((threat, index) => (
              <div key={index} className="flex items-center gap-2">
                <input
                  type="text"
                  value={threat}
                  onChange={(e) => updateThreat(index, e.target.value)}
                  placeholder="Tehdit ekleyin..."
                  className="flex-1 px-2 py-1.5 text-sm border border-slate-300 rounded bg-white focus:outline-none focus:ring-2 focus:ring-red-500"
                />
                <button
                  onClick={() => removeThreat(index)}
                  className="p-1 hover:bg-white rounded transition-colors"
                >
                  <X size={14} className="text-slate-500" />
                </button>
              </div>
            ))}
            {bowtie.threats.length === 0 && (
              <p className="text-xs text-slate-500 italic">Henüz tehdit eklenmedi</p>
            )}
          </div>
        </div>

        <div className="bg-amber-50 border-2 border-amber-300 rounded-lg p-4">
          <div className="flex items-center gap-2 mb-3">
            <Zap size={20} className="text-amber-600" />
            <h4 className="font-semibold text-slate-900">Tepe Olay</h4>
          </div>
          <textarea
            value={bowtie.top_event}
            onChange={(e) => updateTopEvent(e.target.value)}
            placeholder="Ana bulgunuzu buraya yazın (merkez olay)..."
            className="w-full px-3 py-2 text-sm border border-slate-300 rounded bg-white focus:outline-none focus:ring-2 focus:ring-amber-500 resize-none"
            rows={6}
          />
        </div>

        <div className="bg-orange-50 border-2 border-orange-200 rounded-lg p-4">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <Target size={20} className="text-orange-600" />
              <h4 className="font-semibold text-slate-900">Sonuçlar</h4>
            </div>
            <button
              onClick={addConsequence}
              className="p-1 hover:bg-white rounded transition-colors"
            >
              <Plus size={16} className="text-slate-600" />
            </button>
          </div>

          <div className="space-y-2">
            {bowtie.consequences.map((consequence, index) => (
              <div key={index} className="flex items-center gap-2">
                <input
                  type="text"
                  value={consequence}
                  onChange={(e) => updateConsequence(index, e.target.value)}
                  placeholder="Sonuç ekleyin..."
                  className="flex-1 px-2 py-1.5 text-sm border border-slate-300 rounded bg-white focus:outline-none focus:ring-2 focus:ring-orange-500"
                />
                <button
                  onClick={() => removeConsequence(index)}
                  className="p-1 hover:bg-white rounded transition-colors"
                >
                  <X size={14} className="text-slate-500" />
                </button>
              </div>
            ))}
            {bowtie.consequences.length === 0 && (
              <p className="text-xs text-slate-500 italic">Henüz sonuç eklenmedi</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
