/**
 * Claude Code 模型价格汇总
 *
 * 优先从 OpenRouter API 在线获取定价，未命中的模型 fallback 到各 provider 静态定价文件
 */

import type { Currency } from '@/ai/types';
import type {
  PricingPlan,
  PriceTier,
  ModelPricing,
} from '@/ai/types/model-pricing';
import type { ModelTokenUsageStats } from '@/ai/types/token-usage';
import { anthropicPricing } from '@/anthropic/anthropic-pricing';
import { bigModelPricing } from '@/bigmodel/bigmodel-pricing';
import { deepSeekPricing } from '@/deepseek/deepseek-pricing';
import { kimiPricing } from '@/kimi/kimi-pricing';
import { longCatPricing } from '@/longcat/longcat-pricing';
import { miniMaxPricing } from '@/minimax/minimax-pricing';
import { xiaomiMimoPricing } from '@/xiaomi-mimo/xiaomi-mimo-pricing';
import { fetchOpenRouterPricing } from '@/openrouter/fetch-openrouter-pricing';

/** 所有 provider 的静态定价（fallback） */
const allPricings: ModelPricing[][] = [
  anthropicPricing,
  xiaomiMimoPricing,
  bigModelPricing,
  miniMaxPricing,
  deepSeekPricing,
  kimiPricing,
  longCatPricing,
];

/** 静态 fallback 定价映射 */
const FALLBACK_PRICING: Record<string, ModelPricing> = Object.fromEntries(
  allPricings.flat().map((pricing) => [pricing.model, pricing])
);

/** 缓存的在线定价（首次调用 loadPricing 后填充） */
let cachedPricing: Record<string, ModelPricing> | null = null;

/**
 * 加载定价数据：优先 OpenRouter 在线，fallback 到静态定价
 *
 * 同一 session 内只请求一次 API，后续调用返回缓存
 */
export async function loadPricing(): Promise<Record<string, ModelPricing>> {
  if (cachedPricing) return cachedPricing;

  try {
    const onlinePricing = await fetchOpenRouterPricing();
    // 在线定价 + 静态 fallback（在线未覆盖的模型用静态）
    cachedPricing = { ...FALLBACK_PRICING, ...onlinePricing };
  } catch {
    // API 请求失败，降级到静态定价
    cachedPricing = { ...FALLBACK_PRICING };
  }

  return cachedPricing;
}

/** 获取单个模型的完整定价信息 */
export async function getModelPricing(
  model: string
): Promise<ModelPricing | undefined> {
  const pricing = await loadPricing();
  return pricing[model];
}

/** 获取单个模型的价格计划 */
export async function getPricingPlan(
  model: string
): Promise<PricingPlan | undefined> {
  const pricing = await loadPricing();
  return pricing[model]?.price;
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

export function getCurrency(modelPrice: PricingPlan): Currency {
  return modelPrice.currency;
}

/** 获取所有模型的分级 token 阈值 */
export async function getAllTierThresholds(): Promise<number[]> {
  const pricing = await loadPricing();
  const thresholds = new Set<number>();
  for (const p of Object.values(pricing)) {
    for (const tier of p.price.tiers) {
      if (tier.maxInputTokens !== Infinity) thresholds.add(tier.maxInputTokens);
    }
  }
  return [...thresholds].sort((a, b) => a - b);
}

/** 计算模型费用（纯计算，不依赖 async） */
export function calculateModelCost(
  stats: ModelTokenUsageStats,
  modelPrice: PricingPlan
): number {
  if (stats.tiers.size === 0) return 0;

  const sortedTiers = [...modelPrice.tiers].sort(
    (a, b) => a.maxInputTokens - b.maxInputTokens
  );

  let cost = 0;
  for (const [tierKey, tierStats] of stats.tiers) {
    const tier = sortedTiers.find((t) => tierKey <= t.maxInputTokens);
    if (!tier) continue;
    const u = tierStats.usage;
    const regularInput = u.input - u.cacheRead - u.cacheWrite;
    const tierCost =
      (Math.max(0, regularInput) * tier.inputCacheMiss +
        u.cacheRead * tier.inputCacheHit +
        u.cacheWrite * tier.cacheWrite +
        u.output * tier.output) /
      1_000_000;
    cost = Math.round((cost + tierCost) * 1_000_000) / 1_000_000;
  }
  return cost;
}
