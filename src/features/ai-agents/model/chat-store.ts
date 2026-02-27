import { create } from 'zustand';
import type { ChatMessage } from '@/shared/api/ai/types';

interface ChatState {
  chatOpen: boolean;
  messages: ChatMessage[];

  setChatOpen: (open: boolean) => void;
  addMessage: (msg: ChatMessage) => void;
  updateLastMessage: (content: string, done?: boolean) => void;
  clearMessages: () => void;
}

export const useChatStore = create<ChatState>((set) => ({
  chatOpen: false,
  messages: [],

  setChatOpen: (chatOpen) => set({ chatOpen }),

  addMessage: (msg) => set((s) => ({ messages: [...s.messages, msg] })),

  updateLastMessage: (content, done) =>
    set((s) => {
      const msgs = [...s.messages];
      if (msgs.length === 0) return s;
      const last = { ...msgs[msgs.length - 1], content };
      if (done) last.isStreaming = false;
      msgs[msgs.length - 1] = last;
      return { messages: msgs };
    }),

  clearMessages: () => set({ messages: [] }),
}));
