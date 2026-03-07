/**
 * Voice Engine - Turkish Voice-to-Finding Processing
 *
 * This engine processes Turkish voice input and converts it to structured audit findings.
 * Uses keyword matching and context analysis.
 */

import type { VoiceFindingDraft, KeywordMatch, VoiceProcessingResult } from './types';

// Turkish keyword database for risk categorization
const RISK_KEYWORDS: KeywordMatch[] = [
  // Critical - Security & Safety
  { keyword: 'yangın', category: 'Fiziksel Güvenlik', severity: 'critical', weight: 10 },
  { keyword: 'güvenlik', category: 'Güvenlik', severity: 'high', weight: 8 },
  { keyword: 'alarm', category: 'Güvenlik Sistemleri', severity: 'high', weight: 7 },
  { keyword: 'kamera', category: 'Güvenlik Sistemleri', severity: 'medium', weight: 6 },
  { keyword: 'acil çıkış', category: 'Fiziksel Güvenlik', severity: 'critical', weight: 10 },
  { keyword: 'söndürücü', category: 'Yangın Güvenliği', severity: 'critical', weight: 9 },
  { keyword: 'tüp', category: 'Yangın Güvenliği', severity: 'critical', weight: 8 },

  // High - Compliance & Controls
  { keyword: 'eksik', category: 'Kontrol Eksikliği', severity: 'high', weight: 7 },
  { keyword: 'yok', category: 'Kontrol Eksikliği', severity: 'high', weight: 7 },
  { keyword: 'onay', category: 'Yetkilendirme', severity: 'high', weight: 8 },
  { keyword: 'imza', category: 'Yetkilendirme', severity: 'medium', weight: 6 },
  { keyword: 'evrak', category: 'Dokümantasyon', severity: 'medium', weight: 5 },
  { keyword: 'belge', category: 'Dokümantasyon', severity: 'medium', weight: 5 },
  { keyword: 'kayıt', category: 'Dokümantasyon', severity: 'medium', weight: 5 },

  // Medium - Operational
  { keyword: 'süreç', category: 'Operasyonel', severity: 'medium', weight: 5 },
  { keyword: 'prosedür', category: 'Operasyonel', severity: 'medium', weight: 6 },
  { keyword: 'eğitim', category: 'İnsan Kaynakları', severity: 'medium', weight: 5 },
  { keyword: 'personel', category: 'İnsan Kaynakları', severity: 'medium', weight: 4 },

  // Location keywords
  { keyword: 'kasa', category: 'Fiziksel Lokasyon', severity: 'high', weight: 7 },
  { keyword: 'şube', category: 'Fiziksel Lokasyon', severity: 'medium', weight: 5 },
  { keyword: 'daire', category: 'Fiziksel Lokasyon', severity: 'medium', weight: 5 },
  { keyword: 'kiler', category: 'Fiziksel Lokasyon', severity: 'medium', weight: 4 },
  { keyword: 'sunucu', category: 'IT Altyapısı', severity: 'high', weight: 8 },
  { keyword: 'sistem', category: 'IT Altyapısı', severity: 'high', weight: 7 },
];

/**
 * Check if browser supports Web Speech API
 */
export function isSpeechRecognitionSupported(): boolean {
  return 'webkitSpeechRecognition' in window || 'SpeechRecognition' in window;
}

/**
 * Get SpeechRecognition constructor (cross-browser)
 */
