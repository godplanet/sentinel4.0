/**
 * GLASS CARD COMPONENT
 * Demonstrates the Liquid Glass UI from Ek-1 Blueprint
 * Uses Constitution constants for consistent styling
 */

import { ReactNode } from 'react';
import { SENTINEL_CONSTITUTION } from '@/shared/config/constitution';

interface GlassCardProps {
  children: ReactNode;
  className?: string;
  neonGlow?: 'blue' | 'orange' | 'green' | 'red' | 'none';
  solidMode?: boolean; // Override for VDI/Citrix environments
}

export function GlassCard({
  children,
  className = '',
  neonGlow = 'none',
  solidMode = false,
}: GlassCardProps) {
  const ui = SENTINEL_CONSTITUTION.UI;
  const ai = SENTINEL_CONSTITUTION.AI;

  // Determine if we should use glass morphism
  const useGlass = !solidMode && ui.THEME_MODE === 'dual-physics';

  // Glass morphism styles
  const glassStyles = useGlass
    ? {
        backdropFilter: `blur(${ui.GLASS_BLUR})`,
        backgroundColor: `rgba(255, 255, 255, ${ui.GLASS_OPACITY})`,
        border: '1px solid rgba(255, 255, 255, 0.2)',
      }
    : {
        backgroundColor: 'white',
        border: '1px solid rgba(0, 0, 0, 0.1)',
      };

  // Neon glow styles
  const glowStyles: Record<string, string> = {
    blue: ai.DUAL_BRAIN.GEN_AI.GLOW,
    orange: ai.DUAL_BRAIN.COMPUTE_AI.GLOW,
    green: '#10b981',
    red: '#ef4444',
    none: 'transparent',
  };

const boxShadow =
  neonGlow !== 'none'
    ? `0 0 15px ${glowStyles[neonGlow]}20, 0 0 30px ${glowStyles[neonGlow]}10` // Opaklık düşürüldü (Daha soft)
    : '0 4px 20px -5px rgba(0, 0, 0, 0.05)'; // Gölge yumuşatıldı

return (
  <div
    className={`rounded-2xl p-6 transition-all duration-300 ${className}`}
    style={{
      ...glassStyles,
      boxShadow,
    }}
  >
    {/* Parlama efekti de yumuşatıldı */}
    {useGlass && (
        <div className="absolute top-0 left-0 right-0 h-1/3 bg-gradient-to-b from-white/20 to-transparent pointer-events-none rounded-t-2xl" />
    )}
    <div className="relative z-10">{children}</div>
  </div>
);
}

/**
 * RISK BADGE COMPONENT
 * Demonstrates Constitution-driven risk color coding
 */
interface RiskBadgeProps {
  score: number;
  showLabel?: boolean;
}

export function RiskBadge({ score, showLabel = true }: RiskBadgeProps) {
  const zones = SENTINEL_CONSTITUTION.RISK.ZONES;

  let zone = zones.GREEN;
  if (score >= zones.RED.min) zone = zones.RED;
  else if (score >= zones.ORANGE.min) zone = zones.ORANGE;
  else if (score >= zones.YELLOW.min) zone = zones.YELLOW;

  return (
    <div
      className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-sm font-semibold"
      style={{
        backgroundColor: zone.color,
        color: 'white',
        boxShadow: `0 2px 8px ${zone.color}80`,
      }}
    >
      <span className="text-xs">●</span>
      {showLabel && <span>{zone.label}</span>}
      <span className="font-mono">{score}</span>
    </div>
  );
}

/**
 * EVIDENCE INDICATOR
 * Shows evidence requirement status from Constitution
 */
interface EvidenceIndicatorProps {
  evidenceCount: number;
  showRequirement?: boolean;
}

export function EvidenceIndicator({
  evidenceCount,
  showRequirement = true,
}: EvidenceIndicatorProps) {
  const exec = SENTINEL_CONSTITUTION.EXECUTION;
  const isMet = evidenceCount >= exec.MIN_EVIDENCE_FILES;

  return (
    <div className="flex items-center gap-2 text-sm">
      <div
        className={`w-3 h-3 rounded-full ${
          isMet ? 'bg-green-500' : 'bg-red-500'
        }`}
        style={{
          boxShadow: isMet
            ? '0 0 8px rgba(16, 185, 129, 0.6)'
            : '0 0 8px rgba(239, 68, 68, 0.6)',
        }}
      />
      <span className="text-slate-700 font-medium">
        {evidenceCount} / {exec.MIN_EVIDENCE_FILES} Evidence
      </span>
      {showRequirement && exec.EVIDENCE_REQUIRED && !isMet && (
        <span className="text-xs text-red-600 font-semibold">REQUIRED</span>
      )}
    </div>
  );
}

/**
 * AI COMPUTATION BADGE
 * Shows which AI brain is active (Blue=GenAI, Orange=ComputeAI)
 */
interface AIBadgeProps {
  type: 'gen' | 'compute';
}

