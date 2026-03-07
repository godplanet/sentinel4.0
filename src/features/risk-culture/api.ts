/**
 * Wave 61: Risk Culture & Tone at the Top Pulse — API
 * 
 * Tablolar: culture_surveys, sentiment_scores
 * Kural: Ortalama oranlarda/skorlarda (total_responses || 1) koruması.
 * Kural: optional chaining (?.) ve nullish coalescing (??)
 */

import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/shared/api/supabase';

const TENANT_ID = '11111111-1111-1111-1111-111111111111';

export type SurveyStatus = 'DRAFT' | 'ACTIVE' | 'CLOSED' | 'ARCHIVED';
export type SentimentLabel = 'POSITIVE' | 'NEUTRAL' | 'NEGATIVE' | 'CRITICAL';
export type CultureCategory = 'ETHICS' | 'SPEAK_UP' | 'TONE_AT_THE_TOP' | 'ACCOUNTABILITY' | 'RISK_AWARENESS';

export interface CultureSurvey {
  id: string;
  survey_code: string;
  title: string;
  description: string;
  target_audience: string;
  status: SurveyStatus;
  start_date: string | null;
  end_date: string | null;
  total_responses: number;
  participation_rate: number;
  overall_score: number;
}

export interface SentimentScore {
  id: string;
  survey_id: string;
  department_name: string;
  category: CultureCategory;
  score: number;
  sentiment_label: SentimentLabel;
  response_count: number;
  key_themes: string[];
}

export interface CultureDashboardData {
  surveys: CultureSurvey[];
  scores: SentimentScore[];
  globalAvgScore: number;
  totalParticipants: number;
  criticalAreas: SentimentScore[];
}

/** 
 * Kombine Culture Dashboard Data Hook'u. 
 * Hem anketleri hem metrikleri tek seferde çeker. 
 */
export function useCultureDashboard() {
  return useQuery<CultureDashboardData>({
    queryKey: ['risk-culture-dashboard'],
    staleTime: 60_000,
    queryFn: async () => {
      // 1. Anketleri çek
      const { data: rawSurveys, error: errSurveys } = await supabase
        .from('culture_surveys')
        .select('*')
        .eq('tenant_id', TENANT_ID)
        .order('created_at', { ascending: false });

      if (errSurveys) {
        console.error('[Culture API] fetch surveys error:', errSurveys);
        throw errSurveys;
      }

      // 2. Skorları çek
      const { data: rawScores, error: errScores } = await supabase
        .from('sentiment_scores')
        .select('*')
        .eq('tenant_id', TENANT_ID)
        .order('score', { ascending: true }); // Düşük skorlar üste

      if (errScores) {
        console.error('[Culture API] fetch scores error:', errScores);
        throw errScores;
      }

      const surveys = (rawSurveys ?? []) as CultureSurvey[];
      const scores = (rawScores ?? []) as SentimentScore[];

      // 3. Genel hesaplamalar (Matematiksel hatalara karşı koruma)
      // Toplam Katılımcı:
      const totalParticipants = surveys.reduce((acc, sum) => acc + parseNum(sum.total_responses), 0);
      
      // Ağırlıklı Ort. Skor (total_responses || 1 ile):
      let sumOfScoreXVol = 0;
      surveys.forEach(s => {
        sumOfScoreXVol += parseNum(s.overall_score) * parseNum(s.total_responses);
      });
      const globalAvgScore = totalParticipants > 0 
                               ? (sumOfScoreXVol / (totalParticipants || 1)) 
                               : 0;

      // Kritik alanlar: NEGATIVE veya CRITICAL olanlar
      const criticalAreas = scores.filter(s => 
        s.sentiment_label === 'CRITICAL' || s.sentiment_label === 'NEGATIVE'
      );

      return {
        surveys,
        scores,
        globalAvgScore,
        totalParticipants,
        criticalAreas
      };
    }
  });
}

// Yardımcı
function parseNum(val: any): number {
  if (typeof val === 'number') return val;
  if (!val) return 0;
  return parseFloat(val) || 0;
}
