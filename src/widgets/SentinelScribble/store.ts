import { create } from 'zustand';
import type { ScribbleExtractionResult, ExtractedFinding } from './scribble-ai';

interface ScribbleState {
  isOpen: boolean;
  isMaximized: boolean;
  content: string;
  linkedWorkpaperId: string | null;
  linkedContext: string;
  isProcessing: boolean;
  extractionResult: ScribbleExtractionResult | null;
  showFindingModal: boolean;
  prefillFinding: ExtractedFinding | null;
  position: { x: number; y: number };
  size: { width: number; height: number };
  buttonPosition: { x: number; y: number };

  toggle: () => void;
  open: () => void;
  close: () => void;
  toggleMaximize: () => void;
  setContent: (content: string) => void;
  setLinkedWorkpaperId: (id: string | null) => void;
  setLinkedContext: (ctx: string) => void;
  setProcessing: (v: boolean) => void;
  setExtractionResult: (r: ScribbleExtractionResult | null) => void;
  openFindingModal: (finding: ExtractedFinding) => void;
  closeFindingModal: () => void;
  setPosition: (pos: { x: number; y: number }) => void;
  setSize: (size: { width: number; height: number }) => void;
  setButtonPosition: (pos: { x: number; y: number }) => void;
  reset: () => void;
}

const DEFAULT_WIDTH = 500;
const DEFAULT_HEIGHT = 600;

export const useScribbleStore = create<ScribbleState>((set) => ({
  isOpen: false,
  isMaximized: false,
  content: '',
  linkedWorkpaperId: null,
  linkedContext: '',
  isProcessing: false,
  extractionResult: null,
  showFindingModal: false,
  prefillFinding: null,
  position: { x: Math.max(24, (typeof window !== 'undefined' ? window.innerWidth : 1200) - DEFAULT_WIDTH - 24), y: Math.max(24, (typeof window !== 'undefined' ? window.innerHeight : 800) - DEFAULT_HEIGHT - 24) },
  size: { width: DEFAULT_WIDTH, height: DEFAULT_HEIGHT },
  buttonPosition: { x: -1, y: -1 },

  toggle: () => set((s) => ({ isOpen: !s.isOpen })),
  open: () => set({ isOpen: true }),
  close: () => set({ isOpen: false }),
  toggleMaximize: () => set((s) => ({ isMaximized: !s.isMaximized })),
  setContent: (content) => set({ content }),
  setLinkedWorkpaperId: (id) => set({ linkedWorkpaperId: id }),
  setLinkedContext: (ctx) => set({ linkedContext: ctx }),
  setProcessing: (v) => set({ isProcessing: v }),
  setExtractionResult: (r) => set({ extractionResult: r }),
  openFindingModal: (finding) => set({ showFindingModal: true, prefillFinding: finding }),
  closeFindingModal: () => set({ showFindingModal: false, prefillFinding: null }),
  setPosition: (position) => set({ position }),
  setSize: (size) => set({ size }),
  setButtonPosition: (buttonPosition) => set({ buttonPosition }),
  reset: () => set({
    content: '',
    extractionResult: null,
    isProcessing: false,
  }),
}));
