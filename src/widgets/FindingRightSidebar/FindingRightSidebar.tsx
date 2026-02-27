import { useState } from 'react';
import {
  X,
  Info,
  History,
  Sparkles,
  FileText,
  MessageSquare,
  CheckCircle2,
  AlertCircle,
  TrendingUp,
  Calendar,
  User,
} from 'lucide-react';
import clsx from 'clsx';
import type { ComprehensiveFinding } from '@/entities/finding/model/types';

type SidebarTab = 'detay' | 'tarihce' | 'ai' | 'notlar' | 'yorum';

interface FindingRightSidebarProps {
  finding: ComprehensiveFinding | null;
  isOpen?: boolean;
  onClose: () => void;
  onNavigateToDetail?: (id: string) => void;
}

export const FindingRightSidebar = ({ finding, isOpen: isOpenProp, onClose, onNavigateToDetail }: FindingRightSidebarProps) => {
  const isOpen = isOpenProp ?? !!finding;
  if (!finding) return null;
  const [activeTab, setActiveTab] = useState<SidebarTab>('detay');

  const tabs = [
    { id: 'detay' as const, label: 'Detay', icon: Info },
    { id: 'tarihce' as const, label: 'Tarihçe', icon: History },
    { id: 'ai' as const, label: 'AI', icon: Sparkles },
    { id: 'notlar' as const, label: 'Notlar', icon: FileText },
    { id: 'yorum' as const, label: 'Yorum', icon: MessageSquare },
  ];

  return (
    <>
      {/* Overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/20 backdrop-blur-sm z-40 transition-opacity"
          onClick={onClose}
        />
      )}

      {/* Sidebar */}
      <div
        className={clsx(
          'fixed right-0 top-0 h-screen w-[480px] bg-white border-l border-gray-200 z-50',
          'transform transition-transform duration-300 ease-in-out shadow-2xl',
          isOpen ? 'translate-x-0' : 'translate-x-full'
        )}
      >
        {/* Header */}
        <div className="h-16 border-b border-gray-200 flex items-center justify-between px-6">
          <div className="flex items-center gap-3">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={clsx(
                    'flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-all',
                    activeTab === tab.id
                      ? 'bg-blue-600 text-white shadow-md'
                      : 'text-gray-600 hover:bg-gray-100'
                  )}
                >
                  <Icon className="w-4 h-4" />
                  {tab.label}
                </button>
              );
            })}
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <X className="w-5 h-5 text-gray-500" />
          </button>
        </div>

        {/* Content */}
        <div className="h-[calc(100vh-4rem)] overflow-y-auto p-6">
          {activeTab === 'detay' && <DetayTab finding={finding} />}
          {activeTab === 'tarihce' && <TarihceTab finding={finding} />}
          {activeTab === 'ai' && <AITab finding={finding} />}
          {activeTab === 'notlar' && <NotlarTab finding={finding} />}
          {activeTab === 'yorum' && <YorumTab finding={finding} />}
        </div>
      </div>
    </>
  );
};

