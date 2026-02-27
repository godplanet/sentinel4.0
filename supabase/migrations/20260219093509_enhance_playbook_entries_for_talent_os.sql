-- Playbook Entries Tablosunu Sıfırdan ve Tüm İhtiyaçlarla Birlikte Oluşturma
CREATE TABLE IF NOT EXISTS playbook_entries (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id text NOT NULL DEFAULT 'default',
    author_id uuid,
    title text NOT NULL DEFAULT 'Untitled',
    content text,
    category text NOT NULL DEFAULT 'LESSON_LEARNED' CHECK (category IN ('BEST_PRACTICE','LESSON_LEARNED','RISK_INSIGHT','METHODOLOGY','OBSERVATION')),
    tags text[] NOT NULL DEFAULT '{}',
    created_at timestamptz DEFAULT now(),
    updated_at timestamptz DEFAULT now()
);

-- Güvenlik (RLS) Ayarlarını Aktif Etme
ALTER TABLE playbook_entries ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Herkes kendi girdisini gorebilir" 
    ON playbook_entries FOR SELECT 
    USING (true);