export function getSpeechRecognition(): any {
  return (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
}

/**
 * Extract location from text
 */
function extractLocation(text: string): string {
  const locationPatterns = [
    /(?:kasa|şube|daire|bölüm|kat|katı|alan)\s+(\w+)/gi,
    /(\w+)\s+(?:dairesinde|şubesinde|bölümünde)/gi,
  ];

  for (const pattern of locationPatterns) {
    const match = pattern.exec(text);
    if (match) {
      return match[0];
    }
  }

  // Fallback: check for specific location keywords
  const locations = ['kasa dairesi', 'şube', 'it departmanı', 'sunucu odası', 'arşiv'];
  for (const loc of locations) {
    if (text.toLowerCase().includes(loc)) {
      return loc.charAt(0).toUpperCase() + loc.slice(1);
    }
  }

  return 'Belirtilmemiş';
}

/**
 * Analyze text and match keywords to determine severity and category
 */
function analyzeText(text: string): {
  severity: 'critical' | 'high' | 'medium' | 'low';
  category: string;
  matches: KeywordMatch[];
} {
  const textLower = text.toLowerCase();
  const matches: KeywordMatch[] = [];

  // Find all matching keywords
  for (const keywordDef of RISK_KEYWORDS) {
    if (textLower.includes(keywordDef.keyword)) {
      matches.push(keywordDef);
    }
  }

  // If no matches, return default
  if (matches.length === 0) {
    return {
      severity: 'medium',
      category: 'Genel',
      matches: [],
    };
  }

  // Calculate severity based on highest weighted match
  const maxSeverityMatch = matches.reduce((max, curr) =>
    curr.weight > max.weight ? curr : max
  );

  // Determine primary category
  const categoryCount = new Map<string, number>();
  matches.forEach(m => {
    categoryCount.set(m.category, (categoryCount.get(m.category) || 0) + m.weight);
  });

  const primaryCategory = Array.from(categoryCount.entries())
    .sort((a, b) => b[1] - a[1])[0][0];

  return {
    severity: maxSeverityMatch.severity,
    category: primaryCategory,
    matches,
  };
}

/**
 * Generate a finding title from transcript
 */
function generateTitle(text: string, category: string): string {
  // If text is short, use it as title
  if (text.length < 60) {
    return text.charAt(0).toUpperCase() + text.slice(1);
  }

  // Extract first sentence
  const sentences = text.split(/[.!?]/);
  if (sentences[0] && sentences[0].length < 80) {
    return sentences[0].trim().charAt(0).toUpperCase() + sentences[0].trim().slice(1);
  }

  // Generate based on category and keywords
  const keywords = text.toLowerCase().split(/\s+/).slice(0, 5);
  return `${category}: ${keywords.join(' ')}`.slice(0, 80);
}

/**
 * Process voice transcript and create a finding draft
 */
export function processVoiceTranscript(transcript: string): VoiceProcessingResult {
  try {
    // Validate input
    if (!transcript || transcript.trim().length < 10) {
      return {
        success: false,
        error: 'Ses kaydı çok kısa. Lütfen daha detaylı bir açıklama yapın.',
      };
    }

    const cleanText = transcript.trim();
    const analysis = analyzeText(cleanText);
    const location = extractLocation(cleanText);
    const title = generateTitle(cleanText, analysis.category);

    const draft: VoiceFindingDraft = {
      id: `draft_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      title,
      description: cleanText,
      severity: analysis.severity,
      category: analysis.category,
      location,
      timestamp: new Date(),
      audioSource: true,
      confidence: analysis.matches.length > 0 ? 0.85 : 0.65,
    };

    return {
      success: true,
      draft,
      transcript: cleanText,
    };
  } catch (error) {
    return {
      success: false,
      error: 'Ses işlenirken bir hata oluştu.',
    };
  }
}

/**
 * Simulate voice input for demo purposes
 */
export async function simulateVoiceInput(): Promise<string> {
  const demoScripts = [
    'Kasa dairesinde yangın söndürücü tüpü eksik. Acil olarak temin edilmesi gerekiyor.',
    'Şube girişindeki güvenlik kamerası çalışmıyor. Kayıt yapılmıyor.',
    'IT departmanında sunucu odası erişim kartı kontrolü yok. Herkes giriş yapabiliyor.',
    'Müşteri dosyalarında onay imzası eksik. Birden fazla işlemde tespit edildi.',
    'Personel acil durum eğitimi almamış. Acil çıkış yerlerini bilmiyorlar.',
    'Arşiv odasında yangın alarmı test edilmemiş. Son test tarihi 2 yıl önce.',
    'Kasa sayım işleminde çift imza kuralına uyulmamış. Tek kişi sayım yapmış.',
    'ATM odasında 24 saat kamera kaydı tutulmuyor. Sadece gündüz kayıt var.',
  ];

  // Random delay to simulate speaking
  await new Promise(resolve => setTimeout(resolve, 2000 + Math.random() * 2000));

  // Return random demo script
  return demoScripts[Math.floor(Math.random() * demoScripts.length)];
}

/**
 * Save finding draft to database (Wave 29: Supabase field_notes tablosuna kaydet)
 */
export async function saveFindingDraft(draft: VoiceFindingDraft): Promise<boolean> {
  try {
    const { supabase } = await import('@/shared/api/supabase');

    const { error } = await supabase.from('field_notes').insert({
      title: draft?.title ?? 'Adsız Saha Notu',
      description: draft?.description ?? '',
      severity: draft?.severity ?? 'medium',
      category: draft?.category ?? 'Genel',
      location: draft?.location ?? '',
      audio_source: draft?.audioSource ?? false,
      confidence: draft?.confidence ?? 0.75,
      transcript: draft?.description ?? null,
      status: 'draft',
    });

    if (error) {
      console.error('[Wave29] field_notes insert error:', error);
      // Supabase hatası olursa localStorage fallback
      const drafts = JSON.parse(localStorage.getItem('field_agent_drafts') || '[]');
      drafts.unshift({ ...draft, timestamp: draft.timestamp.toISOString() });
      if (drafts.length > 20) drafts.length = 20;
      localStorage.setItem('field_agent_drafts', JSON.stringify(drafts));
    }

    return true;
  } catch (error) {
    console.error('Error saving draft:', error);
    return false;
  }
}

/**
 * Get recent drafts from Supabase (Wave 29: Gerçek DB'den çek)
 */
export async function getRecentDrafts(): Promise<VoiceFindingDraft[]> {
  try {
    const { supabase } = await import('@/shared/api/supabase');

    const { data, error } = await supabase
      .from('field_notes')
      .select('*')
      .eq('status', 'draft')
      .order('created_at', { ascending: false })
      .limit(20);

    if (error || !data?.length) {
      // localStorage fallback
      const drafts = JSON.parse(localStorage.getItem('field_agent_drafts') || '[]');
      return (drafts || []).map((d: any) => ({ ...d, timestamp: new Date(d?.timestamp) }));
    }

    return (data || []).map((row: any) => ({
      id: row?.id ?? '',
      title: row?.title ?? '',
      description: row?.description ?? '',
      severity: row?.severity ?? 'medium',
      category: row?.category ?? 'Genel',
      location: row?.location ?? '',
      timestamp: new Date(row?.created_at ?? Date.now()),
      audioSource: row?.audio_source ?? false,
      confidence: row?.confidence ?? 0.75,
    }));
  } catch (error) {
    return [];
  }
}

/**
 * Clear all drafts (localStorage + DB fallback)
 */
export function clearDrafts(): void {
  localStorage.removeItem('field_agent_drafts');
}

/**
 * Get severity color
 */
export function getSeverityColor(severity: 'critical' | 'high' | 'medium' | 'low'): string {
  switch (severity) {
    case 'critical': return '#dc2626';
    case 'high': return '#f97316';
    case 'medium': return '#eab308';
    case 'low': return '#22c55e';
    default: return '#64748b';
  }
}

/**
 * Get severity label in Turkish
 */
export function getSeverityLabelTR(severity: 'critical' | 'high' | 'medium' | 'low'): string {
  switch (severity) {
    case 'critical': return 'Kritik';
    case 'high': return 'Yüksek';
    case 'medium': return 'Orta';
    case 'low': return 'Düşük';
    default: return 'Bilinmiyor';
  }
}
