import React from 'react';
import { useLocation } from 'react-router-dom';
import { Sidebar } from '@/widgets/Sidebar';
import { Header } from '@/widgets/Header';
import { CommandBar } from '@/shared/ui/CommandBar';
import { SentinelScribble } from '@/widgets/SentinelScribble';
import { ScribbleFindingModal } from '@/widgets/SentinelScribble/ScribbleFindingModal';
import { SentinelChatPanel } from '@/widgets/SentinelChat';
import { SentinelOmnibar } from '@/widgets/OmniCommand/ui/SentinelOmnibar';
import { MasterSuperDrawer } from './MasterSuperDrawer'; // YENİ MİMARİ
import { useUIStore } from '@/shared/stores/ui-store';
import { useChatStore } from '@/features/ai-agents/model/chat-store'; // FSD YENİ YOLU
import { Brain } from 'lucide-react';
import { cn } from '@/lib/utils';

const CHROMELESS_ROUTES = ['/secure-report', '/login'];

export const AppShell = ({ children }: { children: React.ReactNode }) => {
  const { isSidebarOpen, isVDI, drawer } = useUIStore();
  const { chatOpen, setChatOpen } = useChatStore();
  const location = useLocation();

  const isChromeless = CHROMELESS_ROUTES.some((r) => location.pathname.startsWith(r));

  if (isChromeless) {
    return <>{children}</>;
  }

  return (
    <div className={cn(
      "flex min-h-screen bg-background text-foreground font-sans selection:bg-blue-100 selection:text-blue-900 overflow-hidden transition-colors duration-500 print:overflow-visible",
      isVDI && "perf-low"
    )}>
      <div className="print:hidden">
        <Sidebar />
      </div>

      <main className={cn(
        "flex-1 flex flex-col relative min-w-0 transition-all duration-300",
        isSidebarOpen ? "ml-64 print:ml-0" : "ml-20 print:ml-0"
      )}>
        <div className="print:hidden">
          <Header />
        </div>

        <div className="flex-1 overflow-auto px-4 py-5 lg:px-6 relative scroll-smooth print:overflow-visible print:p-0">
          <div className="relative z-10 w-full animate-in fade-in slide-in-from-bottom-4 duration-500 print:animate-none">
            {children}
          </div>
        </div>
      </main>

      {!chatOpen && !drawer.isOpen && (
        <button
          onClick={() => setChatOpen(true)}
          className="fixed bottom-6 right-6 z-40 w-14 h-14 bg-gradient-to-br from-blue-600 to-cyan-500 rounded-2xl shadow-lg shadow-blue-300/40 flex items-center justify-center text-white hover:scale-110 active:scale-95 transition-all print:hidden"
          title="Sentinel AI Asistan"
        >
          <Brain size={24} />
        </button>
      )}

      {/* 🛡️ SİSTEMİN YENİ KALBİ: THE SUPER DRAWER KONTEYNERİ */}
      <MasterSuperDrawer />

      {/* Diğer Global Modüller */}
      <SentinelChatPanel />
      <CommandBar />
      <SentinelScribble />
      <ScribbleFindingModal />
      <SentinelOmnibar />
    </div>
  );
};