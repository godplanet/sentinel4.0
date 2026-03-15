import { usePersonaStore, type PersonaRole } from '@/entities/user/model/persona-store';
import { useUserProfiles } from '@/features/auth/api';
import { useChatStore } from '@/features/ai-agents/model/chat-store';
import { useUIStore } from '@/shared/stores/ui-store';
import { LanguageSwitcher } from '@/shared/ui';
import clsx from 'clsx';
import {
  Bell, Brain, Building, Calculator, CheckCircle,
  Eye, LogOut, Menu, Package, Shield,
  Sparkles, User, UserCog,
} from 'lucide-react';
import { useState } from 'react';
import toast from 'react-hot-toast';
import { useNavigate } from 'react-router-dom';

function getInitials(name: string): string {
  return name.split(' ').slice(0, 2).map((n) => n[0]).join('').toUpperCase();
}

const getPersonaIcon = (role: PersonaRole) => {
  switch (role) {
    case 'CAE': return Shield;
    case 'AUDITOR': return UserCog;
    case 'EXECUTIVE': return Eye;
    case 'AUDITEE': return Building;
    case 'SUPPLIER': return Package;
    default: return User;
  }
};

const getPersonaColor = (role: PersonaRole) => {
  switch (role) {
    case 'CAE': return 'text-purple-400';
    case 'AUDITOR': return 'text-blue-400';
    case 'EXECUTIVE': return 'text-amber-400';
    case 'AUDITEE': return 'text-green-400';
    case 'SUPPLIER': return 'text-orange-400';
    default: return 'text-slate-400';
  }
};

