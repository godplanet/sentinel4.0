-- =============================================================================
-- Wave 82: Immutable Evidence Vault (Blockchain Ledger)
-- =============================================================================

-- 1. immutable_evidences — Blokzincir Üzerinde Hash'leri Saklanan Adli Kanıtlar
CREATE TABLE IF NOT EXISTS public.immutable_evidences (
  id                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id           UUID NOT NULL REFERENCES public.tenants(id),
  evidence_name       TEXT NOT NULL,               -- Örn: 'Şüpheli İşlem Dekontu (PDF)'
  category            TEXT NOT NULL,               -- 'Fraud', 'Audit_Report', 'Regulatory_Filings', 'HR_Dispute'
  uploader_email      TEXT NOT NULL,               -- Yükleyen / Mühürleyen kişi
  file_size_bytes     BIGINT NOT NULL,
  file_mime_type      TEXT NOT NULL DEFAULT 'application/pdf',
  original_hash       TEXT NOT NULL,               -- SHA-256 (Dosyanın orjinal hash değeri)
  ipfs_cid            TEXT,                        -- Merkeziyetsiz depolama (gerekiyorsa)
  blockchain_network  TEXT NOT NULL DEFAULT 'Ethereum_Quorum', -- 'Ethereum_Quorum', 'Polygon', 'Hyperledger'
  tx_hash             TEXT,                        -- Blokzincir İşlem (Tx) Hash Adresi
  is_verified         BOOLEAN NOT NULL DEFAULT false, -- Hash doğrulaması
  sealed_at           TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  created_at          TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 2. blockchain_tx_logs — Smart Contract Mühürleme Logları
CREATE TABLE IF NOT EXISTS public.blockchain_tx_logs (
  id                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id           UUID NOT NULL REFERENCES public.tenants(id),
  evidence_id         UUID NOT NULL REFERENCES public.immutable_evidences(id) ON DELETE CASCADE,
  action              TEXT NOT NULL,               -- 'SEAL_EVIDENCE', 'VERIFY_HASH', 'TRANSFER_CUSTODY'
  tx_status           TEXT NOT NULL DEFAULT 'PENDING', -- 'PENDING', 'CONFIRMED', 'FAILED'
  block_number        BIGINT,                      -- Eğer onaylandıysa konulan blok
  gas_used            NUMERIC(15,2),               -- İşlem maliyeti (gerekiyorsa)
  executed_by         TEXT NOT NULL,               -- İşlemi tetikleyen (sistem veya cüzdan)
  occurred_at         TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_immutable_evidences_tenant ON public.immutable_evidences(tenant_id, is_verified);
CREATE INDEX IF NOT EXISTS idx_blockchain_tx_logs_evidence ON public.blockchain_tx_logs(evidence_id, tx_status);

-- RLS
ALTER TABLE public.immutable_evidences ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.blockchain_tx_logs  ENABLE ROW LEVEL SECURITY;

CREATE POLICY "immutable_evidences_access"
  ON public.immutable_evidences FOR ALL TO authenticated
  USING (tenant_id = '11111111-1111-1111-1111-111111111111'::UUID)
  WITH CHECK (tenant_id = '11111111-1111-1111-1111-111111111111'::UUID);

CREATE POLICY "blockchain_tx_logs_access"
  ON public.blockchain_tx_logs FOR ALL TO authenticated
  USING (tenant_id = '11111111-1111-1111-1111-111111111111'::UUID)
  WITH CHECK (tenant_id = '11111111-1111-1111-1111-111111111111'::UUID);
