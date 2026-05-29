import type { AIProviderInfo, AIRequestParams, AIResponse } from '@/ai/types';

export interface AIProvider {
  info: AIProviderInfo;
  generate(params: AIRequestParams): Promise<AIResponse>;
}
