import { useState } from 'react';
import { Brain, Sparkles, MessageSquare, Send, Check, AlertTriangle, Loader2 } from 'lucide-react';
import clsx from 'clsx';
import type { ReportComment } from '@/entities/report/model/types';

interface AICopilotPanelProps {
  comments: ReportComment[];
  reportId: string;
  onAddComment: (data: { report_id: string; text: string; type?: string }) => void;
  onResolve: (id: string) => void;
  onAIGenerate: (prompt: string) => void;
  aiLoading?: boolean;
}

type TabKey = 'ai' | 'comments';

const AI_PROMPTS = [
  { label: 'Yonetici Ozeti', prompt: 'Bu raporun yonetici ozetini olustur.' },
  { label: 'Kritik Bulgular', prompt: 'Kritik ve yuksek riskli bulgulari ozetle.' },
  { label: 'Aksiyon Onerisi', prompt: 'Bulgulara yonelik aksiyon onerileri olustur.' },
  { label: 'Risk Degerlendirmesi', prompt: 'Genel risk degerlendirmesini yap.' },
];

export function AICopilotPanel({
  comments,
  reportId,
  onAddComment,
  onResolve,
  onAIGenerate,
  aiLoading,
}: AICopilotPanelProps) {
  const [tab, setTab] = useState<TabKey>('ai');
  const [commentText, setCommentText] = useState('');
  const [commentType, setCommentType] = useState<'COMMENT' | 'SUGGESTION'>('COMMENT');
  const [customPrompt, setCustomPrompt] = useState('');
  const [showResolved, setShowResolved] = useState(false);

  const activeComments = comments.filter((c) => !c.resolved);
  const resolvedComments = comments.filter((c) => c.resolved);

  const handleSubmitComment = () => {
    if (!commentText.trim()) return;
    onAddComment({ report_id: reportId, text: commentText.trim(), type: commentType });
    setCommentText('');
  };

  return (
    <div className="flex flex-col h-full">
      <div className="flex border-b border-slate-200">
        <button
          onClick={() => setTab('ai')}
          className={clsx(
            'flex-1 flex items-center justify-center gap-1.5 px-3 py-2.5 text-xs font-bold transition-colors',
            tab === 'ai' ? 'text-blue-600 border-b-2 border-blue-600' : 'text-slate-500 hover:text-slate-700'
          )}
        >
          <Sparkles size={13} />
          AI Copilot
        </button>
        <button
          onClick={() => setTab('comments')}
          className={clsx(
            'flex-1 flex items-center justify-center gap-1.5 px-3 py-2.5 text-xs font-bold transition-colors relative',
            tab === 'comments' ? 'text-blue-600 border-b-2 border-blue-600' : 'text-slate-500 hover:text-slate-700'
          )}
        >
          <MessageSquare size={13} />
          Yorumlar
          {activeComments.length > 0 && (
            <span className="w-4 h-4 bg-blue-600 text-white text-[9px] font-bold rounded-full flex items-center justify-center">
              {activeComments.length}
            </span>
          )}
        </button>
      </div>

      {tab === 'ai' ? (
        <div className="flex-1 overflow-auto p-3 space-y-3">
          <div className="bg-gradient-to-br from-sky-50 to-cyan-50 rounded-xl p-4 border border-sky-200">
            <div className="flex items-center gap-2 mb-3">
              <Brain size={16} className="text-blue-600" />
              <span className="text-xs font-bold text-slate-800">Sentinel Ghostwriter</span>
            </div>
            <p className="text-[11px] text-slate-500 mb-3 leading-relaxed">
              Rapor icerigine dayali otomatik ozet ve analiz olusturun.
            </p>

            <div className="space-y-1.5">
              {AI_PROMPTS.map((p) => (
                <button
                  key={p.label}
                  onClick={() => onAIGenerate(p.prompt)}
                  disabled={aiLoading}
                  className="w-full text-left px-3 py-2 text-xs font-medium text-slate-700 bg-white rounded-lg border border-sky-100 hover:border-blue-300 hover:bg-blue-50 transition-all disabled:opacity-50"
                >
                  {p.label}
                </button>
              ))}
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Ozel Prompt</label>
            <div className="flex gap-1.5">
              <input
                type="text"
                value={customPrompt}
                onChange={(e) => setCustomPrompt(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && customPrompt.trim()) {
                    onAIGenerate(customPrompt.trim());
                    setCustomPrompt('');
                  }
                }}
                placeholder="AI'a bir sey sor..."
                className="flex-1 px-3 py-2 text-xs border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400 bg-white"
              />
              <button
                onClick={() => {
                  if (customPrompt.trim()) {
                    onAIGenerate(customPrompt.trim());
                    setCustomPrompt('');
                  }
                }}
                disabled={!customPrompt.trim() || aiLoading}
                className="p-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-40 transition-colors"
              >
                {aiLoading ? <Loader2 size={14} className="animate-spin" /> : <Send size={14} />}
              </button>
            </div>
          </div>
        </div>
      ) : (
        <div className="flex-1 flex flex-col">
          <div className="flex-1 overflow-auto p-3 space-y-2">
            {activeComments.length === 0 && (
              <div className="text-center py-6 text-xs text-slate-400">Henuz yorum yok</div>
            )}
            {activeComments.map((c) => (
              <CommentCard key={c.id} comment={c} onResolve={onResolve} />
            ))}
            {resolvedComments.length > 0 && (
              <button
                onClick={() => setShowResolved(!showResolved)}
                className="text-xs text-slate-500 hover:text-slate-700 w-full text-center py-2"
              >
                {showResolved ? 'Gizle' : `${resolvedComments.length} cozumlenmis`}
              </button>
            )}
            {showResolved && resolvedComments.map((c) => <CommentCard key={c.id} comment={c} onResolve={onResolve} />)}
          </div>

          <div className="p-3 border-t border-slate-200 space-y-2">
            <div className="flex gap-1">
              {(['COMMENT', 'SUGGESTION'] as const).map((t) => (
                <button
                  key={t}
                  onClick={() => setCommentType(t)}
                  className={clsx(
                    'px-2.5 py-1 text-[10px] font-bold rounded-md transition-colors',
                    commentType === t
                      ? t === 'COMMENT' ? 'bg-blue-100 text-blue-700' : 'bg-amber-100 text-amber-700'
                      : 'bg-slate-100 text-slate-500'
                  )}
                >
                  {t === 'COMMENT' ? 'Yorum' : 'Oneri'}
                </button>
              ))}
            </div>
            <div className="flex gap-2">
              <input
                type="text"
                value={commentText}
                onChange={(e) => setCommentText(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSubmitComment()}
                placeholder="Yorum ekle..."
                className="flex-1 px-3 py-2 text-xs border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <button
                onClick={handleSubmitComment}
                disabled={!commentText.trim()}
                className="p-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-40 transition-colors"
              >
                <Send size={14} />
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function CommentCard({ comment, onResolve }: { comment: ReportComment; onResolve: (id: string) => void }) {
  const isSuggestion = comment.type === 'SUGGESTION';
  return (
    <div
      className={clsx(
        'rounded-lg p-3 text-xs',
        comment.resolved ? 'bg-slate-50 opacity-60' : isSuggestion ? 'bg-amber-50 border border-amber-200' : 'bg-white border border-slate-200 shadow-sm'
      )}
    >
      <div className="flex items-start justify-between gap-2">
        <div className="flex items-center gap-1.5 mb-1">
          {isSuggestion && <AlertTriangle size={11} className="text-amber-600" />}
          <span className="font-bold text-slate-600">{isSuggestion ? 'Oneri' : 'Yorum'}</span>
          <span className="text-slate-400 text-[10px]">
            {new Date(comment.created_at).toLocaleString('tr-TR', { day: '2-digit', month: '2-digit', hour: '2-digit', minute: '2-digit' })}
          </span>
        </div>
        {!comment.resolved && (
          <button onClick={() => onResolve(comment.id)} className="p-1 hover:bg-green-100 rounded" title="Cozumle">
            <Check size={11} className="text-green-600" />
          </button>
        )}
      </div>
      <p className="text-slate-700 leading-relaxed">{comment.text}</p>
    </div>
  );
}
