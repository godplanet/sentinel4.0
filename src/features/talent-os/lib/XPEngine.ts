import { supabase } from '@/shared/api/supabase';
import toast from 'react-hot-toast';

// ============================================================
// Types
// ============================================================

export type XPSourceType =
  | 'FINDING'
  | 'WORKPAPER'
  | 'CERTIFICATE'
  | 'EXAM'
  | 'KUDOS'
  | 'OBSERVATION'
  | 'MENTORSHIP'
  | 'TRAINING_GIVEN';

export type FindingRiskLevel = 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW';

export type ObservationImpactLevel = 'LOW' | 'MEDIUM' | 'HIGH';

export interface XPAwardResult {
  awarded:       boolean;
  amount:        number;
  reason:        string;
  levelUp:       boolean;
  newLevel:      number;
  totalXp:       number;
  isReduced:     boolean;
  reductionTier: 0 | 1 | 2 | 3;
}

export type MemoryGateBlockReason =
  | 'MEMORY_GATE_BLOCKED'
  | 'INSUFFICIENT_XP'
  | 'MAX_LEVEL'
  | 'PROFILE_NOT_FOUND';

export interface LevelUpResult {
  success:               boolean;
  reason:                MemoryGateBlockReason | null;
  newLevel?:             number;
  playbookContributions?: number;
  xpRequired?:           number;
  currentXp?:            number;
}

export interface LedgerEntry {
  id:               string;
  user_id:          string;
  amount:           number;
  skill_id:         string | null;
  source_type:      XPSourceType;
  source_entity_id: string | null;
  description:      string;
  created_at:       string;
}

// ─── Phase 14: Anti-Farming types ────────────────────────────────────────────

export interface DiminishingReturnsStatus {
  count:      number;
  multiplier: number;
  isReduced:  boolean;
  tier:       0 | 1 | 2 | 3;
}

// ============================================================
// Rulebook constants
// ============================================================

const BASE_FINDING_XP      = 50;
const BASE_WORKPAPER_XP    = 100;
const CERTIFICATE_XP       = 1000;
const BASE_OBSERVATION_XP  = 100;
const BASE_MENTORSHIP_XP   = 250;
const MENTEE_LEVELUP_XP    = 500;
const BASE_TRAINING_XP     = 150;

const FARMING_WINDOW_MS  = 24 * 60 * 60 * 1000;
const FARMING_FREE_LIMIT = 3;

// tier index → { min count, xp multiplier }
const DR_TIERS: Array<{ threshold: number; multiplier: number; tier: 1 | 2 | 3 }> = [
  { threshold: FARMING_FREE_LIMIT + 1, multiplier: 0.5,  tier: 1 },
  { threshold: FARMING_FREE_LIMIT + 2, multiplier: 0.25, tier: 2 },
  { threshold: FARMING_FREE_LIMIT + 3, multiplier: 0,    tier: 3 },
];

const FINDING_MULTIPLIERS: Record<FindingRiskLevel, number> = {
  CRITICAL: 3,
  HIGH:     2,
  MEDIUM:   1,
  LOW:      0.5,
};

const OBSERVATION_MULTIPLIERS: Record<ObservationImpactLevel, number> = {
  LOW:    1,
  MEDIUM: 2,
  HIGH:   5,
};

const XP_PER_LEVEL = 1000;

const DR_TOAST_STYLE = { background: '#1e293b', color: '#f1f5f9', fontSize: '13px' };

// ============================================================
// XPEngine
// ============================================================

export class XPEngine {

  // ----------------------------------------------------------
  // Phase 14: Anti-Farming — Diminishing Returns
  // ----------------------------------------------------------

  /**
   * Counts how many times `userId` performed `actionType` in the last 24 hours,
   * then returns the applicable XP multiplier.
   *
   * Rules (OBSERVATION and KUDOS only):
   *   ≤ 3 actions   → multiplier 1.0   (full XP, no warning)
   *   4th action     → multiplier 0.5   (Tier 1, −50%)
   *   5th action     → multiplier 0.25  (Tier 2, −75%)
   *   6th+ action    → multiplier 0.0   (Tier 3, no XP)
   */
  static async checkDiminishingReturns(
    userId:     string,
    actionType: XPSourceType,
  ): Promise<DiminishingReturnsStatus> {
    if (actionType !== 'OBSERVATION' && actionType !== 'KUDOS') {
      return { count: 0, multiplier: 1.0, isReduced: false, tier: 0 };
    }

    const cutoff = new Date(Date.now() - FARMING_WINDOW_MS).toISOString();

    const { count, error } = await supabase
      .from('xp_ledger')
      .select('id', { count: 'exact', head: true })
      .eq('user_id', userId)
      .eq('source_type', actionType)
      .gte('created_at', cutoff);

    if (error || count == null) {
      return { count: 0, multiplier: 1.0, isReduced: false, tier: 0 };
    }

    if (count <= FARMING_FREE_LIMIT) {
      return { count, multiplier: 1.0, isReduced: false, tier: 0 };
    }

    for (let i = DR_TIERS.length - 1; i >= 0; i--) {
      if (count >= DR_TIERS[i].threshold) {
        return {
          count,
          multiplier: DR_TIERS[i].multiplier,
          isReduced:  true,
          tier:       DR_TIERS[i].tier,
        };
      }
    }

    return { count, multiplier: 1.0, isReduced: false, tier: 0 };
  }

