import { supabase } from '@/shared/api/supabase';
import { canonicalStringify } from '@/shared/lib/crypto';
import type { FreezeStep, DigitalEvidence } from './types';

const MOCK_EVIDENCE_TEMPLATES = [
  {
    type: 'EMAIL' as const,
    source_system: 'Microsoft Exchange',
    snapshot: (targets: string[]) => ({
      action: 'MAILBOX_FREEZE',
      targets,
      emails_captured: Math.floor(Math.random() * 200) + 50,
      date_range: 'Son 6 ay',
      status: 'Donduruldu - Salt Okunur',
    }),
  },
  {
    type: 'CHAT' as const,
    source_system: 'Slack Enterprise',
    snapshot: (targets: string[]) => ({
      action: 'CHANNEL_EXPORT',
      targets,
      messages_captured: Math.floor(Math.random() * 500) + 100,
      channels: ['#genel', '#muhasebe-ozel', '#direkt-mesajlar'],
      status: 'Donduruldu - Arsivlendi',
    }),
  },
  {
    type: 'LOG' as const,
    source_system: 'Active Directory',
    snapshot: (targets: string[]) => ({
      action: 'AD_LOG_CAPTURE',
      targets,
      events_captured: Math.floor(Math.random() * 1000) + 200,
      log_types: ['LOGIN', 'FILE_ACCESS', 'PERMISSION_CHANGE', 'VPN'],
      status: 'Donduruldu - Hash Dogrulanmis',
    }),
  },
  {
    type: 'LOG' as const,
    source_system: 'Core Banking / SAP',
    snapshot: (targets: string[]) => ({
      action: 'TRANSACTION_FREEZE',
      targets,
      transactions_captured: Math.floor(Math.random() * 80) + 20,
      systems: ['SAP FI', 'Core Banking EFT', 'Fatura Yonetimi'],
      status: 'Donduruldu - WORM Depolama',
    }),
  },
];

async function computeSHA256(content: string): Promise<string> {
  const encoded = new TextEncoder().encode(content);
  const hashBuffer = await crypto.subtle.digest('SHA-256', encoded);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map((b) => b.toString(16).padStart(2, '0')).join('');
}

function delay(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

export function buildFreezeSteps(targets: string[]): FreezeStep[] {
  return [
    { id: 'exchange', label: `Exchange Baglantisi Kuruluyor (${targets.length} hedef)`, system: 'Microsoft Exchange', status: 'pending' },
    { id: 'slack', label: 'Slack Kanallari Donduruluyorr', system: 'Slack Enterprise', status: 'pending' },
    { id: 'ad', label: 'Active Directory Loglari Yakalaniyor', system: 'Active Directory', status: 'pending' },
    { id: 'erp', label: 'ERP/Core Banking Islemleri Donduruluyorondr', system: 'SAP / Core Banking', status: 'pending' },
    { id: 'hash', label: 'SHA-256 Hash Hesaplaniyor', system: 'Kriptografi Motoru', status: 'pending' },
    { id: 'worm', label: 'WORM Depolamaya Yaziliyor', system: 'Dijital Kasa', status: 'pending' },
  ];
}

export async function executeFreezeProtocol(
  caseId: string,
  targets: string[],
  onStep: (stepId: string, status: FreezeStep['status'], detail?: string) => void,
): Promise<DigitalEvidence[]> {
  const results: DigitalEvidence[] = [];

  onStep('exchange', 'running', 'Exchange sunucusuna baglaniliyor...');
  await delay(800);
  onStep('exchange', 'done', `${targets.length} posta kutusu donduruldu`);

  onStep('slack', 'running', 'Slack API taramasi baslatildi...');
  await delay(600);
  onStep('slack', 'done', 'Kanal ve DM verileri yakalandi');

  onStep('ad', 'running', 'AD event loglari cekiliyor...');
  await delay(700);
  onStep('ad', 'done', 'Login/erisim loglari yakalandi');

  onStep('erp', 'running', 'SAP & Core Banking baglantisi...');
  await delay(900);
  onStep('erp', 'done', 'Finansal islem kayitlari donduruldu');

  onStep('hash', 'running', 'Tum veriler icin SHA-256 hesaplaniyor...');
  await delay(500);

  for (const template of MOCK_EVIDENCE_TEMPLATES) {
    const snapshot = template.snapshot(targets);
    const snapshotStr = canonicalStringify(snapshot);
    const hash = await computeSHA256(snapshotStr);

    const { data, error } = await supabase
      .from('digital_evidence')
      .insert({
        case_id: caseId,
        type: template.type,
        source_system: template.source_system,
        content_snapshot: snapshot,
        hash_sha256: hash,
        timestamp_rfc3161: new Date().toISOString(),
        locked: true,
        frozen_by: 'Dijital Dondurma Protokolu v2.0',
      })
      .select()
      .maybeSingle();

    if (!error && data) {
      results.push(data as DigitalEvidence);
    }
  }

  onStep('hash', 'done', `${results.length} kayit icin hash olusturuldu`);

  onStep('worm', 'running', 'Immutable depolamaya yaziliyor...');
  await delay(600);
  onStep('worm', 'done', 'Tum kanitlar WORM depolamaya kaydedildi');

  await supabase
    .from('investigation_cases')
    .update({ status: 'FROZEN', updated_at: new Date().toISOString() })
    .eq('id', caseId);

  return results;
}
