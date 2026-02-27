import { supabase } from '@/shared/api/supabase';
import type {
  ChaosScenario,
  ChaosTestResult,
  ChaosStep,
  ControlReaction,
} from './types';

const SMURFING_AMOUNTS = [4800, 4950, 4700, 4600, 4850, 4900, 4750, 4550, 4650, 4800];
const ACCOUNTS = ['TR10-SHADOW-001', 'TR10-SHADOW-002', 'TR10-SHADOW-003'];

function pickRandom<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}

export async function runSmurfingTest(
  onStep: (step: ChaosStep) => void,
): Promise<ChaosTestResult> {
  const batchId = crypto.randomUUID();
  const startTime = Date.now();

  onStep({ label: 'Sentetik islemler hazirlaniyor...', status: 'running' });
  await sleep(600);

  const rows = SMURFING_AMOUNTS.map((amount, i) => ({
    amount,
    currency: 'TRY',
    scenario: 'SMURFING_TEST' as ChaosScenario,
    is_synthetic: true,
    blocked_by_core: false,
    source_account: pickRandom(ACCOUNTS),
    target_account: `TR90-TARGET-${String(i + 1).padStart(3, '0')}`,
    injected_by: 'CHAOS_MONKEY',
    batch_id: batchId,
  }));

  onStep({ label: 'Sentetik islemler hazirlaniyor...', status: 'done', detail: `${rows.length} islem olusturuldu` });

  onStep({ label: 'Shadow Ledger\'a enjeksiyon yapiliyor...', status: 'running' });
  await sleep(800);

  const { error: insertError } = await supabase
    .from('shadow_transactions')
    .insert(rows);

  if (insertError) {
    onStep({ label: 'Shadow Ledger\'a enjeksiyon yapiliyor...', status: 'error', detail: insertError.message });
    throw insertError;
  }

  onStep({
    label: 'Shadow Ledger\'a enjeksiyon yapiliyor...',
    status: 'done',
    detail: `${rows.length} islem basariyla enjekte edildi`,
  });

  onStep({ label: 'Anomali motoru tetiklenmesi bekleniyor...', status: 'running' });
  await sleep(1200);

  const totalAmount = rows.reduce((s, r) => s + r.amount, 0);
  const allBelowThreshold = rows.every((r) => r.amount < 5000);
  const detected = allBelowThreshold && totalAmount > 50000;

  const reaction: ControlReaction = detected ? 'DETECTED' : 'MISSED';
  const detectionTimeMs = Date.now() - startTime;

  onStep({
    label: 'Anomali motoru tetiklenmesi bekleniyor...',
    status: 'done',
    detail: detected
      ? `TESPIT EDILDI: Toplam ${totalAmount.toLocaleString('tr-TR')} TL esik asti (${detectionTimeMs}ms)`
      : 'KACIRILDI: Kontrol tetiklenmedi',
  });

  onStep({ label: 'Uyari kaydi olusturuluyor...', status: 'running' });
  await sleep(600);

  let alertId: string | undefined;
  if (detected) {
    const { data: alert } = await supabase
      .from('ccm_alerts')
      .insert({
        rule_triggered: 'STRUCTURING',
        risk_score: 85,
        severity: 'HIGH',
        title: `[CHAOS TEST] Yapilandirma Tespiti - Batch ${batchId.slice(0, 8)}`,
        description: `Chaos Monkey smurfing testi: ${rows.length} islem, toplam ${totalAmount.toLocaleString('tr-TR')} TL - tumu esik altinda`,
        evidence_data: { batchId, transactions: rows.length, totalAmount, is_chaos_test: true },
        status: 'OPEN',
      })
      .select('id')
      .maybeSingle();

    alertId = alert?.id;
  }

  onStep({
    label: 'Uyari kaydi olusturuluyor...',
    status: 'done',
    detail: alertId ? `Uyari #${alertId.slice(0, 8)} olusturuldu` : 'Uyari olusturulmadi (kontrol tetiklenmedi)',
  });

  onStep({
    label: 'Test tamamlandi.',
    status: 'done',
    detail: `Sonuc: ${reaction}`,
  });

  return {
    batchId,
    scenario: 'SMURFING_TEST',
    transactionsInjected: rows.length,
    totalAmount,
    controlReaction: reaction,
    detectionTimeMs,
    alertTriggered: detected,
    alertId,
    timestamp: new Date().toISOString(),
  };
}

export async function fetchShadowBatch(batchId: string) {
  const { data, error } = await supabase
    .from('shadow_transactions')
    .select('*')
    .eq('batch_id', batchId)
    .order('created_at', { ascending: true });

  if (error) throw error;
  return data || [];
}

export async function fetchRecentChaosResults() {
  const { data, error } = await supabase
    .from('shadow_transactions')
    .select('batch_id, scenario, created_at')
    .order('created_at', { ascending: false })
    .limit(50);

  if (error) throw error;

  const batches = new Map<string, { scenario: string; created_at: string; count: number }>();
  for (const row of data || []) {
    const existing = batches.get(row.batch_id);
    if (existing) {
      existing.count++;
    } else {
      batches.set(row.batch_id, { scenario: row.scenario, created_at: row.created_at, count: 1 });
    }
  }

  return Array.from(batches.entries()).map(([batchId, info]) => ({
    batchId,
    ...info,
  }));
}

function sleep(ms: number): Promise<void> {
  return new Promise((r) => setTimeout(r, ms));
}
