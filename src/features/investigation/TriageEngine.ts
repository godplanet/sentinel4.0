import type { TriageScore, TriageCategory, ExtractedEntities } from './types';

const SPECIFICITY_KEYWORDS: Record<string, number> = {
  fatura: 12, invoice: 12, 'ftr-': 15,
  iban: 18, 'tr\\d{2}': 18,
  hesap: 8, transfer: 10, odeme: 10,
  tarih: 8, ocak: 6, subat: 6, mart: 6, nisan: 6,
  mayis: 6, haziran: 6, temmuz: 6, agustos: 6,
  eylul: 6, ekim: 6, kasim: 6, aralik: 6,
  tutar: 10, '\\d+\\.\\d{3}': 8, tl: 5,
  departman: 6, muhasebe: 8, finans: 8,
  mudur: 6, yonetici: 5,
  sozlesme: 10, ihale: 12, komisyon: 10,
  rusvet: 15, kara_para: 15, zimmet: 15,
};

const EVIDENCE_KEYWORDS: Record<string, number> = {
  ekte: 15, ekli: 15, 'ek olarak': 15,
  ekran_goruntusu: 18, screenshot: 18,
  belge: 12, dokuman: 12, dekont: 15,
  fotograf: 10, video: 10, kayit: 12,
  ispat: 12, kanit: 12, delil: 14,
  kopya: 8, ornek: 6, log: 10,
  'elimde mevcut': 15, 'elimdedir': 12,
};

const EMOTION_MARKERS: Record<string, number> = {
  '!!!': 8, '\\?\\?\\?': 6,
  dayanamiyorum: 10, katlanamiyorum: 10,
  utanc: 8, rezalet: 8, igrenc: 10,
  lanet: 12, pislik: 12,
  artik_yeter: 8, kabul_edilemez: 6,
  korku: 6, dehset: 8,
};

const IBAN_PATTERN = /TR\s?\d{2}\s?\d{4}\s?\d{4}\s?\d{4}\s?\d{4}\s?\d{4}\s?\d{2}/gi;
const AMOUNT_PATTERN = /\d{1,3}(?:[.,]\d{3})*(?:\s*(?:TL|tl|lira|₺|USD|EUR))/g;
const DATE_PATTERN = /\d{1,2}[./]\d{1,2}[./]\d{2,4}|(?:ocak|subat|mart|nisan|mayis|haziran|temmuz|agustos|eylul|ekim|kasim|aralik)\s*\d{2,4}|son\s+\d+\s+(?:ay|hafta|gun|yil)|her\s+ayin\s+\d+/gi;
const NAME_PATTERN = /(?:bey|hanim|bay|bayan|mudur|yonetici|sef)\s+\w+|\w+\s+(?:bey|hanim)|[A-Z][a-z]+\s+[A-Z][.]/g;
const INVOICE_PATTERN = /(?:FTR|INV|FAT)[-\s]?\d{4}[-\s]?\d{3,6}/gi;

function normalizeText(text: string): string {
  return text
    .replace(/İ/g, 'i').replace(/I/g, 'i')
    .replace(/Ğ/g, 'g').replace(/ğ/g, 'g')
    .replace(/Ü/g, 'u').replace(/ü/g, 'u')
    .replace(/Ş/g, 's').replace(/ş/g, 's')
    .replace(/Ö/g, 'o').replace(/ö/g, 'o')
    .replace(/Ç/g, 'c').replace(/ç/g, 'c')
    .toLowerCase();
}

function scoreKeywords(text: string, keywords: Record<string, number>): { score: number; matched: string[] } {
  const normalized = normalizeText(text);
  let score = 0;
  const matched: string[] = [];

  for (const [keyword, weight] of Object.entries(keywords)) {
    const pattern = new RegExp(keyword.replace(/_/g, '\\s'), 'gi');
    const matches = normalized.match(pattern);
    if (matches) {
      score += weight * Math.min(matches.length, 3);
      matched.push(keyword.replace(/_/g, ' '));
    }
  }

  return { score, matched };
}

function extractEntities(text: string): ExtractedEntities {
  const ibans = text.match(IBAN_PATTERN)?.map((s) => s.trim()) || [];
  const amounts = text.match(AMOUNT_PATTERN)?.map((s) => s.trim()) || [];
  const dates = text.match(DATE_PATTERN)?.map((s) => s.trim()) || [];
  const names = text.match(NAME_PATTERN)?.map((s) => s.trim()) || [];
  const invoices = text.match(INVOICE_PATTERN)?.map((s) => s.trim()) || [];

  const capsRatio = (text.match(/[A-ZİĞÜŞÖÇ]/g)?.length || 0) / Math.max(text.length, 1);
  const excessivePunctuation = (text.match(/[!?]{2,}/g)?.length || 0) > 0;

  const emotionalMarkers: string[] = [];
  if (capsRatio > 0.3) emotionalMarkers.push('CAPSLOCK');
  if (excessivePunctuation) emotionalMarkers.push('!!!');

  return {
    names,
    dates,
    amounts,
    ibans,
    invoice_numbers: invoices,
    keywords_matched: [],
    emotional_markers: emotionalMarkers,
  };
}

function detectCapslock(text: string): number {
  const upperCount = (text.match(/[A-ZİĞÜŞÖÇ]/g) || []).length;
  const letterCount = (text.match(/[a-zA-ZığüşöçİĞÜŞÖÇ]/g) || []).length;
  if (letterCount === 0) return 0;
  const ratio = upperCount / letterCount;
  return Math.min(ratio * 60, 30);
}

export function analyzeTip(content: string): TriageScore {
  const specificity = scoreKeywords(content, SPECIFICITY_KEYWORDS);
  const evidence = scoreKeywords(content, EVIDENCE_KEYWORDS);
  const emotion = scoreKeywords(content, EMOTION_MARKERS);

  const entities = extractEntities(content);
  entities.keywords_matched = [...new Set([...specificity.matched, ...evidence.matched])];

  const entityBonus =
    entities.ibans.length * 15 +
    entities.amounts.length * 8 +
    entities.dates.length * 5 +
    entities.names.length * 6 +
    (entities.invoice_numbers?.length || 0) * 12;

  const rawSpecificity = Math.min(specificity.score + entityBonus, 100);
  const rawEvidence = Math.min(evidence.score + (entities.ibans.length > 0 ? 10 : 0), 100);
  const rawEmotion = Math.min(emotion.score + detectCapslock(content), 100);

  const total = Math.max(0, Math.min(100,
    (0.5 * rawSpecificity) + (0.3 * rawEvidence) - (0.2 * rawEmotion),
  ));

  let category: TriageCategory = 'SPAM';
  if (total > 80) category = 'CRITICAL_FRAUD';
  else if (total > 30) category = 'HR_CULTURE';

  return {
    total: Math.round(total * 10) / 10,
    specificity: Math.round(rawSpecificity * 10) / 10,
    evidence: Math.round(rawEvidence * 10) / 10,
    emotion: Math.round(rawEmotion * 10) / 10,
    category,
    entities,
  };
}

export function getAutoAssignment(score: number, category: TriageCategory): string | null {
  if (score > 80 && category === 'CRITICAL_FRAUD') return 'Suistimal Inceleme Birimi';
  if (category === 'HR_CULTURE') return 'Insan Kaynaklari';
  return null;
}
