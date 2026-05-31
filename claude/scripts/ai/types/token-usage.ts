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
  usage: TokenUsage;
  count: number;
}

export async function formatTokenUsage(
  usage: TokenUsage,
  model: string
): Promise<string> {
  const totalTokens = usage.input + usage.output;
  const cacheParts: string[] = [];
  if (usage.cacheRead) cacheParts.push(`缓存读取 ${usage.cacheRead}`);
  if (usage.cacheWrite) cacheParts.push(`缓存写入 ${usage.cacheWrite}`);
  const cacheSuffix =
    cacheParts.length > 0 ? ` (${cacheParts.join(', ')})` : '';
    const pricing = await getModelPricing(model);
    const cost = calculateCost(usage, pricing);
  let result = `词元: 输入 ${usage.input}${cacheSuffix} + 输出 ${usage.output} = 总计 ${totalTokens} | 费用: $${cost.toFixed(2)}`;
  return result;
}
