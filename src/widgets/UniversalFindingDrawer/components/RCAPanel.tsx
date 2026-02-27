import { useState } from 'react';
import { 
  GitBranch, Target, Cpu, Users, Settings, Activity, 
  FileText, Share, ListOrdered, ShieldAlert, Info, 
  AlertTriangle, Check
} from 'lucide-react';
import clsx from 'clsx';

interface RCAPanelProps {
  findingId: string | null;
  // Analiz sonucunu ana forma (Finding) aktarmak için
  onApplyAnalysis?: (htmlSummary: string, rawData: any) => void; 
}

type RcaMethod = '5whys' | 'ishikawa' | 'bowtie';

export function RCAPanel({ findingId, onApplyAnalysis }: RCAPanelProps) {
  const [activeMethod, setActiveMethod] = useState<RcaMethod>('5whys');

  // --- 1. METOT: 5-WHYS STATE ---
  const [whys, setWhys] = useState<string[]>(['', '', '', '', '']);
  const whyPlaceholders = [
      "Sorun tam olarak neydi ve neden meydana geldi?",
      "Bir önceki adımda belirttiğiniz durum neden oluştu?",
      "Bu eksikliğin veya hatanın altında yatan sebep neydi?",
      "Sürecin bu noktada tıkanmasına / bozulmasına ne yol açtı?",
      "Sistemsel, kültürel veya yönetimsel asıl (kök) neden nedir?"
  ];

  // --- 2. METOT: ISHIKAWA STATE ---
  const [ishikawa, setIshikawa] = useState({
    man: '', machine: '', material: '', method: '', measurement: '', environment: ''
  });

  // --- 3. METOT: BOW-TIE STATE ---
  const [bowtie, setBowtie] = useState({
    preventive: '', event: '', corrective: '', consequences: ''
  });

  const updateWhy = (index: number, value: string) => {
      const newWhys = [...whys];
      newWhys[index] = value;
      setWhys(newWhys);
  };

  // --- HTML ÇIKTI ÜRETİCİSİ (ANA FORMA GİDECEK VERİ) ---
  const generateHtmlPreview = () => {
    if (activeMethod === '5whys') {
      const filledWhys = whys.filter(w => w?.trim() !== '');
      if (filledWhys.length === 0) return '<p class="text-slate-400 italic">Analiz verisi girilmedi...</p>';
      
      return `
        <div class="rca-summary">
          <p><strong>🔍 Gelişmiş Analiz: 5-Neden (5-Whys)</strong></p>
          <ol>
            ${filledWhys.map((w, i) => `<li><strong>${i + 1}. Neden:</strong> ${w}</li>`).join('')}
          </ol>
        </div>
      `;
    } 
    else if (activeMethod === 'ishikawa') {
      const isAnyFieldFilled = Object.values(ishikawa).some(val => val?.trim() !== '');
      if (!isAnyFieldFilled) return '<p class="text-slate-400 italic">Analiz verisi girilmedi...</p>';

      return `
        <div class="rca-summary">
          <p><strong>🐟 Gelişmiş Analiz: Balık Kılçığı (Ishikawa 6M)</strong></p>
          <ul>
              ${ishikawa.man ? `<li><strong>🧑‍🤝‍🧑 İnsan (Man):</strong> ${ishikawa.man}</li>` : ''}
              ${ishikawa.machine ? `<li><strong>💻 Makine (Machine):</strong> ${ishikawa.machine}</li>` : ''}
              ${ishikawa.method ? `<li><strong>⚙️ Metot (Method):</strong> ${ishikawa.method}</li>` : ''}
              ${ishikawa.material ? `<li><strong>📦 Malzeme (Material):</strong> ${ishikawa.material}</li>` : ''}
              ${ishikawa.measurement ? `<li><strong>📏 Ölçüm (Measurement):</strong> ${ishikawa.measurement}</li>` : ''}
              ${ishikawa.environment ? `<li><strong>🌍 Ortam (Environment):</strong> ${ishikawa.environment}</li>` : ''}
          </ul>
        </div>
      `;
    }
    else if (activeMethod === 'bowtie') {
      if (!bowtie.preventive && !bowtie.event && !bowtie.corrective && !bowtie.consequences) {
          return '<p class="text-slate-400 italic">Analiz verisi girilmedi...</p>';
      }

      return `
        <div class="rca-summary">
          <p><strong>🎀 Gelişmiş Analiz: Papyon (Bow-Tie) Risk Modeli</strong></p>
          <ul>
              ${bowtie.preventive ? `<li><strong>🛡️ Önleyici Kontroller:</strong> ${bowtie.preventive}</li>` : ''}
              ${bowtie.event ? `<li><strong>💥 Gerçekleşen Olay (Risk):</strong> ${bowtie.event}</li>` : ''}
              ${bowtie.corrective ? `<li><strong>🩹 Düzeltici Kontroller:</strong> ${bowtie.corrective}</li>` : ''}
              ${bowtie.consequences ? `<li><strong>📉 Nihai Sonuç ve Etki:</strong> ${bowtie.consequences}</li>` : ''}
          </ul>
        </div>
      `;
    }
    return '';
  };

  const handleApply = () => {
      const html = generateHtmlPreview();
      const rawData = {
        method: activeMethod,
        data: activeMethod === '5whys' ? whys : activeMethod === 'ishikawa' ? ishikawa : bowtie
      };
      
      if (onApplyAnalysis) {
        onApplyAnalysis(html, rawData);
      }
  };

  return (
    <div className="h-full flex flex-col space-y-6 animate-in fade-in duration-300">
      
      {/* BAŞLIK VE AÇIKLAMA */}
      <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-4 flex items-start gap-3 shrink-0">
        <Target className="text-emerald-600 w-6 h-6 shrink-0 mt-0.5" />
        <div>
          <h3 className="font-bold text-emerald-900 mb-1">Kök Neden Laboratuvarı</h3>
          <p className="text-xs text-emerald-800 leading-relaxed font-medium">
            Yüzeysel semptomların ötesine geçin. Bilimsel metodolojiler (5-Neden, Ishikawa, Bow-Tie) kullanarak sorunun asıl kaynağını tespit edin.
          </p>
        </div>
      </div>

      {/* METOT SEKMELERİ */}
      <div className="flex bg-slate-100 p-1 rounded-lg shrink-0">
        <button 
          onClick={() => setActiveMethod('5whys')} 
          className={clsx("flex-1 py-2 text-xs font-bold rounded-md transition-all flex items-center justify-center gap-1.5", activeMethod === '5whys' ? "bg-white text-blue-700 shadow-sm" : "text-slate-500 hover:text-slate-700")}
        >
          <ListOrdered className="w-4 h-4" /> 5-Whys
        </button>
        <button 
          onClick={() => setActiveMethod('ishikawa')} 
          className={clsx("flex-1 py-2 text-xs font-bold rounded-md transition-all flex items-center justify-center gap-1.5", activeMethod === 'ishikawa' ? "bg-white text-indigo-700 shadow-sm" : "text-slate-500 hover:text-slate-700")}
        >
          <GitBranch className="w-4 h-4" /> 6M Kılçık
        </button>
        <button 
          onClick={() => setActiveMethod('bowtie')} 
          className={clsx("flex-1 py-2 text-xs font-bold rounded-md transition-all flex items-center justify-center gap-1.5", activeMethod === 'bowtie' ? "bg-white text-rose-700 shadow-sm" : "text-slate-500 hover:text-slate-700")}
        >
          <ShieldAlert className="w-4 h-4" /> Papyon
        </button>
      </div>

      {/* İÇERİK ALANI */}
      <div className="flex-1 overflow-y-auto custom-scrollbar pb-20 pr-2">
        <div className="space-y-6">
            
            {/* 1. METOT: 5-WHYS */}
            {activeMethod === '5whys' && (
              <div className="space-y-4 animate-in slide-in-from-right-4 duration-300">
                <div className="bg-blue-50 p-4 rounded-xl border border-blue-100 flex gap-3">
                  <Info className="w-5 h-5 text-blue-600 shrink-0 mt-0.5" />
                  <div>
                      <h4 className="text-xs font-black text-blue-900 mb-1 uppercase">Müfettiş İpucu</h4>
                      <p className="text-xs text-blue-800 leading-relaxed">Belirtiden başlayıp 5 kez "Neden?" diye sorun. İnsan hatasında durmayın; süreç neden o hataya izin verdi?</p>
                  </div>
                </div>
                
                {whys.map((why, idx) => (
                  <div key={idx} className="relative group">
                    <div className="absolute left-3 top-1/2 -translate-y-1/2 w-6 h-6 bg-white text-blue-600 rounded-full flex items-center justify-center text-xs font-black border-2 border-blue-100 z-10 group-focus-within:border-blue-500 group-focus-within:text-blue-700 transition-colors">
                      {idx + 1}
                    </div>
                    <input type="text" value={why} onChange={(e) => updateWhy(idx, e.target.value)} 
                      className="w-full pl-12 pr-4 py-3 bg-white border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent shadow-sm text-sm font-medium text-slate-700 transition-all placeholder:text-slate-300" 
                      placeholder={whyPlaceholders[idx]} 
                    />
                    {idx < 4 && <div className="absolute left-6 top-10 w-0.5 h-6 bg-slate-200 z-0 group-focus-within:bg-blue-200"></div>}
                  </div>
                ))}
              </div>
            )}

            {/* 2. METOT: ISHIKAWA */}
            {activeMethod === 'ishikawa' && (
              <div className="space-y-4 animate-in slide-in-from-right-4 duration-300">
                <div className="bg-indigo-50 p-4 rounded-xl border border-indigo-100 flex gap-3">
                  <Info className="w-5 h-5 text-indigo-600 shrink-0 mt-0.5" />
                  <div>
                      <h4 className="text-xs font-black text-indigo-900 mb-1 uppercase">Müfettiş İpucu</h4>
                      <p className="text-xs text-indigo-800 leading-relaxed">Sorunu ana dallara ayırın (6M). Her bir bileşende neyin eksik veya hatalı olduğunu sorgulayın.</p>
                  </div>
                </div>

                <div className="grid grid-cols-1 gap-3">
                    {[
                      { id: 'man', label: 'İnsan (Man)', icon: Users, desc: 'Eğitim eksikliği, dikkatsizlik...' },
                      { id: 'machine', label: 'Makine (Machine)', icon: Cpu, desc: 'Yazılım hatası, altyapı...' },
                      { id: 'method', label: 'Süreç (Method)', icon: Settings, desc: 'Hatalı prosedür, eksik politika...' },
                      { id: 'material', label: 'Malzeme (Material)', icon: FileText, desc: 'Hatalı veri girişi, eksik döküman...' },
                      { id: 'measurement', label: 'Ölçüm (Measurement)', icon: Activity, desc: 'Yanlış KRI, hatalı raporlama...' },
                      { id: 'environment', label: 'Ortam (Environment)', icon: Share, desc: 'Fiziksel şartlar, kültür...' }
                    ].map((item) => (
                      <div key={item.id} className="relative group">
                        <div className="absolute left-3 top-1/2 -translate-y-1/2">
                           <item.icon className="w-4 h-4 text-indigo-400 group-focus-within:text-indigo-600" />
                        </div>
                        <div className="absolute right-3 top-1/2 -translate-y-1/2 text-[10px] font-bold text-slate-400 uppercase tracking-wider pointer-events-none group-focus-within:text-indigo-300">
                           {item.label.split('(')[0]}
                        </div>
                        <input type="text" value={ishikawa[item.id as keyof typeof ishikawa]} 
                          onChange={(e) => setIshikawa({ ...ishikawa, [item.id]: e.target.value })} 
                          className="w-full pl-10 pr-24 py-3 bg-white border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-indigo-500 focus:border-transparent shadow-sm text-slate-700 placeholder:text-slate-300" 
                          placeholder={item.desc} 
                        />
                      </div>
                    ))}
                </div>
              </div>
            )}

            {/* 3. METOT: BOW-TIE (PAPYON) */}
            {activeMethod === 'bowtie' && (
              <div className="space-y-4 animate-in slide-in-from-right-4 duration-300">
                <div className="bg-rose-50 p-4 rounded-xl border border-rose-100 flex gap-3">
                  <Info className="w-5 h-5 text-rose-600 shrink-0 mt-0.5" />
                  <div>
                      <h4 className="text-xs font-black text-rose-900 mb-1 uppercase">Papyon Modeli</h4>
                      <p className="text-xs text-rose-800 leading-relaxed">Sol taraf önleyici (Preventive), sağ taraf düzeltici (Corrective) kontrollerdir. Ortada Risk olayı bulunur.</p>
                  </div>
                </div>

                <div className="space-y-4">
                    <div className="relative">
                        <label className="block text-[10px] font-black text-slate-500 mb-1 uppercase tracking-wider ml-1">1. Önleyici Kontroller</label>
                        <textarea rows={2} value={bowtie.preventive} onChange={e => setBowtie({...bowtie, preventive: e.target.value})} className="w-full px-4 py-3 border border-slate-200 rounded-xl text-sm bg-white focus:ring-2 focus:ring-rose-500 focus:border-transparent resize-none shadow-sm" placeholder="Olayı ne engellemeliydi?" />
                    </div>
                    
                    <div className="relative">
                        <label className="block text-[10px] font-black text-rose-600 mb-1 uppercase tracking-wider ml-1 flex items-center gap-1"><AlertTriangle size={10}/> 2. Gerçekleşen Olay (Risk)</label>
                        <textarea rows={2} value={bowtie.event} onChange={e => setBowtie({...bowtie, event: e.target.value})} className="w-full px-4 py-3 border-2 border-rose-100 rounded-xl text-sm bg-rose-50/50 focus:ring-2 focus:ring-rose-500 focus:border-rose-300 resize-none font-bold text-rose-900" placeholder="Tam olarak ne oldu?" />
                    </div>

                    <div className="relative">
                        <label className="block text-[10px] font-black text-slate-500 mb-1 uppercase tracking-wider ml-1">3. Düzeltici Kontroller</label>
                        <textarea rows={2} value={bowtie.corrective} onChange={e => setBowtie({...bowtie, corrective: e.target.value})} className="w-full px-4 py-3 border border-slate-200 rounded-xl text-sm bg-white focus:ring-2 focus:ring-rose-500 focus:border-transparent resize-none shadow-sm" placeholder="Olay sonrası zarar nasıl azaltıldı?" />
                    </div>

                    <div className="relative">
                        <label className="block text-[10px] font-black text-slate-800 mb-1 uppercase tracking-wider ml-1">4. Sonuç (Etki)</label>
                        <textarea rows={2} value={bowtie.consequences} onChange={e => setBowtie({...bowtie, consequences: e.target.value})} className="w-full px-4 py-3 border border-slate-200 rounded-xl text-sm bg-slate-100 focus:ring-2 focus:ring-slate-500 focus:border-transparent resize-none shadow-sm" placeholder="Kurum ne kaybetti?" />
                    </div>
                </div>
              </div>
            )}

            {/* CANLI ÖNİZLEME KARTI */}
            <div className="bg-slate-50 rounded-xl p-4 border border-slate-200 mt-6">
                <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3 border-b border-slate-200 pb-2">Rapor Çıktısı (Önizleme)</h4>
                <div 
                    className="prose prose-sm prose-slate max-w-none bg-white p-4 rounded-lg border border-slate-200 shadow-sm text-sm"
                    dangerouslySetInnerHTML={{ __html: generateHtmlPreview() }}
                />
            </div>

            {/* AKSİYON BUTONU */}
            <button 
              onClick={handleApply} 
              className="w-full py-3 bg-slate-900 text-white rounded-xl font-bold text-sm hover:bg-slate-800 transition-all shadow-md active:scale-95 flex items-center justify-center gap-2"
            >
              <Check className="w-4 h-4" /> Analizi Ana Forma Aktar
            </button>

        </div>
      </div>
    </div>
  );
}