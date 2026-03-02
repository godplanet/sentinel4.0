import { useQuery } from '@tanstack/react-query';
import type { RiskNode } from '@/features/risk-engine/types';

// FSD Kuralı: Mock veriler arayüzde değil, API adaptörlerinde tutulur.
const MOCK_RISK_UNIVERSE: RiskNode[] = [
  {
    id: '1', path: 'Kredi', name: 'Kredi Tahsis Yönetimi', type: 'PROCESS', baseImpact: 5, volume: 10000000, controlEffectiveness: 0,
    children: [
      {
        id: '1-1', path: 'Kredi.Kurumsal', name: 'Kurumsal Krediler', type: 'PROCESS', baseImpact: 5, volume: 5000000, controlEffectiveness: 0,
        children: [
          {
            id: 'R-1', path: 'Kredi.Kurumsal.R1', name: 'Teminatsız Kredi Riski', type: 'RISK', baseImpact: 5, volume: 0, controlEffectiveness: 0,
            children: [
              { id: 'C-1', path: 'Kredi.Kurumsal.C1', name: 'Sistem Limiti Kontrolü', type: 'CONTROL', baseImpact: 0, volume: 0, controlEffectiveness: 0.9 },
              { id: 'C-2', path: 'Kredi.Kurumsal.C2', name: '2. Yönetici Onayı', type: 'CONTROL', baseImpact: 0, volume: 0, controlEffectiveness: 0.6 }
            ]
          }
        ]
      },
      {
        id: '1-2', path: 'Kredi.Bireysel', name: 'Bireysel Krediler', type: 'PROCESS', baseImpact: 3, volume: 2000000, controlEffectiveness: 0,
        children: []
      }
    ]
  },
  {
    id: '2', path: 'IT', name: 'Bilgi Teknolojileri', type: 'PROCESS', baseImpact: 4, volume: 0, controlEffectiveness: 0,
    children: [
      {
        id: 'R-2', path: 'IT.Sec', name: 'Yetkisiz Erişim Riski', type: 'RISK', baseImpact: 5, volume: 0, controlEffectiveness: 0,
        children: [
           { id: 'C-3', path: 'IT.Sec.C1', name: 'MFA Zorunluluğu', type: 'CONTROL', baseImpact: 0, volume: 0, controlEffectiveness: 0.95 }
        ]
      }
    ]
  }
];

export function useExecutionTree() {
  return useQuery({
    queryKey: ['execution-risk-tree'],
    queryFn: async () => {
      // Gelecekte gerçek Supabase sorgusu buraya yazılacak. Şimdilik mock dönüyoruz.
      return MOCK_RISK_UNIVERSE;
    },
  });
}
