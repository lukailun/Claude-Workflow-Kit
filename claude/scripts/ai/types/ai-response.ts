import type { TokenUsage } from '@/ai/types';

export interface AIResponse {
  text: string;
  tokenUsage?: TokenUsage;
}
