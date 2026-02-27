/**
 * Thinking Indicator Component
 *
 * Visual feedback showing what context Sentinel Prime is loading:
 * - "Reading Constitution..."
 * - "Analyzing Audit Universe..."
 * - "Checking Recent Findings..."
 */

import { motion, AnimatePresence } from 'framer-motion';
import { Loader2, Check, X, Brain, Shield } from 'lucide-react';

interface ThinkingStep {
  step: string;
  status: 'loading' | 'complete' | 'error';
}

interface ThinkingIndicatorProps {
  steps: ThinkingStep[];
  isVisible: boolean;
}

export function ThinkingIndicator({ steps, isVisible }: ThinkingIndicatorProps) {
  if (!isVisible || steps.length === 0) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -10 }}
        className="bg-gradient-to-r from-blue-500/10 to-purple-500/10 border border-blue-500/20 rounded-lg p-4 mb-4"
      >
        <div className="flex items-start gap-3">
          <div className="relative">
            <Brain className="w-5 h-5 text-blue-400" />
            <motion.div
              className="absolute inset-0"
              animate={{
                scale: [1, 1.2, 1],
                opacity: [0.5, 0.8, 0.5],
              }}
              transition={{
                duration: 2,
                repeat: Infinity,
                ease: 'easeInOut',
              }}
            >
              <div className="w-full h-full rounded-full bg-blue-400/30 blur-sm" />
            </motion.div>
          </div>

          <div className="flex-1 space-y-2">
            <div className="flex items-center gap-2">
              <Shield className="w-4 h-4 text-blue-400" />
              <span className="text-sm font-medium text-blue-200">
                Sentinel Prime Initializing...
              </span>
            </div>

            <div className="space-y-1.5">
              {steps.map((step, index) => (
                <motion.div
                  key={step.step}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className="flex items-center gap-2 text-sm"
                >
                  {step.status === 'loading' && (
                    <Loader2 className="w-3 h-3 text-blue-400 animate-spin" />
                  )}
                  {step.status === 'complete' && (
                    <Check className="w-3 h-3 text-green-400" />
                  )}
                  {step.status === 'error' && (
                    <X className="w-3 h-3 text-red-400" />
                  )}
                  <span
                    className={
                      step.status === 'complete'
                        ? 'text-gray-400 line-through'
                        : step.status === 'error'
                          ? 'text-red-400'
                          : 'text-gray-300'
                    }
                  >
                    {step.step}
                  </span>
                </motion.div>
              ))}
            </div>

            {steps.every((s) => s.status === 'complete') && (
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className="text-xs text-green-400 font-medium mt-2"
              >
                ✓ Context loaded. Ready to assist.
              </motion.div>
            )}
          </div>
        </div>
      </motion.div>
    </AnimatePresence>
  );
}

/**
 * Compact inline thinking indicator for chat bubbles
 */
export function InlineThinkingIndicator() {
  return (
    <div className="flex items-center gap-2 text-sm text-gray-400">
      <motion.div
        animate={{
          rotate: 360,
        }}
        transition={{
          duration: 2,
          repeat: Infinity,
          ease: 'linear',
        }}
      >
        <Brain className="w-4 h-4 text-blue-400" />
      </motion.div>
      <span>Sentinel Prime is thinking...</span>
      <div className="flex gap-1">
        {[0, 1, 2].map((i) => (
          <motion.div
            key={i}
            className="w-1 h-1 bg-blue-400 rounded-full"
            animate={{
              scale: [1, 1.5, 1],
              opacity: [0.5, 1, 0.5],
            }}
            transition={{
              duration: 1,
              repeat: Infinity,
              delay: i * 0.2,
            }}
          />
        ))}
      </div>
    </div>
  );
}

/**
 * Pulsing brain icon for loading states
 */
export function BrainPulse({ size = 'md' }: { size?: 'sm' | 'md' | 'lg' }) {
  const sizeClasses = {
    sm: 'w-4 h-4',
    md: 'w-6 h-6',
    lg: 'w-8 h-8',
  };

  return (
    <div className="relative inline-block">
      <Brain className={`${sizeClasses[size]} text-blue-400`} />
      <motion.div
        className="absolute inset-0"
        animate={{
          scale: [1, 1.5, 1],
          opacity: [0.8, 0, 0.8],
        }}
        transition={{
          duration: 2,
          repeat: Infinity,
          ease: 'easeOut',
        }}
      >
        <div className="w-full h-full rounded-full bg-blue-400/50 blur-md" />
      </motion.div>
    </div>
  );
}
