/**
 * Bulgu müzakere sohbeti — finding_negotiation_messages tablosuna React Query ile bağlanır.
 * Denetçi ve iş birimi ekranları bu hook'u kullanır; mock veri yok.
 */

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/shared/api/supabase';
import { ACTIVE_TENANT_ID } from '@/shared/lib/constants';

const UUID_REGEX = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

export interface NegotiationMessage {
  id: string;
  finding_id: string;
  message_text: string;
  role: 'AUDITOR' | 'AUDITEE';
  author_user_id: string;
  author_name: string;
  author_title: string | null;
  created_at: string;
  is_system_message: boolean;
}

export interface SendMessageInput {
  finding_id: string;
  message_text: string;
  role: 'AUDITOR' | 'AUDITEE';
  author_user_id: string;
  author_name: string;
  author_title?: string | null;
  tenant_id: string;
}

const QUERY_KEY_PREFIX = 'negotiation-chat';

function getCurrentUserForNegotiation(): {
  author_user_id: string;
  author_name: string;
  author_title: string | null;
} {
  try {
    const raw = localStorage.getItem('sentinel_user');
    if (raw) {
      const parsed = JSON.parse(raw) as { id?: string; name?: string; title?: string };
      const id = parsed?.id ?? '';
      const name = parsed?.name ?? 'Kullanıcı';
      const title = parsed?.title ?? null;
      if (id && UUID_REGEX.test(String(id))) {
        return { author_user_id: id, author_name: name, author_title: title };
      }
    }
  } catch {
    /* ignore */
  }
  return {
    author_user_id: '00000000-0000-0000-0000-000000000001',
    author_name: 'Sistem Kullanıcısı',
    author_title: null,
  };
}

async function fetchNegotiationMessages(findingId: string): Promise<NegotiationMessage[]> {
  const { data, error } = await supabase
    .from('finding_negotiation_messages')
    .select('id, finding_id, message_text, role, author_user_id, author_name, author_title, created_at, is_system_message')
    .eq('finding_id', findingId)
    .order('created_at', { ascending: true });

  if (error) throw error;
  return (data ?? []) as NegotiationMessage[];
}

async function insertNegotiationMessage(input: SendMessageInput): Promise<NegotiationMessage> {
  const { data, error } = await supabase
    .from('finding_negotiation_messages')
    .insert({
      finding_id: input.finding_id,
      message_text: input.message_text,
      role: input.role,
      author_user_id: input.author_user_id,
      author_name: input.author_name,
      author_title: input.author_title ?? null,
      tenant_id: input.tenant_id,
      is_system_message: false,
    })
    .select()
    .single();

  if (error) throw error;
  return data as NegotiationMessage;
}

export function useNegotiationChat(findingId: string | undefined) {
  const queryClient = useQueryClient();

  const { data: messages = [], isLoading } = useQuery({
    queryKey: [QUERY_KEY_PREFIX, findingId ?? ''],
    queryFn: () => fetchNegotiationMessages(findingId!),
    enabled: Boolean(findingId),
  });

  const sendMessageMutation = useMutation({
    mutationFn: insertNegotiationMessage,
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: [QUERY_KEY_PREFIX, variables.finding_id] });
    },
  });

  const currentUser = getCurrentUserForNegotiation();

  function sendMessage(content: string, role: 'AUDITOR' | 'AUDITEE') {
    if (!findingId?.trim() || !content.trim()) return Promise.reject(new Error('findingId and content required'));
    return sendMessageMutation.mutateAsync({
      finding_id: findingId,
      message_text: content.trim(),
      role,
      author_user_id: currentUser.author_user_id,
      author_name: currentUser.author_name,
      author_title: currentUser.author_title,
      tenant_id: ACTIVE_TENANT_ID,
    });
  }

  return {
    messages,
    isLoading,
    sendMessage,
    sendMessageMutation,
    isSending: sendMessageMutation.isPending,
    currentUser,
  };
}
