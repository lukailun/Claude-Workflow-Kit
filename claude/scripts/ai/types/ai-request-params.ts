import type { AIMessage } from '@/ai/types';

export interface AIRequestParams {
  messages: AIMessage[];
  maxTokens: number;
}
