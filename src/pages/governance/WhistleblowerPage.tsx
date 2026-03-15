import { useIncidentStats, useIncidents } from '@/entities/incident';
import { PageHeader } from '@/shared/ui';
import { IncidentPortal } from '@/widgets/IncidentPortal';
import { AlertTriangle, CheckCircle, Clock, Lock, Phone, Shield } from 'lucide-react';

// Durum renk/ikon eşleme
const STATUS_MAP: Record<string, { label: string; color: string }> = {
 NEW: { label: 'Yeni', color: 'blue' },
 INVESTIGATING:{ label: 'İnceleniyor', color: 'amber' },
 RESOLVED: { label: 'Çözüldü', color: 'green' },
 CLOSED: { label: 'Kapatıldı', color: 'slate' },
};

const CATEGORY_MAP: Record<string, string> = {
 'Dolandırıcılık': '🚨',
 'Etik': '⚖️',
 'IT': '💻',
 'İK': '👥',
};

export default function WhistleblowerPage() {
 // ── Canlı Supabase verileri ──────────────────────────────────
 const { data: stats, isLoading: statsLoading } = useIncidentStats();
 const { data: incidents } = useIncidents();

 // Defensive değerler
 const total = stats?.total ?? 0;
 const open = stats?.open ?? 0;
 const closed = stats?.closed ?? 0;
 const anonymous = stats?.anonymous ?? 0;

 const statCards = [
 { label: 'Toplam İhbar', value: statsLoading ? '—' : String(total), icon: AlertTriangle, color: 'blue' },
 { label: 'Açık İhbarlar', value: statsLoading ? '—' : String(open), icon: Clock, color: 'red' },
 { label: 'Kapalı', value: statsLoading ? '—' : String(closed), icon: CheckCircle, color: 'green' },
 { label: 'Anonim', value: statsLoading ? '—' : String(anonymous), icon: Lock, color: 'purple' },
 ];

 return (
 <div className="p-5 space-y-4">
 <PageHeader
 title="İhbar Hattı (Voice)"
 description="Etik ihlaller ve uygunsuzluklar için gizli bildirim kanalı"
 subtitle="MODÜL 3: YÖNETİŞİM & ETİK"
 />

 {/* AI Banner */}
 <div className="bg-gradient-to-br from-red-50 to-orange-50 border border-red-200 rounded-xl p-4 shadow-sm">
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

 {/* Canlı İstatistik Kartları */}
 <div className="grid md:grid-cols-4 gap-4">
 {(statCards || []).map((stat, i) => (
 <div
 key={i}
 className="bg-surface rounded-xl border border-slate-200 shadow-sm p-4"
 data-testid="incident-stats-card"
 >
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

 {/* İhbar Formu */}
 <div className="bg-surface rounded-xl border border-slate-200 shadow-sm">
 <div className="p-4 border-b border-slate-200">
 <h2 className="text-lg font-bold text-slate-800 flex items-center gap-2">
 <Shield size={20} className="text-red-600" />
 İhbar Yönetim Sistemi
 </h2>
 <p className="text-sm text-slate-600 mt-1">
 Tüm ihbarlar şifrelenmiş ve anonim olarak saklanır
 </p>
 </div>
 <div className="p-4">
 <IncidentPortal />
 </div>
 </div>

 {/* Açık Olaylar Listesi (CAE / Yönetim Görünümü) */}
 {(incidents?.length ?? 0) > 0 && (
 <div className="bg-surface rounded-xl border border-slate-200 shadow-sm" data-testid="incident-list">
 <div className="p-4 border-b border-slate-200">
 <h2 className="text-lg font-bold text-slate-800 flex items-center gap-2">
 <AlertTriangle size={20} className="text-amber-500" />
 Açık Olaylar
 <span className="ml-auto text-sm font-normal text-slate-500">
 {(incidents || []).filter(i => i.status === 'NEW' || i.status === 'INVESTIGATING').length} kayıt
 </span>
 </h2>
 </div>
 <div className="divide-y divide-slate-100">
 {(incidents || []).map((incident) => {
 const status = STATUS_MAP[incident?.status ?? 'NEW'] ?? { label: incident?.status ?? '-', color: 'slate' };
 const emoji = CATEGORY_MAP[incident?.category ?? ''] ?? '📋';
 return (
 <div key={incident.id} className="px-4 py-4 flex items-center gap-4 hover:bg-canvas transition-colors">
 <span className="text-xl">{emoji}</span>
 <div className="flex-1 min-w-0">
 <p className="text-sm font-semibold text-slate-800 truncate">{incident?.title ?? '-'}</p>
 <p className="text-xs text-slate-500 mt-0.5">
 {incident?.category ?? '-'} · {incident?.is_anonymous ? '🔒 Anonim' : '👤 Kimlikli'} ·{' '}
 {incident?.created_at ? new Date(incident.created_at).toLocaleDateString('tr-TR') : '-'}
 </p>
 </div>
 <span className={`px-2.5 py-1 rounded-full text-xs font-semibold bg-${status.color}-100 text-${status.color}-700`}>
 {status.label}
 </span>
 </div>
 );
 })}
 </div>
 </div>
 )}

 {/* Alt Bilgi Kartları */}
 <div className="grid lg:grid-cols-3 gap-4">
 <div className="bg-surface rounded-xl border border-slate-200 shadow-sm p-4">
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
 {['256-bit AES şifreleme', 'Anonim kimlik sistemi', 'Misilleme koruması'].map((item) => (
 <div key={item} className="flex items-center gap-2">
 <div className="w-1.5 h-1.5 rounded-full bg-green-600" />
 {item}
 </div>
 ))}
 </div>
 </div>

 <div className="bg-surface rounded-xl border border-slate-200 shadow-sm p-4">
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
 <div key={i} className="p-2 bg-canvas rounded-lg text-slate-700">
 {category}
 </div>
 ))}
 </div>
 </div>

 <div className="bg-surface rounded-xl border border-slate-200 shadow-sm p-4">
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
