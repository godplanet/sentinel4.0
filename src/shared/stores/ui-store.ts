import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export type BrainMode = 'GENERATIVE' | 'COMPUTATIONAL' | 'IDLE';
export type Environment = 'PROD' | 'UAT' | 'DEV';

// 🛡️ SİSTEMDEKİ TÜM ÇEKMECE TİPLERİ (TEK MERKEZ)
export type DrawerType = 
  | 'NONE' 
  | 'FINDING_DETAIL' 
  | 'WORKPAPER_DETAIL' 
  | 'ACTION_DETAIL' 
  | 'INVESTIGATION_DETAIL' 
  | 'ADVISORY_DETAIL' 
  | 'TPRM_DETAIL';

interface DrawerState {
  isOpen: boolean;
  type: DrawerType;
  entityId: string | null;
  payload?: any;
}

interface UIState {
  isSidebarOpen: boolean;
  toggleSidebar: () => void;

  sidebarColor: string;
  setSidebarColor: (color: string) => void;

  environment: Environment;
  setEnvironment: (env: Environment) => void;

  isVDI: boolean;
  toggleVDI: () => void;

  isCmdBarOpen: boolean;
  toggleCmdBar: () => void;
  setCmdBarOpen: (open: boolean) => void;

  aiMode: BrainMode;
  setAIMode: (mode: BrainMode) => void;
  aiQuery: string;
  setAIQuery: (query: string) => void;

  isAuditeeMode: boolean;
  setAuditeeMode: (mode: boolean) => void;

  // 🛡️ THE MASTER DRAWER YÖNETİMİ
  drawer: DrawerState;
  openDrawer: (type: DrawerType, entityId?: string | null, payload?: any) => void;
  closeDrawer: () => void;
}

export const useUIStore = create<UIState>()(
  persist(
    (set) => ({
      isSidebarOpen: true,
      toggleSidebar: () => set((state) => ({ isSidebarOpen: !state.isSidebarOpen })),

      sidebarColor: '#0f172a',
      setSidebarColor: (color) => set({ sidebarColor: color }),

      environment: 'PROD',
      setEnvironment: (env) => set({ environment: env }),

      isVDI: false,
      toggleVDI: () => set((state) => ({ isVDI: !state.isVDI })),

      isCmdBarOpen: false,
      toggleCmdBar: () => set((state) => ({ isCmdBarOpen: !state.isCmdBarOpen })),
      setCmdBarOpen: (open) => set({ isCmdBarOpen: open }),

      aiMode: 'IDLE',
      setAIMode: (mode) => set({ aiMode: mode }),
      aiQuery: '',
      setAIQuery: (query) => set({ aiQuery: query }),

      isAuditeeMode: false,
      setAuditeeMode: (mode) => set({ isAuditeeMode: mode }),

      // DRAWER BAŞLANGIÇ STATE
      drawer: {
        isOpen: false,
        type: 'NONE',
        entityId: null,
        payload: null,
      },
      openDrawer: (type, entityId = null, payload = null) => 
        set({ drawer: { isOpen: true, type, entityId, payload } }),
      closeDrawer: () => 
        set({ drawer: { isOpen: false, type: 'NONE', entityId: null, payload: null } }),
    }),
    {
      name: 'sentinel-ui-storage',
      // Drawer'ın state'i persist edilmez (güvenlik ve tutarlılık için sayfa yenilenince kapanır)
      partialize: (state) => ({
        isSidebarOpen: state.isSidebarOpen,
        sidebarColor: state.sidebarColor,
        environment: state.environment,
        isVDI: state.isVDI,
        isAuditeeMode: state.isAuditeeMode
      }),
    }
  )
);