import type { AuditEntity, UniverseNode } from '@/entities/universe/model/types';

export interface RiskSignal {
  source: string;
  impact: number;
  reason: string;
  isVeto?: boolean; // SENTINEL V3.0: Veto bayrağı eklendi
}

export interface DynamicRiskResult {
  base_score: number;
  calculated_score: number;
  signals: RiskSignal[];
  level: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  display_text: string;
}

export function calculateDynamicRisk(entity: AuditEntity): DynamicRiskResult {
  const signals: RiskSignal[] = [];
  let base_score = entity.risk_score || 50;
  let total_adjustment = 0;
  let has_veto = false; // SENTINEL V3.0: Acil durum şalteri

  // --- SENTINEL V3.0: MAKRO VETO KONTROLÜ (SIFIR TOLERANS) ---
  // Eğer bu birimde aktif bir VETO (Şer'i, Siber, Yasal) veya son denetim notu 'F' ise motoru kilitler.
  const activeVetoes = entity.metadata?.active_vetoes || [];
  const lastAuditGrade = entity.metadata?.last_audit_grade;

  if (activeVetoes.length > 0 || lastAuditGrade === 'F') {
      has_veto = true;
      const vetoReason = activeVetoes.length > 0 ? activeVetoes[0] : 'Son Denetim Notu: F (Güvence Yok)';
      signals.push({
          source: 'Sentinel Veto Motoru',
          impact: 100, // Maksimum Ceza
          reason: `SIFIR TOLERANS: ${vetoReason}`,
          isVeto: true
      });
      total_adjustment += 100;
  }

  // Eğer VETO yoksa, standart (KRI) sinyallerini hesaplamaya devam et
  if (!has_veto) {
      // BRANCH SIGNALS
      if (entity.type === 'BRANCH') {
        const turnover = entity.metadata?.turnover_rate;
        if (turnover && turnover > 20) {
          const impact = Math.min(30, (turnover - 20) * 2);
          signals.push({ source: 'Personel Devir Oranı', impact, reason: `${turnover}% personel devri (>20% kritik)` });
          total_adjustment += impact;
        }

        const volume = entity.metadata?.transaction_volume;
        if (volume && volume > 10000000) {
          signals.push({ source: 'İşlem Hacmi', impact: 15, reason: `Yüksek işlem hacmi (${(volume / 1000000).toFixed(1)}M TL)` });
          total_adjustment += 15;
        }
      }

      // IT ASSET SIGNALS
      if (entity.type === 'IT_ASSET') {
        const criticality = entity.metadata?.criticality_level;
        if (criticality === 'CRITICAL') {
          signals.push({ source: 'Kritiklik Seviyesi', impact: 25, reason: 'Kritik BT varlığı' });
          total_adjustment += 25;
        }

        const lastPatch = entity.metadata?.last_patch_date;
        if (lastPatch) {
          const daysSincePatch = Math.floor((new Date().getTime() - new Date(lastPatch).getTime()) / (1000 * 60 * 60 * 24));
          if (daysSincePatch > 90) {
            const impact = Math.min(40, Math.floor(daysSincePatch / 30) * 10);
            signals.push({ source: 'Yama Güncelliği', impact, reason: `${daysSincePatch} gündür yamanmamış (>90 gün kritik)` });
            total_adjustment += impact;
          }
        }
      }

      // VENDOR SIGNALS
      if (entity.type === 'VENDOR') {
        const contractStatus = entity.metadata?.contract_status;
        if (contractStatus === 'EXPIRED') {
          signals.push({ source: 'Sözleşme Durumu', impact: 50, reason: 'Sözleşme süresi dolmuş' });
          total_adjustment += 50;
        }

        const riskRating = entity.metadata?.risk_rating;
        if (riskRating === 'HIGH' || riskRating === 'CRITICAL') {
          signals.push({ source: 'Tedarikçi Risk Notu', impact: 20, reason: `${riskRating} seviye tedarikçi riski` });
          total_adjustment += 20;
        }

        const spend = entity.metadata?.annual_spend;
        if (spend && spend > 1000000) {
          signals.push({ source: 'Yıllık Harcama', impact: 10, reason: `Yüksek bütçe (${(spend / 1000000).toFixed(1)}M TL)` });
          total_adjustment += 10;
        }
      }

      // SUBSIDIARY SIGNALS
      if (entity.type === 'SUBSIDIARY') {
        const ownership = entity.metadata?.ownership_percentage;
        if (ownership && ownership < 51) {
          signals.push({ source: 'Kontrol Seviyesi', impact: 15, reason: `Düşük sahiplik oranı (%${ownership})` });
          total_adjustment += 15;
        }
      }
  }

  // Hesaplama ve Seviyelendirme
  const calculated_score = Math.min(100, Math.max(0, base_score + total_adjustment));

  let level: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  if (calculated_score >= 80) level = 'CRITICAL';
  else if (calculated_score >= 60) level = 'HIGH';
  else if (calculated_score >= 40) level = 'MEDIUM';
  else level = 'LOW';

  const display_text = signals.length > 0
    ? `${calculated_score} (${signals[0].reason})`
    : `${calculated_score}`;

  return {
    base_score,
    calculated_score,
    signals,
    level,
    display_text,
  };
}

