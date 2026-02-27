import { useState } from 'react';
import { X, UserPlus, Send, Users, MessageCircle } from 'lucide-react';
import clsx from 'clsx';

interface FindingRightSidebarProps {
  findingId: string;
  onClose: () => void;
}

interface TeamMember {
  id: string;
  name: string;
  role: string;
  avatar?: string;
}

interface Message {
  id: string;
  author: string;
  role: string;
  message: string;
  timestamp: string;
}

const AVAILABLE_TEAM_MEMBERS: TeamMember[] = [
  { id: '1', name: 'Ayşe Kaya', role: 'Operasyon Müdürü' },
  { id: '2', name: 'Mehmet Yılmaz', role: 'Şube Müdürü' },
  { id: '3', name: 'Fatma Demir', role: 'Risk Yöneticisi' },
  { id: '4', name: 'Ahmet Şahin', role: 'BT Sorumlusu' },
];

const MOCK_MESSAGES: Message[] = [
  {
    id: '1',
    author: 'Ahmet Aslan',
    role: 'Denetçi',
    message: 'Merhaba, bu bulgu ile ilgili görüşünüzü bekliyorum. Aksiyon planınızı 3 gün içinde iletebilir misiniz?',
    timestamp: '2026-02-01T14:32:00',
  },
  {
    id: '2',
    author: 'Mehmet Yılmaz',
    role: 'Şube Müdürü',
    message: 'Bulguyu inceledik. Aksiyon planını hazırlıyoruz. Yarın iletelim.',
    timestamp: '2026-02-01T15:45:00',
  },
];

