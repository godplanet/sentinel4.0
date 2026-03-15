/**
 * Wave 53: Siber Tehdit İstihbaratı & Dark Web İzleme Sayfası
 * Rota: /monitoring/cyber-threats
 */

import { PageHeader } from '@/shared/ui';
import { ThreatRadar } from '@/widgets/ThreatRadar';
import { ShieldAlert } from 'lucide-react';

export default function CyberThreatPage() {
 return (
 <div className="min-h-screen bg-canvas w-full">
 <div className="w-full px-4 py-4 space-y-5">
 <div className="sticky top-0 z-20 bg-canvas/95 backdrop-blur-md border-b border-slate-200 -mx-4 px-4 pt-2 pb-4">
 <PageHeader
 title="Siber Tehdit İstihbaratı & Dark Web Monitörü"
 description="OSINT beslemeleri, MITRE ATT&CK taktikleri ve dark web sızıntı uyarıları — CTI canlı panel"
 icon={ShieldAlert}
 />
 </div>

 <ThreatRadar />
 </div>
 </div>
 );
}
