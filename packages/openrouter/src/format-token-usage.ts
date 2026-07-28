import type { LanguageModelUsage } from 'ai';
import { calculateCost, getModelPricing } from './get-model-pricing';

/**
 * 格式化 token 用量与费用信息
 *
 * 从 @cwkit/ai 移入此处，因其依赖 openrouter 的定价查询
 */
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
