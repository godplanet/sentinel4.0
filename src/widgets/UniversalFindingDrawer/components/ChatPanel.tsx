import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Send, MessageSquare, Building, ShieldCheck, Loader2 } from 'lucide-react';
import clsx from 'clsx';
import { fetchFindingComments, addFindingComment } from '@/entities/finding/api/comments';

interface ChatPanelProps {
  findingId: string | null;
  currentUserId?: string;
}

export function ChatPanel({ findingId, currentUserId = '' }: ChatPanelProps) {
  const queryClient = useQueryClient();
  const [newMessage, setNewMessage] = useState('');

  const { data: comments = [], isLoading } = useQuery({
    queryKey: ['finding-comments', findingId],
    queryFn: () => fetchFindingComments(findingId!),
    enabled: !!findingId,
  });

  const { mutate: sendComment, isPending: isSending } = useMutation({
    mutationFn: addFindingComment,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['finding-comments', findingId] });
      setNewMessage('');
    },
  });

  const handleSendMessage = () => {
    if (!newMessage.trim() || !findingId) return;
    sendComment({
      finding_id: findingId,
      comment_text: newMessage.trim(),
      comment_type: 'DISCUSSION',
      author_id: currentUserId,
      author_role: 'AUDITOR',
      author_name: 'Ben (Denetçi)',
    });
  };

  return (
    <div className="h-full flex flex-col animate-in fade-in duration-300">

      {/* Header */}
      <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 mb-4 shrink-0 flex items-start gap-3">
        <MessageSquare className="text-blue-600 w-6 h-6 shrink-0 mt-0.5" />
        <div>
          <h3 className="font-bold text-blue-900 mb-1">Müzakere Odası</h3>
          <p className="text-xs text-blue-800 leading-relaxed font-medium">
            Denetlenen birim ile yapılan resmi yazışmalar. Burada yazılanlar nihai rapora delil olarak eklenebilir.
          </p>
        </div>
      </div>

      {/* Mesaj Listesi */}
      <div className="flex-1 overflow-y-auto custom-scrollbar px-1 pb-4 space-y-4">
        {isLoading ? (
          <div className="flex items-center justify-center py-10 text-slate-400">
            <Loader2 size={20} className="animate-spin mr-2" />
            <span className="text-sm">Yükleniyor...</span>
          </div>
        ) : comments.length === 0 ? (
          <div className="text-center py-12 text-slate-400">
            <MessageSquare className="w-10 h-10 mx-auto mb-3 opacity-30" />
            <p className="text-sm font-medium">Henüz mesaj bulunmuyor.</p>
          </div>
        ) : (
          comments.map((msg) => {
            const isMe = msg.author_role === 'AUDITOR';
            return (
              <div key={msg.id} className={clsx("flex flex-col max-w-[90%]", isMe ? "ml-auto items-end" : "mr-auto items-start")}>
                <div className="flex items-center gap-2 mb-1 px-1">
                  {isMe ? (
                    <>
                      <span className="text-[10px] font-bold text-slate-400">{new Date(msg.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                      <span className="text-[10px] font-bold text-blue-700">{msg.author_name}</span>
                      <ShieldCheck size={12} className="text-blue-600" />
                    </>
                  ) : (
                    <>
                      <Building size={12} className="text-orange-600" />
                      <span className="text-[10px] font-bold text-orange-700">{msg.author_name}</span>
                      <span className="text-[10px] font-bold text-slate-400">{new Date(msg.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                    </>
                  )}
                </div>

                <div className={clsx(
                  "p-3 rounded-2xl text-sm font-medium shadow-sm border leading-relaxed",
                  isMe
                    ? "bg-blue-600 text-white border-blue-600 rounded-tr-none"
                    : "bg-surface text-slate-800 border-slate-200 rounded-tl-none"
                )}>
                  {msg.comment_type === 'DISPUTE' && (
                    <span className="block text-[10px] font-black uppercase tracking-wider opacity-70 mb-1">⚠️ İtiraz Edildi</span>
                  )}
                  {msg.comment_text}
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Mesaj Yazma Alanı */}
      <div className="pt-3 border-t border-slate-200 bg-surface shrink-0">
        <div className="relative">
          <textarea
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && !e.shiftKey && (e.preventDefault(), handleSendMessage())}
            placeholder="Mesajınızı yazın..."
            className="w-full pl-4 pr-12 py-3 bg-canvas border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none text-sm shadow-inner"
            rows={2}
            disabled={isSending}
          />
          <button
            onClick={handleSendMessage}
            disabled={!newMessage.trim() || isSending || !findingId}
            className="absolute right-2 bottom-2 p-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors shadow-sm"
          >
            {isSending ? <Loader2 size={16} className="animate-spin" /> : <Send size={16} />}
          </button>
        </div>
        <p className="text-[10px] text-center text-slate-400 mt-2">
          Enter ile gönder, Shift + Enter ile satır atla
        </p>
      </div>
    </div>
  );
}
