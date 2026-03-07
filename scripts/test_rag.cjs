const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = 'https://zgygkehcysfhyhcrwnsw.supabase.co';
const supabaseKey = 'sb_publishable_3Zs9LC7ClXekefxZuZrU0Q_Ps4Nv-L0';
const supabase = createClient(supabaseUrl, supabaseKey);

const STOP_WORDS = new Set([
  'the', 'is', 'are', 'was', 'were', 'will', 'can', 'what', 'how', 'when', 'where',
  'who', 'why', 'this', 'that', 'these', 'those', 'and', 'but', 'for', 'with',
]);

function tokenize(text) {
  return text
    .toLowerCase()
    .replace(/[^\w\sğüşıöç]/g, ' ')
    .split(/\s+/)
    .filter(t => t.length > 2)
    .filter(t => !STOP_WORDS.has(t));
}

function escapeRegex(str) {
  return str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

function searchStandards(query, aaoifiStandards = []) {
  const queryLower = query.toLowerCase();
  const queryTokens = tokenize(queryLower);

  const scored = (aaoifiStandards || []).map(standard => {
    let score = 0;
    const standardText = `${standard.text} ${standard.section}`.toLowerCase();
    const keywords = (standard.keywords || []).join(' ').toLowerCase();

    // Keyword matching
    queryTokens.forEach(token => {
      if ((standard.keywords || []).some(kw => kw.toLowerCase() === token)) {
        score += 20;
      } else if (keywords.includes(token)) {
        score += 10;
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

    if (standard.standard_name.toLowerCase().includes(queryLower)) {
      score += 25;
    }

    if (standard.risk_level === 'critical') {
      score *= 1.2;
    }

    if (standard.ruling === 'prohibited' || standard.ruling === 'mandatory') {
      score *= 1.1;
    }

    return { standard, score };
  });

  const filtered = scored
    .filter(item => item.score > 0)
    .sort((a, b) => b.score - a.score);

  return filtered.slice(0, 5).map(item => item.standard);
}

async function run() {
  const { data: standards, error } = await supabase.from('shariah_rulings').select('*');
  if (error) {
    console.error(error);
    return;
  }
  
  console.log(`Fetched ${standards.length} standards.`);
  const query = "Arabayı galeriden satın almadan müşteriye satabilir miyiz?";
  const results = searchStandards(query, standards);
  
  console.log(`Found ${results.length} matching standards.`);
  if (results.length > 0) {
    console.log("Top match:", results[0].standard_name, results[0].article_no, results[0].text);
    console.log("Ruling:", results[0].ruling);
  }
}

run();
