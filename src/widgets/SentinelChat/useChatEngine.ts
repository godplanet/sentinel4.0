import { useCallback } from 'react';
import { useAISettingsStore } from '@/features/ai-agents/model/ai-settings-store';
import { useChatStore } from '@/features/ai-agents/model/chat-store';
import { createEngine } from '@/shared/api/ai/engine';
import type { ChatMessage } from '@/shared/api/ai/types';
import {
  useSentinelContext,
  generateSystemPrompt,
  formatContextForAI,
  executeSlashCommand,
  isSlashCommand,
  type SentinelPromptConfig
} from '@/features/ai-agents/sentinel-prime';

export function useChatEngine() {
  const { getConfig, isConfigured, persona, includeContext } = useAISettingsStore();
  const { addMessage, updateLastMessage } = useChatStore();

  const { context: sentinelContext, isLoading: contextLoading } = useSentinelContext({
    includeConstitution: true,
    includeUniverse: true,
    includeFindings: true,
  });

  const sendMessage = useCallback(async (
    prompt: string,
    pageContext: string
  ) => {
    const userMsg: ChatMessage = {
      id: Date.now().toString(),
      role: 'user',
      content: prompt,
      timestamp: new Date(),
    };
    addMessage(userMsg);

    const assistantMsg: ChatMessage = {
      id: (Date.now() + 1).toString(),
      role: 'assistant',
      content: '',
      timestamp: new Date(),
      isStreaming: true,
    };
    addMessage(assistantMsg);

    try {
      if (isSlashCommand(prompt)) {
        const result = await executeSlashCommand(prompt);
        updateLastMessage(result || 'Command executed.', true);
        return;
      }

      const engine = createEngine(getConfig());

      const sentinelConfig: SentinelPromptConfig = {
        persona: 'skeptical',
        mode: 'audit',
        language: 'en',
      };

      let systemPrompt = '';
      if (sentinelContext && !contextLoading) {
        systemPrompt = generateSystemPrompt(sentinelContext, sentinelConfig);
      }

      const contextPrefix = sentinelContext
        ? `${formatContextForAI(sentinelContext)}\n\n`
        : '';

      const pageContextData = includeContext && pageContext
        ? `\n[PAGE_CONTEXT: ${pageContext}]\n\n`
        : '';

      const fullPrompt = `${contextPrefix}${pageContextData}${prompt}`;

      let fullText = '';

      for await (const chunk of engine.streamText(fullPrompt, systemPrompt || persona, undefined)) {
        fullText += chunk;
        updateLastMessage(fullText);
      }

      updateLastMessage(fullText, true);
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : 'Bilinmeyen hata';
      updateLastMessage(`[Hata] ${errorMessage}`, true);
    }
  }, [getConfig, persona, includeContext, addMessage, updateLastMessage, sentinelContext, contextLoading]);

  return {
    sendMessage,
    isConfigured: isConfigured(),
    contextLoading,
    hasContext: !!sentinelContext,
  };
}
