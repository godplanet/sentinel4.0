import { useNavigate } from 'react-router-dom';
import { ShieldX, Home, ArrowLeft, Lock } from 'lucide-react';

export default function AccessDeniedPage() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gradient-to-br from-red-50 to-slate-100 flex items-center justify-center p-6">
      <div className="text-center max-w-2xl">
        <div className="mb-8">
          <div className="relative inline-block">
            <div className="absolute inset-0 bg-red-200 rounded-full blur-3xl opacity-50 animate-pulse" />
            <div className="relative bg-white/60 backdrop-blur-xl border-2 border-red-200/60 rounded-full p-8 shadow-2xl">
              <ShieldX className="text-red-500" size={80} />
            </div>
          </div>
        </div>

        <h1 className="text-8xl font-black text-red-600 mb-4">403</h1>
        <h2 className="text-3xl font-bold text-slate-800 mb-3">Yetkisiz Erişim</h2>
        <p className="text-slate-600 text-lg mb-8 leading-relaxed">
          Bu sayfaya erişim yetkiniz bulunmamaktadır.
          <br />
          Bu kaynağa erişim için yöneticinizle iletişime geçin.
        </p>

        <div className="bg-red-50 border-2 border-red-200 rounded-xl p-6 mb-8">
          <div className="flex items-start gap-3">
            <Lock className="text-red-600 flex-shrink-0 mt-1" size={20} />
            <div className="text-left">
              <h3 className="text-sm font-bold text-red-900 mb-1">Kısıtlı Alan</h3>
              <p className="text-sm text-red-700">
                Bu modül sadece yetkili kullanıcılar için erişilebilir. Erişim için Chief Audit Executive veya Sistem Yöneticisi ile iletişime geçin.
              </p>
            </div>
          </div>
        </div>

        <div className="flex items-center justify-center gap-4">
          <button
            onClick={() => navigate(-1)}
            className="flex items-center gap-2 px-6 py-3 bg-white border-2 border-slate-200 text-slate-700 font-semibold rounded-xl hover:border-slate-300 hover:shadow-lg transition-all hover:scale-105"
          >
            <ArrowLeft size={20} />
            <span>Geri Dön</span>
          </button>

          <button
            onClick={() => navigate('/dashboard')}
            className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white font-semibold rounded-xl hover:shadow-2xl transition-all hover:scale-105"
          >
            <Home size={20} />
            <span>Dashboard'a Dön</span>
          </button>
        </div>

        <div className="mt-12 pt-8 border-t border-slate-200">
          <p className="text-sm text-slate-500">
            Yetki talebi için{' '}
            <button className="text-blue-600 hover:text-blue-700 font-semibold transition-colors">
              İstek Oluştur
            </button>
          </p>
        </div>
      </div>
    </div>
  );
}
