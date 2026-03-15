import { PageHeader } from '@/shared/ui/PageHeader';
import { SkillMatrixRadar } from '@/widgets/SkillMatrixRadar';

export default function BoardEvaluationPage() {
 return (
 <div className="space-y-4">
 <PageHeader
 title="BoD Evaluation & Skill Matrix"
 description="Yönetim Kurulu Üyelerinin bireysel veya kolektif yetkinliklerini izleme ve performans matrisi."
 />

 <div className="bg-slate-50 border border-slate-200 rounded-xl p-4">
 <SkillMatrixRadar />
 </div>
 </div>
 );
}
