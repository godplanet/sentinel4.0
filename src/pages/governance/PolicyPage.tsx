import { PageHeader } from '@/shared/ui';
import { PolicyLibrary } from '@/widgets/PolicyLibrary';
import { BookOpen, FileText, Shield } from 'lucide-react';

export default function PolicyPage() {
  return (
    <div className="space-y-6">
      <PageHeader
        title="Politika ve Prosedür Kütüphanesi"
        subtitle="Kurumsal politikaları okuyun ve onaylayın"
      />

      <div className="space-y-8">
        <div className="mb-8 bg-gradient-to-r from-blue-600 to-blue-700 rounded-xl p-6 text-white">
          <div className="flex items-start gap-4">
            <div className="w-12 h-12 bg-white/20 backdrop-blur-sm rounded-lg flex items-center justify-center flex-shrink-0">
              <Shield className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-xl font-bold mb-2">Policy Guardian</h2>
              <p className="text-blue-100 mb-4">
                Tüm kurumsal politikalar ve prosedürler tek bir merkezi platformda. Her
                çalışan, kendisiyle ilgili politikaları okumalı ve onaylamalıdır.
              </p>
              <div className="flex flex-wrap gap-4 text-sm">
                <div className="flex items-center gap-2 bg-white/20 rounded-lg px-3 py-1.5">
                  <FileText className="w-4 h-4" />
                  <span>Dijital Onay Sistemi</span>
                </div>
                <div className="flex items-center gap-2 bg-white/20 rounded-lg px-3 py-1.5">
                  <BookOpen className="w-4 h-4" />
                  <span>Versiyon Kontrolü</span>
                </div>
                <div className="flex items-center gap-2 bg-white/20 rounded-lg px-3 py-1.5">
                  <Shield className="w-4 h-4" />
                  <span>Uyumluluk Takibi</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        <PolicyLibrary />
      </div>
    </div>
  );
}
