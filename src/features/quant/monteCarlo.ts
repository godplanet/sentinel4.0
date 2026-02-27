import type { MonteCarloOutput, SimulationResult } from '@/entities/quant';

function betaDistributionSample(alpha: number, beta: number): number {
  let x = 0;
  let y = 0;

  for (let i = 0; i < alpha; i++) {
    x += -Math.log(Math.random());
  }

  for (let i = 0; i < beta; i++) {
    y += -Math.log(Math.random());
  }

  return x / (x + y);
}

function pertSample(min: number, likely: number, max: number): number {
  const range = max - min;
  const alpha = 1 + 4 * (likely - min) / range;
  const beta = 1 + 4 * (max - likely) / range;

  const sample = betaDistributionSample(alpha, beta);
  return min + sample * range;
}

export function runMonteCarloSimulation(
  min: number,
  likely: number,
  max: number,
  probability: number,
  iterations: number = 10000
): MonteCarloOutput {
  const samples: number[] = [];

  for (let i = 0; i < iterations; i++) {
    const value = pertSample(min, likely, max);
    samples.push(value);
  }

  samples.sort((a, b) => a - b);

  const mean = samples.reduce((sum, val) => sum + val, 0) / samples.length;

  const var95Index = Math.floor(samples.length * 0.95);
  const var99Index = Math.floor(samples.length * 0.99);
  const var_95 = samples[var95Index];
  const var_99 = samples[var99Index];

  const ale = mean * (probability / 100);

  const numBins = 50;
  const binSize = (max - min) / numBins;
  const bins: number[] = new Array(numBins).fill(0);

  samples.forEach((sample) => {
    const binIndex = Math.min(Math.floor((sample - min) / binSize), numBins - 1);
    bins[binIndex]++;
  });

  const histogram: SimulationResult[] = bins.map((count, index) => ({
    value: min + binSize * (index + 0.5),
    probability: count / samples.length,
  }));

  return {
    histogram,
    mean,
    var_95,
    var_99,
    ale,
  };
}

export function formatCurrency(value: number): string {
  return new Intl.NumberFormat('tr-TR', {
    style: 'currency',
    currency: 'TRY',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(value);
}

export function formatPercentage(value: number): string {
  return `%${value.toFixed(1)}`;
}

export function calculateExpectedLoss(
  minLoss: number,
  likelyLoss: number,
  maxLoss: number,
  probability: number
): number {
  const expectedLoss = (minLoss + 4 * likelyLoss + maxLoss) / 6;
  return expectedLoss * (probability / 100);
}

export function getDistributionStats(samples: number[]) {
  if (samples.length === 0) return null;

  const sorted = [...samples].sort((a, b) => a - b);
  const mean = sorted.reduce((sum, val) => sum + val, 0) / sorted.length;

  const variance =
    sorted.reduce((sum, val) => sum + Math.pow(val - mean, 2), 0) / sorted.length;
  const stdDev = Math.sqrt(variance);

  const median = sorted[Math.floor(sorted.length / 2)];

  const q1 = sorted[Math.floor(sorted.length * 0.25)];
  const q3 = sorted[Math.floor(sorted.length * 0.75)];

  return {
    mean,
    median,
    stdDev,
    q1,
    q3,
    min: sorted[0],
    max: sorted[sorted.length - 1],
  };
}
