import { useState } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import {
  Rocket, Database, Zap, FileText, ChevronRight,
  Shield, Target, BookOpen, ArrowRight
} from 'lucide-react';
import { PageHeader } from '@/shared/ui';
import clsx from 'clsx';

type LaunchPath = 'rkm' | 'adhoc' | 'template';

const PATHS = [
  {
    key: 'rkm' as LaunchPath,
    title: 'RKM Tabanli Denetim',
    subtitle: 'Risk Kutuphane Modulunden risk secimi',
    description: 'Mevcut Risk Kontrol Matrisinden riskleri secerek denetim gorevini baslatin. Tum mevcut risk degerlendirmeleri, kontroller ve gecmis denetim sonuclari otomatik olarak yuklenir.',
    icon: Database,
    color: 'from-blue-600 to-blue-700',
    features: ['Onceki denetim sonuclari aktarilir', 'Risk skorlari otomatik hesaplanir', 'Kontrol testleri hazir gelir', 'GIAS 2024 uyumlu'],
    recommended: true,
  },
  {
    key: 'adhoc' as LaunchPath,
    title: 'Ad-Hoc Denetim',
    subtitle: 'Sifirdan hizli baslatma',
    description: 'Risk kutuphane kaydina ihtiyac duymadan dogrudan denetim baslatir. Saha calismasi sirasinda tespit edilen riskler icin idealdir.',
    icon: Zap,
    color: 'from-orange-500 to-orange-600',
    features: ['Hizli baslangic', 'Risk tanimlama sihirbazi', 'Esnek kapsam belirleme', 'Sonradan RKM ile eslestirme'],
    recommended: false,
  },
  {
    key: 'template' as LaunchPath,
    title: 'Sablon Tabanli Denetim',
    subtitle: 'Onceden tanimlanmis sablonlardan',
    description: 'Kurum icin hazirlanmis denetim sablonlarindan birini secerek standartlastirilmis bir denetim sureci baslatin.',
    icon: FileText,
    color: 'from-teal-600 to-teal-700',
    features: ['Standart is programi', 'Onceden tanimli test adimlari', 'Kurumsal standartlar', 'Tekrarlanabilir surec'],
    recommended: false,
  },
];

export default function AuditStartPage() {
  const [selected, setSelected] = useState<LaunchPath | null>(null);
  const navigate = useNavigate();

  const handleLaunch = (path: LaunchPath) => {
    switch (path) {
      case 'rkm':
        navigate('/strategy/risk-assessment');
        break;
      case 'adhoc':
        navigate('/execution/my-engagements');
        break;
      case 'template':
        navigate('/settings/templates');
        break;
    }
  };

  return (
    <div className="h-screen flex flex-col bg-slate-50">
      <PageHeader
        title="Yeni Denetim Baslat"
        subtitle="Denetim baslatma yolu secin"
        icon={Rocket}
      />

      <div className="flex-1 overflow-auto p-6">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-8">
            <div className="w-16 h-16 bg-slate-800 rounded-2xl flex items-center justify-center mx-auto mb-4">
              <Rocket size={28} className="text-white" />
            </div>
            <h2 className="text-2xl font-bold text-slate-900">Denetim Gorevini Nasil Baslatmak Istersiniz?</h2>
            <p className="text-sm text-slate-500 mt-2 max-w-lg mx-auto">
              Asagidaki uc yoldan birini secerek denetim gorevini baslatin.
              Her yol farkli ihtiyaclara yonelik tasarlanmistir.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {PATHS.map((path, idx) => {
              const Icon = path.icon;
              const isSelected = selected === path.key;

              return (
                <motion.div
                  key={path.key}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: idx * 0.1 }}
                  onClick={() => setSelected(path.key)}
                  className={clsx(
                    'relative bg-white rounded-2xl border-2 overflow-hidden cursor-pointer transition-all hover:shadow-lg group',
                    isSelected ? 'border-blue-500 shadow-lg' : 'border-slate-200 hover:border-slate-300'
                  )}
                >
                  {path.recommended && (
                    <div className="absolute top-3 right-3 bg-blue-600 text-white text-[10px] font-bold px-2.5 py-1 rounded-full z-10">
                      ONERILEN
                    </div>
                  )}

                  <div className={clsx('bg-gradient-to-br p-6 text-white', path.color)}>
                    <div className="w-14 h-14 bg-white/20 backdrop-blur-sm rounded-xl flex items-center justify-center mb-4">
                      <Icon size={28} />
                    </div>
                    <h3 className="text-lg font-bold">{path.title}</h3>
                    <p className="text-sm opacity-90 mt-1">{path.subtitle}</p>
                  </div>

                  <div className="p-6">
                    <p className="text-sm text-slate-600 leading-relaxed">{path.description}</p>

                    <div className="mt-4 space-y-2">
                      {path.features.map((f, i) => (
                        <div key={i} className="flex items-center gap-2 text-xs text-slate-600">
                          <Shield size={12} className="text-green-500 flex-shrink-0" />
                          {f}
                        </div>
                      ))}
                    </div>

                    <button
                      onClick={(e) => { e.stopPropagation(); handleLaunch(path.key); }}
                      className={clsx(
                        'mt-6 w-full flex items-center justify-center gap-2 py-3 rounded-lg font-semibold text-sm transition-all',
                        isSelected
                          ? 'bg-blue-600 text-white hover:bg-blue-700'
                          : 'bg-slate-100 text-slate-700 hover:bg-slate-200 group-hover:bg-blue-600 group-hover:text-white'
                      )}
                    >
                      Baslat <ArrowRight size={14} />
                    </button>
                  </div>
                </motion.div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
