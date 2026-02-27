import type { AuditServiceTemplate } from '@/features/talent-os/types';
import type { GeneratedSprint } from './types';

const DEFAULT_GOALS: Record<number, { title: string; goal: string }[]> = {
  1: [
    { title: 'Sprint 1: Planlama', goal: 'Kapsam belirleme ve hazirlik' },
  ],
  2: [
    { title: 'Sprint 1: Planlama & Saha', goal: 'Kapsam ve saha calismasi' },
    { title: 'Sprint 2: Raporlama', goal: 'Raporlama ve kapani' },
  ],
  3: [
    { title: 'Sprint 1: Kapsam & Planlama', goal: 'Denetim kapsamini belirle, risk degerlendirmesini tamamla' },
    { title: 'Sprint 2: Saha Calismasi', goal: 'Testleri uygula, kanit topla, bulgulari belgele' },
    { title: 'Sprint 3: Raporlama & Kapani', goal: 'Raporu hazirla, musteriye sun, dosyayi kapat' },
  ],
  4: [
    { title: 'Sprint 1: Kapsam & Planlama', goal: 'Denetim kapsamini belirle, risk degerlendirmesini tamamla, is programini olustur' },
    { title: 'Sprint 2: Teknik Test & Analiz', goal: 'Detayli testleri uygula, veri analizi yap, kontrol etkinligini degerlendir' },
    { title: 'Sprint 3: Musteri Dogrulama', goal: 'Bulgulari musteriye sun, yanit ve aksiyonlari topla, dogrulama yap' },
    { title: 'Sprint 4: Raporlama & Kapani', goal: 'Nihai raporu hazirla, yonetim sunumunu yap, dosyayi kapat' },
  ],
};

export function generateSprints(
  template: AuditServiceTemplate,
  startDate: string,
  sprintDurationWeeks: number
): GeneratedSprint[] {
  const totalSprints = template.standard_duration_sprints;
  const goals = DEFAULT_GOALS[totalSprints] || DEFAULT_GOALS[4]!.slice(0, totalSprints);
  const sprints: GeneratedSprint[] = [];

  const start = new Date(startDate);

  for (let i = 0; i < totalSprints; i++) {
    const sprintStart = new Date(start);
    sprintStart.setDate(sprintStart.getDate() + i * sprintDurationWeeks * 7);

    const sprintEnd = new Date(sprintStart);
    sprintEnd.setDate(sprintEnd.getDate() + sprintDurationWeeks * 7 - 1);

    const goalDef = goals[i] || { title: `Sprint ${i + 1}`, goal: '' };

    sprints.push({
      sprint_number: i + 1,
      title: goalDef.title,
      goal: goalDef.goal,
      start_date: sprintStart.toISOString().split('T')[0],
      end_date: sprintEnd.toISOString().split('T')[0],
    });
  }

  return sprints;
}

export function calculateEndDate(startDate: string, totalSprints: number, sprintWeeks: number): string {
  const start = new Date(startDate);
  start.setDate(start.getDate() + totalSprints * sprintWeeks * 7 - 1);
  return start.toISOString().split('T')[0];
}
