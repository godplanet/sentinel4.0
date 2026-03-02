/*
  action_evidence tablosuna AI analiz özeti kolonu.
  Sentinel Prime kanıt analizi sonucu bu alana yazılır.
*/
ALTER TABLE action_evidence
  ADD COLUMN IF NOT EXISTS ai_analysis_summary text;

COMMENT ON COLUMN action_evidence.ai_analysis_summary IS 'AI kanıt analizi özet metni (Sentinel Prime çıktısı)';
