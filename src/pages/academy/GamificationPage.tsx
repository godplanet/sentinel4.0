import { PageHeader } from '@/shared/ui/PageHeader';
import { HuntersGuildBoard } from '@/widgets/HuntersGuildBoard';

export default function GamificationPage() {
 return (
 <div className="space-y-4">
 <PageHeader
 title="The Hunter's Guild (Müfettiş Performans Ligi)"
 description="Denetçilerin bulgu kalitesi ve risk keşiflerine dayalı olarak XP kazandıkları, seviye atladıkları ve rozet topladıkları konsolide performans panosu."
 />

 <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 lg:p-4">
 <HuntersGuildBoard />
 </div>
 </div>
 );
}
