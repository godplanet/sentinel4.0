import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/shared/api/supabase';
import { computeSHA256 } from '@/entities/sox/crypto';
import type { OfficeDocument, OfficeVersion } from './types';

export function useOfficeDocuments(workpaperId?: string | null) {
  return useQuery({
    queryKey: ['office-documents', workpaperId],
    queryFn: async () => {
      let q = supabase
        .from('office_documents')
        .select('*')
        .eq('is_archived', false)
        .order('updated_at', { ascending: false });
      if (workpaperId) q = q.eq('workpaper_id', workpaperId);
      const { data, error } = await q;
      if (error) throw error;
      return (data || []) as OfficeDocument[];
    },
  });
}

export function useAllOfficeDocuments() {
  return useQuery({
    queryKey: ['office-documents-all'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('office_documents')
        .select('*')
        .eq('is_archived', false)
        .order('updated_at', { ascending: false });
      if (error) throw error;
      return (data || []) as OfficeDocument[];
    },
  });
}

export function useOfficeDocument(documentId: string | null) {
  return useQuery({
    queryKey: ['office-document', documentId],
    enabled: !!documentId,
    queryFn: async () => {
      const { data, error } = await supabase
        .from('office_documents')
        .select('*')
        .eq('id', documentId!)
        .maybeSingle();
      if (error) throw error;
      return data as OfficeDocument | null;
    },
  });
}

export function useDocumentVersions(documentId: string | null) {
  return useQuery({
    queryKey: ['office-versions', documentId],
    enabled: !!documentId,
    queryFn: async () => {
      const { data, error } = await supabase
        .from('office_versions')
        .select('*')
        .eq('document_id', documentId!)
        .order('version_number', { ascending: false });
      if (error) throw error;
      return (data || []) as OfficeVersion[];
    },
  });
}

export function useLatestVersion(documentId: string | null) {
  return useQuery({
    queryKey: ['office-latest-version', documentId],
    enabled: !!documentId,
    queryFn: async () => {
      const { data, error } = await supabase
        .from('office_versions')
        .select('*')
        .eq('document_id', documentId!)
        .order('version_number', { ascending: false })
        .limit(1)
        .maybeSingle();
      if (error) throw error;
      return data as OfficeVersion | null;
    },
  });
}

export function useSaveVersion() {
  const qc = useQueryClient();

  return useMutation({
    mutationFn: async (input: {
      documentId: string;
      contentData: Record<string, unknown>;
      changeSummary: string;
      createdByName: string;
    }) => {
      const { data: existing } = await supabase
        .from('office_versions')
        .select('version_number')
        .eq('document_id', input.documentId)
        .order('version_number', { ascending: false })
        .limit(1)
        .maybeSingle();

      const nextVersion = (existing?.version_number || 0) + 1;
      const hash = await computeSHA256(input.contentData);

      if (existing) {
        const { data: prev } = await supabase
          .from('office_versions')
          .select('content_hash')
          .eq('document_id', input.documentId)
          .order('version_number', { ascending: false })
          .limit(1)
          .maybeSingle();
        if (prev?.content_hash === hash) {
          return null;
        }
      }

      const { data: version, error: verErr } = await supabase
        .from('office_versions')
        .insert({
          document_id: input.documentId,
          version_number: nextVersion,
          content_data: input.contentData,
          content_hash: hash,
          change_summary: input.changeSummary,
          is_frozen: true,
          created_by_name: input.createdByName,
        })
        .select()
        .single();
      if (verErr) throw verErr;

      const { error: docErr } = await supabase
        .from('office_documents')
        .update({
          current_version_id: version.id,
          updated_at: new Date().toISOString(),
        })
        .eq('id', input.documentId);
      if (docErr) throw docErr;

      return version as OfficeVersion;
    },
    onSuccess: (version) => {
      if (version) {
        qc.invalidateQueries({ queryKey: ['office-versions', version.document_id] });
        qc.invalidateQueries({ queryKey: ['office-latest-version', version.document_id] });
        qc.invalidateQueries({ queryKey: ['office-document', version.document_id] });
        qc.invalidateQueries({ queryKey: ['office-documents'] });
        qc.invalidateQueries({ queryKey: ['office-documents-all'] });
      }
    },
  });
}

export function useCreateDocument() {
  const qc = useQueryClient();

  return useMutation({
    mutationFn: async (input: {
      title: string;
      docType: 'SPREADSHEET' | 'DOCUMENT';
      workpaperId?: string | null;
      createdByName: string;
      initialContent: Record<string, unknown>;
    }) => {
      const { data: doc, error: docErr } = await supabase
        .from('office_documents')
        .insert({
          title: input.title,
          doc_type: input.docType,
          workpaper_id: input.workpaperId || null,
          created_by_name: input.createdByName,
        })
        .select()
        .single();
      if (docErr) throw docErr;

      const hash = await computeSHA256(input.initialContent);

      const { data: ver, error: verErr } = await supabase
        .from('office_versions')
        .insert({
          document_id: doc.id,
          version_number: 1,
          content_data: input.initialContent,
          content_hash: hash,
          change_summary: 'Ilk versiyon',
          is_frozen: true,
          created_by_name: input.createdByName,
        })
        .select()
        .single();
      if (verErr) throw verErr;

      await supabase
        .from('office_documents')
        .update({ current_version_id: ver.id })
        .eq('id', doc.id);

      return doc as OfficeDocument;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['office-documents'] });
      qc.invalidateQueries({ queryKey: ['office-documents-all'] });
    },
  });
}
