import { AuditeeActionWorkbench } from '@/widgets/AuditeeActionWorkbench/AuditeeActionWorkbench';
import { motion } from 'framer-motion';
import { Lock, Shield } from 'lucide-react';

export default function AuditeePortalPage() {
 return (
 <div className="min-h-screen bg-[#FDFBF7] p-4 md:p-5 flex flex-col">
 <MagicLinkHeader />
 <main className="flex-1 mt-3 min-h-0">
 <div className="w-full px-4 sm:px-4 lg:px-4 h-full" style={{ minHeight: '70vh' }}>
 <motion.div
 initial={{ opacity: 0, y: 12 }}
 animate={{ opacity: 1, y: 0 }}
 transition={{ delay: 0.15 }}
 className="h-full"
 style={{ minHeight: '70vh' }}
 >
 <AuditeeActionWorkbench />
 </motion.div>
 </div>
 </main>

 <footer className="mt-4 text-center">
 <div className="inline-flex items-center gap-2 text-xs text-slate-400">
 <Lock size={11} />
 <span>
 Bu portal, kişisel bağlantınıza özel şifrelenmiş bir oturumda çalışmaktadır.
 Sentinel GRC v3.0 — BDDK Uyumlu
 </span>
 </div>
 </footer>
 </div>
 );
}

function MagicLinkHeader() {
 return (
 <motion.header
 initial={{ opacity: 0, y: -8 }}
 animate={{ opacity: 1, y: 0 }}
 className="w-full px-4 sm:px-4 lg:px-4 w-full"
 >
 <div className="bg-surface/70 backdrop-blur-md border border-slate-200 rounded-2xl px-4 py-4 shadow-sm flex items-center justify-between">
 <div className="flex items-center gap-3">
 <div className="w-10 h-10 rounded-xl bg-slate-900 flex items-center justify-center shadow-sm">
 <Shield size={20} className="text-white" />
 </div>
 <div>
 <p className="text-sm font-black text-primary tracking-tight">
 SENTINEL GRC
 </p>
 <p className="text-[10px] text-slate-500 font-medium tracking-widest uppercase">
 Aksiyon Yönetim Portalı
 </p>
 </div>
 </div>

 <div className="hidden md:flex items-center gap-4">
 <InfoChip label="Güvenli Oturum" icon="🔒" />
 <InfoChip label="BDDK Uyumlu" icon="🏛️" />
 <InfoChip label="GIAS 2024" icon="📋" />
 </div>

 <div className="flex items-center gap-2">
 <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
 <span className="text-xs text-slate-500 font-medium">Canlı</span>
 </div>
 </div>

 <div className="mt-4 px-2">
 <h1 className="text-2xl font-black text-primary">
 Denetim Aksiyonlarım
 </h1>
 <p className="text-sm text-slate-500 mt-1">
 Atanan denetim aksiyonlarınızı yönetin, kanıt yükleyin ve süre uzatımı talep edin.
 </p>
 </div>
 </motion.header>
 );
}

function InfoChip({ label, icon }: { label: string; icon: string }) {
 return (
 <div className="flex items-center gap-1.5 text-xs text-slate-600 font-medium">
 <span>{icon}</span>
 <span>{label}</span>
 </div>
 );
}