export const FindingRightSidebar = ({ findingId, onClose }: FindingRightSidebarProps) => {
  const [activeTab, setActiveTab] = useState<'team' | 'messages'>('team');
  const [assignedMembers, setAssignedMembers] = useState<TeamMember[]>([
    { id: '2', name: 'Mehmet Yılmaz', role: 'Şube Müdürü' },
  ]);
  const [showAddMember, setShowAddMember] = useState(false);
  const [newMessage, setNewMessage] = useState('');
  const [messages, setMessages] = useState<Message[]>(MOCK_MESSAGES);

  const handleAddMember = (member: TeamMember) => {
    if (!assignedMembers.find((m) => m.id === member.id)) {
      setAssignedMembers([...assignedMembers, member]);
    }
    setShowAddMember(false);
  };

  const handleRemoveMember = (memberId: string) => {
    setAssignedMembers(assignedMembers.filter((m) => m.id !== memberId));
  };

  const handleSendMessage = () => {
    if (!newMessage.trim()) return;

    const message: Message = {
      id: String(Date.now()),
      author: 'Sen',
      role: 'Denetlenen',
      message: newMessage,
      timestamp: new Date().toISOString(),
    };

    setMessages([...messages, message]);
    setNewMessage('');
  };

  return (
    <div className="fixed right-0 top-0 h-screen w-96 bg-white border-l border-gray-200 shadow-xl z-50 flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-gray-200">
        <h3 className="text-lg font-semibold text-gray-900">Bulgu Yönetimi</h3>
        <button
          onClick={onClose}
          className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
        >
          <X className="w-5 h-5 text-gray-600" />
        </button>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-gray-200">
        <button
          onClick={() => setActiveTab('team')}
          className={clsx(
            'flex-1 flex items-center justify-center gap-2 px-4 py-3 text-sm font-medium transition-colors',
            activeTab === 'team'
              ? 'text-blue-600 border-b-2 border-blue-600'
              : 'text-gray-600 hover:text-gray-900'
          )}
        >
          <Users className="w-4 h-4" />
          Ekip
        </button>
        <button
          onClick={() => setActiveTab('messages')}
          className={clsx(
            'flex-1 flex items-center justify-center gap-2 px-4 py-3 text-sm font-medium transition-colors',
            activeTab === 'messages'
              ? 'text-blue-600 border-b-2 border-blue-600'
              : 'text-gray-600 hover:text-gray-900'
          )}
        >
          <MessageCircle className="w-4 h-4" />
          Mesajlar
        </button>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto">
        {activeTab === 'team' && (
          <div className="p-4 space-y-4">
            <div className="flex items-center justify-between">
              <h4 className="text-sm font-semibold text-gray-900">Atanan Ekip Üyeleri</h4>
              <button
                onClick={() => setShowAddMember(!showAddMember)}
                className="flex items-center gap-1 px-3 py-1.5 text-sm text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
              >
                <UserPlus className="w-4 h-4" />
                Ekle
              </button>
            </div>

            {showAddMember && (
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 space-y-2">
                <div className="text-xs font-medium text-blue-900 mb-2">Ekip Üyesi Seç</div>
                {AVAILABLE_TEAM_MEMBERS.filter(
                  (member) => !assignedMembers.find((m) => m.id === member.id)
                ).map((member) => (
                  <button
                    key={member.id}
                    onClick={() => handleAddMember(member)}
                    className="w-full flex items-center gap-3 p-2 hover:bg-blue-100 rounded-lg transition-colors text-left"
                  >
                    <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center text-white text-sm font-bold">
                      {member.name.split(' ').map((n) => n[0]).join('')}
                    </div>
                    <div>
                      <div className="text-sm font-medium text-gray-900">{member.name}</div>
                      <div className="text-xs text-gray-600">{member.role}</div>
                    </div>
                  </button>
                ))}
              </div>
            )}

            <div className="space-y-2">
              {assignedMembers.map((member) => (
                <div
                  key={member.id}
                  className="flex items-center justify-between p-3 bg-gray-50 rounded-lg border border-gray-200"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-blue-600 rounded-full flex items-center justify-center text-white text-sm font-bold">
                      {member.name.split(' ').map((n) => n[0]).join('')}
                    </div>
                    <div>
                      <div className="text-sm font-medium text-gray-900">{member.name}</div>
                      <div className="text-xs text-gray-600">{member.role}</div>
                    </div>
                  </div>
                  <button
                    onClick={() => handleRemoveMember(member.id)}
                    className="p-1 hover:bg-red-100 rounded transition-colors"
                  >
                    <X className="w-4 h-4 text-red-600" />
                  </button>
                </div>
              ))}

              {assignedMembers.length === 0 && (
                <div className="text-center py-8 text-sm text-gray-500">
                  Henüz ekip üyesi atanmadı
                </div>
              )}
            </div>

            <div className="pt-4 border-t border-gray-200">
              <div className="text-xs text-gray-600">
                <strong>Not:</strong> Atadığınız ekip üyeleri bu bulguyu görüntüleyebilir ve aksiyon planına katkıda bulunabilir.
              </div>
            </div>
          </div>
        )}

        {activeTab === 'messages' && (
          <div className="flex flex-col h-full">
            <div className="flex-1 p-4 space-y-4 overflow-y-auto">
              {messages.map((message) => (
                <div
                  key={message.id}
                  className={clsx(
                    'p-3 rounded-lg',
                    message.author === 'Sen'
                      ? 'bg-blue-50 border border-blue-200 ml-8'
                      : 'bg-gray-50 border border-gray-200 mr-8'
                  )}
                >
                  <div className="flex items-start gap-2 mb-2">
                    <div
                      className={clsx(
                        'w-8 h-8 rounded-full flex items-center justify-center text-white text-xs font-bold',
                        message.author === 'Sen' ? 'bg-blue-600' : 'bg-gray-600'
                      )}
                    >
                      {message.author.split(' ').map((n) => n[0]).join('')}
                    </div>
                    <div>
                      <div className="text-xs font-semibold text-gray-900">{message.author}</div>
                      <div className="text-xs text-gray-600">{message.role}</div>
                    </div>
                  </div>
                  <div className="text-sm text-gray-800 ml-10">{message.message}</div>
                  <div className="text-xs text-gray-500 ml-10 mt-1">
                    {new Date(message.timestamp).toLocaleString('tr-TR', {
                      day: 'numeric',
                      month: 'short',
                      hour: '2-digit',
                      minute: '2-digit',
                    })}
                  </div>
                </div>
              ))}
            </div>

            <div className="p-4 border-t border-gray-200">
              <div className="relative">
                <textarea
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' && !e.shiftKey) {
                      e.preventDefault();
                      handleSendMessage();
                    }
                  }}
                  rows={3}
                  className="w-full px-3 py-2 pr-12 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none text-sm"
                  placeholder="Mesaj yaz..."
                />
                <button
                  onClick={handleSendMessage}
                  disabled={!newMessage.trim()}
                  className="absolute right-2 bottom-2 w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <Send className="w-4 h-4 text-white" />
                </button>
              </div>
              <div className="text-xs text-gray-500 mt-2">
                Müfettiş ile doğrudan iletişim kurun
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
