import type { SoxIncident, SkepticChallenge } from '@/entities/sox';

export function evaluateSkepticChallenge(
  controlCode: string,
  department: string | null,
  proposedStatus: 'Effective' | 'Ineffective' | 'Not_Tested',
  incidents: SoxIncident[],
): SkepticChallenge {
  if (proposedStatus !== 'Effective') {
    return { triggered: false, incidentCount: 0, incidents: [], message: '', severity: 'warning' };
  }

  const thirtyDaysAgo = new Date();
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

  const recentIncidents = incidents.filter((inc) => {
    const isRecent = new Date(inc.occurred_at) >= thirtyDaysAgo;
    const matchesControl = inc.control_code === controlCode;
    const matchesDept = inc.department === department;
    return isRecent && (matchesControl || matchesDept);
  });

  if (recentIncidents.length === 0) {
    return { triggered: false, incidentCount: 0, incidents: [], message: '', severity: 'warning' };
  }

  const hasCritical = recentIncidents.some((i) => i.severity === 'Critical');
  const hasHigh = recentIncidents.some((i) => i.severity === 'High');
  const severity: SkepticChallenge['severity'] = hasCritical || hasHigh ? 'critical' : 'warning';

  const incidentSummary = recentIncidents
    .map((i) => `- [${i.severity}] ${i.title} (${new Date(i.occurred_at).toLocaleDateString('tr-TR')})`)
    .join('\n');

  const message = buildChallengeMessage(controlCode, department, recentIncidents.length, severity, incidentSummary);

  return {
    triggered: true,
    incidentCount: recentIncidents.length,
    incidents: recentIncidents,
    message,
    severity,
  };
}

function buildChallengeMessage(
  controlCode: string,
  department: string | null,
  count: number,
  severity: 'warning' | 'critical',
  incidentSummary: string,
): string {
  const deptLabel = department || 'ilgili birim';

  if (severity === 'critical') {
    return [
      `SENTINEL SKEPTIC [KRITIK ITIRAZ]`,
      ``,
      `${deptLabel} departmaninda son 30 gunde ${count} adet olay kaydi tespit edilmistir:`,
      ``,
      incidentSummary,
      ``,
      `Kontrol ${controlCode} icin "Effective" beyani, yukaridaki olaylarla celismektedir.`,
      `Bu kontrolu "Effective" olarak imzalayabilmeniz icin her bir olayin neden kontrol etkinligini`,
      `zayiflatmadigini detayli olarak aciklamaniz ZORUNLUDUR.`,
      ``,
      `Aciklama yapilmadan bu beyan onaylanamaz.`,
    ].join('\n');
  }

  return [
    `SENTINEL SKEPTIC [UYARI]`,
    ``,
    `${deptLabel} departmaninda son 30 gunde ${count} adet olay kaydi bulunmaktadir:`,
    ``,
    incidentSummary,
    ``,
    `Kontrol ${controlCode} icin "Effective" beyani vermeden once bu olaylari`,
    `degerlendirmeniz onerilmektedir. Devam etmek icin gerekce giriniz.`,
  ].join('\n');
}