  /** Returns true if the user is under any active DR cooldown for OBSERVATION or KUDOS. */
  static async isDiminishingActive(userId: string): Promise<boolean> {
    const [obs, kudos] = await Promise.all([
      XPEngine.checkDiminishingReturns(userId, 'OBSERVATION'),
      XPEngine.checkDiminishingReturns(userId, 'KUDOS'),
    ]);
    return obs.isReduced || kudos.isReduced;
  }

  // ----------------------------------------------------------
  // Public award methods
  // ----------------------------------------------------------

  static async awardFindingXP(
    userId:    string,
    riskLevel: FindingRiskLevel,
    skillId?:  string,
    entityId?: string,
  ): Promise<XPAwardResult> {
    const multiplier  = FINDING_MULTIPLIERS[riskLevel] ?? 1;
    const amount      = Math.round(BASE_FINDING_XP * multiplier);
    const description = `${riskLevel.charAt(0) + riskLevel.slice(1).toLowerCase()} risk finding logged`;
    return XPEngine._award(userId, amount, 'FINDING', description, skillId, entityId);
  }

  static async awardWorkpaperXP(
    userId:    string,
    qaipScore: number,
    skillId?:  string,
    entityId?: string,
  ): Promise<XPAwardResult> {
    if (qaipScore < 70) {
      return {
        awarded: false, amount: 0,
        reason: `QAIP score ${qaipScore} is below minimum threshold (70).`,
        levelUp: false, newLevel: 0, totalXp: 0,
        isReduced: false, reductionTier: 0,
      };
    }
    const multiplier  = qaipScore > 90 ? 1.5 : 1.0;
    const amount      = Math.round(BASE_WORKPAPER_XP * multiplier);
    const description = `Workpaper sign-off completed — QAIP Score: ${qaipScore}%`;
    return XPEngine._award(userId, amount, 'WORKPAPER', description, skillId, entityId);
  }

  static async awardCertificateXP(
    userId:    string,
    certName:  string,
    skillId?:  string,
    entityId?: string,
  ): Promise<XPAwardResult> {
    const description = `Sertifika tamamlandı: ${certName}`;
    return XPEngine._award(userId, CERTIFICATE_XP, 'CERTIFICATE', description, skillId, entityId);
  }

  static async awardExamXP(
    userId:    string,
    examTitle: string,
    score:     number,
    xpAmount:  number,
    skillId?:  string,
    entityId?: string,
  ): Promise<XPAwardResult> {
    const description = `Sınav geçildi — ${examTitle} (%${Math.round(score)})`;
    return XPEngine._award(userId, xpAmount, 'EXAM', description, skillId, entityId);
  }

  static async awardKudosXP(
    userId:   string,
    fromName: string,
    reason:   string,
    amount:   number,
    skillId?: string,
  ): Promise<XPAwardResult> {
    const dr = await XPEngine.checkDiminishingReturns(userId, 'KUDOS');

    if (dr.isReduced) {
      if (dr.multiplier === 0) {
        toast('XP Yield reduced to 0 due to high frequency. Take a break! 🛡️', {
          icon: '🚫', style: DR_TOAST_STYLE,
        });
        return {
          awarded: false, amount: 0,
          reason: 'Diminishing returns: KUDOS daily limit reached.',
          levelUp: false, newLevel: 0, totalXp: 0,
          isReduced: true, reductionTier: dr.tier,
        };
      }
      toast(`XP Yield reduced due to high frequency. Take a break! 🛡️`, {
        icon: '⚠️', style: DR_TOAST_STYLE,
      });
    }

    const finalAmount = Math.round(amount * dr.multiplier);
    const description = `Kudos alındı (${fromName}): ${reason}`;
    const result = await XPEngine._award(userId, finalAmount, 'KUDOS', description, skillId);
    return { ...result, isReduced: dr.isReduced, reductionTier: dr.tier };
  }

