import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Brain, Lock, Mail, ArrowRight, Shield, CheckCircle, XCircle } from 'lucide-react';

const MOCK_CREDENTIALS = {
  email: 'admin@sentinel.com',
  password: '123456',
};

const MOCK_USER = {
  id: 'mock-user-1',
  name: 'Hakan Yılmaz',
  email: 'admin@sentinel.com',
  role: 'CAE',
  title: 'Chief Audit Executive',
};

export default function LoginPage() {
  const navigate = useNavigate();
  const [email, setEmail] = useState(MOCK_CREDENTIALS.email);
  const [password, setPassword] = useState(MOCK_CREDENTIALS.password);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess(false);

    setTimeout(() => {
      if (email === MOCK_CREDENTIALS.email && password === MOCK_CREDENTIALS.password) {
        localStorage.setItem('sentinel_token', 'mock-token-123');
        localStorage.setItem('sentinel_user', JSON.stringify(MOCK_USER));
        localStorage.setItem('isAuthenticated', 'true');

        setSuccess(true);

        setTimeout(() => {
          navigate('/dashboard');
        }, 500);
      } else {
        setError('E-posta veya şifre hatalı');
        setLoading(false);
      }
    }, 800);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 relative overflow-hidden">
      <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAwIiBoZWlnaHQ9IjIwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZGVmcz48cGF0dGVybiBpZD0iZ3JpZCIgd2lkdGg9IjQwIiBoZWlnaHQ9IjQwIiBwYXR0ZXJuVW5pdHM9InVzZXJTcGFjZU9uVXNlIj48cGF0aCBkPSJNIDQwIDAgTCAwIDAgMCA0MCIgZmlsbD0ibm9uZSIgc3Ryb2tlPSJyZ2JhKDI1NSwgMjU1LCAyNTUsIDAuMDMpIiBzdHJva2Utd2lkdGg9IjEiLz48L3BhdHRlcm4+PC9kZWZzPjxyZWN0IHdpZHRoPSIxMDAlIiBoZWlnaHQ9IjEwMCUiIGZpbGw9InVybCgjZ3JpZCkiLz48L3N2Zz4=')] opacity-30" />

      <div className="absolute top-0 left-0 w-96 h-96 bg-blue-600/20 rounded-full blur-3xl" />
      <div className="absolute bottom-0 right-0 w-96 h-96 bg-purple-600/20 rounded-full blur-3xl" />

      <div className="relative z-10 flex items-center justify-center min-h-screen p-6">
        <div className="w-full max-w-md">
          <div className="text-center mb-8">
            <div className="flex items-center justify-center mb-6">
              <div className="relative">
                <div className="absolute inset-0 bg-gradient-to-br from-blue-400 to-purple-600 rounded-2xl blur-2xl opacity-50 animate-pulse" />
                <div className="relative bg-gradient-to-br from-blue-500 to-purple-600 p-4 rounded-2xl shadow-2xl">
                  <Shield className="text-white" size={48} />
                </div>
              </div>
            </div>

            <h1 className="text-4xl font-black text-white mb-2 tracking-tight">
              SENTINEL v3.0
            </h1>
            <p className="text-slate-300 text-lg font-medium">
              Banking GRC Platform
            </p>
            <div className="flex items-center justify-center gap-2 mt-3">
              <Brain className="text-blue-400" size={16} />
              <span className="text-xs text-slate-400 uppercase tracking-wider font-bold">
                AI-Native Banking OS
              </span>
            </div>
          </div>

          <div className="bg-white/10 backdrop-blur-xl border-2 border-white/20 rounded-2xl p-8 shadow-2xl">
            <div className="mb-6">
              <h2 className="text-2xl font-bold text-white mb-1">Hoş Geldiniz</h2>
              <p className="text-slate-300 text-sm">Devam etmek için giriş yapın</p>
            </div>

            <form onSubmit={handleLogin} className="space-y-5">
              {error && (
                <div className="flex items-center gap-2 p-3 bg-red-500/20 border border-red-500/30 rounded-lg text-red-200">
                  <XCircle size={18} />
                  <span className="text-sm font-medium">{error}</span>
                </div>
              )}

              {success && (
                <div className="flex items-center gap-2 p-3 bg-green-500/20 border border-green-500/30 rounded-lg text-green-200">
                  <CheckCircle size={18} />
                  <span className="text-sm font-medium">Giriş başarılı! Yönlendiriliyorsunuz...</span>
                </div>
              )}

              <div className="p-3 bg-blue-500/20 border border-blue-500/30 rounded-lg">
                <p className="text-xs text-blue-200 font-medium">
                  <span className="font-bold">Demo Hesap:</span> {MOCK_CREDENTIALS.email} / {MOCK_CREDENTIALS.password}
                </p>
              </div>

              <div>
                <label className="block text-sm font-semibold text-white mb-2">
                  E-posta
                </label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="ornek@banka.com"
                    className="w-full pl-11 pr-4 py-3 bg-white/90 border border-slate-200 rounded-xl text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
                    required
                    disabled={loading || success}
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold text-white mb-2">
                  Şifre
                </label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                  <input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full pl-11 pr-4 py-3 bg-white/90 border border-slate-200 rounded-xl text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
                    required
                    disabled={loading || success}
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={loading || success}
                className="w-full relative overflow-hidden bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 text-white font-bold py-3.5 rounded-xl shadow-lg hover:shadow-2xl transition-all hover:scale-[1.02] disabled:opacity-50 disabled:cursor-not-allowed group"
              >
                <div className="absolute inset-0 bg-gradient-to-r from-blue-400 via-purple-500 to-pink-500 opacity-0 group-hover:opacity-100 transition-opacity" />
                <div className="relative flex items-center justify-center gap-2">
                  {loading ? (
                    <>
                      <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      <span>Giriş yapılıyor...</span>
                    </>
                  ) : success ? (
                    <>
                      <CheckCircle size={20} />
                      <span>Başarılı!</span>
                    </>
                  ) : (
                    <>
                      <span>Giriş Yap</span>
                      <ArrowRight size={20} />
                    </>
                  )}
                </div>
              </button>
            </form>

            <div className="mt-6 pt-6 border-t border-white/10">
              <p className="text-center text-xs text-slate-400">
                Şifrenizi mi unuttunuz?{' '}
                <button className="text-blue-400 hover:text-blue-300 font-semibold transition-colors">
                  Sıfırla
                </button>
              </p>
            </div>
          </div>

          <div className="mt-6 text-center">
            <p className="text-xs text-slate-500">
              Sentinel v3.0 - Cognitive Banking Audit Platform
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
