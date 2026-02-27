import { useState, useRef, useEffect } from 'react';
import { Send, FileText, AlertCircle } from 'lucide-react';
import { useNegotiationChat, type SendMessageInput } from '../api/useNegotiationChat';

interface NegotiationChatProps {
  findingId: string;
  currentUserId: string;
  currentUserName: string;
  currentUserRole: 'AUDITOR' | 'AUDITEE';
  tenantId: string;
}

export function NegotiationChat({
  findingId,
  currentUserId,
  currentUserName,
  currentUserRole,
  tenantId,
}: NegotiationChatProps) {
  const { messages, loading, sending, sendMessage } = useNegotiationChat(findingId);
  const [inputText, setInputText] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to bottom on new messages
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSend = async () => {
    if (!inputText.trim() || sending) return;

    const input: SendMessageInput = {
      finding_id: findingId,
      message_text: inputText.trim(),
      role: currentUserRole,
      author_user_id: currentUserId,
      author_name: currentUserName,
      author_title: currentUserRole === 'AUDITOR' ? 'Kıdemli Denetçi' : 'Şube Müdürü',
      tenant_id: tenantId,
    };

    const result = await sendMessage(input);
    if (result.success) {
      setInputText('');
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-sm text-gray-500">Müzakereler yükleniyor...</div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-500 to-blue-600 text-white px-4 py-3 rounded-t-lg">
        <div className="flex items-center gap-2">
          <FileText className="w-5 h-5" />
          <div>
            <div className="font-semibold">Resmi Müzakere Kaydı</div>
            <div className="text-xs text-blue-100">
              {messages.length} mesaj • Silinemez kayıt
            </div>
          </div>
        </div>
      </div>

      {/* Info Banner */}
      <div className="bg-amber-50 border border-amber-200 px-3 py-2 text-xs text-amber-800 flex items-start gap-2">
        <AlertCircle className="w-4 h-4 mt-0.5 flex-shrink-0" />
        <div>
          <strong>Yasal Uyarı:</strong> Bu sohbet resmi denetim kaydıdır. Tüm mesajlar
          kalıcı ve silinemez şekilde saklanır.
        </div>
      </div>

      {/* Messages Area */}
      <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-gray-50">
        {messages.length === 0 ? (
          <div className="text-center text-gray-400 py-8">
            <FileText className="w-12 h-12 mx-auto mb-2 opacity-50" />
            <div className="text-sm">Henüz mesaj yok</div>
            <div className="text-xs">Müzakereyi başlatmak için mesaj gönderin</div>
          </div>
        ) : (
          messages.map((msg) => {
            const isAuditor = msg.role === 'AUDITOR';
            const isSystem = msg.is_system_message;
            const isCurrentUser = msg.author_user_id === currentUserId;

            if (isSystem) {
              return (
                <div key={msg.id} className="text-center">
                  <div className="inline-block bg-gray-300 text-gray-700 px-3 py-1 rounded-full text-xs">
                    {msg.message_text}
                  </div>
                  <div className="text-xs text-gray-400 mt-1">
                    {new Date(msg.created_at).toLocaleString('tr-TR')}
                  </div>
                </div>
              );
            }

            return (
              <div
                key={msg.id}
                className={`flex ${isCurrentUser ? 'justify-end' : 'justify-start'}`}
              >
                <div
                  className={`max-w-[80%] ${
                    isAuditor
                      ? 'bg-blue-600 text-white'
                      : 'bg-white text-gray-800 border border-gray-200'
                  } rounded-lg px-4 py-2.5 shadow-sm`}
                >
                  {/* Author Info */}
                  <div
                    className={`text-xs font-semibold mb-1 ${
                      isAuditor ? 'text-blue-100' : 'text-gray-600'
                    }`}
                  >
                    {msg.author_name}
                    {msg.author_title && ` • ${msg.author_title}`}
                  </div>

                  {/* Message Text */}
                  <div className="text-sm whitespace-pre-wrap break-words">
                    {msg.message_text}
                  </div>

                  {/* Timestamp */}
                  <div
                    className={`text-xs mt-1.5 ${
                      isAuditor ? 'text-blue-200' : 'text-gray-500'
                    }`}
                  >
                    {new Date(msg.created_at).toLocaleString('tr-TR', {
                      day: '2-digit',
                      month: 'short',
                      hour: '2-digit',
                      minute: '2-digit',
                    })}
                  </div>
                </div>
              </div>
            );
          })
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input Area */}
      <div className="border-t border-gray-200 p-3 bg-white">
        <div className="flex gap-2">
          <textarea
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            onKeyDown={handleKeyPress}
            placeholder="Mesajınızı yazın... (Enter: Gönder, Shift+Enter: Yeni satır)"
            className="flex-1 resize-none border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            rows={3}
            disabled={sending}
          />
          <button
            onClick={handleSend}
            disabled={!inputText.trim() || sending}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center gap-2"
          >
            <Send className="w-4 h-4" />
            <span className="text-sm font-medium">Gönder</span>
          </button>
        </div>
        <div className="text-xs text-gray-500 mt-2">
          <strong>Role:</strong> {currentUserRole === 'AUDITOR' ? 'Müfettiş' : 'Denetlenen'}
        </div>
      </div>
    </div>
  );
}
