import { ArrowDown, Target } from 'lucide-react';
import { motion } from 'framer-motion';

interface FiveWhysInputProps {
  whys?: string[];
  setWhys?: (whys: string[]) => void;
  onChange?: (whys: string[]) => void;
}

export const FiveWhysInput = ({ whys: externalWhys, setWhys: externalSetWhys, onChange }: FiveWhysInputProps) => {
  const whys = externalWhys || ['', '', '', '', ''];

  const handleWhyChange = (index: number, value: string) => {
    const newWhys = [...whys];
    newWhys[index] = value;
    externalSetWhys?.(newWhys);
    onChange?.(newWhys);
  };

  const whyLabels = [
    'Neden 1 (İlk Seviye)',
    'Neden 2 (Daha Derin)',
    'Neden 3 (Daha Derin)',
    'Neden 4 (Daha Derin)',
    'Neden 5 (Kök Neden)',
  ];

  return (
    <div className="space-y-1">
      <div className="flex items-center gap-2 mb-4 pb-3 border-b border-gray-200">
        <Target className="w-5 h-5 text-rose-600" />
        <h3 className="text-sm font-semibold text-gray-900">
          5 Whys Root Cause Analysis
        </h3>
      </div>

      {whys.map((why, index) => (
        <motion.div
          key={index}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: index * 0.1 }}
        >
          <div className="relative">
            <label className="block text-xs font-medium text-gray-700 mb-1.5">
              {whyLabels[index]}
            </label>
            <textarea
              value={why}
              onChange={(e) => handleWhyChange(index, e.target.value)}
              placeholder={`${index + 1}. Bu sorunu neden yaşıyoruz?`}
              rows={2}
              className={`
                w-full px-3 py-2 border rounded-lg text-sm
                bg-white focus:outline-none focus:ring-2 transition-all
                ${index === 4
                  ? 'border-rose-300 focus:ring-rose-500 focus:border-rose-500 bg-rose-50/50'
                  : 'border-gray-300 focus:ring-indigo-500 focus:border-indigo-500'
                }
                resize-none
              `}
            />

            {index === 4 && why && (
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className="absolute -right-2 -top-2"
              >
                <div className="bg-rose-600 text-white text-[10px] font-bold px-2 py-1 rounded-full shadow-lg">
                  KÖK NEDEN
                </div>
              </motion.div>
            )}
          </div>

          {index < 4 && (
            <div className="flex justify-center py-1">
              <ArrowDown className="w-4 h-4 text-gray-400" />
            </div>
          )}
        </motion.div>
      ))}

      {whys[4] && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="mt-4 p-4 bg-rose-50 border border-rose-200 rounded-lg"
        >
          <p className="text-xs font-medium text-rose-900 mb-2">
            Belirlenen Kök Neden:
          </p>
          <p className="text-sm text-rose-800 leading-relaxed">
            {whys[4]}
          </p>
        </motion.div>
      )}
    </div>
  );
};
