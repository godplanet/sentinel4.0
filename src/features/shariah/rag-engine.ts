/**
 * RAG (Retrieval-Augmented Generation) Şer'i Uyumluluk Motoru
 *
 * Bu motor, istemci tarafında semantik arama uygular:
 * 1. Kullanıcı sorgusuna dayalı ilgili AAOIFI standartlarını alır
 * 2. Halüsinasyon OLMADAN bağlamsal olarak doğru yanıtlar üretir
 * 3. HER ZAMAN bilgi tabanından kesin kaynak gösterir
 *
 * Felsefe: "Kaynak Olmadan Fetva Yok"
 */

import { aaoifiStandards, searchByKeywords, type AAOIFIStandard } from './data/aaoifi_standards';

export interface RAGSearchResult {
  standards: AAOIFIStandard[];
  relevanceScores: number[];
  totalFound: number;
}

export interface FatwaResponse {
  answer: string;
  ruling: 'permissible' | 'not_permissible' | 'conditional' | 'requires_review';
  riskLevel: 'critical' | 'high' | 'medium' | 'low';
  citations: AAOIFIStandard[];
  reasoning: string[];
  warnings?: string[];
}

/**
 * Advanced semantic search with TF-IDF-like scoring
 */
export function searchStandards(query: string): RAGSearchResult {
  const queryLower = query.toLowerCase();
  const queryTokens = tokenize(queryLower);

  // Enhanced scoring algorithm
  const scored = aaoifiStandards.map(standard => {
    let score = 0;
    const standardText = `${standard.text} ${standard.section}`.toLowerCase();
    const keywords = standard.keywords.join(' ').toLowerCase();

    // Keyword matching (highest weight)
    queryTokens.forEach(token => {
      if (standard.keywords.some(kw => kw.toLowerCase() === token)) {
        score += 20; // Exact keyword match
      } else if (keywords.includes(token)) {
        score += 10; // Partial keyword match
      }
    });

    // Text content matching
    queryTokens.forEach(token => {
      const regex = new RegExp(`\\b${escapeRegex(token)}\\w*`, 'gi');
      const matches = standardText.match(regex);
      if (matches) {
        score += matches.length * 3;
      }
    });

    // Standard name matching
    if (standard.standard_name.toLowerCase().includes(queryLower)) {
      score += 25;
    }

    // Boost critical risk items
    if (standard.risk_level === 'critical') {
      score *= 1.2;
    }

    // Boost prohibited/mandatory rulings (more likely to be relevant)
    if (standard.ruling === 'prohibited' || standard.ruling === 'mandatory') {
      score *= 1.1;
    }

    return { standard, score };
  });

  const filtered = scored
    .filter(item => item.score > 0)
    .sort((a, b) => b.score - a.score);

  const top = filtered.slice(0, 5);

  return {
    standards: top.map(item => item.standard),
    relevanceScores: top.map(item => item.score),
    totalFound: filtered.length,
  };
}

/**
 * Generate a structured Fatwa response based on query
 */
