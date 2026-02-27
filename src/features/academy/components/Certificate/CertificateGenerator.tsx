import { useRef } from 'react';
import { Printer, X, Award, ShieldCheck } from 'lucide-react';

export interface CertificateData {
  recipientName: string;
  courseTitle: string;
  examTitle: string;
  score: number;
  xpAwarded: number;
  completedAt: string;
  issuerName?: string;
  category?: string;
}

interface CertificateGeneratorProps {
  data: CertificateData;
  onClose: () => void;
}

export function CertificateGenerator({ data, onClose }: CertificateGeneratorProps) {
  const printRef = useRef<HTMLDivElement>(null);

  const completedDate = new Date(data.completedAt).toLocaleDateString('en-GB', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });

  const handlePrint = () => {
    const content = printRef.current;
    if (!content) return;

    const printWindow = window.open('', '_blank', 'width=900,height=700');
    if (!printWindow) return;

    printWindow.document.write(`
      <!DOCTYPE html>
      <html>
        <head>
          <title>Certificate — ${data.courseTitle}</title>
          <style>
            * { margin: 0; padding: 0; box-sizing: border-box; }
            body { font-family: 'Georgia', serif; background: white; }
            @page { size: A4 landscape; margin: 0; }
            @media print {
              html, body { width: 297mm; height: 210mm; }
            }
          </style>
        </head>
        <body>${content.outerHTML}</body>
      </html>
    `);
    printWindow.document.close();
    printWindow.focus();
    setTimeout(() => {
      printWindow.print();
      printWindow.close();
    }, 400);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4"
         style={{ backgroundColor: 'rgba(0,0,0,0.55)' }}>
      <div className="w-full max-w-3xl bg-white rounded-2xl shadow-2xl overflow-hidden border border-slate-200">
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100">
          <div className="flex items-center gap-2">
            <Award size={18} className="text-amber-500" />
            <h2 className="text-slate-900 font-semibold text-base">Certificate of Completion</h2>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={handlePrint}
              className="flex items-center gap-2 px-4 py-2 rounded-xl bg-slate-900 hover:bg-slate-700
                         text-white text-sm font-medium transition-colors"
            >
              <Printer size={15} />
              Print / Save PDF
            </button>
            <button
              onClick={onClose}
              className="w-8 h-8 rounded-lg flex items-center justify-center text-slate-400
                         hover:bg-slate-100 hover:text-slate-600 transition-colors"
            >
              <X size={16} />
            </button>
          </div>
        </div>

        <div className="p-6">
          <CertificateCanvas ref={printRef} data={data} completedDate={completedDate} />
        </div>

        <div className="px-6 pb-4 text-center">
          <p className="text-xs text-slate-400">
            This certificate is digitally issued by Sentinel GRC Academy and verifiable via the platform.
          </p>
        </div>
      </div>
    </div>
  );
}

import { forwardRef } from 'react';

const CertificateCanvas = forwardRef<
  HTMLDivElement,
  { data: CertificateData; completedDate: string }
