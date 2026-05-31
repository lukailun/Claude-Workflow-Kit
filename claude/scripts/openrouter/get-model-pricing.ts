/**
 * Claude Code 模型价格汇总
 *
 * 定价以 OpenRouter model ID 为 key（如 `anthropic/claude-sonnet-4.6`）
 * 调用方传入短 ID 或 OpenRouter ID 均可，内部自动翻译
 *
 * 优先从 OpenRouter API 在线获取，fallback 到各 provider 静态定价
 */

import type { Currency } from '@/ai/types';
import type {
  PricingPlan,
  PriceTier,
  ModelPricing,
} from '@/ai/types/model-pricing';
import type { ModelTokenUsageStats, TokenUsage } from '@/ai/types/token-usage';
import type { PublicPricing } from '@openrouter/sdk/models';
import { anthropicPricing } from '@/anthropic/anthropic-pricing';
import { bigModelPricing } from '@/bigmodel/bigmodel-pricing';
import { deepSeekPricing } from '@/deepseek/deepseek-pricing';
import { kimiPricing } from '@/kimi/kimi-pricing';
import { longCatPricing } from '@/longcat/longcat-pricing';
import { miniMaxPricing } from '@/minimax/minimax-pricing';
import { xiaomiMimoPricing } from '@/xiaomi-mimo/xiaomi-mimo-pricing';
import { getModels } from '@/openrouter/get-models';
import { toOpenRouterId } from '@/openrouter/model-id';

// ─── Fallback 静态定价（短 ID key） ────────────────────────

const allPricings: ModelPricing[][] = [
  anthropicPricing,
  xiaomiMimoPricing,
  bigModelPricing,
  miniMaxPricing,
  deepSeekPricing,
  kimiPricing,
  longCatPricing,
];

const FALLBACK_BY_SHORT_ID: Record<string, ModelPricing> = Object.fromEntries(
  allPricings.flat().map((pricing) => [pricing.model, pricing])
);

// ─── 在线定价（OpenRouter ID key） ────────────────────────

/** 将 OpenRouter per-token 价格转为 per-1M-token */
function toPer1M(value: string | undefined): number {
  if (!value) return 0;
  const num = parseFloat(value);
  if (isNaN(num)) return 0;
  return Math.round(num * 1_000_000 * 1000) / 1000;
}

/** 从 OpenRouter PublicPricing 构建 PriceTier */
function buildTier(pricing: PublicPricing): PriceTier {
  return {
    maxInputTokens: Infinity,
    inputCacheMiss: toPer1M(pricing.prompt),
    inputCacheHit: toPer1M(pricing.inputCacheRead),
    output: toPer1M(pricing.completion),
    cacheWrite: toPer1M(pricing.inputCacheWrite),
  };
}

/** 将 OpenRouter Model 转为项目 ModelPricing */
function toModelPricing(model: { id: string; name: string; pricing: PublicPricing }): ModelPricing {
  return {
    model: model.id,
    name: model.name,
    price: {
      currency: 'USD',
      tiers: [buildTier(model.pricing)],
    },
  };
}

// ─── 缓存 ────────────────────────────────

/** 缓存的在线定价（OpenRouter ID key） */
let cachedOnlinePricing: Record<string, ModelPricing> | null = null;

/**
 * 加载在线定价（仅 OpenRouter 上存在的模型）
 * 同一 session 只请求一次 API
 */
async function loadOnlinePricing(): Promise<Record<string, ModelPricing>> {
  if (cachedOnlinePricing) return cachedOnlinePricing;

  const models = await getModels();
  if (!models) {
    cachedOnlinePricing = {};
    return cachedOnlinePricing;
  }

  cachedOnlinePricing = {};
  for (const model of models) {
    cachedOnlinePricing[model.id] = toModelPricing(model);
  }
  return cachedOnlinePricing;
}

// ─── 对外 API ────────────────────────────────

/**
 * 获取单个模型的完整定价信息
 *
 * @param modelId 短 ID（如 `claude-sonnet-4-6`）或 OpenRouter ID（如 `anthropic/claude-sonnet-4.6`）
 */
export async function getModelPricing(
  modelId: string
): Promise<ModelPricing | undefined> {
  const orId = await toOpenRouterId(modelId);
  if (orId) {
    const online = await loadOnlinePricing();
    if (online[orId]) return online[orId];
  }
  // fallback 到静态定价（短 ID）
  return FALLBACK_BY_SHORT_ID[modelId];
}

/**
 * 获取单个模型的价格计划
 *
 * @param modelId 短 ID 或 OpenRouter ID
 */
export async function getPricingPlan(
  modelId: string
): Promise<PricingPlan | undefined> {
  return (await getModelPricing(modelId))?.price;
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

/** 计算模型费用（纯计算，不依赖 async） */
export function calculateModelCost(
  stats: ModelTokenUsageStats,
  modelPrice: PricingPlan
): number {
  const tier = modelPrice.tiers[0];
  if (!tier) return 0;
  return calculateCost(stats.usage, tier);
}
