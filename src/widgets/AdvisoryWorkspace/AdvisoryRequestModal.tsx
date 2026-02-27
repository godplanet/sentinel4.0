import { useState, useEffect } from 'react';
import { X, Handshake, Loader2, Send } from 'lucide-react';
import { supabase } from '@/shared/api/supabase';
import { useCreateAdvisoryRequest } from '@/entities/advisory';

interface Props {
  onClose: () => void;
}

interface DeptOption {
  id: string;
  name: string;
}

export function AdvisoryRequestModal({ onClose }: Props) {
  const createRequest = useCreateAdvisoryRequest();
  const [departments, setDepartments] = useState<DeptOption[]>([]);
  const [deptId, setDeptId] = useState('');
  const [title, setTitle] = useState('');
  const [problem, setProblem] = useState('');
  const [outcome, setOutcome] = useState('');

  useEffect(() => {
    supabase
      .from('audit_entities')
      .select('id, name')
      .order('name')
      .then(({ data }) => {
        if (data) setDepartments(data as DeptOption[]);
      });
  }, []);

  const handleSubmit = async () => {
    if (!title.trim() || !problem.trim()) return;
    await createRequest.mutateAsync({
      title,
      problem_statement: problem,
      desired_outcome: outcome,
      department_id: deptId || null,
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black/30 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl max-w-lg w-full shadow-2xl overflow-hidden">
        <div className="px-6 py-4 bg-gradient-to-r from-blue-600 to-cyan-600 flex items-center justify-between">
          <h3 className="text-sm font-bold text-white flex items-center gap-2">
            <Handshake size={16} />
            Danismanlik Hizmeti Talep Et
          </h3>
          <button onClick={onClose} className="p-1 rounded hover:bg-white/20 text-white transition-colors">
            <X size={18} />
          </button>
        </div>

        <div className="p-6 space-y-4">
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1.5">Departman</label>
            <select
              value={deptId}
              onChange={(e) => setDeptId(e.target.value)}
              className="w-full px-4 py-3 bg-slate-50 border-2 border-slate-200 rounded-xl text-sm focus:outline-none focus:border-blue-400"
            >
              <option value="">Departman secin...</option>
              {departments.map((d) => (
                <option key={d.id} value={d.id}>{d.name}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1.5">Baslik</label>
            <input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Orn: Yeni Ise Alim Sureci Tasarimi"
              className="w-full px-4 py-3 bg-slate-50 border-2 border-slate-200 rounded-xl text-sm focus:outline-none focus:border-blue-400"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1.5">Problem / Ihtiyac</label>
            <textarea
              value={problem}
              onChange={(e) => setProblem(e.target.value)}
              placeholder="Ne konuda yardima ihtiyaciniz var?"
              rows={3}
              className="w-full px-4 py-3 bg-slate-50 border-2 border-slate-200 rounded-xl text-sm focus:outline-none focus:border-blue-400 resize-none"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1.5">Beklenen Sonuc</label>
            <textarea
              value={outcome}
              onChange={(e) => setOutcome(e.target.value)}
              placeholder="Bu danismanliktan ne bekliyorsunuz?"
              rows={2}
              className="w-full px-4 py-3 bg-slate-50 border-2 border-slate-200 rounded-xl text-sm focus:outline-none focus:border-blue-400 resize-none"
            />
          </div>
        </div>

        <div className="px-6 py-4 border-t border-slate-200 flex gap-3">
          <button
            onClick={onClose}
            className="flex-1 px-4 py-2.5 bg-slate-100 text-slate-700 text-sm font-bold rounded-xl hover:bg-slate-200 transition-colors"
          >
            Iptal
          </button>
          <button
            onClick={handleSubmit}
            disabled={!title.trim() || !problem.trim() || createRequest.isPending}
            className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 bg-blue-600 text-white text-sm font-bold rounded-xl hover:bg-blue-700 transition-colors disabled:opacity-50"
          >
            {createRequest.isPending ? <Loader2 size={14} className="animate-spin" /> : <Send size={14} />}
            Talep Gonder
          </button>
        </div>
      </div>
    </div>
  );
}
