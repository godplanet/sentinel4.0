import { useNavigate } from 'react-router-dom';
import { SearchX, Home, ArrowLeft } from 'lucide-react';

export default function NotFoundPage() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 flex items-center justify-center p-6">
      <div className="text-center max-w-2xl">
        <div className="mb-8">
          <div className="relative inline-block">
            <div className="absolute inset-0 bg-slate-200 rounded-full blur-3xl opacity-50" />
            <div className="relative bg-white/60 backdrop-blur-xl border-2 border-white/40 rounded-full p-8 shadow-2xl">
              <SearchX className="text-slate-400" size={80} />
            </div>
          </div>
        </div>

        <h1 className="text-8xl font-black text-slate-900 mb-4">404</h1>
        <h2 className="text-3xl font-bold text-slate-800 mb-3">Sayfa Bulunamadı</h2>
        <p className="text-slate-600 text-lg mb-8 leading-relaxed">
          Aradığınız sayfa taşınmış, silinmiş veya hiç var olmamış olabilir.
          <br />
          Lütfen URL'yi kontrol edin veya ana sayfaya dönün.
        </p>

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
            Yardıma mı ihtiyacınız var?{' '}
            <button className="text-blue-600 hover:text-blue-700 font-semibold transition-colors">
              Destek ekibiyle iletişime geçin
            </button>
          </p>
        </div>
      </div>
    </div>
  );
}
