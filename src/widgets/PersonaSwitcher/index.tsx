import { useState } from 'react';
import { usePersonaStore, PERSONAS, type PersonaRole } from '@/entities/user/model/persona-store';
import { useNavigate } from 'react-router-dom';
import {
  Shield,
  UserCog,
  Eye,
  Building,
  Package,
  CheckCircle,
  ChevronDown,
  X,
} from 'lucide-react';
import clsx from 'clsx';

/**
 * PERSONA QUICK SWITCHER
 *
 * A floating widget that allows rapid persona switching for testing/demos.
 * Can be placed anywhere in the app for quick access.
 *
 * Usage:
 * <PersonaSwitcher />
 */

interface PersonaSwitcherProps {
  compact?: boolean;
  className?: string;
}

export const PersonaSwitcher = ({ compact = false, className }: PersonaSwitcherProps) => {
  const { currentPersona, setPersona, getCurrentPersonaConfig } = usePersonaStore();
  const navigate = useNavigate();
  const [isOpen, setIsOpen] = useState(false);

  const getPersonaIcon = (role: PersonaRole) => {
    switch (role) {
      case 'CAE': return Shield;
      case 'AUDITOR': return UserCog;
      case 'EXECUTIVE': return Eye;
      case 'AUDITEE': return Building;
      case 'SUPPLIER': return Package;
      default: return UserCog;
    }
  };

  const getPersonaColor = (role: PersonaRole) => {
    switch (role) {
      case 'CAE': return { bg: 'bg-purple-500', text: 'text-purple-400', ring: 'ring-purple-500' };
      case 'AUDITOR': return { bg: 'bg-blue-500', text: 'text-blue-400', ring: 'ring-blue-500' };
      case 'EXECUTIVE': return { bg: 'bg-amber-500', text: 'text-amber-400', ring: 'ring-amber-500' };
      case 'AUDITEE': return { bg: 'bg-green-500', text: 'text-green-400', ring: 'ring-green-500' };
      case 'SUPPLIER': return { bg: 'bg-orange-500', text: 'text-orange-400', ring: 'ring-orange-500' };
      default: return { bg: 'bg-slate-500', text: 'text-slate-400', ring: 'ring-slate-500' };
    }
  };

  const handlePersonaSwitch = (role: PersonaRole) => {
    setPersona(role);
    setIsOpen(false);
    navigate('/dashboard');
  };

  const currentConfig = getCurrentPersonaConfig();
  const Icon = getPersonaIcon(currentPersona);
  const colors = getPersonaColor(currentPersona);

  if (compact) {
    return (
      <div className={clsx('relative', className)}>
        <button
          onClick={() => setIsOpen(!isOpen)}
          className={clsx(
            'flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-all',
            colors.bg,
            'text-white hover:opacity-90'
          )}
        >
          <Icon size={16} />
          <span>{currentConfig.name.split(' ')[0]}</span>
          <ChevronDown size={14} className={clsx('transition-transform', isOpen && 'rotate-180')} />
        </button>

        {isOpen && (
          <>
            <div
              className="fixed inset-0 z-40"
              onClick={() => setIsOpen(false)}
            />
            <div className="absolute top-full right-0 mt-2 z-50 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg shadow-2xl overflow-hidden min-w-[280px]">
              <div className="px-4 py-2 bg-slate-50 dark:bg-slate-900 border-b border-slate-200 dark:border-slate-700">
                <div className="text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wider">
                  Rol Simülasyonu
                </div>
              </div>
              {(Object.keys(PERSONAS) as PersonaRole[]).map((role) => {
                const persona = PERSONAS[role];
                const RoleIcon = getPersonaIcon(role);
                const roleColors = getPersonaColor(role);
                const isActive = currentPersona === role;

                return (
                  <button
                    key={role}
                    onClick={() => handlePersonaSwitch(role)}
                    className={clsx(
                      'w-full flex items-center gap-3 px-4 py-3 text-left transition-colors',
                      isActive
                        ? 'bg-blue-50 dark:bg-blue-900/20 border-l-4 border-blue-500'
                        : 'hover:bg-slate-50 dark:hover:bg-slate-700/50'
                    )}
                  >
                    <div className={clsx('w-10 h-10 rounded-full flex items-center justify-center', roleColors.bg)}>
                      <RoleIcon size={20} className="text-white" />
                    </div>
                    <div className="flex-1">
                      <div className="font-semibold text-sm text-slate-900 dark:text-white">
                        {persona.name}
                      </div>
                      <div className="text-xs text-slate-500 dark:text-slate-400">
                        {persona.title}
                      </div>
                    </div>
                    {isActive && <CheckCircle className="text-blue-500" size={18} />}
                  </button>
                );
              })}
            </div>
          </>
        )}
      </div>
    );
  }

  // Full card view
  return (
    <div className={clsx('bg-white dark:bg-slate-800 rounded-xl shadow-lg p-6 border border-slate-200 dark:border-slate-700', className)}>
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-bold text-slate-900 dark:text-white">
          Aktif Persona
        </h3>
        <div className={clsx('w-10 h-10 rounded-full flex items-center justify-center', colors.bg)}>
          <Icon size={20} className="text-white" />
        </div>
      </div>

      <div className="mb-4">
        <div className="text-xl font-bold text-slate-900 dark:text-white mb-1">
          {currentConfig.name}
        </div>
        <div className="text-sm text-slate-600 dark:text-slate-400">
          {currentConfig.title}
        </div>
        <div className="text-xs text-slate-500 dark:text-slate-500 mt-1">
          {currentConfig.email}
        </div>
      </div>

      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full px-4 py-2 bg-slate-900 dark:bg-slate-700 text-white rounded-lg hover:bg-slate-800 dark:hover:bg-slate-600 transition-colors text-sm font-medium"
      >
        Rol Değiştir
      </button>

      {isOpen && (
        <>
          <div
            className="fixed inset-0 z-40"
            onClick={() => setIsOpen(false)}
          />
          <div className="absolute top-0 left-0 right-0 z-50 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg shadow-2xl max-h-[480px] overflow-y-auto">
            <div className="sticky top-0 px-4 py-3 bg-slate-50 dark:bg-slate-900 border-b border-slate-200 dark:border-slate-700 flex items-center justify-between">
              <div className="text-sm font-bold text-slate-900 dark:text-white uppercase tracking-wider">
                Persona Seç
              </div>
              <button
                onClick={() => setIsOpen(false)}
                className="p-1 hover:bg-slate-200 dark:hover:bg-slate-700 rounded transition-colors"
              >
                <X size={16} className="text-slate-600 dark:text-slate-400" />
              </button>
            </div>

            {(Object.keys(PERSONAS) as PersonaRole[]).map((role) => {
              const persona = PERSONAS[role];
              const RoleIcon = getPersonaIcon(role);
              const roleColors = getPersonaColor(role);
              const isActive = currentPersona === role;

              return (
                <button
                  key={role}
                  onClick={() => handlePersonaSwitch(role)}
                  className={clsx(
                    'w-full flex items-center gap-3 px-4 py-3 text-left transition-colors border-l-4',
                    isActive
                      ? 'bg-blue-50 dark:bg-blue-900/20 border-blue-500'
                      : 'hover:bg-slate-50 dark:hover:bg-slate-700/50 border-transparent'
                  )}
                >
                  <div className={clsx('w-12 h-12 rounded-full flex items-center justify-center', roleColors.bg)}>
                    <RoleIcon size={24} className="text-white" />
                  </div>
                  <div className="flex-1">
                    <div className="font-semibold text-slate-900 dark:text-white">
                      {persona.name}
                    </div>
                    <div className="text-sm text-slate-600 dark:text-slate-400">
                      {persona.title}
                    </div>
                    <div className="text-xs text-slate-500 dark:text-slate-500 mt-0.5">
                      {persona.email}
                    </div>
                  </div>
                  {isActive && <CheckCircle className="text-blue-500" size={20} />}
                </button>
              );
            })}
          </div>
        </>
      )}
    </div>
  );
};

export default PersonaSwitcher;
