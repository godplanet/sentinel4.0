/**
 * Field Agent - Voice-to-Action Feature
 * Feature-Sliced Design Public API
 */

export {
  processVoiceTranscript,
  simulateVoiceInput,
  saveFindingDraft,
  getRecentDrafts,
  clearDrafts,
  getSeverityColor,
  getSeverityLabelTR,
  isSpeechRecognitionSupported,
  getSpeechRecognition,
} from './voice-engine';

export type {
  VoiceStatus,
  VoiceTranscript,
  VoiceFindingDraft,
  KeywordMatch,
  VoiceProcessingResult,
} from './types';
