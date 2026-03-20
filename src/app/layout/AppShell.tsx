import { useChatStore } from '@/features/ai-agents/model/chat-store'; // FSD YENİ YOLU
import { cn } from '@/lib/utils';
import { useUIStore } from '@/shared/stores/ui-store';
import { CommandBar } from '@/shared/ui/CommandBar';

import { SentinelOmnibar } from '@/widgets/OmniCommand/ui/SentinelOmnibar';
import { SentinelChatPanel } from '@/widgets/SentinelChat';
import { SentinelScribble } from '@/widgets/SentinelScribble';
import { ScribbleFindingModal } from '@/widgets/SentinelScribble/ScribbleFindingModal';
import { Sidebar } from '@/widgets/Sidebar';

import React from 'react';
import { useLocation } from 'react-router-dom';
import { MasterSuperDrawer } from './MasterSuperDrawer'; // YENİ MİMARİ

const CHROMELESS_ROUTES = ['/secure-report', '/login'];

export const AppShell = ({ children }: { children: React.ReactNode }) => {
 const { isSidebarOpen, isVDI } = useUIStore();
 const { chatOpen, setChatOpen } = useChatStore();
 const location = useLocation();

 const isChromeless = CHROMELESS_ROUTES.some((r) => location.pathname.startsWith(r));

 if (isChromeless) {
 return <>{children}</>;
 }

 return (
 <div className={cn(
 "flex h-screen bg-background text-foreground font-sans selection:bg-blue-100 selection:text-blue-900 overflow-hidden transition-colors duration-500 print:overflow-visible print:h-auto",
 isVDI && "perf-low"
 )}>
 <div className="print:hidden">
 <Sidebar />
 </div>

 <main className={cn(
 "flex-1 flex flex-col h-screen overflow-hidden relative min-w-0 transition-all duration-300",
 isSidebarOpen ? "ml-52 print:ml-0" : "ml-16 print:ml-0"
 )}>
 <div className="flex-1 overflow-auto px-3 py-2 lg:px-4 relative scroll-smooth print:overflow-visible print:p-0">
 <div className="relative z-10 w-full animate-in fade-in slide-in-from-bottom-4 duration-500 print:animate-none">
 {children}
 </div>
 </div>
 </main>

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