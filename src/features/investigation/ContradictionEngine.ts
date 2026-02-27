import type { DigitalEvidence, ContradictionFlag, EvidenceType } from './types';

interface ContradictionRule {
  keywords: string[];
  evidenceType: EvidenceType;
  field: string;
  checkFn: (text: string, snapshot: Record<string, unknown>) => string | null;
  severity: 'CRITICAL' | 'HIGH' | 'MEDIUM';
}

const RULES: ContradictionRule[] = [
  {
    keywords: ['izin', 'degildi', 'yoktum', 'ofiste degildi', 'tatil'],
    evidenceType: 'LOG',
    field: 'events',
    checkFn: (text, snapshot) => {
      const lower = text.toLowerCase();
      const claimsAbsence = ['izin', 'degildi', 'yoktum', 'ofiste degil', 'tatil'].some((k) => lower.includes(k));
      if (!claimsAbsence) return null;

      const events = snapshot.events as Array<{ action?: string; ip?: string; timestamp?: string }> | undefined;
      if (!events) return null;

      const loginEvents = events.filter((e) => e.action === 'LOGIN');
      if (loginEvents.length > 0) {
        const ips = loginEvents.map((e) => e.ip).join(', ');
        return `Supheli izinde oldugunu iddia ediyor, ancak Active Directory kayitlarina gore ${loginEvents.length} farkli oturum acma tespit edildi (IP: ${ips}).`;
      }
      return null;
    },
    severity: 'CRITICAL',
  },
  {
    keywords: ['baglanti', 'yok', 'tanimiyorum', 'ilgim yok', 'kurumsal'],
    evidenceType: 'EMAIL',
    field: 'from',
    checkFn: (text, snapshot) => {
      const lower = text.toLowerCase();
      const deniesConnection = ['baglanti', 'yok', 'ilgim yok', 'kurumsal'].some((k) => lower.includes(k));
      if (!deniesConnection) return null;

      const from = snapshot.from as string | undefined;
      const to = snapshot.to as string | undefined;
      const subject = snapshot.subject as string | undefined;
      if (from && to) {
        return `Supheli kisisel baglanti olmadigini belirtiyor, ancak ${from} adresinden ${to} adresine "${subject || 'Konu yok'}" basligi ile e-posta gonderilmis.`;
      }
      return null;
    },
    severity: 'HIGH',
  },
  {
    keywords: ['is iliskisi', 'yok', 'akraba', 'uzak'],
    evidenceType: 'LOG',
    field: 'transfers',
    checkFn: (text, snapshot) => {
      const lower = text.toLowerCase();
      const deniesRelation = lower.includes('is iliskisi') || (lower.includes('akraba') && lower.includes('yok'));
      if (!deniesRelation) return null;

      const transfers = snapshot.transfers as Array<{ amount?: number; to_iban?: string }> | undefined;
      if (transfers && transfers.length > 0) {
        const total = transfers.reduce((s, t) => s + (t.amount || 0), 0);
        return `Supheli is iliskisi olmadigini soyledi ancak ayni IBAN'a toplam ${total.toLocaleString('tr-TR')} TL tutarinda ${transfers.length} transfer tespit edildi.`;
      }
      return null;
    },
    severity: 'CRITICAL',
  },
  {
    keywords: ['fatura', 'bilmiyorum', 'gormedim', 'onaylamadim'],
    evidenceType: 'INVOICE',
    field: 'approved_by',
    checkFn: (text, snapshot) => {
      const lower = text.toLowerCase();
      const deniesInvoice = ['fatura', 'bilmiyorum', 'gormedim', 'onaylamadim'].some((k) => lower.includes(k));
      if (!deniesInvoice) return null;

      const approvedBy = snapshot.approved_by as string | undefined;
      const invoiceNo = snapshot.invoice_no as string | undefined;
      const amount = snapshot.amount as number | undefined;
      if (approvedBy) {
        return `Supheli fatura islemlerini bilmedigini iddia ediyor, ancak ${invoiceNo || 'bilinmeyen'} numarali ${(amount || 0).toLocaleString('tr-TR')} TL tutarli fatura ${approvedBy} tarafindan onaylanmis.`;
      }
      return null;
    },
    severity: 'HIGH',
  },
];

export function detectContradictions(
  suspectText: string,
  evidence: DigitalEvidence[],
): ContradictionFlag[] {
  const flags: ContradictionFlag[] = [];

  for (const rule of RULES) {
    const lower = suspectText.toLowerCase();
    const keywordMatch = rule.keywords.some((k) => lower.includes(k));
    if (!keywordMatch) continue;

    const matchingEvidence = evidence.filter((e) => e.type === rule.evidenceType);
    for (const ev of matchingEvidence) {
      const detail = rule.checkFn(suspectText, ev.content_snapshot);
      if (detail) {
        flags.push({
          id: `auto-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
          claim: suspectText.slice(0, 100),
          evidence_type: rule.evidenceType,
          evidence_source: ev.source_system,
          evidence_detail: detail,
          severity: rule.severity,
          detected_at: new Date().toISOString(),
        });
      }
    }
  }

  return flags;
}