const DetayTab = ({ finding }: { finding: ComprehensiveFinding }) => {
  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-sm font-semibold text-gray-900 mb-3">Genel Bilgiler</h3>
        <div className="space-y-3">
          <div className="flex items-start justify-between py-2 border-b border-gray-100">
            <span className="text-sm text-gray-600">Referans No</span>
            <span className="text-sm font-mono font-semibold text-gray-900">{finding.code}</span>
          </div>
          <div className="flex items-start justify-between py-2 border-b border-gray-100">
            <span className="text-sm text-gray-600">Durum</span>
            <span
              className={clsx(
                'text-xs px-2.5 py-1 rounded-full font-medium',
                finding.state === 'IN_NEGOTIATION'
                  ? 'bg-blue-100 text-blue-700'
                  : finding.state === 'AGREED'
                    ? 'bg-green-100 text-green-700'
                    : 'bg-gray-100 text-gray-700'
              )}
            >
              {finding.state === 'IN_NEGOTIATION'
                ? 'Müzakarede'
                : finding.state === 'AGREED'
                  ? 'Mutabık'
                  : finding.state === 'DRAFT'
                    ? 'Taslak'
                    : finding.state}
            </span>
          </div>
          <div className="flex items-start justify-between py-2 border-b border-gray-100">
            <span className="text-sm text-gray-600">Önem Seviyesi</span>
            <span
              className={clsx(
                'text-xs px-2.5 py-1 rounded-full font-semibold',
                finding.severity === 'CRITICAL'
                  ? 'bg-red-600 text-white'
                  : finding.severity === 'HIGH'
                    ? 'bg-orange-600 text-white'
                    : 'bg-yellow-600 text-white'
              )}
            >
              {finding.severity === 'CRITICAL'
                ? 'Kritik'
                : finding.severity === 'HIGH'
                  ? 'Yüksek'
                  : 'Orta'}
            </span>
          </div>
          <div className="flex items-start justify-between py-2 border-b border-gray-100">
            <span className="text-sm text-gray-600">Kategori</span>
            <span className="text-sm font-medium text-gray-900">
              {finding.gias_category || 'Belirlenmedi'}
            </span>
          </div>
          {finding.financial_impact && (
            <div className="flex items-start justify-between py-2 border-b border-gray-100">
              <span className="text-sm text-gray-600">Finansal Etki</span>
              <span className="text-sm font-bold text-gray-900">
                ₺{(finding.financial_impact / 1000000).toFixed(2)}M
              </span>
            </div>
          )}
        </div>
      </div>

      <div>
        <h3 className="text-sm font-semibold text-gray-900 mb-3">Sorumlu Birim</h3>
        <div className="bg-gray-50 rounded-lg p-4">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
              <User className="w-5 h-5 text-blue-600" />
            </div>
            <div>
              <p className="text-sm font-medium text-gray-900">
                {finding.auditee_department || 'Atanmadı'}
              </p>
              <p className="text-xs text-gray-500">Sorumlu Birim</p>
            </div>
          </div>
        </div>
      </div>

      <div>
        <h3 className="text-sm font-semibold text-gray-900 mb-3">Tarihler</h3>
        <div className="space-y-2">
          <div className="flex items-center gap-2 text-sm">
            <Calendar className="w-4 h-4 text-gray-400" />
            <span className="text-gray-600">Oluşturulma:</span>
            <span className="font-medium text-gray-900">
              {new Date(finding.created_at).toLocaleDateString('tr-TR')}
            </span>
          </div>
          {finding.negotiation_started_at && (
            <div className="flex items-center gap-2 text-sm">
              <Calendar className="w-4 h-4 text-gray-400" />
              <span className="text-gray-600">Müzakere Başlangıcı:</span>
              <span className="font-medium text-gray-900">
                {new Date(finding.negotiation_started_at).toLocaleDateString('tr-TR')}
              </span>
            </div>
          )}
          {finding.agreed_at && (
            <div className="flex items-center gap-2 text-sm">
              <CheckCircle2 className="w-4 h-4 text-green-500" />
              <span className="text-gray-600">Mutabakat:</span>
              <span className="font-medium text-gray-900">
                {new Date(finding.agreed_at).toLocaleDateString('tr-TR')}
              </span>
            </div>
          )}
        </div>
      </div>

      {finding.action_plans && finding.action_plans.length > 0 && (
        <div>
          <h3 className="text-sm font-semibold text-gray-900 mb-3">
            Aksiyon Planları ({finding.action_plans.length})
          </h3>
          <div className="space-y-3">
            {finding.action_plans.map((plan) => (
              <div key={plan.id} className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                <div className="flex items-start justify-between mb-2">
                  <h4 className="text-sm font-medium text-gray-900">{plan.title}</h4>
                  <span
                    className={clsx(
                      'text-xs px-2 py-0.5 rounded font-medium',
                      plan.status === 'COMPLETED'
                        ? 'bg-green-100 text-green-700'
                        : plan.status === 'IN_PROGRESS'
                          ? 'bg-blue-100 text-blue-700'
                          : 'bg-gray-100 text-gray-700'
                    )}
                  >
                    {plan.status === 'COMPLETED'
                      ? 'Tamamlandı'
                      : plan.status === 'IN_PROGRESS'
                        ? 'Devam Ediyor'
                        : 'Bekliyor'}
                  </span>
                </div>
                <p className="text-xs text-gray-600 mb-3">{plan.description}</p>
                <div className="flex items-center gap-2 mb-2">
                  <User className="w-3.5 h-3.5 text-gray-500" />
                  <span className="text-xs text-gray-700">{plan.responsible_person}</span>
                </div>
                {plan.progress_percentage > 0 && (
                  <div className="mt-3">
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-xs text-gray-600">İlerleme</span>
                      <span className="text-xs font-medium text-gray-900">
                        {plan.progress_percentage}%
                      </span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-1.5">
                      <div
                        className="bg-blue-600 h-1.5 rounded-full transition-all"
                        style={{ width: `${plan.progress_percentage}%` }}
                      />
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

const TarihceTab = ({ finding }: { finding: ComprehensiveFinding }) => {
  const allHistory = finding.history || [];

  return (
    <div className="space-y-4">
      <h3 className="text-sm font-semibold text-gray-900">Bulgu Geçmişi</h3>
      {allHistory.length > 0 ? (
        <div className="space-y-4">
          {allHistory.map((item, index) => (
            <div key={item.id} className="relative pl-6 pb-4">
              {index !== allHistory.length - 1 && (
                <div className="absolute left-2 top-6 bottom-0 w-px bg-gray-200" />
              )}
              <div className="absolute left-0 top-1 w-4 h-4 rounded-full bg-blue-100 border-2 border-blue-600" />
              <div className="bg-gray-50 rounded-lg p-4">
                <div className="flex items-start justify-between mb-2">
                  <span className="text-xs font-medium text-blue-600">
                    {item.change_type === 'STATE_CHANGE'
                      ? 'Durum Değişikliği'
                      : item.change_type === 'COMMENT_ADDED'
                        ? 'Yorum Eklendi'
                        : item.change_type === 'ACTION_PLAN_ADDED'
                          ? 'Aksiyon Planı Eklendi'
                          : 'Değişiklik'}
                  </span>
                  <span className="text-xs text-gray-500">
                    {new Date(item.changed_at).toLocaleDateString('tr-TR')}
                  </span>
                </div>
                <p className="text-sm text-gray-700 mb-2">
                  {item.change_description || 'Değişiklik yapıldı'}
                </p>
                {item.changed_by_role && (
                  <span className="text-xs text-gray-500">
                    {item.changed_by_role === 'AUDITOR' ? 'Müfettiş' : 'Denetlenen'}
                  </span>
                )}
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-12">
          <History className="w-12 h-12 text-gray-400 mx-auto mb-3" />
          <p className="text-sm text-gray-500">Henüz değişiklik kaydı yok</p>
        </div>
      )}
    </div>
  );
};

const AITab = ({ finding }: { finding: ComprehensiveFinding }) => {
  return (
    <div className="space-y-6">
      {/* Benzerlik Analizi */}
      <div className="bg-gradient-to-br from-purple-50 to-indigo-50 rounded-lg p-6 border border-purple-200">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 bg-purple-600 rounded-lg flex items-center justify-center">
            <Sparkles className="w-5 h-5 text-white" />
          </div>
          <div>
            <h3 className="text-sm font-semibold text-purple-900">Benzerlik Analizi</h3>
            <p className="text-xs text-purple-700">AI tarafından analiz edildi</p>
          </div>
        </div>
        <div className="text-center mb-4">
          <div className="text-5xl font-bold text-purple-600 mb-2">%85</div>
          <p className="text-sm text-purple-800">
            Bu bulgu, son 3 yıl içinde 5 farklı şubede tespit edilen benzer bulgulara sahip.
          </p>
        </div>
        <div className="flex gap-2">
          <button className="flex-1 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors text-sm font-medium">
            Benzerlik Analizi
          </button>
          <button className="flex-1 px-4 py-2 bg-white text-purple-600 border border-purple-200 rounded-lg hover:bg-purple-50 transition-colors text-sm font-medium">
            Önerileri Gör
          </button>
        </div>
      </div>

      {/* Tekrar Eden Bulgular */}
      <div>
        <h3 className="text-sm font-semibold text-gray-900 mb-3">Tekrar Eden Bulgular</h3>
        <div className="space-y-3">
          {[
            {
              id: 1,
              title: 'Bulgu Taslağı Oluşturuldu',
              branch: 'Kadıköy',
              date: '14 Ocak 2025',
            },
            {
              id: 2,
              title: 'Risk Seviyesi Güncellendi',
              branch: 'Beşiktaş',
              date: '14 Kasım 2025',
            },
            {
              id: 3,
              title: 'Yönetici Onayına Sunuldu',
              branch: 'Şişli',
              date: '20 Aralık 2024',
            },
            {
              id: 4,
              title: 'Şube Müdürü\'ne İletildi',
              branch: 'Etiler',
              date: '12 Ekim 2025',
            },
          ].map((item) => (
            <div
              key={item.id}
              className="flex items-start gap-3 p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors cursor-pointer"
            >
              <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center flex-shrink-0 mt-1">
                <CheckCircle2 className="w-4 h-4 text-blue-600" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-gray-900">{item.title}</p>
                <div className="flex items-center gap-2 mt-1">
                  <span className="text-xs text-gray-500">{item.branch}</span>
                  <span className="text-xs text-gray-400">•</span>
                  <span className="text-xs text-gray-500">{item.date}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Kalite Kontrol */}
      <div className="bg-orange-50 border-l-4 border-orange-500 p-4">
        <div className="flex items-start gap-3">
          <AlertCircle className="w-5 h-5 text-orange-600 flex-shrink-0 mt-0.5" />
          <div>
            <h4 className="text-sm font-semibold text-orange-900 mb-1">Kalite Kontrol</h4>
            <p className="text-sm text-orange-800 leading-relaxed">
              Bulgu metni içinde mükerrer gönderilmiş kontrol tespiti var. "Dual-control" kelimesi
              3 kez kullanılmıştır.
            </p>
          </div>
        </div>
      </div>

      {/* Sentinel AI'a Sor */}
      <div className="bg-gradient-to-r from-blue-50 to-cyan-50 rounded-lg p-4 border border-blue-200">
        <h4 className="text-sm font-semibold text-blue-900 mb-2">Sentinel AI\'a Sor</h4>
        <p className="text-xs text-blue-700 mb-3">
          Bu bulgu hakkında Sentinel Prime\'dan ek öneriler alın.
        </p>
        <button className="w-full px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium">
          AI Önerileri Al
        </button>
      </div>
    </div>
  );
};

const NotlarTab = ({ finding }: { finding: ComprehensiveFinding }) => {
  const [notes, setNotes] = useState('');

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-sm font-semibold text-gray-900 mb-3">Müfettiş Notları</h3>
        <p className="text-xs text-gray-600 mb-4">
          Notlarınızı buraya yazın. Sentinel AI bu notları analiz ederek bulguya dönüştürebilir.
        </p>
        <textarea
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          placeholder="Notlarınız..."
          className="w-full h-64 px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none bg-white text-sm"
        />
        <div className="flex gap-2 mt-3">
          <button className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium flex items-center justify-center gap-2">
            <Sparkles className="w-4 h-4" />
            Bulguya Dönüştür
          </button>
          <button className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors text-sm font-medium">
            Kaydet
          </button>
        </div>
      </div>

      {/* Önceki Notlar */}
      <div>
        <h3 className="text-sm font-semibold text-gray-900 mb-3">Önceki Notlar</h3>
        <div className="space-y-3">
          <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4">
            <div className="flex items-start justify-between mb-2">
              <span className="text-xs text-yellow-800 font-medium">15.12.2025 - 14:30</span>
              <button className="text-xs text-yellow-700 hover:text-yellow-900">Düzenle</button>
            </div>
            <p className="text-sm text-yellow-900">
              CCTV kayıtlarında personel tek başına kasaya erişim sağlamıştır. İşlem personeli
              Ahmet Yılmaz. Yönetici tatilde.
            </p>
          </div>
          <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4">
            <div className="flex items-start justify-between mb-2">
              <span className="text-xs text-yellow-800 font-medium">14.12.2025 - 10:15</span>
              <button className="text-xs text-yellow-700 hover:text-yellow-900">Düzenle</button>
            </div>
            <p className="text-sm text-yellow-900">
              Benzer durum 2024 yılında da gözlenmişti. İyileştirme yapılmamış.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

const YorumTab = ({ finding }: { finding: ComprehensiveFinding }) => {
  const [newComment, setNewComment] = useState('');
  const comments = finding.comments || [];

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-sm font-semibold text-gray-900 mb-3">Müzakere Yorumları</h3>
        <div className="space-y-4 mb-6">
          {comments.length > 0 ? (
            comments.map((comment) => (
              <div key={comment.id} className="border-l-2 border-blue-200 pl-4">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-medium text-gray-900">{comment.author_name}</span>
                    <span
                      className={clsx(
                        'px-2 py-0.5 rounded text-xs font-medium',
                        comment.author_role === 'AUDITOR'
                          ? 'bg-blue-100 text-blue-700'
                          : 'bg-green-100 text-green-700'
                      )}
                    >
                      {comment.author_role === 'AUDITOR' ? 'Müfettiş' : 'Denetlenen'}
                    </span>
                  </div>
                  <span className="text-xs text-gray-500">
                    {new Date(comment.created_at).toLocaleDateString('tr-TR')}
                  </span>
                </div>
                <p className="text-sm text-gray-700">{comment.comment_text}</p>
              </div>
            ))
          ) : (
            <div className="text-center py-8">
              <MessageSquare className="w-12 h-12 text-gray-400 mx-auto mb-3" />
              <p className="text-sm text-gray-500">Henüz yorum eklenmedi</p>
            </div>
          )}
        </div>

        {/* New Comment */}
        <div>
          <textarea
            value={newComment}
            onChange={(e) => setNewComment(e.target.value)}
            placeholder="Yorum ekle..."
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none bg-white text-sm"
            rows={4}
          />
          <button className="mt-3 w-full px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium flex items-center justify-center gap-2">
            <MessageSquare className="w-4 h-4" />
            Yorum Gönder
          </button>
        </div>
      </div>
    </div>
  );
};
