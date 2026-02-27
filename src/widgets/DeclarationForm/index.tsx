import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Shield, CheckCircle2, FileSignature, Clock, AlertCircle } from 'lucide-react';
import { createAuditorDeclaration, type AuditorDeclaration } from '@/entities/governance';

interface DeclarationFormProps {
  onSuccess?: (declaration: AuditorDeclaration) => void;
}

export function DeclarationForm({ onSuccess }: DeclarationFormProps) {
  const [selectedType, setSelectedType] = useState<'INDEPENDENCE' | 'CONFLICT_OF_INTEREST' | 'CODE_OF_CONDUCT'>('INDEPENDENCE');
  const [agreed, setAgreed] = useState(false);
  const [signing, setSigning] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);

  const declarationTexts = {
    INDEPENDENCE: {
      title: 'Bağımsızlık Beyanı',
      content: `Ben, ${new Date().getFullYear()} yılı için İç Denetim Başkanlığı'nda görev yapan denetçi olarak;

• IIA Uluslararası İç Denetim Meslek Standartları ve Etik Kurallar'a uygun hareket edeceğimi,
• Denetim faaliyetlerimi tarafsız, objektif ve bağımsız bir şekilde yürüteceğimi,
• Denetlediğim birimler ile herhangi bir çıkar çatışması yaratabilecek ilişkim olmadığını,
• Denetim görevlerimde profesyonel meslek mensuplarının gerektirdiği dürüstlük ve tarafsızlığı göstereceğimi,
• Edindiğim bilgileri gizli tutacağımı ve yetkisiz kişilerle paylaşmayacağımı,

İşbu belge ile beyan ederim.`,
      icon: Shield,
      color: 'blue'
    },
    CONFLICT_OF_INTEREST: {
      title: 'Çıkar Çatışması Beyanı',
      content: `Ben, ${new Date().getFullYear()} yılı için İç Denetim Başkanlığı'nda görev yapan denetçi olarak;

• Görevimi yürütürken kişisel çıkarlarımı ve kurumun çıkarlarını birbirinden ayrı tutacağımı,
• Denetim görevlerimi yerine getirirken hiçbir şekilde kişisel veya finansal çıkar sağlamayacağımı,
• Denetlenen birimlerle ticari ilişkim bulunmadığını,
• Akraba veya yakın ilişki içinde olduğum kişilerin çalıştığı birimlerin denetiminde görev almayacağımı,
• Herhangi bir çıkar çatışması durumunda derhal üst yönetimi bilgilendireceğimi,

İşbu belge ile beyan ederim.`,
      icon: AlertCircle,
      color: 'orange'
    },
    CODE_OF_CONDUCT: {
      title: 'Etik Kurallar Beyanı',
      content: `Ben, ${new Date().getFullYear()} yılı için İç Denetim Başkanlığı'nda görev yapan denetçi olarak;

• Dürüstlük, tarafsızlık ve gizlilik ilkelerine uygun davranacağımı,
• Meslek etiği ve kurum değerlerine bağlı kalacağımı,
• Yetkinlik ve mesleki gelişimimi sürekli artıracağımı,
• Elde ettiğim bilgileri sadece yasal ve etik amaçlarla kullanacağımı,
• Hediye, ikram veya çıkar sağlayabilecek herhangi bir menfaat kabul etmeyeceğimi,
• Kurum itibarını ve denetim mesleğinin saygınlığını koruyacağımı,

İşbu belge ile beyan ederim.`,
      icon: FileSignature,
      color: 'green'
    }
  };

  const currentDeclaration = declarationTexts[selectedType];

  const handleSign = async () => {
    if (!agreed) return;

    try {
      setSigning(true);
      const declaration = await createAuditorDeclaration({
        declaration_type: selectedType,
        period_year: new Date().getFullYear(),
      });

      setShowSuccess(true);
      setTimeout(() => {
        setShowSuccess(false);
        setAgreed(false);
        if (onSuccess) onSuccess(declaration);
      }, 3000);
    } catch (error) {
      console.error('Failed to sign declaration:', error);
    } finally {
      setSigning(false);
    }
  };

  const getColorClasses = (color: string) => {
    if (color === 'blue') return 'from-blue-600 to-blue-700 text-blue-700 bg-blue-100 border-blue-500';
    if (color === 'orange') return 'from-orange-600 to-orange-700 text-orange-700 bg-orange-100 border-orange-500';
    return 'from-green-600 to-green-700 text-green-700 bg-green-100 border-green-500';
  };

  const colors = getColorClasses(currentDeclaration.color);

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-lg border border-slate-200 shadow-sm p-6">
        <h3 className="text-lg font-bold text-slate-900 mb-4 flex items-center gap-2">
          <FileSignature className="w-5 h-5 text-slate-700" />
          Beyan Türü Seçimi
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <button
            onClick={() => setSelectedType('INDEPENDENCE')}
            className={`p-4 rounded-lg border-2 transition-all ${
              selectedType === 'INDEPENDENCE'
                ? 'border-blue-500 bg-blue-50'
                : 'border-slate-200 hover:border-blue-300'
            }`}
          >
            <Shield className={`w-8 h-8 mx-auto mb-2 ${selectedType === 'INDEPENDENCE' ? 'text-blue-600' : 'text-slate-400'}`} />
            <p className="font-semibold text-slate-900 text-sm">Bağımsızlık Beyanı</p>
            <p className="text-xs text-slate-600 mt-1">IIA Standartları</p>
          </button>

          <button
            onClick={() => setSelectedType('CONFLICT_OF_INTEREST')}
            className={`p-4 rounded-lg border-2 transition-all ${
              selectedType === 'CONFLICT_OF_INTEREST'
                ? 'border-orange-500 bg-orange-50'
                : 'border-slate-200 hover:border-orange-300'
            }`}
          >
            <AlertCircle className={`w-8 h-8 mx-auto mb-2 ${selectedType === 'CONFLICT_OF_INTEREST' ? 'text-orange-600' : 'text-slate-400'}`} />
            <p className="font-semibold text-slate-900 text-sm">Çıkar Çatışması</p>
            <p className="text-xs text-slate-600 mt-1">Etik Kurallar</p>
          </button>

          <button
            onClick={() => setSelectedType('CODE_OF_CONDUCT')}
            className={`p-4 rounded-lg border-2 transition-all ${
              selectedType === 'CODE_OF_CONDUCT'
                ? 'border-green-500 bg-green-50'
                : 'border-slate-200 hover:border-green-300'
            }`}
          >
            <FileSignature className={`w-8 h-8 mx-auto mb-2 ${selectedType === 'CODE_OF_CONDUCT' ? 'text-green-600' : 'text-slate-400'}`} />
            <p className="font-semibold text-slate-900 text-sm">Etik Kurallar</p>
            <p className="text-xs text-slate-600 mt-1">Davranış Kodu</p>
          </button>
        </div>
      </div>

      <AnimatePresence mode="wait">
        <motion.div
          key={selectedType}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
          className="bg-white rounded-lg border-2 border-slate-200 shadow-lg overflow-hidden"
        >
          <div className={`bg-gradient-to-r ${colors.split(' ')[0]} ${colors.split(' ')[1]} p-6 text-white`}>
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-white/20 backdrop-blur-sm rounded-lg flex items-center justify-center">
                <currentDeclaration.icon className="w-6 h-6" />
              </div>
              <div>
                <h2 className="text-xl font-bold">{currentDeclaration.title}</h2>
                <p className="text-sm opacity-90">{new Date().getFullYear()} Yılı Denetim Dönemi</p>
              </div>
            </div>
          </div>

          <div className="p-8">
            <div className="bg-slate-50 rounded-lg p-6 mb-6 border border-slate-200">
              <pre className="text-sm text-slate-700 leading-relaxed whitespace-pre-wrap font-sans">
                {currentDeclaration.content}
              </pre>
            </div>

            <div className="flex items-center justify-between p-4 bg-amber-50 border border-amber-200 rounded-lg mb-6">
              <div className="flex items-start gap-3">
                <Clock className="w-5 h-5 text-amber-600 mt-0.5 flex-shrink-0" />
                <div>
                  <p className="text-sm font-semibold text-amber-900">Önemli Bilgilendirme</p>
                  <p className="text-xs text-amber-800 mt-1">
                    Bu beyan dijital olarak imzalanacak ve kayıt altına alınacaktır.
                    İmzalama tarihi ve saati sistem tarafından otomatik kaydedilir.
                  </p>
                </div>
              </div>
            </div>

            <label className="flex items-start gap-3 cursor-pointer p-4 rounded-lg border-2 border-slate-200 hover:border-slate-300 transition-all mb-6">
              <input
                type="checkbox"
                checked={agreed}
                onChange={(e) => setAgreed(e.target.checked)}
                className="mt-1 w-5 h-5 text-blue-600 border-slate-300 rounded focus:ring-2 focus:ring-blue-500"
              />
              <div>
                <p className="text-sm font-semibold text-slate-900">
                  Yukarıdaki beyanı okudum ve anladım
                </p>
                <p className="text-xs text-slate-600 mt-1">
                  Bu beyanın içeriğini kabul ettiğimi ve uyacağımı taahhüt ederim.
                </p>
              </div>
            </label>

            <div className="flex items-center justify-between pt-4 border-t border-slate-200">
              <div className="text-xs text-slate-600">
                <p>Tarih: {new Date().toLocaleDateString('tr-TR')}</p>
                <p>Saat: {new Date().toLocaleTimeString('tr-TR')}</p>
              </div>

              <button
                onClick={handleSign}
                disabled={!agreed || signing}
                className={`flex items-center gap-2 px-6 py-3 rounded-lg font-semibold transition-all ${
                  !agreed || signing
                    ? 'bg-slate-200 text-slate-400 cursor-not-allowed'
                    : `bg-gradient-to-r ${colors.split(' ')[0]} ${colors.split(' ')[1]} text-white hover:shadow-lg hover:scale-105`
                }`}
              >
                <FileSignature className="w-5 h-5" />
                {signing ? 'İmzalanıyor...' : 'Dijital Olarak İmzala'}
              </button>
            </div>
          </div>
        </motion.div>
      </AnimatePresence>

      <AnimatePresence>
        {showSuccess && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
          >
            <motion.div
              initial={{ y: 50 }}
              animate={{ y: 0 }}
              className="bg-white rounded-xl p-8 max-w-md w-full text-center shadow-2xl"
            >
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <CheckCircle2 className="w-8 h-8 text-green-600" />
              </div>
              <h3 className="text-xl font-bold text-slate-900 mb-2">Beyan Başarıyla İmzalandı!</h3>
              <p className="text-sm text-slate-600">
                {currentDeclaration.title} dijital olarak imzalanmış ve sisteme kaydedilmiştir.
              </p>
              <div className="mt-4 p-3 bg-slate-50 rounded-lg">
                <p className="text-xs text-slate-600">
                  İmzalama Zamanı: {new Date().toLocaleString('tr-TR')}
                </p>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