  static async awardObservationXP(
    userId:      string,
    impactLevel: ObservationImpactLevel,
    skillId?:    string,
    entityId?:   string,
  ): Promise<XPAwardResult> {
    const dr = await XPEngine.checkDiminishingReturns(userId, 'OBSERVATION');

    if (dr.isReduced) {
      if (dr.multiplier === 0) {
        toast('XP Yield reduced to 0 due to high frequency. Take a break! 🛡️', {
          icon: '🚫', style: DR_TOAST_STYLE,
        });
        return {
          awarded: false, amount: 0,
          reason: 'Diminishing returns: OBSERVATION daily limit reached.',
          levelUp: false, newLevel: 0, totalXp: 0,
          isReduced: true, reductionTier: dr.tier,
        };
      }
      toast(`XP Yield reduced due to high frequency. Take a break! 🛡️`, {
        icon: '⚠️', style: DR_TOAST_STYLE,
      });
    }

    const baseMultiplier = OBSERVATION_MULTIPLIERS[impactLevel] ?? 1;
    const amount         = Math.round(BASE_OBSERVATION_XP * baseMultiplier * dr.multiplier);
    const description    = `Value Added: ${impactLevel} Impact Observation${dr.isReduced ? ` (DR ×${dr.multiplier})` : ''}`;
    const result = await XPEngine._award(userId, amount, 'OBSERVATION', description, skillId, entityId);
    return { ...result, isReduced: dr.isReduced, reductionTier: dr.tier };
  }

  static async awardMentorshipXP(
    mentorUserId: string,
    menteeUserId: string,
    engagementId: string,
    skillId?:     string,
  ): Promise<XPAwardResult> {
    const description = `Mentorship Bonus for Engagement ${engagementId}`;
    const result = await XPEngine._award(
      mentorUserId, BASE_MENTORSHIP_XP, 'MENTORSHIP', description, skillId, engagementId,
    );
    await XPEngine._recordMenteeLink(mentorUserId, menteeUserId);
    return result;
  }

  static async awardMenteeLevelUpBonus(
    mentorUserId: string,
    menteeUserId: string,
    skillId?:     string,
  ): Promise<XPAwardResult> {
    const description = `Leadership Bonus: Your mentee leveled up!`;
    const result = await XPEngine._award(
      mentorUserId, MENTEE_LEVELUP_XP, 'MENTORSHIP', description, skillId, menteeUserId,
    );
    await XPEngine._recordMenteeLink(mentorUserId, menteeUserId);
    return result;
  }

  static async awardTrainingGivenXP(
    userId:        string,
    trainingTitle: string,
    skillId?:      string,
    entityId?:     string,
  ): Promise<XPAwardResult> {
    const description = `Training Delivered: ${trainingTitle}`;
    return XPEngine._award(
      userId, BASE_TRAINING_XP, 'TRAINING_GIVEN', description, skillId, entityId,
    );
  }

  // ----------------------------------------------------------
  // Level-up processor
  // ----------------------------------------------------------

  static processLevelUp(currentXp: number, currentLevel: number): {
    newLevel: number; leveledUp: boolean; levelsGained: number;
  } {
    let newLevel = currentLevel;
    while (currentXp >= newLevel * XP_PER_LEVEL) newLevel++;
    return { newLevel, leveledUp: newLevel > currentLevel, levelsGained: newLevel - currentLevel };
  }

  /**
   * Memory Gate: Attempt to level up an auditor.
   *
   * Golden Rule — the auditor MUST have at least one Playbook contribution before
   * advancing to the next level. Without institutional knowledge sharing,
   * the system hard-blocks the level-up.
   */
  static async attemptLevelUp(auditorId: string, playbookContributions?: number): Promise<LevelUpResult> {
    if (playbookContributions !== undefined) {
      if (playbookContributions === 0) {
        return { success: false, reason: 'MEMORY_GATE_BLOCKED', playbookContributions: 0 };
      }
      return { success: true, reason: null, playbookContributions };
    }

    const { data: profile, error } = await supabase
      .from('talent_profiles')
      .select('current_level, total_xp, next_level_xp, playbook_contributions')
      .eq('id', auditorId)
      .maybeSingle();

    if (error || !profile) {
      return { success: false, reason: 'PROFILE_NOT_FOUND' };
    }

    const level          = (profile.current_level as number) ?? 1;
    const totalXp        = (profile.total_xp as number) ?? 0;
    const nextLevelXp    = (profile.next_level_xp as number) ?? 1000;
    const contributions  = (profile.playbook_contributions as number) ?? 0;

    if (level >= 5) {
      return { success: false, reason: 'MAX_LEVEL', newLevel: 5, currentXp: totalXp };
    }

    if (totalXp < nextLevelXp) {
      return {
        success: false,
        reason: 'INSUFFICIENT_XP',
        xpRequired: nextLevelXp,
        currentXp: totalXp,
        playbookContributions: contributions,
      };
    }

    if (contributions === 0) {
      return {
        success: false,
        reason: 'MEMORY_GATE_BLOCKED',
        xpRequired: nextLevelXp,
        currentXp: totalXp,
        playbookContributions: 0,
      };
    }

    const newLevel = level + 1;
    const { error: updateError } = await supabase
      .from('talent_profiles')
      .update({ current_level: newLevel })
      .eq('id', auditorId);

    if (updateError) throw updateError;

    return {
      success: true,
      reason: null,
      newLevel,
      playbookContributions: contributions,
      currentXp: totalXp,
    };
  }

