import { useCallback, useRef, useState } from 'react';
import { supabase } from '@/shared/api/supabase';
import { computeSHA256 } from '@/entities/sox/crypto';

interface AutoSaveConfig {
  table: string;
  column: string;
  idColumn?: string;
  delay?: number;
}

interface CryoSaveConfig {
  documentId: string | null;
  createdByName: string;
  delay?: number;
}

export function useSheetAutoSave(recordId: string | null, config: AutoSaveConfig) {
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const [saving, setSaving] = useState(false);
  const [lastSaved, setLastSaved] = useState<Date | null>(null);
  const [error, setError] = useState<string | null>(null);

  const save = useCallback(
    (data: any) => {
      if (!recordId) return;
      if (timerRef.current) clearTimeout(timerRef.current);
      setError(null);

      timerRef.current = setTimeout(async () => {
        setSaving(true);
        try {
          const updatePayload: Record<string, any> = {
            [config.column]: data,
            updated_at: new Date().toISOString(),
          };

          const { error: err } = await supabase
            .from(config.table)
            .update(updatePayload)
            .eq(config.idColumn || 'id', recordId);

          if (err) throw err;
          setLastSaved(new Date());
        } catch (e: any) {
          setError(e.message || 'Save failed');
        } finally {
          setSaving(false);
        }
      }, config.delay || 30000);
    },
    [recordId, config.table, config.column, config.idColumn, config.delay]
  );

  const saveNow = useCallback(
    async (data: any) => {
      if (!recordId) return;
      if (timerRef.current) clearTimeout(timerRef.current);
      setError(null);
      setSaving(true);

      try {
        const updatePayload: Record<string, any> = {
          [config.column]: data,
          updated_at: new Date().toISOString(),
        };

        const { error: err } = await supabase
          .from(config.table)
          .update(updatePayload)
          .eq(config.idColumn || 'id', recordId);

        if (err) throw err;
        setLastSaved(new Date());
      } catch (e: any) {
        setError(e.message || 'Save failed');
      } finally {
        setSaving(false);
      }
    },
    [recordId, config.table, config.column, config.idColumn]
  );

  return { save, saveNow, saving, lastSaved, error };
}

export function useCryoSave(config: CryoSaveConfig) {
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const lastHashRef = useRef<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [lastSaved, setLastSaved] = useState<Date | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [versionCount, setVersionCount] = useState(0);

  const persistVersion = useCallback(async (data: Record<string, unknown>) => {
    if (!config.documentId) return null;

    const hash = await computeSHA256(data);
    if (hash === lastHashRef.current) return null;

    setSaving(true);
    setError(null);

    try {
      const { data: existing } = await supabase
        .from('office_versions')
        .select('version_number')
        .eq('document_id', config.documentId)
        .order('version_number', { ascending: false })
        .limit(1)
        .maybeSingle();

      const nextVersion = (existing?.version_number || 0) + 1;

      const { data: version, error: verErr } = await supabase
        .from('office_versions')
        .insert({
          document_id: config.documentId,
          version_number: nextVersion,
          content_data: data,
          content_hash: hash,
          change_summary: `Otomatik kayit v${nextVersion}`,
          is_frozen: true,
          created_by_name: config.createdByName,
        })
        .select()
        .single();
      if (verErr) throw verErr;

      await supabase
        .from('office_documents')
        .update({ current_version_id: version.id, updated_at: new Date().toISOString() })
        .eq('id', config.documentId);

      lastHashRef.current = hash;
      setLastSaved(new Date());
      setVersionCount(nextVersion);
      return version;
    } catch (e: any) {
      setError(e.message || 'Cryo save failed');
      return null;
    } finally {
      setSaving(false);
    }
  }, [config.documentId, config.createdByName]);

  const save = useCallback((data: Record<string, unknown>) => {
    if (!config.documentId) return;
    if (timerRef.current) clearTimeout(timerRef.current);
    timerRef.current = setTimeout(() => persistVersion(data), config.delay || 30000);
  }, [config.documentId, config.delay, persistVersion]);

  const saveNow = useCallback(async (data: Record<string, unknown>) => {
    if (timerRef.current) clearTimeout(timerRef.current);
    return persistVersion(data);
  }, [persistVersion]);

  return { save, saveNow, saving, lastSaved, error, versionCount };
}
