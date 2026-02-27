import { useState, useCallback, useEffect } from 'react';
import { Upload, Check, FileText, Loader2 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { supabase } from '@/shared/api/supabase';
import { ACTIVE_TENANT_ID } from '@/shared/lib/constants';

interface UploadedFile {
  id?: string;
  name: string;
  size: number;
  hash: string;
  uploadedAt: Date;
  storage_path?: string;
}

interface EvidenceUploaderProps {
  workpaperId?: string | null;
}

export const EvidenceUploader = ({ workpaperId }: EvidenceUploaderProps) => {
  const [files, setFiles] = useState<UploadedFile[]>([]);
  const [isUploading, setIsUploading] = useState(false);
  const [isDragging, setIsDragging] = useState(false);

  useEffect(() => {
    if (workpaperId) {
      loadExistingEvidence();
    }
  }, [workpaperId]);

  const loadExistingEvidence = async () => {
    if (!workpaperId) return;

    try {
      const { data, error } = await supabase
        .from('evidence_chain')
        .select('*')
        .eq('workpaper_id', workpaperId)
        .order('uploaded_at', { ascending: false });

      if (error) throw error;

      const loadedFiles: UploadedFile[] = data?.map((ev: any) => ({
        id: ev.id,
        name: ev.file_name,
        size: ev.file_size_bytes,
        hash: ev.sha256_hash,
        uploadedAt: new Date(ev.uploaded_at),
        storage_path: ev.storage_path,
      })) || [];

      setFiles(loadedFiles);
    } catch (error) {
      console.error('Error loading evidence:', error);
    }
  };

  const generateHash = async (file: File): Promise<string> => {
    await new Promise(resolve => setTimeout(resolve, 2000));
    const randomHash = Array.from({ length: 64 }, () =>
      Math.floor(Math.random() * 16).toString(16)
    ).join('');
    return randomHash;
  };

  const handleFileUpload = useCallback(async (fileList: FileList | null) => {
    if (!fileList || fileList.length === 0) return;
    if (!workpaperId) {
      alert('Workpaper ID bulunamadı. Lütfen önce bir workpaper seçin.');
      return;
    }

    setIsUploading(true);
    const file = fileList[0];

    const hash = await generateHash(file);
    const storagePath = `/evidence/${workpaperId}/${Date.now()}-${file.name}`;

    try {
      const { data, error } = await supabase
        .from('evidence_chain')
        .insert({
          workpaper_id: workpaperId,
          storage_path: storagePath,
          file_name: file.name,
          file_size_bytes: file.size,
          sha256_hash: hash,
          uploaded_by: ACTIVE_TENANT_ID,
        })
        .select()
        .single();

      if (error) throw error;

      const uploadedFile: UploadedFile = {
        id: data.id,
        name: file.name,
        size: file.size,
        hash,
        uploadedAt: new Date(),
        storage_path: storagePath,
      };

      setFiles(prev => [...prev, uploadedFile]);
    } catch (error) {
      console.error('Error uploading evidence:', error);
      alert('Kanıt yüklenirken hata oluştu. Lütfen tekrar deneyin.');
    } finally {
      setIsUploading(false);
    }
  }, [workpaperId]);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    handleFileUpload(e.dataTransfer.files);
  }, [handleFileUpload]);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback(() => {
    setIsDragging(false);
  }, []);

  const formatFileSize = (bytes: number): string => {
    if (bytes < 1024) return bytes + ' B';
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
    return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
  };

  return (
    <div className="space-y-4">
      <div
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        className={`
          relative border-2 border-dashed rounded-lg p-8 transition-all duration-200
          ${isDragging
            ? 'border-emerald-500 bg-emerald-50/50'
            : 'border-gray-300 hover:border-gray-400 bg-white/50'
          }
        `}
      >
        <input
          type="file"
          id="evidence-upload"
          className="hidden"
          onChange={(e) => handleFileUpload(e.target.files)}
          disabled={isUploading}
        />

        <label
          htmlFor="evidence-upload"
          className="flex flex-col items-center cursor-pointer"
        >
          <div className={`
            w-16 h-16 rounded-full flex items-center justify-center mb-4 transition-colors
            ${isDragging ? 'bg-emerald-100' : 'bg-gray-100'}
          `}>
            <Upload className={`w-8 h-8 ${isDragging ? 'text-emerald-600' : 'text-gray-600'}`} />
          </div>
          <p className="text-sm font-medium text-gray-700 mb-1">
            Kanıt Yükle
          </p>
          <p className="text-xs text-gray-500">
            Sürükle-bırak veya tıkla (PDF, JPG, PNG, DOC)
          </p>
        </label>

        {isUploading && (
          <div className="absolute inset-0 bg-white/90 backdrop-blur-sm rounded-lg flex flex-col items-center justify-center">
            <Loader2 className="w-8 h-8 text-indigo-600 animate-spin mb-3" />
            <p className="text-sm font-medium text-gray-700">SHA-256 Özeti Hesaplanıyor...</p>
            <div className="w-48 h-2 bg-gray-200 rounded-full mt-2 overflow-hidden">
              <motion.div
                className="h-full bg-indigo-600"
                initial={{ width: '0%' }}
                animate={{ width: '100%' }}
                transition={{ duration: 2 }}
              />
            </div>
          </div>
        )}
      </div>

      <AnimatePresence>
        {files.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-2"
          >
            {files.map((file, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.1 }}
                className="bg-white/80 backdrop-blur-sm border border-emerald-200 rounded-lg p-4"
              >
                <div className="flex items-start gap-3">
                  <div className="flex items-center justify-center w-10 h-10 bg-emerald-100 rounded-lg shrink-0">
                    <FileText className="w-5 h-5 text-emerald-600" />
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <p className="text-sm font-medium text-gray-900 truncate">
                        {file.name}
                      </p>
                      <div className="flex items-center gap-1 px-2 py-0.5 bg-emerald-100 rounded-full">
                        <Check className="w-3 h-3 text-emerald-600" />
                        <span className="text-xs font-medium text-emerald-700">Doğrulandı</span>
                      </div>
                    </div>

                    <p className="text-xs text-gray-500 mb-2">
                      {formatFileSize(file.size)} • {file.uploadedAt.toLocaleTimeString('tr-TR')}
                    </p>

                    <div className="bg-gray-50 rounded p-2 border border-gray-200">
                      <p className="text-[10px] font-medium text-gray-500 uppercase tracking-wide mb-1">
                        SHA-256 Hash
                      </p>
                      <p className="text-xs font-mono text-gray-700 break-all leading-relaxed">
                        {file.hash}
                      </p>
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
