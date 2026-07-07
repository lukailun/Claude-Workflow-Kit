import { LanguageModelUsage } from 'ai';
import { getModelPricing, calculateCost } from '@/openrouter/get-model-pricing';

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

export async function formatTokenUsage(
  usage: LanguageModelUsage,
  model: string
): Promise<string> {
  const totalTokens = usage.totalTokens ?? 0;
  const cacheParts: string[] = [];
  if (usage.inputTokenDetails.cacheReadTokens) {
    cacheParts.push(`缓存读取 ${usage.inputTokenDetails.cacheReadTokens}`);
  }
  if (usage.inputTokenDetails.cacheWriteTokens) {
    cacheParts.push(`缓存写入 ${usage.inputTokenDetails.cacheWriteTokens}`);
  }
  const cacheSuffix =
    cacheParts.length > 0 ? ` (${cacheParts.join(', ')})` : '';
  const pricing = await getModelPricing(model);
  const cost = calculateCost(usage, pricing);
  let result = `词元: 输入 ${usage.inputTokens ?? 0}${cacheSuffix} + 输出 ${usage.outputTokens ?? 0} = 总计 ${totalTokens} | 费用: $${cost.toFixed(2)}`;
  return result;
}