>(({ data, completedDate }, ref) => {
  return (
    <div
      ref={ref}
      style={{
        width: '100%',
        aspectRatio: '297/210',
        position: 'relative',
        background: 'white',
        border: '1px solid #e2e8f0',
        borderRadius: '12px',
        overflow: 'hidden',
        fontFamily: 'Georgia, serif',
      }}
    >
      <div style={{
        position: 'absolute', inset: 0,
        background: 'linear-gradient(135deg, #f0f7ff 0%, #fff 40%, #fffbeb 100%)',
      }} />

      <div style={{
        position: 'absolute', inset: '12px',
        border: '2px solid #1e3a5f',
        borderRadius: '8px',
        pointerEvents: 'none',
      }} />
      <div style={{
        position: 'absolute', inset: '16px',
        border: '1px solid #93c5fd',
        borderRadius: '6px',
        pointerEvents: 'none',
      }} />

      <CornerOrn pos="top-left" />
      <CornerOrn pos="top-right" />
      <CornerOrn pos="bottom-left" />
      <CornerOrn pos="bottom-right" />

      <div style={{
        position: 'relative', zIndex: 10,
        display: 'flex', flexDirection: 'column', alignItems: 'center',
        justifyContent: 'center', height: '100%', padding: '32px 48px',
        textAlign: 'center',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '12px' }}>
          <ShieldCheckIcon />
          <span style={{ fontSize: '11px', fontFamily: 'system-ui, sans-serif', fontWeight: 700,
                         letterSpacing: '0.2em', color: '#1e3a5f', textTransform: 'uppercase' }}>
            Sentinel GRC Academy
          </span>
        </div>

        <div style={{ width: '48px', height: '2px', background: '#f59e0b', margin: '0 auto 16px' }} />

        <h1 style={{ fontSize: '22px', fontWeight: 400, color: '#1e293b', letterSpacing: '0.05em',
                     marginBottom: '6px' }}>
          Certificate of Completion
        </h1>

        <p style={{ fontSize: '10px', fontFamily: 'system-ui, sans-serif', color: '#64748b',
                    letterSpacing: '0.15em', textTransform: 'uppercase', marginBottom: '20px' }}>
          This is to certify that
        </p>

        <div style={{ marginBottom: '4px' }}>
          <span style={{ fontSize: '28px', fontWeight: 700, color: '#1e3a5f',
                         borderBottom: '2px solid #f59e0b', paddingBottom: '4px' }}>
            {data.recipientName}
          </span>
        </div>

        <p style={{ fontSize: '10px', fontFamily: 'system-ui, sans-serif', color: '#64748b',
                    letterSpacing: '0.1em', marginTop: '16px', marginBottom: '4px' }}>
          has successfully completed
        </p>

        <h2 style={{ fontSize: '17px', fontWeight: 700, color: '#1e293b', marginBottom: '4px' }}>
          {data.courseTitle}
        </h2>

        <p style={{ fontSize: '12px', color: '#475569', fontStyle: 'italic', marginBottom: '20px' }}>
          {data.examTitle}
        </p>

        <div style={{ display: 'flex', gap: '32px', marginBottom: '20px' }}>
          <CertStat label="Score Achieved" value={`${Math.round(data.score)}%`} />
          <div style={{ width: '1px', background: '#e2e8f0' }} />
          <CertStat label="XP Awarded" value={`+${data.xpAwarded} XP`} />
          <div style={{ width: '1px', background: '#e2e8f0' }} />
          {data.category && <CertStat label="Category" value={data.category} />}
        </div>

        <div style={{ width: '48px', height: '1px', background: '#cbd5e1', margin: '0 auto 16px' }} />

        <p style={{ fontSize: '11px', fontFamily: 'system-ui, sans-serif', color: '#94a3b8' }}>
          Issued on {completedDate}
          {data.issuerName ? ` · Authorized by ${data.issuerName}` : ''}
        </p>

        <div style={{ position: 'absolute', bottom: '28px', right: '48px',
                      display: 'flex', flexDirection: 'column', alignItems: 'flex-end' }}>
          <div style={{ width: '80px', borderBottom: '1px solid #1e3a5f', marginBottom: '4px' }} />
          <p style={{ fontSize: '9px', fontFamily: 'system-ui, sans-serif',
                      color: '#94a3b8', letterSpacing: '0.08em' }}>
            Digital Signature
          </p>
        </div>
      </div>
    </div>
  );
});

CertificateCanvas.displayName = 'CertificateCanvas';

function CertStat({ label, value }: { label: string; value: string }) {
  return (
    <div style={{ textAlign: 'center' }}>
      <p style={{ fontSize: '14px', fontWeight: 700, color: '#1e3a5f', marginBottom: '2px' }}>
        {value}
      </p>
      <p style={{ fontSize: '9px', fontFamily: 'system-ui, sans-serif',
                  color: '#94a3b8', letterSpacing: '0.08em', textTransform: 'uppercase' }}>
        {label}
      </p>
    </div>
  );
}

function CornerOrn({ pos }: { pos: 'top-left' | 'top-right' | 'bottom-left' | 'bottom-right' }) {
  const style: React.CSSProperties = {
    position: 'absolute', width: '32px', height: '32px',
    zIndex: 5,
    ...(pos === 'top-left'     && { top: '24px',    left: '24px' }),
    ...(pos === 'top-right'    && { top: '24px',    right: '24px', transform: 'scaleX(-1)' }),
    ...(pos === 'bottom-left'  && { bottom: '24px', left: '24px',  transform: 'scaleY(-1)' }),
    ...(pos === 'bottom-right' && { bottom: '24px', right: '24px', transform: 'scale(-1,-1)' }),
  };
  return (
    <svg style={style} viewBox="0 0 32 32" fill="none">
      <path d="M4 4 L4 12 M4 4 L12 4" stroke="#1e3a5f" strokeWidth="2" strokeLinecap="round" />
      <circle cx="4" cy="4" r="1.5" fill="#f59e0b" />
    </svg>
  );
}

function ShieldCheckIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#1e3a5f" strokeWidth="2"
         strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
      <polyline points="9 12 11 14 15 10" />
    </svg>
  );
}