  static xpForNextLevel(currentLevel: number): number {
    return currentLevel * XP_PER_LEVEL;
  }

  static progressToNextLevel(currentXp: number, currentLevel: number): number {
    const floorXp  = (currentLevel - 1) * XP_PER_LEVEL;
    const ceilXp   = currentLevel * XP_PER_LEVEL;
    const range    = ceilXp - floorXp;
    const progress = currentXp - floorXp;
    return Math.min(100, Math.max(0, Math.round((progress / range) * 100)));
  }

  // ----------------------------------------------------------
  // Fetch ledger (for feed UI)
  // ----------------------------------------------------------

  static async fetchLedger(userId: string, limit = 20): Promise<LedgerEntry[]> {
    const { data, error } = await supabase
      .from('xp_ledger')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .limit(limit);
    if (error) throw error;
    return (data ?? []) as LedgerEntry[];
  }

  // ----------------------------------------------------------
  // Private helpers
  // ----------------------------------------------------------

  private static async _award(
    userId:      string,
    amount:      number,
    sourceType:  XPSourceType,
    description: string,
    skillId?:    string,
    entityId?:   string,
  ): Promise<XPAwardResult> {
    const entry: Record<string, unknown> = {
      user_id:          userId,
      amount,
      source_type:      sourceType,
      description,
      skill_id:         skillId  ?? null,
      source_entity_id: entityId ?? null,
    };

    const { error: ledgerError } = await supabase.from('xp_ledger').insert(entry);
    if (ledgerError) throw ledgerError;

    // TÜMÖR TEMİZLENDİ: Artık auditor_profiles değil, DOĞRU tablo olan talent_profiles'a bakıyoruz
    const { data: profile, error: fetchError } = await supabase
      .from('talent_profiles')
      .select('total_xp, current_level')
      .eq('id', userId)
      .maybeSingle();
      
    if (fetchError) throw fetchError;

    const prevXp    = (profile?.total_xp    as number) ?? 0;
    const prevLevel = (profile?.current_level as number) ?? 1;
    const newXp     = prevXp + amount;

    const { newLevel, leveledUp } = XPEngine.processLevelUp(newXp, prevLevel);
    const updatePayload: Record<string, number> = { total_xp: newXp };
    if (leveledUp) updatePayload.current_level = newLevel;

    if (profile) {
      const { error: updateError } = await supabase
        .from('talent_profiles')
        .update(updatePayload)
        .eq('id', userId);
      if (updateError) throw updateError;
    }

    return {
      awarded: true, amount, reason: description,
      levelUp: leveledUp, newLevel: leveledUp ? newLevel : prevLevel, totalXp: newXp,
      isReduced: false, reductionTier: 0,
    };
  }

  private static async _recordMenteeLink(
    mentorUserId: string,
    menteeUserId: string,
  ): Promise<void> {
    // ESKİ auditor_profiles BAĞLANTISI KOPARILDI. 
    // Mentörlük ilişkileri ileride talent_profiles üzerinden kurgulanacak.
    return Promise.resolve();
  }
}

// ============================================================
// Convenience helpers
// ============================================================

export function formatXPToast(result: XPAwardResult): string {
  if (!result.awarded) return '';
  let msg = `+${result.amount} XP`;
  if (result.levelUp)   msg += ` · Level Up! → Lv.${result.newLevel}`;
  if (result.isReduced) msg += ` (reduced)`;
  return msg;
}

export function getRiskLevelFromSeverity(severity: string): FindingRiskLevel {
  const map: Record<string, FindingRiskLevel> = {
    CRITICAL: 'CRITICAL', HIGH: 'HIGH', MEDIUM: 'MEDIUM', LOW: 'LOW', OBSERVATION: 'LOW',
  };
  return map[severity?.toUpperCase()] ?? 'MEDIUM';
}
