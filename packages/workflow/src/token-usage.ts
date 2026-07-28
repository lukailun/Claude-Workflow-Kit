import { LanguageModelUsage } from 'ai';
import { getModelPricing, calculateCost } from '@lukailun/dev-kit-openrouter/get-model-pricing';

export async function formatTokenUsage(
  usage: LanguageModelUsage,
  model: string
): Promise<string> {
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
  const totalTokens = usage.totalTokens ?? 0;
  return `词元: 输入 ${usage.inputTokens ?? 0}${cacheSuffix} + 输出 ${usage.outputTokens ?? 0} = 总计 ${totalTokens} | 费用: $${cost.toFixed(2)}`;
}
