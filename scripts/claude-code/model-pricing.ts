/**
 * Claude Code 模型价格汇总（从各 provider price 聚合）
 */

import type { ModelTokenUsageStats } from '../ai/types/token-usage';
import type Currency from '../ai/types/currency';
import type {
  PricingPlan,
  PriceTier,
  ModelPricing,
} from '../ai/types/model-pricing';
import anthropicPricing from '../anthropic/anthropic-pricing';
import xiaomiMimoPricing from '../xiaomi-mimo/xiaomi-mimo-pricing';
import bigModelPricing from '../big-model/big-model-pricing';
import miniMaxPricing from '../mini-max/mini-max-pricing';
import deepSeekPricing from '../deep-seek/deep-seek-pricing';
import arkCodingPlanPricing from '../ark-coding-plan/ark-coding-plan-pricing';

const allPricings: ModelPricing[][] = [
  anthropicPricing,
  xiaomiMimoPricing,
  bigModelPricing,
  miniMaxPricing,
  deepSeekPricing,
  arkCodingPlanPricing,
];

const MODEL_PRICING: Record<string, ModelPricing> = Object.fromEntries(
  allPricings.flat().map((pricing) => [pricing.model, pricing])
);

export function getModelPricing(model: string): ModelPricing | undefined {
  return MODEL_PRICING[model];
}

export function getPricingPlan(model: string): PricingPlan | undefined {
  return MODEL_PRICING[model]?.price;
}

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

export function getAllTierThresholds(): number[] {
  const thresholds = new Set<number>();
  for (const p of Object.values(MODEL_PRICING)) {
    for (const tier of p.price.tiers) {
      if (tier.maxInputTokens !== Infinity) thresholds.add(tier.maxInputTokens);
    }
  }
  return [...thresholds].sort((a, b) => a - b);
}

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
    cost +=
      (Math.max(0, regularInput) * tier.inputCacheMiss +
        u.cacheRead * tier.inputCacheHit +
        u.cacheWrite * tier.cacheWrite +
        u.output * tier.output) /
      1_000_000;
  }
  return cost;
}
