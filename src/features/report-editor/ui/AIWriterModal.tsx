import { useState } from 'react';
import { X, Sparkles, Loader2, FileText, CheckCircle2 } from 'lucide-react';
import clsx from 'clsx';

interface AIWriterModalProps {
  onClose: () => void;
  onInsert: (content: string) => void;
  findingCount?: number;
}

type SectionType = 'executive' | 'findings' | 'conclusion' | 'recommendations';

const SECTIONS = [
  {
    id: 'executive' as SectionType,
    label: 'Yönetici Özeti',
    description: 'Kısa ve öz yönetici özeti oluştur',
    icon: FileText,
    color: 'from-blue-500 to-cyan-500',
  },
  {
    id: 'findings' as SectionType,
    label: 'Bulgular Bölümü',
    description: 'Tespit edilen bulguları detaylı açıkla',
    icon: FileText,
    color: 'from-orange-500 to-red-500',
  },
  {
    id: 'conclusion' as SectionType,
    label: 'Sonuç ve Değerlendirme',
    description: 'Genel sonuç ve değerlendirme yaz',
    icon: FileText,
    color: 'from-blue-500 to-cyan-500',
  },
  {
    id: 'recommendations' as SectionType,
    label: 'Öneriler',
    description: 'Aksiyon önerileri listesi hazırla',
    icon: FileText,
    color: 'from-green-500 to-emerald-500',
  },
];

