import { LanguageModelUsage } from 'ai';

/** token 用量基础数据 */
export interface TokenUsage {
  input: number;
  output: number;
  cacheRead: number;
  cacheWrite: number;
}

/** 模型统计 */
export interface ModelTokenUsageStats {
  usage: LanguageModelUsage;
  count: number;
}