export function getRiskColor(level: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL'): string {
  switch (level) {
    case 'CRITICAL':
      return 'text-red-700 bg-red-100 border-red-200';
    case 'HIGH':
      return 'text-orange-700 bg-orange-100 border-orange-200';
    case 'MEDIUM':
      return 'text-yellow-700 bg-yellow-100 border-yellow-200';
    case 'LOW':
      return 'text-green-700 bg-green-100 border-green-200';
  }
}

export function calculateBaseRisk(node: UniverseNode): number {
  const likelihood = (node.inherent_risk / 100) * 5;
  const impact = (node.inherent_risk / 100) * 5;
  const velocity = node.risk_velocity ?? 3;

  const raw = (likelihood + velocity) * impact;
  const normalized = (raw / 50) * 100;
  let score = Math.min(100, Math.max(0, normalized));

  if ((node.shariah_impact ?? 0) >= 4) {
    score = Math.min(100, score * 1.25);
  }

  return score;
}

export function calculateCascadeRisk(node: UniverseNode): number {
  if (!node.children || node.children.length === 0) {
    return calculateBaseRisk(node);
  }
  const childRisks = node.children.map(calculateCascadeRisk);
  const maxChildRisk = Math.max(...childRisks);
  const avgChildRisk = childRisks.reduce((sum, r) => sum + r, 0) / childRisks.length;
  return 0.7 * maxChildRisk + 0.3 * avgChildRisk;
}

export function applyTalentGapMultiplier(baseRisk: number, hasRequiredSkill: boolean): number {
  return hasRequiredSkill ? baseRisk : Math.min(100, baseRisk * 1.2);
}

export function getTypeColor(type: string): { bg: string; text: string; icon: string } {
  switch (type) {
    case 'BRANCH':
    case 'HEADQUARTERS':
    case 'DEPARTMENT':
    case 'UNIT':
      return { bg: 'bg-blue-100', text: 'text-blue-700', icon: '🏢' };
    case 'IT_ASSET':
      return { bg: 'bg-purple-100', text: 'text-purple-700', icon: '💻' };
    case 'VENDOR':
      return { bg: 'bg-orange-100', text: 'text-orange-700', icon: '🚚' };
    case 'PROCESS':
      return { bg: 'bg-gray-100', text: 'text-gray-700', icon: '⚙️' };
    case 'SUBSIDIARY':
      return { bg: 'bg-indigo-100', text: 'text-indigo-700', icon: '🏛️' };
    default:
      return { bg: 'bg-slate-100', text: 'text-slate-700', icon: '📦' };
  }
}