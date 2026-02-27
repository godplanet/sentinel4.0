import type { TalentProfile, BurnoutZone } from './types';

// ============================================================
// Sentiment Multiplier (Phase 13 — Pulse Engine)
// Formula: Final_Fatigue = Mathematical_Fatigue * Sentiment_Multiplier
// ============================================================

export type SentimentLevel = 1 | 2 | 3 | 4 | 5;

export function getSentimentMultiplier(energyLevel: SentimentLevel | number): number {
  if (energyLevel <= 2) return 1.3;
  if (energyLevel >= 5) return 0.8;
  return 1.0;
}

export function applyPulseSentiment(
  mathFatigue:  number,
  energyLevel?: number,
): number {
  if (energyLevel == null) return mathFatigue;
  const multiplier = getSentimentMultiplier(energyLevel);
  return Math.min(Math.round(mathFatigue * multiplier * 10) / 10, 100);
}

export function detectQuietQuittingRisk(
  fatigue:      number,
  energyLevel:  number,
  stressFactor: 'LOW' | 'NORMAL' | 'HIGH',
): boolean {
  return fatigue < 45 && energyLevel <= 2 && stressFactor === 'HIGH';
}

const HOURS_WEIGHT = 0.45;
const TRAVEL_WEIGHT = 0.25;
const STRESS_STREAK_WEIGHT = 0.20;
const RECENCY_WEIGHT = 0.10;

const WEEKLY_THRESHOLD = 40;
const THREE_WEEK_THRESHOLD = WEEKLY_THRESHOLD * 3;

export function calculateFatigue(auditor: TalentProfile): {
  score: number;
  zone: BurnoutZone;
  breakdown: {
    hoursComponent: number;
    travelComponent: number;
    stressComponent: number;
    recencyComponent: number;
  };
} {
  const hoursRatio = Math.min(auditor.active_hours_last_3_weeks / THREE_WEEK_THRESHOLD, 2.0);
  const hoursComponent = Math.min(hoursRatio * 100, 100) * HOURS_WEIGHT;

  const travelComponent = Math.min(auditor.travel_load, 100) * TRAVEL_WEIGHT;

  const stressCap = 5;
  const stressRatio = Math.min(auditor.consecutive_high_stress_projects / stressCap, 1.0);
  const stressComponent = stressRatio * 100 * STRESS_STREAK_WEIGHT;

  let recencyComponent = 0;
  if (auditor.last_audit_date) {
    const daysSince = Math.max(
      0,
      (Date.now() - new Date(auditor.last_audit_date).getTime()) / (1000 * 60 * 60 * 24)
    );
    recencyComponent = (daysSince < 7 ? 80 : daysSince < 14 ? 50 : daysSince < 30 ? 25 : 0)
      * RECENCY_WEIGHT;
  }

  const score = Math.round(
    Math.min(hoursComponent + travelComponent + stressComponent + recencyComponent, 100) * 10
  ) / 10;

  let zone: BurnoutZone = 'GREEN';
  if (score > 70) zone = 'RED';
  else if (score > 45) zone = 'AMBER';

  return {
    score,
    zone,
    breakdown: {
      hoursComponent: Math.round(hoursComponent * 10) / 10,
      travelComponent: Math.round(travelComponent * 10) / 10,
      stressComponent: Math.round(stressComponent * 10) / 10,
      recencyComponent: Math.round(recencyComponent * 10) / 10,
    },
  };
}

export function getFatigueColor(zone: BurnoutZone): string {
  switch (zone) {
    case 'GREEN': return 'text-emerald-600';
    case 'AMBER': return 'text-amber-500';
    case 'RED': return 'text-red-600';
  }
}

export function getFatigueBgColor(zone: BurnoutZone): string {
  switch (zone) {
    case 'GREEN': return 'bg-emerald-500';
    case 'AMBER': return 'bg-amber-500';
    case 'RED': return 'bg-red-500';
  }
}

export function getFatigueLabel(zone: BurnoutZone): string {
  switch (zone) {
    case 'GREEN': return 'Normal';
    case 'AMBER': return 'Dikkat';
    case 'RED': return 'Kritik';
  }
}
