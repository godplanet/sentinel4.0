import { useState, useRef, useEffect } from 'react';
import clsx from 'clsx';

interface EditableNumberProps {
  value: number;
  onChange: (value: number) => void;
}

export function EditableNumber({ value, onChange }: EditableNumberProps) {
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState(String(value));
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    setDraft(String(value));
  }, [value]);

  useEffect(() => {
    if (editing && inputRef.current) {
      inputRef.current.focus();
      inputRef.current.select();
    }
  }, [editing]);

  const commit = () => {
    setEditing(false);
    const num = parseInt(draft, 10);
    if (!isNaN(num) && num >= 0 && num !== value) {
      onChange(num);
    } else {
      setDraft(String(value));
    }
  };

  if (editing) {
    return (
      <input
        ref={inputRef}
        type="number"
        min={0}
        value={draft}
        onChange={(e) => setDraft(e.target.value)}
        onBlur={commit}
        onKeyDown={(e) => {
          if (e.key === 'Enter') commit();
          if (e.key === 'Escape') { setDraft(String(value)); setEditing(false); }
        }}
        onClick={(e) => e.stopPropagation()}
        className="w-16 px-2 py-1 text-xs font-semibold text-center border-2 border-blue-400 rounded-md bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
      />
    );
  }

  return (
    <button
      onClick={(e) => { e.stopPropagation(); setEditing(true); }}
      className={clsx(
        'w-16 px-2 py-1 text-xs font-semibold text-center rounded-md border transition-colors',
        value > 0
          ? 'bg-blue-50 text-blue-800 border-blue-200 hover:border-blue-400'
          : 'bg-slate-50 text-slate-500 border-slate-200 hover:border-slate-400'
      )}
    >
      {value}
    </button>
  );
}
