export type Sentiment = 'aggressive' | 'defensive' | 'helpful' | 'neutral';

export interface SentimentResult {
  sentiment: Sentiment;
  confidence: number;
  riskDelta: number;
  explanation: string;
}

const AGGRESSIVE_PATTERNS = [
  /bu sacmalik/i, /gereksiz/i, /kabul etmiyorum/i, /reddediyorum/i,
  /bu bizim sorunumuz degil/i, /saçma/i, /baskani arayacagim/i,
  /avukat/i, /anlamsiz/i, /itiraz/i, /zaman kaybı/i, /zorlaştır/i,
];

const HELPFUL_PATTERNS = [
  /tamam/i, /haklısınız/i, /gonderiyorum/i, /ekledim/i, /duzelt/i,
  /hemen/i, /cozum/i, /anlıyorum/i, /kabul/i, /uygulay/i,
  /tesekkur/i, /yardım/i, /gönder/i, /hazırl/i, /tamamla/i,
];

const DEFENSIVE_PATTERNS = [
  /ama/i, /fakat/i, /gecikme/i, /zaman/i, /bekliyorduk/i,
  /kaynaklarımız/i, /onceden bilseydik/i, /planlanmamıs/i,
  /mümkün değil/i, /yetersiz/i,
];

export function analyzeSentiment(text: string): SentimentResult {
  const lowerText = text.toLowerCase();
  let aggressiveScore = 0;
  let helpfulScore = 0;
  let defensiveScore = 0;

  AGGRESSIVE_PATTERNS.forEach((p) => { if (p.test(lowerText)) aggressiveScore++; });
  HELPFUL_PATTERNS.forEach((p) => { if (p.test(lowerText)) helpfulScore++; });
  DEFENSIVE_PATTERNS.forEach((p) => { if (p.test(lowerText)) defensiveScore++; });

  if (text.includes('!')) aggressiveScore += 0.5;
  if (text === text.toUpperCase() && text.length > 5) aggressiveScore += 1;

  const total = aggressiveScore + helpfulScore + defensiveScore;

  if (total === 0) {
    return {
      sentiment: 'neutral',
      confidence: 0.5,
      riskDelta: 0,
      explanation: 'Yanit tarafsiz. Risk skoru degismedi.',
    };
  }

  if (aggressiveScore > helpfulScore && aggressiveScore > defensiveScore) {
    const conf = Math.min(0.95, 0.6 + aggressiveScore * 0.1);
    return {
      sentiment: 'aggressive',
      confidence: conf,
      riskDelta: +15,
      explanation: 'Agresif ton tespit edildi. Denetlenen muhalif davranisi gosteriyor. Risk skoru artirildi.',
    };
  }

  if (helpfulScore > aggressiveScore && helpfulScore >= defensiveScore) {
    const conf = Math.min(0.95, 0.6 + helpfulScore * 0.1);
    return {
      sentiment: 'helpful',
      confidence: conf,
      riskDelta: -10,
      explanation: 'Isbirligi yapan ton tespit edildi. Denetlenen olumlu yanit veriyor. Risk skoru azaltildi.',
    };
  }

  const conf = Math.min(0.95, 0.55 + defensiveScore * 0.1);
  return {
    sentiment: 'defensive',
    confidence: conf,
    riskDelta: +5,
    explanation: 'Savunmaci ton tespit edildi. Denetlenen gecikme/kaynak bahane gosteriyor. Risk skoru hafif artirildi.',
  };
}

export const SENTIMENT_COLORS: Record<Sentiment, string> = {
  aggressive: '#dc2626',
  defensive: '#d97706',
  helpful: '#16a34a',
  neutral: '#64748b',
};

export const SENTIMENT_LABELS: Record<Sentiment, string> = {
  aggressive: 'Agresif',
  defensive: 'Savunmaci',
  helpful: 'Isbirlikci',
  neutral: 'Tarafsiz',
};
