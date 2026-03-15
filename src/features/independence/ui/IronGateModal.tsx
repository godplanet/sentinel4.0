import { useDeclarationStatus, useSignDeclaration } from '@/entities/independence/model/queries';
import { supabase } from '@/shared/api/supabase';
import type { User } from '@supabase/supabase-js';
import { ArrowRight, CheckCircle2, FileSignature, Lock, Shield } from 'lucide-react';
import { useEffect, useState } from 'react';
import toast from 'react-hot-toast';

interface IronGateModalProps {
 engagementId: string;
 onSuccess?: () => void;
 onGateCleared?: (engagementId: string) => void;
 onClose?: () => void;
 engagementTitle?: string;
 userId?: string;
}

export function IronGateModal({ engagementId, engagementTitle, onSuccess, onGateCleared, onClose }: IronGateModalProps) {
 const [isChecked, setIsChecked] = useState(false);
 const signDeclaration = useSignDeclaration();
 const { data: declaration } = useDeclarationStatus(engagementId);
 const [user, setUser] = useState<User | null>(null);

 useEffect(() => {
 const userStr = localStorage.getItem('sentinel_user');
 if (userStr) {
 try {
 const parsedUser = JSON.parse(userStr);
 setUser({ id: parsedUser.id, user_metadata: { full_name: parsedUser.name } } as unknown as User);
 } catch (e) {
 console.error(e);
 }
 } else {
 supabase.auth.getUser().then(({ data }) => {
 if (data.user) setUser(data.user);
 });
 }
 }, []);

 const handleSign = async () => {
 console.log('BROWSER CONSOLE: handleSign called. isChecked:', isChecked);
 if (!isChecked) {
 toast.error('Lütfen çıkar çatışmanız olmadığını beyan eden kutucuğu işaretleyin.', {
 style: {
 background: '#ef4444',
 color: '#fff',
 fontWeight: 600,
 },
 });
 return;
 }

 try {
 const declarationText = "GIAS 2025 Standart 2.1 uyarınca, denetlenen birimle hiçbir finansal, kişisel veya mesleki çıkar çatışmam bulunmamaktadır.";
 
 console.log('BROWSER CONSOLE: calling mutateAsync', { engagementId, declarationText });
 await signDeclaration.mutateAsync({
 engagementId,
 declarationText
 });
 console.log('BROWSER CONSOLE: mutateAsync resolved');
 
 toast.success('Bağımsızlık beyanınız başarıyla mühürlendi.', {
 icon: '🛡️',
 style: {
 background: '#047857',
 color: '#fff',
 fontWeight: 600,
 },
 });
 console.log('BROWSER CONSOLE: calling onClose()');
 if (onSuccess) onSuccess();
 if (onGateCleared) onGateCleared(engagementId);
 if (onClose) onClose();
 } catch (error: any) {
 console.error('BROWSER CONSOLE: [SENTINEL] Gate sign error:', error);
 toast.error('Beyan işlemi sırasında güvenli bağlantı hatası oluştu. Lütfen sistem yöneticinizle görüşün.', {
 style: {
 background: '#ef4444',
 color: '#fff',
 fontWeight: 600,
 },
 });
 }
 };

 return (
 <div className="fixed inset-0 z-[200] flex items-center justify-center p-4">
 {/* Absolute Backdrop Cam Efekti: %100 Light Mode, bg-white/80, backdrop-blur-xl */}
 <div className="absolute inset-0 bg-white/80 backdrop-blur-xl" />

 {/* C-Level Adli Sözleşme Modal İçeriği */}
 <div className="relative w-full max-w-2xl bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden isolate transform transition-all">
 {/* Dekoratif Yaldızlı/Bordo Rozet Üst Çizgi */}
 <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-red-800 via-rose-700 to-amber-500" />
 
 {/* Heraldic Badge / Rozet Tasarımı */}
 <div className="px-4 pt-10 pb-4 border-b border-slate-100 bg-slate-50/50 relative overflow-hidden">
 {/* Arka plan silüeti */}
 <div className="absolute right-0 top-0 opacity-5 pointer-events-none transform translate-x-1/3 -translate-y-1/4">
 <Shield size={240} />
 </div>

 <div className="flex items-center gap-4 mb-4 relative z-10">
 <div className="w-16 h-16 rounded-xl bg-gradient-to-br from-red-900 to-rose-800 p-0.5 shadow-lg flex-shrink-0">
 <div className="w-full h-full bg-white rounded-[10px] flex items-center justify-center">
 <Lock className="w-8 h-8 text-rose-800" />
 </div>
 </div>
 <div>
 <div className="flex items-center gap-2 mb-1">
 <span className="px-2 py-0.5 rounded text-[11px] font-bold uppercase tracking-widest bg-amber-100 text-amber-800 border border-amber-200">
 GIAS 2025 • STANDART 2.1
 </span>
 <span className="px-2 py-0.5 rounded text-[11px] font-bold uppercase tracking-widest bg-red-100 text-red-800 border border-red-200">
 ZORUNLU PROTOKOL
 </span>
 </div>
 <h2 className="text-2xl font-serif font-bold text-slate-900">
 Bağımsızlık ve Tarafsızlık Beyanı
 </h2>
 {engagementTitle && (
 <p className="text-sm font-medium text-slate-500 mt-1">{engagementTitle}</p>
 )}
 </div>
 </div>
 
 <p className="text-slate-600 text-[13px] leading-relaxed max-w-lg relative z-10 font-medium">
 Denetim görevine başlamadan önce, görevlendirildiğiniz alan/süreç ile ilgili bağımsızlığınızı tehlikeye atacak bir çıkar çatışması olmadığını yasal olarak beyan etmeniz gerekmektedir.
 </p>
 </div>

 {/* Adli Metin Alanı */}
 <div className="px-4 py-5 space-y-4 bg-white">
 <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 shadow-inner">
 <div className="flex items-start gap-4">
 <FileSignature className="w-6 h-6 text-slate-400 mt-1 flex-shrink-0" />
 <div className="space-y-4">
 <p className="text-[14px] text-slate-800 leading-relaxed font-serif text-justify">
 "Uluslararası İç Denetim Standartları (GIAS 2025) ve kurum içi etik kurallar çerçevesinde; bu denetim görevi kapsamındaki birimler, personeller veya incelenecek süreçler üzerinde herhangi bir doğrudan/dolaylı <strong>finansal menfaatim, kişisel veya mesleki çıkar çatışmam</strong> (akrabalık, eski yöneticilik, taraf olma vb.) bulunmadığını vicdani ve mesleki sorumlulukla beyan ederim."
 </p>
 <div className="pt-4 mt-2 border-t border-slate-200/60 text-[12px] text-slate-500 flex flex-col gap-1">
 <div className="flex items-center justify-between">
 <span>Müfettiş: <strong>{user?.user_metadata?.full_name || 'İsimsiz Müfettiş'}</strong></span>
 <span>Tarih: <strong>{new Date().toLocaleDateString('tr-TR')}</strong></span>
 </div>
 <div className="flex items-center justify-between">
 <span>Sicil / Kimlik: <strong>{user?.id?.slice(0, 8).toUpperCase() || 'BİLİNMİYOR'}</strong></span>
 <span>Durum: <strong className="text-amber-600 uppercase">{declaration?.signed_at ? 'MÜHÜRLENDİ' : 'EKSİK İMZA'}</strong></span>
 </div>
 </div>
 </div>
 </div>
 </div>

 <label className="flex items-start gap-3 p-4 rounded-xl border-2 cursor-pointer transition-all duration-200 hover:bg-slate-50 border-slate-200">
 <div className="flex items-center h-6">
 <input
 type="checkbox"
 checked={isChecked}
 onChange={(e) => setIsChecked(e.target.checked)}
 className="w-5 h-5 rounded border-slate-300 text-rose-700 focus:ring-rose-700 bg-white"
 />
 </div>
 <span className="text-[14px] font-medium text-slate-700 pt-0.5 select-none">
 Yukarıdaki metni okudum, anladım. Herhangi bir çıkar çatışmam <strong>yoktur</strong>.
 </span>
 </label>
 </div>

 {/* Footer Aksiyonları */}
 <div className="px-4 py-5 bg-slate-50 border-t border-slate-100 flex items-center justify-between">
 <div className="flex flex-col gap-1">
 <p className="text-[11px] text-slate-400 max-w-[280px] leading-tight font-medium">
 Mühür işlemi sistem loglarına IP adresiniz ve zaman damgası ile <strong className="text-slate-500">Değiştirilemez (Immutable)</strong> olarak kaydedilecektir.
 </p>
 {onClose && (
 <button onClick={onClose} className="text-[12px] text-slate-500 hover:text-slate-800 text-left font-medium w-fit mt-1">İptal Et</button>
 )}
 </div>
 
 <button
 onClick={handleSign}
 disabled={signDeclaration.isPending}
 className={`
 relative overflow-hidden group px-4 py-3 rounded-lg flex items-center gap-3 font-bold text-[13px] tracking-wide uppercase transition-all
 ${isChecked && !signDeclaration.isPending
 ? 'bg-rose-800 text-white shadow-md hover:bg-rose-900 hover:shadow-lg hover:-translate-y-0.5' 
 : 'bg-slate-200 text-slate-400 cursor-not-allowed'
 }
 `}
 >
 {signDeclaration.isPending ? (
 <span className="flex items-center gap-2">
 <Lock className="w-4 h-4 animate-pulse" /> Mühürleniyor...
 </span>
 ) : (
 <>
 <CheckCircle2 className={`w-5 h-5 ${isChecked ? 'text-amber-300' : 'text-slate-400'}`} />
 <span>Dijital Olarak Mühürle</span>
 <ArrowRight className={`w-4 h-4 transition-transform group-hover:translate-x-1 ${isChecked ? 'text-rose-300' : 'text-slate-400'}`} />
 </>
 )}
 </button>
 </div>
 </div>
 </div>
 );
}
