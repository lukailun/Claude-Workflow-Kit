/**
 * 模型定价查询（基于 OpenRouter）
 *
 * 调用方传入短 ID 或 OpenRouter ID 均可，内部自动翻译
 * 价格单位：per 1M token，USD
 */

import type { PublicPricing } from '@openrouter/sdk/models';
import { LanguageModelUsage } from 'ai';
import Big from 'big.js';
import type {  ModelTokenUsageStats } from '@/ai/types/token-usage';
import { getModels } from '@/openrouter/get-models';
import { toOpenRouterId } from '@/openrouter/model-id';

/** 模型定价（per 1M token，USD） */
export interface ModelPricing {
  model: string;
  name: string;
  inputCacheMiss: number;
  inputCacheHit: number;
  output: number;
  cacheWrite: number;
}

/** 将 OpenRouter per-token 价格转为 per-1M-token */
function toPer1M(value: string | undefined): number {
  if (!value) return 0;
  return new Big(value).times(1_000_000).toNumber();
}

function toModelPricing(model: { id: string; name: string; pricing: PublicPricing }): ModelPricing {
  return {
    model: model.id,
    name: model.name,
    inputCacheMiss: toPer1M(model.pricing.prompt),
    inputCacheHit: toPer1M(model.pricing.inputCacheRead),
    output: toPer1M(model.pricing.completion),
    cacheWrite: toPer1M(model.pricing.inputCacheWrite),
  };
}

// ─── 缓存 ────────────────────────

let _cachedPricing: Record<string, ModelPricing> | null = null;

async function loadPricing(): Promise<Record<string, ModelPricing>> {
  if (_cachedPricing) return _cachedPricing;

  const models = await getModels();
  _cachedPricing = {};
  if (models) {
    for (const model of models) {
      _cachedPricing[model.id] = toModelPricing(model);
    }
  }
  return _cachedPricing;
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
  return { model: modelId, name: modelId, inputCacheMiss: 0, inputCacheHit: 0, output: 0, cacheWrite: 0 };
}

/** 计算费用（USD），price 单位为每 1M token */
export function calculateCost(usage: LanguageModelUsage, price: ModelPricing): number {
  return (
    ((usage.inputTokenDetails.noCacheTokens ?? 0) * price.inputCacheMiss +
      (usage.inputTokenDetails.cacheReadTokens ?? 0 ) * price.inputCacheHit +
      (usage.inputTokenDetails.cacheWriteTokens ?? 0) * price.cacheWrite +
    (  usage.outputTokens ?? 0) * price.output) /
    1_000_000
  );
}

/** 计算模型总费用 */
export function calculateModelCost(stats: ModelTokenUsageStats, price: ModelPricing): number {
  return calculateCost(stats.usage, price);
}
