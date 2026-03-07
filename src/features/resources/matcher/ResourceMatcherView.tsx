import { Target } from 'lucide-react';
import { useTalentPool, useBestFitMatch } from '@/features/talent-os/api/queries';
import { BestFitPanel } from '@/widgets/TalentOS/BestFitPanel';

export function ResourceMatcherView() {
  const { data: profiles = [], isLoading: profilesLoading } = useTalentPool();
  const { data: templates = [], isLoading: templatesLoading } = useBestFitMatch();
  
  const loading = profilesLoading || templatesLoading;

  if (loading) {
    return (
      <div className="flex items-center justify-center p-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600" />
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
        <div className="bg-gradient-to-r from-teal-600 to-teal-700 rounded-xl p-6 text-white shadow-sm">
          <div className="flex items-start gap-4">
            <div className="w-12 h-12 bg-white/20 backdrop-blur-sm rounded-lg flex items-center justify-center flex-shrink-0 shadow-inner">
              <Target className="w-6 h-6 text-white" />
            </div>
            <div>
              <h2 className="text-xl font-bold mb-2">Akıllı Eşleştirme Motoru</h2>
              <p className="text-teal-50 text-sm leading-relaxed">
                Denetim tipini seçin, sistem becerilere, uygunluğa ve yorgunluk durumuna göre 
                en uygun denetçi adaylarını sıralar. Kırmızı bölgede olan denetçiler otomatik 
                olarak engellenir. Analiz sonuçları "Aşırı Savunmacı Programlama" standartlarındadır.
              </p>
            </div>
          </div>
        </div>
        
        <BestFitPanel profiles={profiles} templates={templates} />
    </div>
  );
}
