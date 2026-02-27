import { RiskSeverity } from '@/entities/risk/types';

// ============================================================================
// KONFİGÜRASYON (Anayasal Limitler)
// ============================================================================
const CONSTANTS = {
  BASE_SCORE: 100,
  VOLUME_LOG_BASE: Math.E, // Doğal Logaritma (ln)
  MIN_VOLUME_MULTIPLIER: 2, // ln(1) 0 olacağı için minimum 2 kabul edilir
  CRITICAL_LIMIT: 60, // 1 Kritik Bulgu varsa maks puan (D)
  HIGH_FINDING_LIMIT: 75, // 3+ Yüksek Bulgu varsa maks puan (C)
  HIGH_FINDING_THRESHOLD: 3,
  IMPACT_WEIGHTS: {
    PROCESS: 1.0,
    IT: 1.2, // IT risklerinin çarpanı daha yüksek olabilir
    LEGAL: 1.5,
  }
} as const;

// GIAS 2024 Puan Kesinti Tablosu
const DEDUCTIONS: Record<RiskSeverity, number> = {
  'CRITICAL': 25,
  'HIGH': 10,
  'MEDIUM': 4,
  'LOW': 1,
  'OBSERVATION': 0
};

// ============================================================================
// TİPLER (Domain Types)
// ============================================================================
export interface RiskInput {
  baseImpact: number; // 1-5 arası
  volume: number;     // İşlem hacmi (TL/Adet)
  controlEffectiveness: number; // 0.0 - 1.0 arası (1.0 = Mükemmel Kontrol)
}

export interface RiskOutput {
  inherentRisk: number; // Doğal Risk
  residualRisk: number; // Artık Risk
  riskLevel: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
}

export interface AuditScoreInput {
  findings: Array<{
    severity: RiskSeverity;
    isRepeat?: boolean; // Tekerrür eden bulgu mu?
  }>;
  methodologyMultiplier?: number; // Varsayılan 1.0
}

export interface AuditScoreOutput {
  rawScore: number;
  finalScore: number;
  grade: 'A' | 'B' | 'C' | 'D' | 'F';
  deductions: {
    total: number;
    breakdown: Record<RiskSeverity, number>;
    repeatPenalty: number;
  };
  isLimited: boolean; // Limit kuralına takıldı mı?
  limitReason?: string;
}

// ============================================================================
// HESAPLAMA MOTORU (Pure Functions)
// ============================================================================

/**
 * Basel IV uyumlu SMA (Standardised Measurement Approach) benzeri hesaplama.
 * Formül: Risk = (Etki * ln(Hacim)) * (1 - Kontrol)
 */
export const calculateRisk = (input: RiskInput): RiskOutput => {
  // Hacim çarpanını hesapla (Logaritmik yumuşatma)
  // Eğer hacim 0 ise, minimum çarpanı kullan (Division by zero veya -Infinity koruması)
  const volumeMultiplier = Math.log(Math.max(input.volume, CONSTANTS.MIN_VOLUME_MULTIPLIER));
  
  // Doğal Risk (Kontrollerden önceki saf risk)
  const inherentRisk = input.baseImpact * volumeMultiplier;

  // Artık Risk (Kontrol etkinliği düşüldükten sonra)
  // residual = inherent * (1 - effectiveness)
  const residualRisk = inherentRisk * (1 - input.controlEffectiveness);

  // Risk Seviyesi Belirleme (Dinamik eşikler)
  let riskLevel: RiskOutput['riskLevel'] = 'LOW';
  if (residualRisk > 12) riskLevel = 'CRITICAL';
  else if (residualRisk > 8) riskLevel = 'HIGH';
  else if (residualRisk > 4) riskLevel = 'MEDIUM';

  return {
    inherentRisk: Number(inherentRisk.toFixed(2)),
    residualRisk: Number(residualRisk.toFixed(2)),
    riskLevel
  };
};

/**
 * Denetim Puanı Hesaplama (Hybrid Model)
 * Base 100 üzerinden bulgu kesintileri yapılır.
 * "Limiting Rule" (Kritik bulgu varsa maks 60) burada uygulanır.
 */
export const calculateAuditScore = (input: AuditScoreInput): AuditScoreOutput => {
  let totalDeduction = 0;
  let repeatPenalty = 0;
  const breakdown = { CRITICAL: 0, HIGH: 0, MEDIUM: 0, LOW: 0, OBSERVATION: 0 };
  const multiplier = input.methodologyMultiplier || 1.0;

  // 1. Kesintileri Hesapla
  input.findings.forEach(finding => {
    let point = DEDUCTIONS[finding.severity] || 0;
    
    // Tekerrür Cezası (%50 artış)
    if (finding.isRepeat) {
      const penalty = point * 0.5;
      repeatPenalty += penalty;
      point += penalty;
    }

    // Metodoloji Çarpanı
    point *= multiplier;

    totalDeduction += point;
    breakdown[finding.severity]++;
  });

  // 2. Ham Puanı Belirle (0'ın altına inemez)
  const rawScore = Math.max(0, CONSTANTS.BASE_SCORE - totalDeduction);
  
  // 3. Limiting Rules (Anayasal Kısıtlamalar) Uygula
  let finalScore = rawScore;
  let isLimited = false;
  let limitReason = undefined;

  // KURAL 1: 1 tane bile Kritik bulgu varsa, puan 60'ı (D) geçemez.
  if (breakdown.CRITICAL > 0 && finalScore > CONSTANTS.CRITICAL_LIMIT) {
    finalScore = CONSTANTS.CRITICAL_LIMIT;
    isLimited = true;
    limitReason = "Kritik Bulgu Limiti (Critical Finding Cap)";
  }

  // KURAL 2: 3'ten fazla Yüksek bulgu varsa, puan 75'i (C) geçemez.
  else if (breakdown.HIGH > CONSTANTS.HIGH_FINDING_THRESHOLD && finalScore > CONSTANTS.HIGH_FINDING_LIMIT) {
    finalScore = CONSTANTS.HIGH_FINDING_LIMIT;
    isLimited = true;
    limitReason = "Çoklu Yüksek Bulgu Limiti (High Finding Threshold)";
  }

  // 4. Harf Notunu Belirle
  const grade = getGrade(finalScore);

  return {
    rawScore: Number(rawScore.toFixed(2)),
    finalScore: Number(finalScore.toFixed(2)),
    grade,
    deductions: {
      total: Number(totalDeduction.toFixed(2)),
      breakdown,
      repeatPenalty: Number(repeatPenalty.toFixed(2))
    },
    isLimited,
    limitReason
  };
};

// Yardımcı: Puan -> Harf Dönüşümü
const getGrade = (score: number): AuditScoreOutput['grade'] => {
  if (score >= 95) return 'A';
  if (score >= 85) return 'B';
  if (score >= 70) return 'C';
  if (score >= 50) return 'D';
  return 'F';
};