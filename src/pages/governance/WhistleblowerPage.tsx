import { PageHeader } from '@/shared/ui';
import { IncidentPortal } from '@/widgets/IncidentPortal';
import { Shield, AlertTriangle, Lock, Phone } from 'lucide-react';

export default function WhistleblowerPage() {
  return (
    <div className="p-8 space-y-6">
      <PageHeader
        title="İhbar Hattı (Voice)"
        description="Etik ihlaller ve uygunsuzluklar için gizli bildirim kanalı"
        badge="MODÜL 3: YÖNETİŞİM & ETİK"
      />

      <div className="bg-gradient-to-br from-red-50 to-orange-50 border border-red-200 rounded-xl p-6 shadow-sm">
        <div className="flex items-start gap-4">
          <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-red-500 to-orange-500 flex items-center justify-center shrink-0">
            <Shield className="w-6 h-6 text-white" />
          </div>
          <div className="flex-1">
            <h3 className="text-lg font-bold text-slate-800 mb-2">AI Sentiment Analysis & Risk Classification</h3>
            <p className="text-slate-600 text-sm">
              İhbar metinleri otomatik olarak analiz edilir. AI Sentiment Analysis ile aciliyet seviyesi belirlenir,
              risk sınıflandırması yapılır ve ilgili birimlere yönlendirilir. Tam anonimlik ve gizlilik garantisi.
            </p>
          </div>
        </div>
      </div>

      <div className="grid md:grid-cols-4 gap-6">
        {[
          { label: 'Toplam İhbar', value: '23', icon: AlertTriangle, color: 'blue' },
          { label: 'Açık İhbarlar', value: '7', icon: AlertTriangle, color: 'red' },
          { label: 'Kapalı', value: '14', icon: Shield, color: 'green' },
          { label: 'Anonim', value: '18', icon: Lock, color: 'purple' },
        ].map((stat, i) => (
          <div key={i} className="bg-white rounded-xl border border-slate-200 shadow-sm p-6">
            <div className="flex items-center justify-between mb-4">
              <div className={`w-10 h-10 rounded-lg bg-${stat.color}-100 flex items-center justify-center`}>
                <stat.icon size={20} className={`text-${stat.color}-600`} />
              </div>
            </div>
            <div className="text-2xl font-bold text-slate-800 mb-1">{stat.value}</div>
            <div className="text-sm text-slate-600">{stat.label}</div>
          </div>
        ))}
      </div>

      <div className="bg-white rounded-xl border border-slate-200 shadow-sm">
        <div className="p-6 border-b border-slate-200">
          <h2 className="text-lg font-bold text-slate-800 flex items-center gap-2">
            <Shield size={20} className="text-red-600" />
            İhbar Yönetim Sistemi
          </h2>
          <p className="text-sm text-slate-600 mt-1">
            Tüm ihbarlar şifrelenmiş ve anonim olarak saklanır
          </p>
        </div>
        <div className="p-6">
          <IncidentPortal />
        </div>
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 rounded-lg bg-purple-100 flex items-center justify-center">
              <Lock size={20} className="text-purple-600" />
            </div>
            <h3 className="text-lg font-bold text-slate-800">Gizlilik Garantisi</h3>
          </div>
          <p className="text-sm text-slate-600 mb-4">
            İhbarlarınız end-to-end şifreleme ile korunur. Kimlik bilgileriniz asla paylaşılmaz.
          </p>
          <div className="space-y-2 text-xs text-slate-600">
            <div className="flex items-center gap-2">
              <div className="w-1.5 h-1.5 rounded-full bg-green-600"></div>
              256-bit AES şifreleme
            </div>
            <div className="flex items-center gap-2">
              <div className="w-1.5 h-1.5 rounded-full bg-green-600"></div>
              Anonim kimlik sistemi
            </div>
            <div className="flex items-center gap-2">
              <div className="w-1.5 h-1.5 rounded-full bg-green-600"></div>
              Misilleme koruması
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 rounded-lg bg-blue-100 flex items-center justify-center">
              <AlertTriangle size={20} className="text-blue-600" />
            </div>
            <h3 className="text-lg font-bold text-slate-800">İhbar Kategorileri</h3>
          </div>
          <div className="space-y-2 text-sm">
            {[
              'Mali Usulsüzlük',
              'Etik İhlal',
              'Yolsuzluk & Rüşvet',
              'Ayrımcılık & Taciz',
              'Çıkar Çatışması',
              'Bilgi Güvenliği İhlali',
            ].map((category, i) => (
              <div key={i} className="p-2 bg-slate-50 rounded-lg text-slate-700">
                {category}
              </div>
            ))}
          </div>
        </div>

        <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 rounded-lg bg-green-100 flex items-center justify-center">
              <Phone size={20} className="text-green-600" />
            </div>
            <h3 className="text-lg font-bold text-slate-800">İletişim Kanalları</h3>
          </div>
          <div className="space-y-3 text-sm">
            <div className="p-3 bg-green-50 border border-green-200 rounded-lg">
              <div className="font-semibold text-green-800 mb-1">Telefonla İhbar</div>
              <div className="text-green-700">0850 XXX XX XX</div>
              <div className="text-xs text-green-600 mt-1">7/24 Hizmet</div>
            </div>
            <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg">
              <div className="font-semibold text-blue-800 mb-1">E-posta</div>
              <div className="text-blue-700">ihbar@bank.com</div>
            </div>
            <div className="p-3 bg-purple-50 border border-purple-200 rounded-lg">
              <div className="font-semibold text-purple-800 mb-1">Web Portal</div>
              <div className="text-purple-700">Bu Sayfa</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
