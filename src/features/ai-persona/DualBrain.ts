/**
 * Dual-Brain Engine
 *
 * Switches between two modes of thinking:
 * - BLUE MODE (GenAI): Strategic advice, explanations, summaries
 * - ORANGE MODE (ComputeAI): Heavy computation, simulations, data analysis
 *
 * The AI NEVER calculates risk mentally. It writes code to calculate.
 */

export type BrainMode = 'BLUE' | 'ORANGE';

export interface BrainDecision {
  mode: BrainMode;
  confidence: number;
  reasoning: string;
  suggestedAction?: string;
}

export interface ComputationRequest {
  type: 'BENFORD' | 'MONTE_CARLO' | 'RISK_SCORING' | 'SAMPLING' | 'TREND_ANALYSIS';
  parameters: Record<string, unknown>;
  dataSource?: string;
}

export interface ComputationResult {
  success: boolean;
  result?: unknown;
  visualization?: {
    type: 'line' | 'bar' | 'scatter' | 'pie';
    data: unknown[];
  };
  code?: string;
  error?: string;
}

export class DualBrainEngine {
  private computationKeywords = [
    'calculate',
    'compute',
    'simulate',
    'analyze',
    'benford',
    'monte carlo',
    'risk score',
    'sample size',
    'trend',
    'distribution',
    'statistical',
    'regression',
    'correlation',
    'variance',
    'standard deviation',
    'chi-square',
    'p-value',
    'confidence interval',
  ];

  private strategicKeywords = [
    'explain',
    'why',
    'how',
    'what',
    'should',
    'recommend',
    'suggest',
    'advise',
    'opinion',
    'think',
    'consider',
    'strategy',
    'approach',
    'methodology',
    'framework',
  ];

  decideBrainMode(prompt: string): BrainDecision {
    const lowerPrompt = prompt.toLowerCase();

    const computationScore = this.computationKeywords.filter((kw) =>
      lowerPrompt.includes(kw)
    ).length;

    const strategicScore = this.strategicKeywords.filter((kw) =>
      lowerPrompt.includes(kw)
    ).length;

    const hasNumbers = /\d{2,}/.test(prompt);
    const hasDataReference = /data|transactions|records|samples/i.test(prompt);

    if (computationScore > strategicScore || (hasNumbers && hasDataReference)) {
      return {
        mode: 'ORANGE',
        confidence: Math.min(0.95, 0.6 + computationScore * 0.15),
        reasoning: 'Detected computational intent. Switching to Compute Brain (Orange Mode).',
        suggestedAction: 'Generate and execute analysis code',
      };
    }

    return {
      mode: 'BLUE',
      confidence: Math.min(0.95, 0.6 + strategicScore * 0.1),
      reasoning: 'Detected strategic/explanatory intent. Using GenAI Brain (Blue Mode).',
      suggestedAction: 'Provide strategic guidance and explanation',
    };
  }

