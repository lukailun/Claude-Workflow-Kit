import { currencySymbol } from '@/ai/types/currency';
import type { PricingPlan, PriceTier } from '@/ai/types/model-pricing';
import { getPricingPlan } from '@/claude-code/model-pricing';

/** token 用量基础数据 */
export interface TokenUsage {
  input: number;
  output: number;
  cacheRead: number;
  cacheWrite: number;
}

/** 带请求数的 token 用量（分支统计用） */
export interface TokenUsageStats {
  usage: TokenUsage;
  count: number;
}

/** 模型统计（含分阶梯） */
export interface ModelTokenUsageStats {
  usage: TokenUsage;
  count: number;
  tiers: Map<number, TokenUsageStats>;
}

/** 根据输入 token 数选择对应的价格档位 */
export function findTier(
  modelPrice: PricingPlan,
  inputTokens: number
): PriceTier | undefined {
  const sorted = [...modelPrice.tiers].sort(
    (a, b) => a.maxInputTokens - b.maxInputTokens
  );
  return sorted.find((tier) => inputTokens <= tier.maxInputTokens);
}

/** 计算费用，price 单位为每 1M token */
export function calculateCost(usage: TokenUsage, tier: PriceTier): number {
  const regularInput = usage.input - usage.cacheRead - usage.cacheWrite;
  return (
    (Math.max(0, regularInput) * tier.inputCacheMiss +
      usage.cacheRead * tier.inputCacheHit +
      usage.cacheWrite * tier.cacheWrite +
      usage.output * tier.output) /
    1_000_000
  );
}

export function formatTokenUsage(usage: TokenUsage, model: string): string {
  const totalTokens = usage.input + usage.output;
  const cacheParts: string[] = [];
  if (usage.cacheRead) cacheParts.push(`缓存读取 ${usage.cacheRead}`);
  if (usage.cacheWrite) cacheParts.push(`缓存写入 ${usage.cacheWrite}`);
  const cacheSuffix =
    cacheParts.length > 0 ? ` (${cacheParts.join(', ')})` : '';

  let result = `Token: 输入 ${usage.input}${cacheSuffix} + 输出 ${usage.output} = 总计 ${totalTokens}`;
  const pricingPlan = getPricingPlan(model);
  if (pricingPlan) {
    const tier = findTier(pricingPlan, usage.input);
    if (tier) {
      const cost = calculateCost(usage, tier);
      const symbol = currencySymbol[pricingPlan.currency];
      result += ` | 费用: ${symbol}${cost.toFixed(2)}`;
    }
  }

  return result;
}
