import type { LanguageModelUsage } from 'ai';

export type { TokenUsage } from '@cwkit/shared/types/token-usage';

/** 模型统计 */
export interface ModelTokenUsageStats {
  usage: LanguageModelUsage;
  count: number;
}
