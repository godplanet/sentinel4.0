import { Upload, FileText, X } from 'lucide-react';
import { useState } from 'react';

export function FileUploader({ label = "Dosya Yükle" }: { label?: string }) {
  const [files, setFiles] = useState<string[]>([]);

  const handleUpload = () => {
    // Mock upload
    const mockFile = `Kanıt_Dokumanı_${Math.floor(Math.random() * 100)}.pdf`;
    setFiles([...files, mockFile]);
  };

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <span className="text-xs font-bold text-slate-500 uppercase">{label}</span>
        <button 
          onClick={handleUpload}
          className="flex items-center gap-2 px-3 py-1.5 bg-white border border-slate-200 rounded-lg text-xs font-bold text-slate-600 hover:text-indigo-600 hover:border-indigo-200 transition-all"
        >
          <Upload size={12} /> Seç
        </button>
      </div>
      
      {files.length > 0 && (
        <div className="space-y-2">
          {files.map((file, idx) => (
            <div key={idx} className="flex items-center justify-between p-2 bg-slate-50 border border-slate-200 rounded-lg text-xs">
              <div className="flex items-center gap-2">
                <FileText size={14} className="text-indigo-500"/>
                <span className="font-medium text-slate-700">{file}</span>
              </div>
              <button onClick={() => setFiles(files.filter((_, i) => i !== idx))} className="text-slate-400 hover:text-red-500">
                <X size={14} />
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}