import { Brain, User } from 'lucide-react';
import clsx from 'clsx';
import type { ChatMessage } from '@/shared/api/ai/types';

function renderMarkdownLite(text: string) {
  const lines = text.split('\n');
  return lines.map((line, i) => {
    let processed = line
      .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
      .replace(/\*(.+?)\*/g, '<em>$1</em>')
      .replace(/`(.+?)`/g, '<code class="bg-slate-200 px-1 rounded text-xs">$1</code>');

    if (line.startsWith('### ')) {
      processed = `<h4 class="font-bold text-base mt-3 mb-1">${processed.slice(5)}</h4>`;
    } else if (line.startsWith('## ')) {
      processed = `<h3 class="font-bold text-lg mt-3 mb-1">${processed.slice(4)}</h3>`;
    } else if (line.startsWith('# ')) {
      processed = `<h2 class="font-bold text-xl mt-3 mb-1">${processed.slice(3)}</h2>`;
    } else if (line.match(/^[-*]\s/)) {
      processed = `<li class="ml-4 list-disc">${processed.slice(2)}</li>`;
    } else if (line.match(/^\d+\.\s/)) {
      processed = `<li class="ml-4 list-decimal">${processed.replace(/^\d+\.\s/, '')}</li>`;
    }

    return (
      <span key={i} dangerouslySetInnerHTML={{ __html: processed + (i < lines.length - 1 ? '<br/>' : '') }} />
    );
  });
}

interface ChatBubbleProps {
  message: ChatMessage;
}

export function ChatBubble({ message }: ChatBubbleProps) {
  const isUser = message.role === 'user';

  return (
    <div className={clsx('flex gap-3', isUser ? 'justify-end' : 'justify-start')}>
      {!isUser && (
        <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-blue-600 to-cyan-500 flex items-center justify-center flex-shrink-0 shadow-md">
          <Brain className="w-4 h-4 text-white" />
        </div>
      )}
      <div
        className={clsx(
          'max-w-[85%] rounded-2xl px-4 py-3 text-sm leading-relaxed',
          isUser
            ? 'bg-blue-600 text-white rounded-br-md'
            : 'bg-white border border-slate-200 text-slate-800 rounded-bl-md shadow-sm'
        )}
      >
        {isUser ? (
          <p>{message.content}</p>
        ) : (
          <div className="prose prose-sm prose-slate max-w-none">
            {message.content ? (
              renderMarkdownLite(message.content)
            ) : (
              <span className="inline-flex items-center gap-1 text-slate-400">
                <span className="w-1.5 h-1.5 rounded-full bg-blue-500 animate-pulse" />
                <span className="w-1.5 h-1.5 rounded-full bg-blue-500 animate-pulse delay-150" />
                <span className="w-1.5 h-1.5 rounded-full bg-blue-500 animate-pulse delay-300" />
              </span>
            )}
            {message.isStreaming && message.content && (
              <span className="inline-block w-1 h-4 bg-blue-500 animate-pulse ml-0.5 align-text-bottom" />
            )}
          </div>
        )}
        <div className={clsx(
          'text-[10px] mt-1.5',
          isUser ? 'text-blue-200' : 'text-slate-400'
        )}>
          {message.timestamp.toLocaleTimeString('tr-TR', { hour: '2-digit', minute: '2-digit' })}
        </div>
      </div>
      {isUser && (
        <div className="w-8 h-8 rounded-lg bg-slate-700 flex items-center justify-center flex-shrink-0">
          <User className="w-4 h-4 text-white" />
        </div>
      )}
    </div>
  );
}