export function AIBadge({ type }: AIBadgeProps) {
  const ai = SENTINEL_CONSTITUTION.AI;
  const brain = type === 'gen' ? ai.DUAL_BRAIN.GEN_AI : ai.DUAL_BRAIN.COMPUTE_AI;

  return (
    <div
      className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-bold text-white"
      style={{
        backgroundColor: brain.GLOW,
        boxShadow: `0 0 16px ${brain.GLOW}, 0 0 32px ${brain.GLOW}40`,
        animation: 'pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite',
      }}
    >
      <span className="w-2 h-2 bg-white rounded-full animate-pulse" />
      {type === 'gen' ? 'GenAI Active' : 'ComputeAI Active'}
    </div>
  );
}

/**
 * FOUR-EYES INDICATOR
 * Shows approval status for critical actions
 */
interface FourEyesIndicatorProps {
  preparerId: string;
  reviewerId?: string;
  currentUserId: string;
}

export function FourEyesIndicator({
  preparerId,
  reviewerId,
  currentUserId,
}: FourEyesIndicatorProps) {
  const exec = SENTINEL_CONSTITUTION.EXECUTION;

  if (!exec.FOUR_EYES_PRINCIPLE) {
    return null;
  }

  const canApprove = preparerId !== currentUserId;
  const isApproved = !!reviewerId;

  return (
    <div className="flex items-center gap-3 p-3 bg-slate-50 rounded-lg border border-slate-200">
      <div className="flex items-center gap-2">
        <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center text-white text-xs font-bold">
          P
        </div>
        <span className="text-xs text-slate-600">Preparer</span>
      </div>

      <div className="flex-1 border-t border-dashed border-slate-300" />

      <div className="flex items-center gap-2">
        <div
          className={`w-8 h-8 rounded-full flex items-center justify-center text-white text-xs font-bold ${
            isApproved ? 'bg-green-500' : 'bg-slate-300'
          }`}
        >
          R
        </div>
        <span className="text-xs text-slate-600">Reviewer</span>
      </div>

      {!canApprove && (
        <div className="ml-3 px-2 py-1 bg-amber-100 text-amber-800 text-xs rounded border border-amber-300">
          🔒 Cannot approve own work
        </div>
      )}
    </div>
  );
}

/**
 * GRADE WATERFALL DISPLAY
 * Shows audit grade with limiting rules visualization
 */
interface GradeWaterfallProps {
  rawScore: number;
  finalScore: number;
  criticalCount: number;
  highCount: number;
}

export function GradeWaterfall({
  rawScore,
  finalScore,
  criticalCount,
  highCount,
}: GradeWaterfallProps) {
  const grading = SENTINEL_CONSTITUTION.GRADING;
  const isLimited = finalScore < rawScore;

  const getGradeLetter = (score: number) => {
    if (score >= 90) return 'A';
    if (score >= 80) return 'B';
    if (score >= 70) return 'C';
    if (score >= 60) return 'D';
    return 'F';
  };

  const rawGrade = getGradeLetter(rawScore);
  const finalGrade = getGradeLetter(finalScore);

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <div className="text-sm text-slate-600">Raw Score:</div>
        <div className="flex items-center gap-2">
          <span className="text-2xl font-bold text-slate-700">{rawScore}</span>
          <span className="text-lg text-slate-500">({rawGrade})</span>
        </div>
      </div>

      {isLimited && (
        <>
          <div className="flex items-center gap-2 text-xs text-amber-600">
            <span>⚠️ Limiting Rule Applied:</span>
            {criticalCount >= 1 && <span>1+ Critical → Max D (60)</span>}
            {criticalCount === 0 && highCount >= 2 && (
              <span>2+ High → Max C (70)</span>
            )}
          </div>

          <div className="relative h-2 bg-slate-200 rounded-full overflow-hidden">
            <div
              className="absolute h-full bg-gradient-to-r from-red-500 to-amber-500 transition-all duration-500"
              style={{ width: `${(finalScore / rawScore) * 100}%` }}
            />
          </div>
        </>
      )}

      <div className="flex items-center justify-between pt-2 border-t border-slate-200">
        <div className="text-sm font-semibold text-slate-700">Final Grade:</div>
        <div
          className="flex items-center gap-2 px-4 py-2 rounded-lg"
          style={{
            backgroundColor:
              finalScore >= 90
                ? '#10b981'
                : finalScore >= 70
                ? '#fbbf24'
                : '#ef4444',
            color: 'white',
            boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)',
          }}
        >
          <span className="text-3xl font-bold">{finalGrade}</span>
          <span className="text-xl">({finalScore})</span>
        </div>
      </div>
    </div>
  );
}

/**
 * ENVIRONMENT BANNER
 * Shows current environment with constitutional color coding
 */
interface EnvironmentBannerProps {
  environment: 'PRODUCTION' | 'TEST' | 'DEVELOPMENT' | 'UAT';
}

export function EnvironmentBanner({ environment }: EnvironmentBannerProps) {
  const colors = SENTINEL_CONSTITUTION.UI.ENVIRONMENT_COLORS;
  const color = colors[environment];

  return (
    <div
      className="px-4 py-2 text-white text-sm font-bold text-center"
      style={{
        backgroundColor: color,
        boxShadow: `0 2px 8px ${color}60`,
      }}
    >
      🌍 {environment} ENVIRONMENT
    </div>
  );
}