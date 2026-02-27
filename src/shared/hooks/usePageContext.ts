import { useLocation } from 'react-router-dom';
import { useMemo } from 'react';
import { optimizeContext } from '@/shared/api/ai';

const PAGE_LABELS: Record<string, string> = {
  '/dashboard': 'Dashboard - Genel Bakis',
  '/strategy/objectives': 'Stratejik Hedefler',
  '/strategy/universe': 'Denetim Evreni',
  '/strategy/risk-assessment': 'Risk Degerlendirme',
  '/strategy/annual-plan': 'Yillik Plan',
  '/execution/my-engagements': 'Denetim Gorevleri',
  '/execution/workpapers': 'Calisma Kagitlari',
  '/execution/findings': 'Bulgular',
  '/execution/actions': 'Aksiyon Takip',
  '/monitoring/watchtower': 'Surekli Izleme - Watchtower',
  '/reporting/builder': 'Rapor Olusturucu',
  '/reporting/executive': 'Stratejik Analiz',
  '/governance/policies': 'Politikalar',
  '/governance/board': 'YK Raporlama',
  '/resources': 'Kaynak Yonetimi',
  '/oracle': 'Sentinel AI Oracle',
};

export function usePageContext(): { label: string; path: string; context: string } {
  const location = useLocation();

  return useMemo(() => {
    const path = location.pathname;
    let label = PAGE_LABELS[path] || path;

    for (const [prefix, lbl] of Object.entries(PAGE_LABELS)) {
      if (path.startsWith(prefix) && prefix.length > 1) {
        label = lbl;
        break;
      }
    }

    const rawContext: Record<string, unknown> = {
      activePage: label,
      path,
    };

    if (path.match(/\/execution\/findings\/(.+)/)) {
      const id = path.split('/').pop();
      rawContext.findingId = id;
      rawContext.pageType = 'finding_detail';
    } else if (path.match(/\/execution\/my-engagements\/(.+)/)) {
      const id = path.split('/').pop();
      rawContext.engagementId = id;
      rawContext.pageType = 'engagement_detail';
    }

    return {
      label,
      path,
      context: optimizeContext(rawContext),
    };
  }, [location.pathname]);
}
