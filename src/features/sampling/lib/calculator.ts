/**
 * GIAS Standard 14.1 - Statistical Sampling Calculator
 *
 * Attribute Sampling Methodology for Audit Testing
 * Based on international audit standards and risk-based approach
 */

export type RiskLevel = 'high' | 'medium' | 'low';
export type ConfidenceLevel = 90 | 95 | 99;

export interface SamplingInput {
  populationSize: number;
  riskLevel: RiskLevel;
  confidenceLevel: ConfidenceLevel;
  expectedErrorRate?: number;
}

export interface SamplingResult {
  recommendedSampleSize: number;
  methodology: string;
  justification: string;
  confidenceLevel: number;
  riskLevel: RiskLevel;
  isFullScope: boolean;
}

/**
 * Standard Audit Sampling Table (Attribute Sampling)
 * Based on statistical tables from audit literature
 */
const SAMPLING_TABLE: Record<RiskLevel, Record<ConfidenceLevel, number>> = {
  high: {
    90: 60,
    95: 75,
    99: 100,
  },
  medium: {
    90: 40,
    95: 50,
    99: 70,
  },
  low: {
    90: 25,
    95: 30,
    99: 45,
  },
};

/**
 * Calculate recommended sample size based on population and risk
 */
export function calculateSampleSize(input: SamplingInput): SamplingResult {
  const { populationSize, riskLevel, confidenceLevel, expectedErrorRate = 0 } = input;

  // Rule 1: Small populations require full or near-full testing
  if (populationSize <= 0) {
    return {
      recommendedSampleSize: 0,
      methodology: 'Invalid Input',
      justification: 'Evren büyüklüğü pozitif bir sayı olmalıdır.',
      confidenceLevel,
      riskLevel,
      isFullScope: false,
    };
  }

  // Rule 2: Very small populations (< 30) = Full scope
  if (populationSize < 30) {
    return {
      recommendedSampleSize: populationSize,
      methodology: 'Full Scope Testing',
      justification: 'Evren büyüklüğü 30\'dan küçük olduğu için tam kapsam testi önerilir (GIAS 14.1).',
      confidenceLevel,
      riskLevel,
      isFullScope: true,
    };
  }

  // Rule 3: Get base sample size from table
  let baseSampleSize = SAMPLING_TABLE[riskLevel][confidenceLevel];

  // Rule 4: Adjust for expected error rate
  if (expectedErrorRate > 0) {
    const adjustmentFactor = 1 + (expectedErrorRate / 100);
    baseSampleSize = Math.ceil(baseSampleSize * adjustmentFactor);
  }

  // Rule 5: Cap at population size (but maintain minimum coverage)
  let finalSampleSize = baseSampleSize;

  if (populationSize < baseSampleSize) {
    // For small-medium populations, ensure at least 60% coverage
    finalSampleSize = Math.ceil(populationSize * 0.6);
  } else {
    // For large populations, ensure we don't go below minimum statistical threshold
    const minThreshold = Math.ceil(populationSize * 0.05); // At least 5%
    finalSampleSize = Math.max(baseSampleSize, minThreshold);
  }

  // Rule 6: Never exceed population
  finalSampleSize = Math.min(finalSampleSize, populationSize);

  // Generate methodology description
  const methodology = getMethodologyDescription(riskLevel, confidenceLevel);
  const justification = getJustification(populationSize, finalSampleSize, riskLevel, confidenceLevel);

  return {
    recommendedSampleSize: finalSampleSize,
    methodology,
    justification,
    confidenceLevel,
    riskLevel,
    isFullScope: finalSampleSize === populationSize,
  };
}

/**
 * Get methodology description based on parameters
 */
function getMethodologyDescription(risk: RiskLevel, confidence: ConfidenceLevel): string {
  const riskText = {
    high: 'Yüksek Risk',
    medium: 'Orta Risk',
    low: 'Düşük Risk',
  };

  return `Attribute Sampling - ${riskText[risk]} - %${confidence} Güven Aralığı`;
}

/**
 * Generate justification text
 */
function getJustification(population: number, sample: number, risk: RiskLevel, confidence: ConfidenceLevel): string {
  const coverage = ((sample / population) * 100).toFixed(1);

  const riskJustification = {
    high: 'Yüksek risk seviyesi nedeniyle daha büyük örneklem gereklidir.',
    medium: 'Orta risk seviyesi dengelenmiş bir örneklem yaklaşımı gerektirir.',
    low: 'Düşük risk seviyesi daha küçük örneklem ile test edilebilir.',
  };

  return `
Evren: ${population.toLocaleString('tr-TR')} adet
Önerilen Örneklem: ${sample.toLocaleString('tr-TR')} adet (${coverage}% kapsam)
Güven Aralığı: %${confidence}
Risk Değerlendirmesi: ${riskJustification[risk]}

GIAS Standard 14.1 uyarınca, örneklem büyüklüğü istatistiksel güvenilirlik ve risk seviyesi dikkate alınarak hesaplanmıştır.
  `.trim();
}

/**
 * Generate random sample indices from population
 */
export function generateRandomSample(populationSize: number, sampleSize: number): number[] {
  if (sampleSize >= populationSize) {
    return Array.from({ length: populationSize }, (_, i) => i + 1);
  }

  const indices = new Set<number>();

  while (indices.size < sampleSize) {
    const randomIndex = Math.floor(Math.random() * populationSize) + 1;
    indices.add(randomIndex);
  }

  return Array.from(indices).sort((a, b) => a - b);
}

/**
 * Validate sampling configuration
 */
export function validateSamplingConfig(input: Partial<SamplingInput>): string[] {
  const errors: string[] = [];

  if (!input.populationSize || input.populationSize <= 0) {
    errors.push('Evren büyüklüğü pozitif bir sayı olmalıdır');
  }

  if (!input.riskLevel) {
    errors.push('Risk seviyesi seçilmelidir');
  }

  if (!input.confidenceLevel) {
    errors.push('Güven aralığı seçilmelidir');
  }

  if (input.expectedErrorRate !== undefined) {
    if (input.expectedErrorRate < 0 || input.expectedErrorRate > 100) {
      errors.push('Beklenen hata oranı 0-100 arasında olmalıdır');
    }
  }

  return errors;
}
