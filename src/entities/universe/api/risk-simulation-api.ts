import { supabase } from '@/shared/api/supabase';

/**
 * RiskSimulationPage için kullanılan Risk veri modeli.
 * audit_entities tablosundaki risk_score ve velocity_multiplier
 * alanları kullanılarak impact/likelihood/baseVelocity hesaplanır.
 */
export interface SimulationRisk {
  id: string;
  code: string;
  title: string;
  category: string;
  impact: number;       // 1-5 arası (risk_score'dan türetilir)
  likelihood: number;   // 1-5 arası (velocity_multiplier'dan türetilir)
  baseVelocity: number; // 0.0-1.0 (velocity_multiplier / 2)
  shariah_related: boolean;
}

/**
 * Denetim evrenindeki (audit_entities) varlıkları risk simülasyonu için getirir.
 * En yüksek risk skorlu 20 varlık döner.
 *
 * Haritalama kuralları:
 *   impact      = ceil(risk_score / 20), 1-5 arasına sınırlandırılır
 *   likelihood  = round(velocity_multiplier * 2.5), 1-5 arasına sınırlandırılır
 *   baseVelocity= min(1.0, velocity_multiplier / 2)
 *   shariah_related = ltree path'inde 'teverruk' veya 'murabaha' içeriyorsa true
 */
export async function fetchRisksForSimulation(): Promise<SimulationRisk[]> {
  const { data, error } = await supabase
    .from('audit_entities')
    .select('id, entity_name, entity_type, path, risk_score, velocity_multiplier, metadata')
    .order('risk_score', { ascending: false })
    .limit(20);

  if (error) throw error;

  return (data ?? []).map((entity) => {
    const riskScore = (entity.risk_score as number) ?? 50;
    const velocityMultiplier = (entity.velocity_multiplier as number) ?? 1.0;
    const pathStr = (entity.path as string) ?? '';
    const lastSegment = pathStr.split('.').at(-1) ?? entity.id.slice(0, 4);
    const meta = (entity.metadata ?? {}) as Record<string, unknown>;

    const impact = Math.max(1, Math.min(5, Math.ceil(riskScore / 20)));
    const likelihood = Math.max(1, Math.min(5, Math.round(velocityMultiplier * 2.5)));
    const baseVelocity = Math.min(1.0, velocityMultiplier / 2);
    const shariah_related =
      pathStr.includes('teverruk') ||
      pathStr.includes('murabaha') ||
      pathStr.includes('musaraka') ||
      (meta.shariah_sensitive as boolean) === true;

    return {
      id: entity.id,
      code: `ENT-${lastSegment.toUpperCase().slice(0, 6)}`,
      title: (entity.entity_name as string) ?? 'Bilinmeyen Varlık',
      category: (entity.entity_type as string) ?? 'UNIT',
      impact,
      likelihood,
      baseVelocity,
      shariah_related,
    };
  });
}
