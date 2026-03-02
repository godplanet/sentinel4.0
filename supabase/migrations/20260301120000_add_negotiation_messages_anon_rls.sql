/*
  finding_negotiation_messages tablosu için anon erişim (dev/local).
  Uygulama Supabase Auth oturumu açmadan anon key ile çalıştığında
  müzakere mesajları okunabilsin ve yazılabilsin.
*/
CREATE POLICY "Dev: anon select finding_negotiation_messages"
  ON finding_negotiation_messages FOR SELECT TO anon USING (true);

CREATE POLICY "Dev: anon insert finding_negotiation_messages"
  ON finding_negotiation_messages FOR INSERT TO anon WITH CHECK (true);
