import type { EsgMetricDefinition, GreenSkepticResult } from '@/entities/esg';

interface ValidationInput {
  metric: EsgMetricDefinition;
  value: number;
  previousValue: number | null;
  evidenceUrl: string | null;
  evidenceDescription: string | null;
}

export function evaluateGreenSkeptic(input: ValidationInput): GreenSkepticResult {
  const flags: string[] = [];
  let severity: GreenSkepticResult['severity'] = 'info';
  let confidence = 80;

  if (!input.evidenceUrl && !input.evidenceDescription) {
    flags.push('Kanit belgesi eklenmemistir. Tum ESG beyanlari bagimsiz kanit gerektirir.');
    confidence -= 30;
    severity = 'warning';
  }

  if (input.previousValue != null && input.previousValue > 0) {
    const changePct = Math.abs(((input.value - input.previousValue) / input.previousValue) * 100);

    if (changePct > 50) {
      flags.push(
        `Onceki doneme gore %${changePct.toFixed(0)} degisim tespit edilmistir. `
        + `Bu boyutta ani degisim detayli dogrulama gerektirir.`
      );
      confidence -= 25;
      severity = 'critical';
    } else if (changePct > 25) {
      flags.push(`Onceki doneme gore %${changePct.toFixed(0)} degisim dikkate deger.`);
      confidence -= 10;
      if (severity === 'info') severity = 'warning';
    }
  }

  if (input.metric.target_value != null && input.metric.target_direction) {
    const { target_value, target_direction } = input.metric;
    const onTarget =
      target_direction === 'below' ? input.value <= target_value :
      target_direction === 'above' ? input.value >= target_value :
      input.value === target_value;

    if (onTarget && input.previousValue != null) {
      const prevOnTarget =
        target_direction === 'below' ? input.previousValue <= target_value :
        target_direction === 'above' ? input.previousValue >= target_value :
        input.previousValue === target_value;

      if (!prevOnTarget) {
        flags.push(
          `Onceki donemde hedefe ulasilamamis, bu donemde hedef tutturulmus. `
          + `Ani iyilesme icin ek kanit onerilir.`
        );
        confidence -= 15;
        if (severity === 'info') severity = 'warning';
      }
    }
  }

  if (input.metric.unit === '%' && (input.value > 100 || input.value < 0)) {
    flags.push(`Yuzde degeri gecersiz aralikta: ${input.value}%`);
    confidence -= 40;
    severity = 'critical';
  }

  if (input.metric.code.startsWith('GRI 305') && input.value === 0) {
    flags.push('Sifir emisyon beyani son derece nadir. Dogrulama sertifikasi zorunludur.');
    confidence -= 35;
    severity = 'critical';
  }

  if (input.metric.unit === '%' && input.value === 100 && input.metric.pillar === 'E') {
    flags.push(
      `%100 cevreci beyan potansiyel greenwashing gostergesidir. `
      + `Bagimsiz sertifikasyon (I-REC, GO) belgesi istenmektedir.`
    );
    confidence -= 30;
    severity = 'critical';
  }

  confidence = Math.max(0, Math.min(100, confidence));

  if (flags.length === 0) {
    return {
      triggered: false,
      severity: 'info',
      message: 'GREEN SKEPTIC: Veri tutarli gorunuyor. Otomatik dogrulama basarili.',
      flags: [],
      confidence,
    };
  }

  const header = severity === 'critical'
    ? 'GREEN SKEPTIC [KRITIK UYARI]'
    : 'GREEN SKEPTIC [UYARI]';

  const message = [
    header,
    '',
    `Metrik: ${input.metric.code} - ${input.metric.name}`,
    `Beyan Degeri: ${input.value} ${input.metric.unit}`,
    input.previousValue != null ? `Onceki Deger: ${input.previousValue} ${input.metric.unit}` : null,
    '',
    'Tespit Edilen Sorunlar:',
    ...flags.map((f, i) => `${i + 1}. ${f}`),
    '',
    severity === 'critical'
      ? 'Bu veri yayinlanamaz. Ek kanit ve aciklama zorunludur.'
      : 'Verinin yayinlanmadan once gozden gecirilmesi onerilmektedir.',
  ].filter(Boolean).join('\n');

  return { triggered: true, severity, message, flags, confidence };
}
