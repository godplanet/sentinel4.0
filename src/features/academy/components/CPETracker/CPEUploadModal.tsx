import { useState, useRef } from 'react';
import { X, Upload, FileCheck2, Loader2, AlertCircle } from 'lucide-react';
import { createCpeRecord } from '../../api/cpeApi';
import type { UserCpeRecord } from '../../types';

const CPE_PROVIDERS = [
  'IIA', 'ISACA', 'AICPA', 'ACAMS', 'CFA Institute', 'CIMA',
  'LinkedIn Learning', 'Coursera', 'NASBA', 'Internal Training',
  'BDDK', 'SPK', 'Other',
];

interface CPEUploadModalProps {
  userId: string;
  onClose: () => void;
  onCreated: (record: UserCpeRecord) => void;
}

interface FormState {
  title: string;
  provider: string;
  customProvider: string;
  credit_hours: string;
  date_earned: string;
  notes: string;
}

const INITIAL_FORM: FormState = {
  title: '',
  provider: 'IIA',
  customProvider: '',
  credit_hours: '',
  date_earned: new Date().toISOString().split('T')[0],
  notes: '',
};

export function CPEUploadModal({ userId, onClose, onCreated }: CPEUploadModalProps) {
  const [form, setForm]           = useState<FormState>(INITIAL_FORM);
  const [fileName, setFileName]   = useState<string | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors]       = useState<Partial<Record<keyof FormState, string>>>({});
  const [submitError, setSubmitError] = useState<string | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);

  const set = (field: keyof FormState) => (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>
  ) => {
    setForm((f) => ({ ...f, [field]: e.target.value }));
    setErrors((e) => ({ ...e, [field]: undefined }));
  };

  const handleFileChange = (file: File | null) => {
    if (!file) return;
    if (file.type !== 'application/pdf' && !file.type.startsWith('image/')) {
      setErrors((e) => ({ ...e, title: 'Only PDF or image files are allowed.' }));
      return;
    }
    setFileName(file.name);
  };

  const validate = (): boolean => {
    const errs: typeof errors = {};
    if (!form.title.trim())       errs.title        = 'Course name is required.';
    if (!form.credit_hours.trim() || isNaN(Number(form.credit_hours)) || Number(form.credit_hours) <= 0)
                                  errs.credit_hours = 'Enter a valid number of hours.';
    if (!form.date_earned)        errs.date_earned  = 'Date is required.';
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    setIsSubmitting(true);
    setSubmitError(null);

    const provider = form.provider === 'Other' ? form.customProvider.trim() || 'Other' : form.provider;

    try {
      const record = await createCpeRecord({
        user_id: userId,
        title: form.title.trim(),
        provider,
        credit_hours: Number(form.credit_hours),
        date_earned: form.date_earned,
        notes: form.notes.trim() || undefined,
        evidence_url: fileName ? `mock://uploads/${fileName}` : undefined,
      });
      onCreated(record);
    } catch (err) {
      setSubmitError(err instanceof Error ? err.message : 'Failed to save record.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4"
         style={{ backgroundColor: 'rgba(0,0,0,0.4)' }}>
      <div className="w-full max-w-lg bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden">
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100">
          <div>
            <h2 className="text-slate-900 font-semibold text-base">Log External CPE</h2>
            <p className="text-slate-500 text-xs mt-0.5">
              Record external training hours with evidence
            </p>
          </div>
          <button onClick={onClose}
                  className="w-8 h-8 rounded-lg flex items-center justify-center text-slate-400
                             hover:bg-slate-100 hover:text-slate-600 transition-colors">
            <X size={16} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="px-6 py-5 space-y-4">
          <Field label="Course / Training Name" error={errors.title} required>
            <input
              type="text"
              value={form.title}
              onChange={set('title')}
              placeholder="e.g. IIA Internal Audit Fundamentals"
              className={inputClass(!!errors.title)}
            />
          </Field>

          <div className="grid grid-cols-2 gap-4">
            <Field label="Provider" error={errors.provider}>
              <select value={form.provider} onChange={set('provider')} className={inputClass(false)}>
                {CPE_PROVIDERS.map((p) => (
                  <option key={p} value={p}>{p}</option>
                ))}
              </select>
            </Field>

            {form.provider === 'Other' && (
              <Field label="Provider Name" error={errors.customProvider}>
                <input
                  type="text"
                  value={form.customProvider}
                  onChange={set('customProvider')}
                  placeholder="Enter provider name"
                  className={inputClass(false)}
                />
              </Field>
            )}
          </div>

          <div className="grid grid-cols-2 gap-4">
            <Field label="CPE Hours" error={errors.credit_hours} required>
              <input
                type="number"
                min="0.5"
                max="80"
                step="0.5"
                value={form.credit_hours}
                onChange={set('credit_hours')}
                placeholder="e.g. 8"
                className={inputClass(!!errors.credit_hours)}
              />
            </Field>

            <Field label="Completion Date" error={errors.date_earned} required>
              <input
                type="date"
                value={form.date_earned}
                onChange={set('date_earned')}
                max={new Date().toISOString().split('T')[0]}
                className={inputClass(!!errors.date_earned)}
              />
            </Field>
          </div>

          <Field label="Evidence (PDF / Image)">
            <div
              onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
              onDragLeave={() => setIsDragging(false)}
              onDrop={(e) => {
                e.preventDefault();
                setIsDragging(false);
                handleFileChange(e.dataTransfer.files[0] ?? null);
              }}
              onClick={() => fileRef.current?.click()}
              className={`relative border-2 border-dashed rounded-xl p-4 cursor-pointer
                transition-colors text-center
                ${isDragging ? 'border-blue-400 bg-blue-50' : 'border-slate-200 hover:border-blue-300 hover:bg-slate-50'}`}
            >
              <input
                ref={fileRef}
                type="file"
                accept="application/pdf,image/*"
                className="sr-only"
                onChange={(e) => handleFileChange(e.target.files?.[0] ?? null)}
              />
              {fileName ? (
                <div className="flex items-center justify-center gap-2">
                  <FileCheck2 size={18} className="text-emerald-500 flex-shrink-0" />
                  <span className="text-sm text-slate-700 font-medium truncate max-w-xs">{fileName}</span>
                </div>
              ) : (
                <div className="flex flex-col items-center gap-1.5">
                  <Upload size={20} className="text-slate-400" />
                  <p className="text-sm text-slate-500">
                    <span className="text-blue-600 font-medium">Click to upload</span> or drag & drop
                  </p>
                  <p className="text-xs text-slate-400">PDF or image (mock — no actual upload)</p>
                </div>
              )}
            </div>
          </Field>

          <Field label="Notes">
            <textarea
              value={form.notes}
              onChange={set('notes')}
              rows={2}
              placeholder="Optional: additional context about this training"
              className={`${inputClass(false)} resize-none`}
            />
          </Field>

          {submitError && (
            <div className="flex items-center gap-2 text-rose-600 text-sm bg-rose-50 border border-rose-200 rounded-lg px-3 py-2">
              <AlertCircle size={14} />
              {submitError}
            </div>
          )}

          <div className="flex items-center justify-end gap-3 pt-2">
            <button type="button" onClick={onClose}
                    className="px-4 py-2 text-sm font-medium text-slate-600 rounded-xl border border-slate-200
                               hover:bg-slate-50 transition-colors">
              Cancel
            </button>
            <button type="submit" disabled={isSubmitting}
                    className="flex items-center gap-2 px-5 py-2 text-sm font-semibold text-white rounded-xl
                               bg-blue-600 hover:bg-blue-500 transition-colors disabled:opacity-60
                               shadow-sm shadow-blue-200">
              {isSubmitting && <Loader2 size={14} className="animate-spin" />}
              {isSubmitting ? 'Saving…' : 'Save CPE Record'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

function Field({
  label,
  error,
  required,
  children,
}: {
  label: string;
  error?: string;
  required?: boolean;
  children: React.ReactNode;
}) {
  return (
    <div>
      <label className="block text-xs font-semibold text-slate-600 mb-1.5">
        {label}
        {required && <span className="text-rose-500 ml-0.5">*</span>}
      </label>
      {children}
      {error && <p className="mt-1 text-xs text-rose-500">{error}</p>}
    </div>
  );
}

function inputClass(hasError: boolean) {
  return `w-full rounded-xl border px-3 py-2 text-sm text-slate-900 bg-white
    placeholder:text-slate-400 outline-none transition-colors
    focus:ring-2 focus:ring-blue-500 focus:border-transparent
    ${hasError ? 'border-rose-400' : 'border-slate-200 hover:border-slate-300'}`;
}
