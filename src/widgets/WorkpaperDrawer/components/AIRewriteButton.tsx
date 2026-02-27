import { useState } from 'react';
import { Sparkles, Loader2 } from 'lucide-react';
import { motion } from 'framer-motion';

interface AIRewriteButtonProps {
  originalText: string;
  onRewrite: (rewrittenText: string) => void;
}

export const AIRewriteButton = ({ originalText, onRewrite }: AIRewriteButtonProps) => {
  const [isRewriting, setIsRewriting] = useState(false);

  const handleRewrite = async () => {
    if (!originalText.trim()) return;

    setIsRewriting(true);

    await new Promise(resolve => setTimeout(resolve, 2000));

    const rewrittenText = `[AI İyileştirme] ${originalText}. Bu bulgu, sistemik kontrol zayıflığından kaynaklanmakta olup, kurumsal risk yönetimi çerçevesinde kritik öneme sahiptir.`;

    onRewrite(rewrittenText);
    setIsRewriting(false);
  };

  return (
    <button
      onClick={handleRewrite}
      disabled={isRewriting || !originalText.trim()}
      className={`
        inline-flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm font-medium
        transition-all duration-200
        ${isRewriting || !originalText.trim()
          ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
          : 'bg-indigo-50 text-indigo-700 hover:bg-indigo-100 hover:shadow-md'
        }
      `}
    >
      {isRewriting ? (
        <>
          <Loader2 className="w-4 h-4 animate-spin" />
          <span>AI İyileştiriyor...</span>
        </>
      ) : (
        <>
          <motion.div
            animate={{
              scale: [1, 1.2, 1],
            }}
            transition={{
              duration: 2,
              repeat: Infinity,
              repeatType: 'loop',
            }}
          >
            <Sparkles className="w-4 h-4" />
          </motion.div>
          <span>AI ile İyileştir</span>
        </>
      )}
    </button>
  );
};
