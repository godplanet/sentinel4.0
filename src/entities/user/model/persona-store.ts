import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export type PersonaRole = 'CAE' | 'AUDITOR' | 'EXECUTIVE' | 'AUDITEE' | 'SUPPLIER';

export interface PersonaConfig {
  id: string;
  role: PersonaRole;
  name: string;
  email: string;
  title: string;
  allowedPaths: string[];
  hiddenPaths: string[];
}

export const PERSONAS: Record<PersonaRole, PersonaConfig> = {
  CAE: {
    id: 'a0000000-0000-0000-0000-000000000010',
    role: 'CAE',
    name: 'Hilmi Duru',
    email: 'hilmi.duru@sentinelbank.com.tr',
    title: 'Baş Denetçi',
    allowedPaths: ['*'],
    hiddenPaths: [],
  },
  AUDITOR: {
    id: 'a0000000-0000-0000-0000-000000000002',
    role: 'AUDITOR',
    name: 'Ahmet Demir',
    email: 'ahmet.demir@sentinelbank.com.tr',
    title: 'Kıdemli Müfettiş',
    allowedPaths: [
      '/dashboard',
      '/execution',
      '/reporting',
      '/library',
      '/process-canvas',
      '/ccm',
      '/ai-agents',
      '/oracle',
      '/chaos-lab',
      '/automation',
      '/monitoring',
    ],
    hiddenPaths: [
      '/strategy',
      '/governance',
      '/settings',
      '/resources',
      '/qaip',
    ],
  },
  EXECUTIVE: {
    id: 'a0000000-0000-0000-0000-000000000003',
    role: 'EXECUTIVE',
    name: 'Zeynep Aydın',
    email: 'zeynep.aydin@sentinelbank.com.tr',
    title: 'Genel Müdür Yardımcısı',
    allowedPaths: [
      '/dashboard',
      '/reporting',
      '/strategy/risk-heatmap',
      '/strategy/neural-map',
      '/governance/board',
    ],
    hiddenPaths: [
      '/execution',
      '/settings',
      '/qaip',
      '/investigation',
      '/ccm',
    ],
  },
  AUDITEE: {
    id: 'a0000000-0000-0000-0000-000000000004',
    role: 'AUDITEE',
    name: 'Mehmet Kaya',
    email: 'mehmet.kaya@sentinelbank.com.tr',
    title: 'Şube Müdürü',
    allowedPaths: [
      '/dashboard',
      '/execution/actions',
      '/execution/findings',
      '/investigation',
      '/auditee',
    ],
    hiddenPaths: [
      '/strategy',
      '/governance',
      '/settings',
      '/resources',
      '/qaip',
      '/ccm',
      '/reporting',
      '/library',
    ],
  },
  SUPPLIER: {
    id: 'a0000000-0000-0000-0000-000000000005',
    role: 'SUPPLIER',
    name: 'Vendor Co.',
    email: 'vendor@partnerfirm.com',
    title: 'Tedarikçi Temsilcisi',
    allowedPaths: [
      '/vendor-portal',
    ],
    hiddenPaths: ['*'], // Hide everything except allowed
  },
};

interface PersonaState {
  currentPersona: PersonaRole;
  setPersona: (persona: PersonaRole) => void;
  isPathAllowed: (path: string) => boolean;
  getCurrentPersonaConfig: () => PersonaConfig;
}

export const usePersonaStore = create<PersonaState>()(
  persist(
    (set, get) => ({
      currentPersona: 'CAE',

      setPersona: (persona: PersonaRole) => {
        set({ currentPersona: persona });
        // Update localStorage for compatibility
        const config = PERSONAS[persona];
        localStorage.setItem('sentinel_user', JSON.stringify({
          name: config.name,
          role: config.title,
          email: config.email,
        }));
      },

      isPathAllowed: (path: string): boolean => {
        const { currentPersona } = get();
        const config = PERSONAS[currentPersona];

        // CAE has full access
        if (currentPersona === 'CAE') return true;

        // Check if path is explicitly hidden
        if (config.hiddenPaths.includes('*')) {
          return config.allowedPaths.some(allowed => path.startsWith(allowed));
        }

        // Check if path starts with any hidden path
        if (config.hiddenPaths.some(hidden => path.startsWith(hidden))) {
          return false;
        }

        // Check if path starts with any allowed path
        return config.allowedPaths.some(allowed => {
          if (allowed === '*') return true;
          return path.startsWith(allowed);
        });
      },

      getCurrentPersonaConfig: (): PersonaConfig => {
        const { currentPersona } = get();
        return PERSONAS[currentPersona];
      },
    }),
    {
      name: 'sentinel-persona-storage',
    }
  )
);