  async executeComputation(request: ComputationRequest): Promise<ComputationResult> {
    try {
      switch (request.type) {
        case 'BENFORD':
          return await this.executeBenfordAnalysis(request.parameters);
        case 'MONTE_CARLO':
          return await this.executeMonteCarloSimulation(request.parameters);
        case 'RISK_SCORING':
          return await this.executeRiskScoring(request.parameters);
        case 'SAMPLING':
          return await this.executeSamplingCalculation(request.parameters);
        case 'TREND_ANALYSIS':
          return await this.executeTrendAnalysis(request.parameters);
        default:
          return {
            success: false,
            error: `Unknown computation type: ${request.type}`,
          };
      }
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Computation failed',
      };
    }
  }

  private async executeBenfordAnalysis(params: Record<string, unknown>): Promise<ComputationResult> {
    const data = params.data as number[] || this.generateSampleData(1000);

    const digitCounts: Record<number, number> = {
      1: 0, 2: 0, 3: 0, 4: 0, 5: 0, 6: 0, 7: 0, 8: 0, 9: 0,
    };

    data.forEach((value) => {
      const firstDigit = parseInt(String(Math.abs(value))[0]);
      if (firstDigit >= 1 && firstDigit <= 9) {
        digitCounts[firstDigit]++;
      }
    });

    const total = data.length;
    const observedDistribution = Object.entries(digitCounts).map(([digit, count]) => ({
      digit: parseInt(digit),
      observed: count / total,
      expected: this.benfordExpected(parseInt(digit)),
      count,
    }));

    let chiSquare = 0;
    observedDistribution.forEach((d) => {
      const observedCount = d.count;
      const expectedCount = d.expected * total;
      chiSquare += Math.pow(observedCount - expectedCount, 2) / expectedCount;
    });

    const anomalyDetected = chiSquare > 15.51;

    const code = `
// Benford's Law Analysis
const digitCounts = {};
data.forEach(value => {
  const firstDigit = parseInt(String(Math.abs(value))[0]);
  digitCounts[firstDigit] = (digitCounts[firstDigit] || 0) + 1;
});

const chiSquare = Object.keys(digitCounts).reduce((sum, digit) => {
  const observed = digitCounts[digit];
  const expected = benfordExpected(parseInt(digit)) * data.length;
  return sum + Math.pow(observed - expected, 2) / expected;
}, 0);

// Chi-square critical value (8 df, 95% confidence) = 15.51
const anomalyDetected = chiSquare > 15.51;
`;

    return {
      success: true,
      result: {
        distribution: observedDistribution,
        chiSquareScore: chiSquare,
        anomalyDetected,
        sampleSize: total,
      },
      visualization: {
        type: 'bar',
        data: observedDistribution.map((d) => ({
          digit: String(d.digit),
          Observed: (d.observed * 100).toFixed(1),
          Expected: (d.expected * 100).toFixed(1),
        })),
      },
      code,
    };
  }

  private async executeMonteCarloSimulation(params: Record<string, unknown>): Promise<ComputationResult> {
    const iterations = (params.iterations as number) || 10000;
    const meanRisk = (params.meanRisk as number) || 50;
    const stdDev = (params.stdDev as number) || 15;

    const results: number[] = [];
    for (let i = 0; i < iterations; i++) {
      const risk = this.normalRandom(meanRisk, stdDev);
      results.push(Math.max(0, Math.min(100, risk)));
    }

    results.sort((a, b) => a - b);

    const percentile = (p: number) => results[Math.floor((p / 100) * iterations)];

    const code = `
// Monte Carlo Risk Simulation
const results = [];
for (let i = 0; i < ${iterations}; i++) {
  const risk = normalRandom(${meanRisk}, ${stdDev});
  results.push(Math.max(0, Math.min(100, risk)));
}
results.sort((a, b) => a - b);

const p5 = results[Math.floor(0.05 * ${iterations})];
const p50 = results[Math.floor(0.50 * ${iterations})];
const p95 = results[Math.floor(0.95 * ${iterations})];
`;

    const histogram = this.createHistogram(results, 20);

    return {
      success: true,
      result: {
        iterations,
        mean: this.mean(results),
        median: percentile(50),
        stdDev: this.stdDev(results),
        percentiles: {
          p5: percentile(5),
          p25: percentile(25),
          p50: percentile(50),
          p75: percentile(75),
          p95: percentile(95),
        },
      },
      visualization: {
        type: 'bar',
        data: histogram.map((bin) => ({
          range: `${bin.min.toFixed(0)}-${bin.max.toFixed(0)}`,
          frequency: bin.count,
        })),
      },
      code,
    };
  }

  private async executeRiskScoring(params: Record<string, unknown>): Promise<ComputationResult> {
    const impact = (params.impact as number) || 50;
    const volume = (params.volume as number) || 1000;
    const controlEffectiveness = (params.controlEffectiveness as number) || 0.5;

    const inherentRisk = impact * Math.log(volume);
    const residualRisk = inherentRisk * (1 - controlEffectiveness);
    const riskScore = Math.min(100, Math.max(0, residualRisk));

    const code = `
// Constitutional Risk Formula
const impact = ${impact};
const volume = ${volume};
const controlEffectiveness = ${controlEffectiveness};

const inherentRisk = impact * Math.log(volume);
const residualRisk = inherentRisk * (1 - controlEffectiveness);
const riskScore = Math.min(100, Math.max(0, residualRisk));

// Risk Classification
const riskLevel =
  riskScore >= 75 ? 'CRITICAL' :
  riskScore >= 50 ? 'HIGH' :
  riskScore >= 25 ? 'MEDIUM' : 'LOW';
`;

    const riskLevel =
      riskScore >= 75 ? 'CRITICAL' :
      riskScore >= 50 ? 'HIGH' :
      riskScore >= 25 ? 'MEDIUM' : 'LOW';

    return {
      success: true,
      result: {
        impact,
        volume,
        controlEffectiveness,
        inherentRisk: inherentRisk.toFixed(2),
        residualRisk: residualRisk.toFixed(2),
        riskScore: riskScore.toFixed(2),
        riskLevel,
      },
      code,
    };
  }

  private async executeSamplingCalculation(params: Record<string, unknown>): Promise<ComputationResult> {
    const populationSize = (params.populationSize as number) || 10000;
    const confidenceLevel = (params.confidenceLevel as number) || 95;
    const marginOfError = (params.marginOfError as number) || 5;

    const zScores: Record<number, number> = {
      90: 1.645,
      95: 1.96,
      99: 2.576,
    };

    const z = zScores[confidenceLevel] || 1.96;
    const p = 0.5;

    const sampleSize = Math.ceil(
      (z * z * p * (1 - p)) / Math.pow(marginOfError / 100, 2) /
      (1 + (z * z * p * (1 - p)) / (Math.pow(marginOfError / 100, 2) * populationSize))
    );

    const code = `
// Statistical Sampling Formula
const z = ${z}; // Z-score for ${confidenceLevel}% confidence
const p = 0.5; // Maximum variability
const e = ${marginOfError / 100}; // Margin of error
const N = ${populationSize}; // Population size

const sampleSize = Math.ceil(
  (z * z * p * (1 - p)) / (e * e) /
  (1 + (z * z * p * (1 - p)) / ((e * e) * N))
);

const samplingRate = (sampleSize / N) * 100;
`;

    return {
      success: true,
      result: {
        populationSize,
        confidenceLevel,
        marginOfError,
        recommendedSampleSize: sampleSize,
        samplingRate: ((sampleSize / populationSize) * 100).toFixed(2) + '%',
      },
      code,
    };
  }

  private async executeTrendAnalysis(params: Record<string, unknown>): Promise<ComputationResult> {
    const data = (params.data as number[]) || this.generateTrendData(12);

    const n = data.length;
    const xMean = (n - 1) / 2;
    const yMean = this.mean(data);

    let numerator = 0;
    let denominator = 0;

    data.forEach((y, x) => {
      numerator += (x - xMean) * (y - yMean);
      denominator += Math.pow(x - xMean, 2);
    });

    const slope = numerator / denominator;
    const intercept = yMean - slope * xMean;

    const trend = slope > 5 ? 'INCREASING' : slope < -5 ? 'DECREASING' : 'STABLE';

    const predictions = Array.from({ length: 3 }, (_, i) =>
      slope * (n + i) + intercept
    );

    const code = `
// Linear Regression Trend Analysis
const n = data.length;
const xMean = (n - 1) / 2;
const yMean = data.reduce((a, b) => a + b) / n;

let numerator = 0, denominator = 0;
data.forEach((y, x) => {
  numerator += (x - xMean) * (y - yMean);
  denominator += Math.pow(x - xMean, 2);
});

const slope = numerator / denominator;
const intercept = yMean - slope * xMean;

// Forecast next 3 periods
const predictions = [1, 2, 3].map(i =>
  slope * (n + i) + intercept
);
`;

    return {
      success: true,
      result: {
        dataPoints: n,
        slope: slope.toFixed(2),
        intercept: intercept.toFixed(2),
        trend,
        nextPeriodForecast: predictions.map((p) => p.toFixed(2)),
      },
      visualization: {
        type: 'line',
        data: data.map((value, index) => ({
          period: index + 1,
          actual: value.toFixed(2),
          trend: (slope * index + intercept).toFixed(2),
        })),
      },
      code,
    };
  }

  private benfordExpected(digit: number): number {
    return Math.log10(1 + 1 / digit);
  }

  private normalRandom(mean: number, stdDev: number): number {
    const u1 = Math.random();
    const u2 = Math.random();
    const z = Math.sqrt(-2 * Math.log(u1)) * Math.cos(2 * Math.PI * u2);
    return mean + stdDev * z;
  }

  private mean(data: number[]): number {
    return data.reduce((sum, val) => sum + val, 0) / data.length;
  }

  private stdDev(data: number[]): number {
    const avg = this.mean(data);
    const squaredDiffs = data.map((val) => Math.pow(val - avg, 2));
    return Math.sqrt(this.mean(squaredDiffs));
  }

  private createHistogram(data: number[], bins: number): Array<{ min: number; max: number; count: number }> {
    const min = Math.min(...data);
    const max = Math.max(...data);
    const binWidth = (max - min) / bins;

    const histogram: Array<{ min: number; max: number; count: number }> = [];
    for (let i = 0; i < bins; i++) {
      const binMin = min + i * binWidth;
      const binMax = binMin + binWidth;
      const count = data.filter((val) => val >= binMin && val < binMax).length;
      histogram.push({ min: binMin, max: binMax, count });
    }

    return histogram;
  }

  private generateSampleData(count: number): number[] {
    const data: number[] = [];
    for (let i = 0; i < count; i++) {
      const digit = Math.floor(Math.random() * 9) + 1;
      const magnitude = Math.pow(10, Math.floor(Math.random() * 4) + 2);
      data.push(digit * magnitude + Math.random() * magnitude);
    }
    return data;
  }

  private generateTrendData(count: number): number[] {
    const baseValue = 50;
    const trend = 2;
    const noise = 5;
    return Array.from({ length: count }, (_, i) =>
      baseValue + trend * i + (Math.random() - 0.5) * noise * 2
    );
  }
}

export const dualBrain = new DualBrainEngine();
