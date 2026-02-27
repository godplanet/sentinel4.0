import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/shared/api/supabase';

export interface NegotiationMessage {
  id: string;
  finding_id: string;
  message_text: string;
  role: 'AUDITOR' | 'AUDITEE';
  author_user_id: string;
  author_name: string;
  author_title?: string;
  created_at: string;
  is_system_message: boolean;
}

export interface SendMessageInput {
  finding_id: string;
  message_text: string;
  role: 'AUDITOR' | 'AUDITEE';
  author_user_id: string;
  author_name: string;
  author_title?: string;
  tenant_id: string;
}

export function useNegotiationChat(findingId: string | undefined) {
  const [messages, setMessages] = useState<NegotiationMessage[]>([]);
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);

  // Fetch messages
  const fetchMessages = useCallback(async () => {
    if (!findingId) {
      setMessages([]);
      setLoading(false);
      return;
    }

    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('finding_negotiation_messages')
        .select('*')
        .eq('finding_id', findingId)
        .order('created_at', { ascending: true });

      if (error) throw error;
      setMessages(data || []);
    } catch (error) {
      console.error('Error fetching negotiation messages:', error);
      setMessages([]);
    } finally {
      setLoading(false);
    }
  }, [findingId]);

  // Send message
  const sendMessage = useCallback(async (input: SendMessageInput) => {
    setSending(true);
    try {
      const { data, error } = await supabase
        .from('finding_negotiation_messages')
        .insert({
          finding_id: input.finding_id,
          message_text: input.message_text,
          role: input.role,
          author_user_id: input.author_user_id,
          author_name: input.author_name,
          author_title: input.author_title,
          tenant_id: input.tenant_id,
          is_system_message: false,
        })
        .select()
        .single();

      if (error) throw error;

      // Add to local state for optimistic UI
      setMessages((prev) => [...prev, data]);
      return { success: true, message: data };
    } catch (error) {
      console.error('Error sending negotiation message:', error);
      return { success: false, error };
    } finally {
      setSending(false);
    }
  }, []);

  // Send system message (auto-generated)
  const sendSystemMessage = useCallback(async (
    findingId: string,
    messageText: string,
    tenantId: string
  ) => {
    try {
      const { data, error } = await supabase
        .from('finding_negotiation_messages')
        .insert({
          finding_id: findingId,
          message_text: messageText,
          role: 'AUDITOR',
          author_user_id: 'SYSTEM',
          author_name: 'Sistem',
          tenant_id: tenantId,
          is_system_message: true,
        })
        .select()
        .single();

      if (error) throw error;
      setMessages((prev) => [...prev, data]);
      return { success: true, message: data };
    } catch (error) {
      console.error('Error sending system message:', error);
      return { success: false, error };
    }
  }, []);

  // Real-time subscription
  useEffect(() => {
    if (!findingId) return;

    fetchMessages();

    // Subscribe to new messages
    const channel = supabase
      .channel(`negotiation:${findingId}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'finding_negotiation_messages',
          filter: `finding_id=eq.${findingId}`,
        },
        (payload) => {
          const newMessage = payload.new as NegotiationMessage;
          setMessages((prev) => {
            // Avoid duplicates
            if (prev.some((m) => m.id === newMessage.id)) return prev;
            return [...prev, newMessage];
          });
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [findingId, fetchMessages]);

  return {
    messages,
    loading,
    sending,
    sendMessage,
    sendSystemMessage,
    refetch: fetchMessages,
  };
}
