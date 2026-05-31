/**
 * 模型定价查询（基于 OpenRouter）
 *
 * 调用方传入短 ID 或 OpenRouter ID 均可，内部自动翻译
 * 价格单位：per 1M token，USD
 */

import type { TokenUsage, ModelTokenUsageStats } from '@/ai/types/token-usage';
import type { PublicPricing } from '@openrouter/sdk/models';
import { getModels } from '@/openrouter/get-models';
import { toOpenRouterId } from '@/openrouter/model-id';

/** 模型定价（per 1M token，USD） */
export interface ModelPricing {
  model: string;
  name: string;
  prompt: number;
  completion: number;
  cacheRead: number;
  cacheWrite: number;
}

/** 将 OpenRouter per-token 价格转为 per-1M-token */
function toPer1M(value: string | undefined): number {
  if (!value) return 0;
  const num = parseFloat(value);
  if (isNaN(num)) return 0;
  return Math.round(num * 1_000_000 * 1000) / 1000;
}

function toModelPricing(model: { id: string; name: string; pricing: PublicPricing }): ModelPricing {
  return {
    model: model.id,
    name: model.name,
    prompt: toPer1M(model.pricing.prompt),
    completion: toPer1M(model.pricing.completion),
    cacheRead: toPer1M(model.pricing.inputCacheRead),
    cacheWrite: toPer1M(model.pricing.inputCacheWrite),
  };
}

// ─── 缓存 ────────────────────────

let cachedPricing: Record<string, ModelPricing> | null = null;

async function loadPricing(): Promise<Record<string, ModelPricing>> {
  if (cachedPricing) return cachedPricing;

  const models = await getModels();
  cachedPricing = {};
  if (models) {
    for (const model of models) {
      cachedPricing[model.id] = toModelPricing(model);
    }
  }
  return cachedPricing;
}

// ─── 对外 API ────────────────────────

/**
 * 获取模型定价
 *
 * @param modelId 短 ID 或 OpenRouter ID
 */
export async function getModelPricing(modelId: string): Promise<ModelPricing> {
  const orId = await toOpenRouterId(modelId);
  if (orId) {
    const pricing = await loadPricing();
    if (pricing[orId]) return pricing[orId];
  }
  return { model: modelId, name: modelId, prompt: 0, completion: 0, cacheRead: 0, cacheWrite: 0 };
}

/** 计算费用（USD），price 单位为每 1M token */
export function calculateCost(usage: TokenUsage, price: ModelPricing): number {
  const regularInput = usage.input - usage.cacheRead - usage.cacheWrite;
  return (
    (Math.max(0, regularInput) * price.prompt +
      usage.cacheRead * price.cacheRead +
      usage.cacheWrite * price.cacheWrite +
      usage.output * price.completion) /
    1_000_000
  );
}

/** 计算模型总费用 */
export function calculateModelCost(stats: ModelTokenUsageStats, price: ModelPricing): number {
  return calculateCost(stats.usage, price);
}
