import { useState } from 'react';
import { actionApi } from '@/entities/action';
import type { Action } from '@/entities/action';
import { Zap, Loader2, CheckCircle } from 'lucide-react';

interface AutoFixButtonProps {
  action: Action;
  onSuccess?: () => void;
}

export function AutoFixButton({ action, onSuccess }: AutoFixButtonProps) {
  const [fixing, setFixing] = useState(false);
  const [success, setSuccess] = useState(false);

  if (!action.auto_fix_config?.enabled) {
    return null;
  }

  const handleAutoFix = async () => {
    if (!confirm('Execute auto-fix? This will automatically close the action if successful.')) {
      return;
    }

    try {
      setFixing(true);
      await actionApi.autoFix(action.id);
      setSuccess(true);
      setTimeout(() => {
        onSuccess?.();
      }, 1500);
    } catch (error) {
      console.error('Auto-fix failed:', error);
      alert('Auto-fix failed. Please try manually.');
      setFixing(false);
    }
  };

  if (success) {
    return (
      <div className="flex items-center gap-2 px-4 py-2 bg-green-100 text-green-700 rounded-lg border border-green-300">
        <CheckCircle size={18} />
        <span className="font-medium">Auto-fixed successfully!</span>
      </div>
    );
  }

  return (
    <button
      onClick={handleAutoFix}
      disabled={fixing}
      className="
        flex items-center gap-2 px-4 py-2.5
        bg-gradient-to-r from-purple-600 to-purple-700
        text-white rounded-lg
        hover:from-purple-700 hover:to-purple-800
        shadow-md hover:shadow-lg
        transition-all font-medium
        disabled:opacity-50 disabled:cursor-not-allowed
        group
      "
    >
      {fixing ? (
        <>
          <Loader2 size={18} className="animate-spin" />
          <span>Executing Auto-Fix...</span>
        </>
      ) : (
        <>
          <Zap size={18} className="group-hover:animate-pulse" />
          <span>Auto-Fix</span>
        </>
      )}
    </button>
  );
}
