/**
 * Field Agent - Voice-to-Action Types
 */

export type VoiceStatus = 'idle' | 'listening' | 'processing' | 'success' | 'error';

export interface VoiceTranscript {
  id: string;
  text: string;
  timestamp: Date;
  confidence: number;
}

export interface VoiceFindingDraft {
  id: string;
  title: string;
  description: string;
  severity: 'critical' | 'high' | 'medium' | 'low';
  category: string;
  location: string;
  timestamp: Date;
  audioSource: boolean;
  confidence: number;
}

export interface KeywordMatch {
  keyword: string;
  category: string;
  severity: 'critical' | 'high' | 'medium' | 'low';
  weight: number;
}

export interface VoiceProcessingResult {
  success: boolean;
  draft?: VoiceFindingDraft;
  error?: string;
  transcript?: string;
}