export function AIWriterModal({ onClose, onInsert, findingCount = 0 }: AIWriterModalProps) {
  const [selectedSection, setSelectedSection] = useState<SectionType | null>(null);
  const [generating, setGenerating] = useState(false);
  const [generatedContent, setGeneratedContent] = useState<string>('');

  const handleGenerate = async () => {
    if (!selectedSection) return;

    setGenerating(true);
    await new Promise((resolve) => setTimeout(resolve, 2000));

    const content = generateContent(selectedSection, findingCount);
    setGeneratedContent(content);
    setGenerating(false);
  };

  const handleInsert = () => {
    onInsert(generatedContent);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-4xl mx-4 max-h-[90vh] flex flex-col">
        <div className="flex items-center justify-between p-6 border-b border-slate-200">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-cyan-600 rounded-xl flex items-center justify-center">
              <Sparkles className="text-white" size={20} />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-slate-900">AI Yazım Asistanı</h2>
              <p className="text-sm text-slate-600">
                Sentinel AI ile profesyonel rapor bölümleri oluşturun
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-slate-100 rounded-lg transition-colors"
          >
            <X className="w-6 h-6 text-slate-500" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-6">
          {!generatedContent ? (
            <>
              <div className="mb-6">
                <div className="flex items-center gap-2 mb-3">
                  <h3 className="text-lg font-semibold text-slate-900">Hangi bölümü yazayım?</h3>
                  {findingCount > 0 && (
                    <span className="px-2 py-1 bg-blue-100 text-blue-700 text-xs font-semibold rounded">
                      {findingCount} Bulgu Tespit Edildi
                    </span>
                  )}
                </div>
                <p className="text-sm text-slate-600">
                  Bulgularınızı analiz edip profesyonel Türkçe metin oluşturacağım
                </p>
              </div>

              <div className="grid grid-cols-2 gap-4 mb-6">
                {SECTIONS.map((section) => {
                  const Icon = section.icon;
                  return (
                    <button
                      key={section.id}
                      onClick={() => setSelectedSection(section.id)}
                      className={clsx(
                        'text-left border-2 rounded-xl p-5 transition-all group relative overflow-hidden',
                        selectedSection === section.id
                          ? 'border-blue-500 bg-blue-50'
                          : 'border-slate-200 hover:border-blue-300 hover:bg-slate-50'
                      )}
                    >
                      <div
                        className={clsx(
                          'absolute top-0 right-0 w-24 h-24 rounded-full blur-2xl opacity-0 transition-opacity',
                          selectedSection === section.id && 'opacity-20',
                          `bg-gradient-to-br ${section.color}`
                        )}
                      />
                      <div className="relative">
                        <div className="flex items-center gap-3 mb-2">
                          <div
                            className={clsx(
                              'w-10 h-10 rounded-lg flex items-center justify-center transition-all',
                              selectedSection === section.id
                                ? `bg-gradient-to-br ${section.color}`
                                : 'bg-slate-100 group-hover:bg-slate-200'
                            )}
                          >
                            <Icon
                              className={clsx(
                                'transition-colors',
                                selectedSection === section.id ? 'text-white' : 'text-slate-600'
                              )}
                              size={20}
                            />
                          </div>
                          <h4 className="font-semibold text-slate-900">{section.label}</h4>
                        </div>
                        <p className="text-sm text-slate-600">{section.description}</p>
                      </div>
                    </button>
                  );
                })}
              </div>

              <button
                onClick={handleGenerate}
                disabled={!selectedSection || generating}
                className={clsx(
                  'w-full flex items-center justify-center gap-3 px-6 py-4 rounded-xl font-semibold transition-all',
                  selectedSection && !generating
                    ? 'bg-gradient-to-r from-blue-600 to-cyan-600 text-white hover:shadow-lg hover:scale-[1.02]'
                    : 'bg-slate-200 text-slate-400 cursor-not-allowed'
                )}
              >
                {generating ? (
                  <>
                    <Loader2 className="animate-spin" size={20} />
                    AI Oluşturuyor...
                  </>
                ) : (
                  <>
                    <Sparkles size={20} />
                    AI ile Oluştur
                  </>
                )}
              </button>
            </>
          ) : (
            <div className="space-y-4">
              <div className="flex items-center gap-2 mb-4">
                <CheckCircle2 className="text-emerald-500" size={24} />
                <h3 className="text-lg font-semibold text-slate-900">İçerik Hazır!</h3>
              </div>

              <div className="border border-slate-200 rounded-xl p-6 bg-slate-50 max-h-96 overflow-y-auto">
                <div
                  className="prose prose-slate max-w-none"
                  dangerouslySetInnerHTML={{ __html: generatedContent }}
                />
              </div>

              <div className="flex items-center gap-3">
                <button
                  onClick={handleInsert}
                  className="flex-1 flex items-center justify-center gap-2 px-6 py-3 bg-gradient-to-r from-blue-600 to-cyan-600 text-white rounded-xl font-semibold hover:shadow-lg transition-all"
                >
                  <CheckCircle2 size={20} />
                  Rapora Ekle
                </button>
                <button
                  onClick={() => setGeneratedContent('')}
                  className="px-6 py-3 bg-slate-200 text-slate-700 rounded-xl font-semibold hover:bg-slate-300 transition-colors"
                >
                  Yeniden Oluştur
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function generateContent(section: SectionType, findingCount: number): string {
  const templates = {
    executive: `
      <h2>Yönetici Özeti</h2>
      <p>
        Yapılan denetim çalışmasında, özellikli süreçlerde <strong>${findingCount} adet</strong> bulgu tespit edilmiştir.
        Tespit edilen bulgular, operasyonel risk seviyesinin orta-yüksek düzeyde olduğunu göstermektedir.
      </p>
      <p>
        Bulgular içerisinde <strong>kritik</strong> ve <strong>yüksek</strong> öneme sahip olanların
        acilen çözüme kavuşturulması gerekmektedir. Bu bulgulara ilişkin aksiyon planları oluşturulmuş ve
        ilgili birimlere iletilmiştir.
      </p>
      <p>
        Denetim çalışması sonucunda, mevcut kontrol yapısının güçlendirilmesi ve süreçlerin
        iyileştirilmesine yönelik somut öneriler geliştirilmiştir.
      </p>
    `,
    findings: `
      <h2>Tespit Edilen Bulgular</h2>
      <p>
        Denetim kapsamında gerçekleştirilen incelemeler neticesinde <strong>${findingCount} adet</strong>
        bulgu tespit edilmiştir. Bu bulgular risk seviyelerine göre sınıflandırılmış ve detaylı olarak
        değerlendirilmiştir.
      </p>
      <h3>Bulgulara Genel Bakış</h3>
      <ul>
        <li><strong>Kritik Bulgular:</strong> Acil müdahale gerektiren, işletme sürekliliğini tehdit eden bulgular</li>
        <li><strong>Yüksek Riskli Bulgular:</strong> Önemli ölçüde risk oluşturan, orta vadede çözüm gerektiren bulgular</li>
        <li><strong>Orta Riskli Bulgular:</strong> İyileştirme fırsatı sunan, takip edilmesi gereken bulgular</li>
      </ul>
      <p>
        Her bir bulgu için detaylı açıklamalar, risk değerlendirmeleri ve kök neden analizleri
        aşağıdaki bölümlerde sunulmaktadır.
      </p>
    `,
    conclusion: `
      <h2>Sonuç ve Genel Değerlendirme</h2>
      <p>
        Gerçekleştirilen denetim çalışması sonucunda, incelenen süreçlerde <strong>${findingCount} adet</strong>
        gelişim alanı tespit edilmiştir. Bu bulgular, kurumun mevcut risk profilini ve kontrol ortamını
        objektif olarak yansıtmaktadır.
      </p>
      <p>
        Tespit edilen bulguların büyük bir kısmı, süreç iyileştirmeleri ve kontrol mekanizmalarının
        güçlendirilmesi yoluyla giderilebilir niteliktedir. Kritik öneme sahip bulgular için acil
        aksiyon planları oluşturulmuş ve yönetimin onayına sunulmuştur.
      </p>
      <p>
        Genel olarak değerlendirildiğinde, kurumun risk yönetimi ve iç kontrol yapısının temel
        unsurlarının mevcut olduğu ancak etkinliğinin artırılmasına ihtiyaç duyulduğu görülmektedir.
      </p>
    `,
    recommendations: `
      <h2>Öneriler ve Aksiyon Planı</h2>
      <p>
        Tespit edilen <strong>${findingCount} bulgu</strong> kapsamında aşağıdaki öneriler geliştirilmiştir:
      </p>
      <h3>Kısa Vadeli Öneriler (0-3 Ay)</h3>
      <ul>
        <li>Kritik bulguların acil olarak giderilmesi için kaynak tahsisi yapılmalıdır</li>
        <li>Yüksek riskli alanlarda görev tanımları netleştirilmeli ve sorumluluklar belirlenmelidir</li>
        <li>Günlük operasyonel kontroller güçlendirilmeli ve dokümante edilmelidir</li>
      </ul>
      <h3>Orta Vadeli Öneriler (3-6 Ay)</h3>
      <ul>
        <li>Süreç iyileştirme çalışmaları başlatılmalı ve metodolojik olarak yönetilmelidir</li>
        <li>Personel eğitim programları gözden geçirilmeli ve güncellenmeli</li>
        <li>Teknolojik altyapı yatırımları planlanmalı ve bütçelenmelidir</li>
      </ul>
      <h3>Uzun Vadeli Öneriler (6-12 Ay)</h3>
      <ul>
        <li>Kurumsal risk yönetimi çerçevesi tam olarak uygulanmalı</li>
        <li>Sürekli iyileştirme kültürü kurumsallaştırılmalı</li>
        <li>Denetim döngüsü düzenli olarak tekrarlanarak iyileştirmeler takip edilmelidir</li>
      </ul>
    `,
  };

  return templates[section] || '<p>İçerik oluşturulamadı</p>';
}
