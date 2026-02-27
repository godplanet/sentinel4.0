import { useState, useRef, useEffect } from 'react';
import { ChevronDown, Check, Loader2 } from 'lucide-react';
import clsx from 'clsx';

interface Option {
  value: string;
  label: string;
  color: string;
  bg: string;
  border: string;
}

interface StatusDropdownProps {
  value: string;
  options: Option[];
  onChange: (value: string) => void;
}

export function StatusDropdown({ value, options, onChange }: StatusDropdownProps) {
  const [open, setOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  const current = options.find(o => o.value === value) || options[0];

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const handleSelect = async (newValue: string) => {
    if (newValue === value) {
      setOpen(false);
      return;
    }
    setSaving(true);
    setOpen(false);
    await new Promise(r => setTimeout(r, 300));
    onChange(newValue);
    setSaving(false);
  };

  return (
    <div ref={ref} className="relative">
      <button
        onClick={(e) => { e.stopPropagation(); setOpen(!open); }}
        className={clsx(
          'flex items-center gap-1.5 px-3 py-1.5 rounded-md border text-xs font-semibold transition-all w-full justify-between min-w-[130px]',
          current.bg, current.color, current.border,
          'hover:shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-400 focus:ring-offset-1'
        )}
      >
        {saving ? (
          <span className="flex items-center gap-1.5">
            <Loader2 size={12} className="animate-spin" />
            Saving...
          </span>
        ) : (
          <span>{current.label}</span>
        )}
        <ChevronDown size={14} className={clsx('transition-transform', open && 'rotate-180')} />
      </button>

      {open && (
        <div className="absolute z-50 mt-1 w-full bg-white border border-slate-200 rounded-lg shadow-xl overflow-hidden animate-in fade-in slide-in-from-top-2 duration-150">
          {options.map((opt) => (
            <button
              key={opt.value}
              onClick={(e) => { e.stopPropagation(); handleSelect(opt.value); }}
              className={clsx(
                'flex items-center justify-between w-full px-3 py-2 text-xs font-medium transition-colors',
                opt.value === value ? `${opt.bg} ${opt.color}` : 'text-slate-700 hover:bg-slate-50'
              )}
            >
              <span>{opt.label}</span>
              {opt.value === value && <Check size={14} />}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