export const Header = () => {
  const { toggleSidebar, toggleCmdBar } = useUIStore();
  const { currentPersona, setPersona, getCurrentPersonaConfig, activeProfile } = usePersonaStore();
  const { chatOpen, setChatOpen } = useChatStore();
  const { data: profiles = [], isLoading: isLoadingProfiles } = useUserProfiles();
  const navigate = useNavigate();

  const [aiMode, setAiMode] = useState<'reasoning' | 'math'>('reasoning');
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [showPersonaMenu, setShowPersonaMenu] = useState(false);

  void currentPersona;

  const persona = getCurrentPersonaConfig();
  const displayName = persona.name;
  const displayTitle = persona.title;
  const initials = getInitials(persona.name);

  return (
    <header className="sticky top-0 z-50 w-full border-b border-slate-200 bg-surface/95 backdrop-blur-xl h-13 print:hidden">
      <div className="flex h-full items-center px-3 gap-2">

        <button
          onClick={toggleSidebar}
          className="p-2 rounded-lg hover:bg-slate-100 text-slate-500 transition-colors shrink-0"
        >
          <Menu size={18} />
        </button>

        <div className="flex-1 max-w-2xl mx-auto">
          <button
            onClick={toggleCmdBar}
            className="w-full flex items-center bg-canvas border border-slate-200 rounded-xl hover:bg-surface hover:border-slate-300 hover:shadow-sm transition-all"
          >
            <div className="pl-3 pr-2 text-slate-400">
              {aiMode === 'reasoning' ? <Brain size={16} /> : <Calculator size={16} />}
            </div>
            <span className="flex-1 h-9 flex items-center text-[13px] text-slate-400 text-left truncate">
              {aiMode === 'reasoning'
                ? "Sentinel'e stratejik bir risk sorusu sor..."
                : "Finansal etki analizi veya formül gir..."}
            </span>
            <kbd className="hidden lg:flex items-center text-[10px] font-mono text-slate-400 px-1.5 py-0.5 rounded border border-slate-200 bg-surface mr-2">
              ⌘K
            </kbd>
            <div className="flex items-center gap-0.5 bg-surface border border-slate-200 rounded-lg p-0.5 mr-1.5 shrink-0">
              <div
                onClick={(e) => { e.stopPropagation(); setAiMode('reasoning'); }}
                className={clsx(
                  'flex items-center gap-1 px-2.5 py-1 rounded-md text-[11px] font-bold transition-all cursor-pointer',
                  aiMode === 'reasoning' ? 'bg-blue-600 text-white shadow-sm' : 'text-slate-500 hover:text-blue-600'
                )}
              >
                <Brain size={12} />
                <span className="hidden xl:inline">Analiz</span>
              </div>
              <div
                onClick={(e) => { e.stopPropagation(); setAiMode('math'); }}
                className={clsx(
                  'flex items-center gap-1 px-2.5 py-1 rounded-md text-[11px] font-bold transition-all cursor-pointer',
                  aiMode === 'math' ? 'bg-emerald-600 text-white shadow-sm' : 'text-slate-500 hover:text-emerald-600'
                )}
              >
                <Calculator size={12} />
                <span className="hidden xl:inline">Hesapla</span>
              </div>
            </div>
          </button>
        </div>

        <div className="flex items-center gap-1 shrink-0">

          {/* Sentinel Asistan */}
          <button
            onClick={() => setChatOpen(!chatOpen)}
            className={clsx(
              'relative overflow-hidden flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg transition-all group shrink-0',
              'bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600',
              'shadow-[0_0_12px_rgba(124,58,237,0.4)] hover:shadow-[0_0_18px_rgba(124,58,237,0.6)]'
            )}
            title="Sentinel Asistan"
          >
            <div className="absolute inset-0 bg-gradient-to-r from-blue-400 via-purple-500 to-pink-500 opacity-0 group-hover:opacity-100 transition-opacity" />
            <Brain className="relative text-white" size={13} />
            <span className="relative text-[11px] font-black text-white tracking-tight hidden sm:inline">Asistan</span>
            <Sparkles size={11} className="relative text-yellow-300 animate-pulse hidden sm:block" />
          </button>

          <LanguageSwitcher />

          <button
            className="p-1.5 rounded-lg hover:bg-slate-100 text-slate-500 hover:text-slate-700 transition-colors relative"
            title="Bildirimler"
          >
            <Bell size={16} />
            <span className="absolute top-1 right-1 w-1.5 h-1.5 bg-rose-500 rounded-full" />
          </button>

          <div className="h-5 w-px bg-slate-200 mx-1" />

          {/* Kullanici profil + dropdown */}
          <div className="relative">
            {showPersonaMenu && (
              <>
                <div className="fixed inset-0 z-40" onClick={() => setShowPersonaMenu(false)} />
                <div className="absolute right-0 top-full mt-2 w-64 z-50 bg-slate-800 border border-white/20 rounded-lg shadow-2xl overflow-hidden max-h-96 overflow-y-auto">
                  <div className="px-4 py-2 bg-surface/5 border-b border-white/10">
                    <div className="text-xs font-bold text-white uppercase tracking-wider">Rol Simülasyonu</div>
                  </div>
                  {profiles.length === 0 && isLoadingProfiles ? (
                    <div className="px-4 py-5 text-sm text-slate-400 text-center animate-pulse">Profiller yükleniyor...</div>
                  ) : profiles.length === 0 ? (
                    <div className="px-4 py-5 text-sm text-red-400 text-center">
                      <div className="font-semibold mb-1">Profil Bulunamadı</div>
                    </div>
                  ) : (profiles || []).map((profile) => {
                    let mappedRole: PersonaRole = 'AUDITOR';
                    if (profile.role === 'admin' || profile.role === 'cae') mappedRole = 'CAE';
                    else if (profile.role === 'auditor') mappedRole = 'AUDITOR';
                    else if (profile.role === 'executive' || profile.role === 'gmy') mappedRole = 'EXECUTIVE';
                    else if (profile.role === 'auditee') mappedRole = 'AUDITEE';
                    else if (profile.role === 'guest' || profile.role === 'vendor' || profile.role === 'supplier') mappedRole = 'SUPPLIER';

                    const RoleIcon = getPersonaIcon(mappedRole);
                    const isActive = activeProfile ? activeProfile.id === profile.id : currentPersona === mappedRole;

                    return (
                      <button
                        key={profile.id}
                        onClick={() => {
                          const targetRoute = mappedRole === 'AUDITEE' ? '/auditee' : '/dashboard';
                          navigate(targetRoute, { replace: true });
                          setTimeout(() => {
                            setPersona(mappedRole, profile);
                            toast.success(`Aktif Rol Değiştirildi: ${profile.full_name} - ${profile.title}`);
                          }, 50);
                          setShowPersonaMenu(false);
                          setShowUserMenu(false);
                        }}
                        className={clsx(
                          'w-full flex items-center gap-3 px-4 py-3 text-left text-sm transition-colors',
                          isActive
                            ? 'bg-blue-500/20 text-blue-300 border-l-4 border-blue-500'
                            : 'text-white hover:bg-surface/10'
                        )}
                      >
                        <RoleIcon size={18} className={getPersonaColor(mappedRole)} />
                        <div className="flex-1 overflow-hidden">
                          <div className="font-semibold truncate">{profile.full_name}</div>
                          <div className="text-xs opacity-70 truncate">{profile.title}</div>
                        </div>
                        {isActive && <CheckCircle className="text-blue-500 shrink-0" size={16} />}
                      </button>
                    );
                  })}
                </div>
              </>
            )}

            {showUserMenu && (
              <>
                <div className="fixed inset-0 z-40" onClick={() => setShowUserMenu(false)} />
                <div className="absolute right-0 top-full mt-2 w-48 z-50 bg-slate-800 border border-white/20 rounded-lg shadow-2xl overflow-hidden">
                  <button
                    onClick={() => { navigate('/resources/profiles'); setShowUserMenu(false); }}
                    className="w-full flex items-center gap-3 px-4 py-3 text-left text-sm text-white hover:bg-surface/10 transition-colors"
                  >
                    <User size={16} />
                    <span>Profilim</span>
                  </button>
                  <div className="border-t border-white/10" />
                  <button
                    onClick={() => { setShowPersonaMenu(true); setShowUserMenu(false); }}
                    className="w-full flex items-center gap-3 px-4 py-3 text-left text-sm text-purple-300 hover:bg-purple-500/10 transition-colors"
                  >
                    <UserCog size={16} />
                    <span>Rol Değiştir</span>
                  </button>
                  <div className="border-t border-white/10" />
                  <button
                    onClick={() => {
                      localStorage.removeItem('sentinel_user');
                      navigate('/login');
                      setShowUserMenu(false);
                    }}
                    className="w-full flex items-center gap-3 px-4 py-3 text-left text-sm text-red-400 hover:bg-red-500/10 transition-colors"
                  >
                    <LogOut size={16} />
                    <span>Çıkış Yap</span>
                  </button>
                </div>
              </>
            )}

            <button
              onClick={() => setShowUserMenu(!showUserMenu)}
              className="flex items-center gap-2 px-1 py-1 rounded-lg hover:bg-slate-100 transition-colors"
            >
              <div className="hidden md:flex flex-col items-end">
                <span className="text-[11px] font-bold text-slate-800 leading-tight">{displayName}</span>
                <span className="text-[9px] text-slate-500 leading-tight">{displayTitle}</span>
              </div>
              <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-400 to-purple-500 flex items-center justify-center shadow-sm hover:shadow-md transition-shadow">
                <span className="text-[10px] font-bold text-white">{initials}</span>
              </div>
            </button>
          </div>

        </div>
      </div>
    </header>
  );
};
