import { useMemo } from 'react';
import { useLocation, useParams } from 'react-router-dom';

interface PageContext {
  pageName: string;
  route: string;
  params: Record<string, string>;
  description: string;
}

const ROUTE_DESCRIPTIONS: Record<string, string> = {
  '/dashboard': 'Ana kontrol paneli - KPI ozet ve gorev durumu',
  '/strategy/universe': 'Denetim Evreni - Tum denetlenebilir birimler ve risk haritasi',
  '/strategy/risk-assessment': 'Risk Degerlendirme - Risk skorlama ve isi haritasi',
  '/strategy/objectives': 'Strateji ve Hedefler - Kurumsal hedef uyum haritasi',
  '/strategy/annual-plan': 'Yillik Denetim Plani - Gantt ve kaynak atama',
  '/execution/my-engagements': 'Denetim Gorevleri - Aktif saha calismalari',
  '/execution/workpapers': 'Calisma Kagitlari - Kontrol testleri ve kanitlar',
  '/execution/findings': 'Bulgu Merkezi - Tum bulgular, durumlar ve oncelikler',
  '/execution/actions': 'Aksiyon Takibi - Duzeltici eylem planlari',
  '/monitoring/watchtower': 'Gozetim Kulesi - Surekli izleme ve prob sistemi',
  '/reporting/executive': 'Yonetim Raporu - Ust yonetim icin ozet gosterge paneli',
  '/reporting/builder': 'Rapor Olusturucu - Dinamik rapor sablonlari',
  '/governance/policies': 'Politika Kutuphanesi - Ic denetim politika ve prosedürleri',
  '/qaip/kpi': 'Kalite KPI - Denetim kalite gostergeleri',
  '/resources': 'Kaynak Yonetimi - Denetci profilleri ve kapasite planlama',
};

export function useCurrentPageContext(): PageContext {
  const location = useLocation();
  const params = useParams();

  return useMemo(() => {
    const route = location.pathname;
    const baseRoute = route.replace(/\/[0-9a-f-]{36}/g, '/:id');

    const description = ROUTE_DESCRIPTIONS[baseRoute]
      || ROUTE_DESCRIPTIONS[route]
      || `Sayfa: ${route}`;

    const segments = route.split('/').filter(Boolean);
    const pageName = segments[segments.length - 1] || 'dashboard';

    return {
      pageName,
      route,
      params: params as Record<string, string>,
      description,
    };
  }, [location.pathname, params]);
}
