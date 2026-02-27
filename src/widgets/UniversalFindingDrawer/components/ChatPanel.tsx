import { useState } from 'react';
import { Send, MessageSquare, User, Building, ShieldCheck } from 'lucide-react';
import clsx from 'clsx';
import type { FindingComment } from '@/entities/finding/model/types';

interface ChatPanelProps {
  findingId: string | null;
  currentUserId?: string;
}

// MOCK DATA
const MOCK_COMMENTS: FindingComment[] = [
  {
    id: 'c1', tenant_id: 't1', finding_id: 'f1',
    comment_text: 'Sayın denetçim, bulgudaki "sistematik hata" ifadesine itiraz ediyoruz. Bu sadece münferit bir olaydır.',
    comment_type: 'DISPUTE',
    author_id: 'u1', author_role: 'AUDITEE', author_name: 'Şube Müdürü',
    created_at: '2026-02-14T11:00:00Z', updated_at: '', is_deleted: false
  },
  {
    id: 'c2', tenant_id: 't1', finding_id: 'f1',
    comment_text: 'Kayıtları inceledik (Ek-1). Son 3 ayda 12 kez tekrarlandığı için sistematik olarak değerlendirilmiştir.',
    comment_type: 'CLARIFICATION',
    author_id: 'u2', author_role: 'AUDITOR', author_name: 'Kıdemli Denetçi',
    parent_comment_id: 'c1',
    created_at: '2026-02-14T11:15:00Z', updated_at: '', is_deleted: false
  }
];

export function ChatPanel({ findingId, currentUserId = 'u2' }: ChatPanelProps) {
  const [comments, setComments] = useState<FindingComment[]>(MOCK_COMMENTS);
  const [newMessage, setNewMessage] = useState('');

  const handleSendMessage = () => {
    if (!newMessage.trim()) return;
    
    const newComment: FindingComment = {
      id: Math.random().toString(), tenant_id: 't1', finding_id: findingId || '',
      comment_text: newMessage,
      comment_type: 'DISCUSSION',
      author_id: currentUserId, author_role: 'AUDITOR', author_name: 'Ben (Denetçi)',
      created_at: new Date().toISOString(), updated_at: '', is_deleted: false
    };

    setComments([...comments, newComment]);
    setNewMessage('');
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
        {comments.map((msg) => {
          const isMe = msg.author_role === 'AUDITOR'; // Demo için Auditor biziz
          return (
            <div key={msg.id} className={clsx("flex flex-col max-w-[90%]", isMe ? "ml-auto items-end" : "mr-auto items-start")}>
              
              <div className="flex items-center gap-2 mb-1 px-1">
                {isMe ? (
                   <>
                     <span className="text-[10px] font-bold text-slate-400">{new Date(msg.created_at).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</span>
                     <span className="text-[10px] font-bold text-blue-700">{msg.author_name}</span>
                     <ShieldCheck size={12} className="text-blue-600" />
                   </>
                ) : (
                   <>
                     <Building size={12} className="text-orange-600" />
                     <span className="text-[10px] font-bold text-orange-700">{msg.author_name}</span>
                     <span className="text-[10px] font-bold text-slate-400">{new Date(msg.created_at).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</span>
                   </>
                )}
              </div>

              <div className={clsx(
                "p-3 rounded-2xl text-sm font-medium shadow-sm border leading-relaxed",
                isMe 
                  ? "bg-blue-600 text-white border-blue-600 rounded-tr-none" 
                  : "bg-white text-slate-800 border-slate-200 rounded-tl-none"
              )}>
                {msg.comment_type === 'DISPUTE' && (
                  <span className="block text-[10px] font-black uppercase tracking-wider opacity-70 mb-1">⚠️ İtiraz Edildi</span>
                )}
                {msg.comment_text}
              </div>

            </div>
          );
        })}
      </div>

      {/* Mesaj Yazma Alanı */}
      <div className="pt-3 border-t border-slate-200 bg-white shrink-0">
        <div className="relative">
          <textarea
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && !e.shiftKey && (e.preventDefault(), handleSendMessage())}
            placeholder="Mesajınızı yazın..."
            className="w-full pl-4 pr-12 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none text-sm shadow-inner"
            rows={2}
          />
          <button 
            onClick={handleSendMessage}
            disabled={!newMessage.trim()}
            className="absolute right-2 bottom-2 p-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors shadow-sm"
          >
            <Send size={16} />
          </button>
        </div>
        <p className="text-[10px] text-center text-slate-400 mt-2">
          Enter ile gönder, Shift + Enter ile satır atla
        </p>
      </div>

    </div>
  );
}