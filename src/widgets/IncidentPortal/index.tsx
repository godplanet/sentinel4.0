import { useSubmitIncident, type CreateIncidentInput, type IncidentCategory } from '@/entities/incident';
import { motion } from 'framer-motion';
import {
 AlertCircle,
 CheckCircle2,
 Eye,
 EyeOff,
 Lock,
 Send,
 Shield,
} from 'lucide-react';
import { useState } from 'react';

const CATEGORIES: { value: IncidentCategory; label: string }[] = [
 { value: 'Dolandırıcılık', label: 'Dolandırıcılık' },
 { value: 'Etik', label: 'Etik İhlal' },
 { value: 'IT', label: 'Bilgi Teknolojileri' },
 { value: 'İK', label: 'İnsan Kaynakları' },
];

export function IncidentPortal() {
 const [title, setTitle] = useState('');
 const [description, setDescription] = useState('');
 const [category, setCategory] = useState<IncidentCategory>('Etik');
 const [isAnonymous, setIsAnonymous] = useState(true);
 const [error, setError] = useState<string | null>(null);
 const [trackingCode, setTrackingCode] = useState<string | null>(null);

 const submitMutation = useSubmitIncident();

 const isSubmitting = submitMutation.isPending;
 const isSuccess = submitMutation.isSuccess;


 const handleSubmit = async (e: React.FormEvent) => {
 e.preventDefault();
 setError(null);

 if (!title.trim() || !description.trim()) {
 setError('Lütfen tüm alanları doldurun');
 return;
 }

 const input: CreateIncidentInput = {
 title: title.trim(),
 description: description.trim(),
 category,
 is_anonymous: isAnonymous,
 };

 submitMutation.mutate(input, {
 onSuccess: (data) => {
 // Gerçek ID'yi tracking code olarak göster
 setTrackingCode((data as { id?: string })?.id?.substring(0, 12)?.toUpperCase() ?? 'REF-ALINDI');
 setTitle('');
 setDescription('');
 setCategory('Etik');
 setIsAnonymous(true);
 },
 onError: (err) => {
 console.error('Failed to submit incident:', err);
 setError('Bildirim gönderilirken bir hata oluştu. Lütfen tekrar deneyin.');
 },
 });
 };


 if (isSuccess) {
 return (
 <motion.div
 initial={{ opacity: 0, scale: 0.9 }}
 animate={{ opacity: 1, scale: 1 }}
 className="bg-surface rounded-2xl shadow-2xl p-5 max-w-2xl mx-auto text-center"
 data-testid="incident-success-screen"
 >
 <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
 <CheckCircle2 className="w-12 h-12 text-green-600" />
 </div>
 <h2 className="text-2xl font-bold text-primary mb-3">
 Bildiriminiz Alındı
 </h2>
 <p className="text-slate-600 mb-4">
 Güvenli bir şekilde kayıt altına alındı. Bildiriminiz en kısa sürede değerlendirilecektir.
 </p>
 <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
 <p className="text-sm text-blue-900">
 <strong>Referans No:</strong> {trackingCode ?? 'REF-ALINDI'}
 </p>
 <p className="text-xs text-blue-700 mt-2">
 Bu numarayı not alarak takip edebilirsiniz.
 </p>
 </div>
 </motion.div>
 );
 }

 return (
 <motion.div
 initial={{ opacity: 0, y: 20 }}
 animate={{ opacity: 1, y: 0 }}
 className="bg-surface rounded-2xl shadow-2xl overflow-hidden max-w-2xl mx-auto"
 >
 <div className="bg-gradient-to-r from-blue-600 to-blue-700 px-4 py-4">
 <div className="flex items-center gap-4">
 <div className="w-16 h-16 bg-surface/20 backdrop-blur-sm rounded-xl flex items-center justify-center">
 <Shield className="w-9 h-9 text-white" />
 </div>
 <div>
 <h1 className="text-2xl font-bold text-white mb-1">
 Güvenli Olay Bildirimi
 </h1>
 <p className="text-blue-100 text-sm">
 Gizli ve güvenli şekilde bildirim yapın
 </p>
 </div>
 </div>
 </div>

 <form onSubmit={handleSubmit} className="p-5 space-y-4">
 <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 flex items-start gap-3">
 <Lock className="w-5 h-5 text-blue-600 mt-0.5 flex-shrink-0" />
 <div className="text-sm text-blue-900">
 <p className="font-semibold mb-1">Gizliliğiniz Korunur</p>
 <p className="text-blue-700">
 Bildiriminiz şifrelenmiş olarak iletilir ve kimliğiniz gizli tutulur.
 </p>
 </div>
 </div>

 <div>
 <label className="block text-sm font-semibold text-slate-700 mb-2">
 Olay Başlığı
 </label>
 <input
 type="text"
 value={title}
 onChange={(e) => setTitle(e.target.value)}
 placeholder="Kısa ve öz bir başlık girin"
 className="w-full px-4 py-3 bg-surface border-2 border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors text-primary"
 required
 />
 </div>

 <div>
 <label className="block text-sm font-semibold text-slate-700 mb-2">
 Detaylı Açıklama
 </label>
 <textarea
 value={description}
 onChange={(e) => setDescription(e.target.value)}
 placeholder="Olayı detaylı bir şekilde açıklayın. Ne gördünüz? Ne zaman gerçekleşti? Kim dahil?"
 rows={6}
 className="w-full px-4 py-3 bg-surface border-2 border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors resize-none text-primary"
 required
 />
 <p className="text-xs text-slate-500 mt-2">
 En az 50 karakter giriniz
 </p>
 </div>

 <div>
 <label className="block text-sm font-semibold text-slate-700 mb-2">
 Kategori
 </label>
 <select
 value={category}
 onChange={(e) => setCategory(e.target.value as IncidentCategory)}
 className="w-full px-4 py-3 bg-surface border-2 border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors text-primary"
 >
 {(CATEGORIES || []).map((cat) => (
 <option key={cat.value} value={cat.value}>
 {cat.label}
 </option>
 ))}
 </select>
 </div>

 <div className="bg-canvas border border-slate-200 rounded-lg p-4">
 <div className="flex items-center justify-between">
 <div className="flex items-center gap-3">
 {isAnonymous ? (
 <EyeOff className="w-5 h-5 text-slate-600" />
 ) : (
 <Eye className="w-5 h-5 text-slate-600" />
 )}
 <div>
 <p className="font-semibold text-primary">
 {isAnonymous ? 'Anonim Bildirim' : 'Kimliğimle Bildir'}
 </p>
 <p className="text-sm text-slate-600">
 {isAnonymous
 ? 'Kimliğiniz gizli tutulacak'
 : 'Kimliğiniz kaydedilecek'}
 </p>
 </div>
 </div>
 <button
 type="button"
 onClick={() => setIsAnonymous(!isAnonymous)}
 className={`relative inline-flex h-8 w-14 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 ${
 isAnonymous ? 'bg-blue-600' : 'bg-slate-300'
 }`}
 >
 <span
 className={`inline-block h-6 w-6 transform rounded-full bg-surface transition-transform ${
 isAnonymous ? 'translate-x-7' : 'translate-x-1'
 }`}
 />
 </button>
 </div>
 </div>

 {error && (
 <motion.div
 initial={{ opacity: 0, y: -10 }}
 animate={{ opacity: 1, y: 0 }}
 className="bg-red-50 border border-red-200 rounded-lg p-4 flex items-center gap-3"
 >
 <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0" />
 <p className="text-sm text-red-900">{error}</p>
 </motion.div>
 )}

 <button
 type="submit"
 disabled={isSubmitting}
 className="w-full flex items-center justify-center gap-3 px-4 py-4 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-lg hover:from-blue-700 hover:to-blue-800 disabled:from-slate-400 disabled:to-slate-500 disabled:cursor-not-allowed transition-all font-semibold text-lg shadow-lg hover:shadow-xl"
 >
 {isSubmitting ? (
 <>
 <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
 Gönderiliyor...
 </>
 ) : (
 <>
 <Send className="w-5 h-5" />
 Güvenli Gönder
 </>
 )}
 </button>

 <div className="text-center">
 <p className="text-xs text-slate-500">
 Gönderdiğiniz bilgiler şifrelenmiş olarak kaydedilir ve
 <br />
 sadece yetkili kişiler tarafından görüntülenebilir.
 </p>
 </div>
 </form>
 </motion.div>
 );
}
