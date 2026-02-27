import type { EntityType } from '@/entities/universe/model/types';

export interface SyncedEntity {
  name: string;
  type: EntityType;
  risk_score: number;
  metadata: Record<string, any>;
  source: string;
  parent_name?: string;
}

export interface SyncResult {
  source: string;
  status: 'success' | 'error';
  entities: SyncedEntity[];
  message: string;
}

export async function simulateHRSync(): Promise<SyncResult> {
  await delay(1500);

  return {
    source: 'İK Sistemi (HR)',
    status: 'success',
    entities: [
      {
        name: 'Ataşehir Şubesi',
        type: 'BRANCH',
        risk_score: 45,
        metadata: {
          turnover_rate: 28,
          transaction_volume: 15000000,
          staff_count: 12,
          region: 'Anadolu',
        },
        source: 'HR_SYSTEM',
        parent_name: 'İstanbul Bölge',
      },
      {
        name: 'Çankaya Şubesi',
        type: 'BRANCH',
        risk_score: 38,
        metadata: {
          turnover_rate: 15,
          transaction_volume: 8500000,
          staff_count: 8,
          region: 'Ankara',
        },
        source: 'HR_SYSTEM',
        parent_name: 'Ankara Bölge',
      },
    ],
    message: '2 yeni şube İK sisteminden keşfedildi',
  };
}

export async function simulateCMDBSync(): Promise<SyncResult> {
  await delay(2000);

  return {
    source: 'CMDB (BT Envanteri)',
    status: 'success',
    entities: [
      {
        name: 'Mobil Bankacılık Sunucusu',
        type: 'IT_ASSET',
        risk_score: 65,
        metadata: {
          criticality_level: 'CRITICAL',
          cpe_id: 'MB-PROD-001',
          last_patch_date: '2025-11-15',
          system_type: 'Application Server',
          owner_team: 'Dijital Bankacılık',
        },
        source: 'CMDB',
      },
      {
        name: 'Veri Ambarı Sunucusu',
        type: 'IT_ASSET',
        risk_score: 55,
        metadata: {
          criticality_level: 'HIGH',
          cpe_id: 'DWH-PROD-002',
          last_patch_date: '2026-01-20',
          system_type: 'Database Server',
          owner_team: 'Veri Yönetimi',
        },
        source: 'CMDB',
      },
    ],
    message: '2 kritik BT varlığı CMDB\'den keşfedildi',
  };
}

export async function simulateProcurementSync(): Promise<SyncResult> {
  await delay(1800);

  return {
    source: 'Satınalma Sistemi',
    status: 'success',
    entities: [
      {
        name: 'Aras Kargo A.Ş.',
        type: 'VENDOR',
        risk_score: 42,
        metadata: {
          contract_date: '2024-01-15',
          contract_expiry: '2027-01-15',
          risk_rating: 'MEDIUM',
          contract_status: 'ACTIVE',
          service_type: 'Lojistik Hizmetleri',
          annual_spend: 850000,
        },
        source: 'PROCUREMENT',
      },
      {
        name: 'XYZ Yazılım Ltd.',
        type: 'VENDOR',
        risk_score: 72,
        metadata: {
          contract_date: '2023-06-01',
          contract_expiry: '2025-12-31',
          risk_rating: 'HIGH',
          contract_status: 'EXPIRED',
          service_type: 'Yazılım Geliştirme',
          annual_spend: 2500000,
        },
        source: 'PROCUREMENT',
      },
    ],
    message: '2 tedarikçi satınalma sisteminden keşfedildi',
  };
}

export async function runFullSync(): Promise<SyncResult[]> {
  const results = await Promise.all([
    simulateHRSync(),
    simulateCMDBSync(),
    simulateProcurementSync(),
  ]);

  return results;
}

function delay(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms));
}