export function generateFatwa(query: string): FatwaResponse {
  const searchResult = searchStandards(query);
  const citations = searchResult.standards;

  if (citations.length === 0) {
    return {
      answer: 'Bu sorgu için ilgili AAOIFI standardı bulunamadı. Lütfen soruyu yeniden ifade edin veya yetkili bir Şer\'i alime danışın.',
      ruling: 'requires_review',
      riskLevel: 'medium',
      citations: [],
      reasoning: ['Bilgi tabanında yetersiz veri'],
      warnings: ['Bu sorgu, insan Şer\'i uzman incelemesi gerektirir']
    };
  }

  // Analyze the citations to determine ruling
  const prohibitedCount = citations.filter(c => c.ruling === 'prohibited').length;
  const mandatoryCount = citations.filter(c => c.ruling === 'mandatory').length;
  const criticalCount = citations.filter(c => c.risk_level === 'critical').length;

  let ruling: FatwaResponse['ruling'] = 'requires_review';
  let answer = '';
  const reasoning: string[] = [];
  const warnings: string[] = [];

  // Decision logic
  if (prohibitedCount > 0) {
    ruling = 'not_permissible';
    const prohibited = citations.find(c => c.ruling === 'prohibited')!;
    answer = `CAİZ DEĞİLDİR. AAOIFI Standart No. ${prohibited.standard_no} (${prohibited.standard_name}), Madde ${prohibited.article_no}'ye göre: "${prohibited.text}"`;
    reasoning.push('Şer\'i olarak açıkça yasaklanan unsurlar içerir');
    if (criticalCount > 0) {
      warnings.push('⚠️ KRİTİK İHLAL: Bu işlem batıl (geçersiz) olabilir');
    }
  } else if (mandatoryCount > 0) {
    ruling = 'conditional';
    const mandatory = citations[0];
    answer = `ŞARTLI CAİZDİR. Bu işlem, SADECE aşağıdaki zorunlu koşullar karşılanırsa caizdir: "${mandatory.text}" (AAOIFI Standart No. ${mandatory.standard_no}, Madde ${mandatory.article_no})`;
    reasoning.push('Zorunlu koşullara sıkı uyumu gerektirir');
  } else {
    ruling = 'permissible';
    const permissible = citations[0];
    answer = `CAİZDİR. AAOIFI Standart No. ${permissible.standard_no} (${permissible.standard_name}), Madde ${permissible.article_no}'ye göre: "${permissible.text}"`;
    reasoning.push('Şer\'i prensiplere uyumludur');
  }

  // Determine overall risk level
  const riskLevel = criticalCount > 0 ? 'critical' :
                   citations.some(c => c.risk_level === 'high') ? 'high' :
                   citations.some(c => c.risk_level === 'medium') ? 'medium' : 'low';

  // Add context from multiple citations
  if (citations.length > 1) {
    reasoning.push(`Ek ilgili standartlar: ${citations.slice(1, 3).map(c => `${c.standard_name} (${c.article_no})`).join(', ')}`);
  }

  return {
    answer,
    ruling,
    riskLevel,
    citations,
    reasoning,
    warnings: warnings.length > 0 ? warnings : undefined,
  };
}

/**
 * Analyze a finding for Shari'ah compliance issues
 */
export function analyzeFindingCompliance(findingDescription: string): {
  complianceStatus: 'compliant' | 'non_compliant' | 'needs_review';
  violations: AAOIFIStandard[];
  recommendations: string[];
  severity: 'critical' | 'high' | 'medium' | 'low';
} {
  const searchResult = searchStandards(findingDescription);
  const relevantStandards = searchResult.standards;

  // Check for violations
  const violations = relevantStandards.filter(s =>
    s.ruling === 'prohibited' || (s.ruling === 'mandatory' && s.risk_level === 'critical')
  );

  const complianceStatus = violations.length > 0 ? 'non_compliant' :
                          relevantStandards.length > 0 ? 'needs_review' : 'compliant';

  const severity = violations.some(v => v.risk_level === 'critical') ? 'critical' :
                  violations.some(v => v.risk_level === 'high') ? 'high' : 'medium';

  const recommendations: string[] = [];

  if (violations.length > 0) {
    recommendations.push('Şer\'i uyumluluğu sağlamak için acil düzeltme gereklidir');
    recommendations.push('İlerlemeden önce Şer\'i Danışma Kurulu\'na (SSB) danışın');
    violations.forEach(v => {
      recommendations.push(`${v.standard_name} (Madde ${v.article_no}) ihlalini giderin`);
    });
  } else if (relevantStandards.length > 0) {
    recommendations.push('Belirlenen standartlara uyumluluğu gözden geçirin');
    recommendations.push('Zorunlu koşullara uyumu belgeleyin');
  }

  return {
    complianceStatus,
    violations,
    recommendations,
    severity,
  };
}

/**
 * Kullanıcı rehberliği için önerilen sorular
 */
export function getSuggestedQuestions(): string[] {
  return [
    'Arabayı galeriden satın almadan müşteriye satabilir miyiz?',
    'Sukuk\'ta anapara garantisi vermek caiz midir?',
    'Gecikmiş taksitler için gecikme faizi uygulayabilir miyiz?',
    'Geçerli Murabaha\'nın koşulları nelerdir?',
    'Organize Teverruk caiz midir?',
    'İcara\'da kira ödemeleri LIBOR\'a bağlanabilir mi?',
    'Varlık teslimattan önce yok olursa ne olur?',
    'Mudarebe\'de sabit getiri garanti edebilir miyiz?',
  ];
}

// Helper functions
function tokenize(text: string): string[] {
  return text
    .toLowerCase()
    .replace(/[^\w\s]/g, ' ')
    .split(/\s+/)
    .filter(t => t.length > 2)
    .filter(t => !STOP_WORDS.has(t));
}

function escapeRegex(str: string): string {
  return str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

const STOP_WORDS = new Set([
  'the', 'is', 'are', 'was', 'were', 'will', 'can', 'what', 'how', 'when', 'where',
  'who', 'why', 'this', 'that', 'these', 'those', 'and', 'but', 'for', 'with',
]);
