/**
 * 从 OpenRouter API 在线获取模型定价，并转换为项目 ModelPricing 格式
 *
 * OpenRouter 定价单位：per-token（项目使用 per-1M-token）
 * OpenRouter 货币：USD（项目中部分模型使用 CNY，这里统一用 USD）
 */

import type { ModelPricing, PriceTier } from '@/ai/types/model-pricing';
import { toProjectId } from '@/openrouter/openrouter-model-map';

const OPENROUTER_MODELS_URL = 'https://openrouter.ai/api/v1/models';

/** OpenRouter API 返回的单个模型定价字段 */
interface OpenRouterPricing {
  prompt?: string;
  completion?: string;
  input_cache_read?: string;
  input_cache_write?: string;
}

/** OpenRouter API 返回的单个模型 */
interface OpenRouterModel {
  id: string;
  name: string;
  context_length: number;
  pricing: OpenRouterPricing;
}

/** OpenRouter API 响应 */
interface OpenRouterModelsResponse {
  data: OpenRouterModel[];
}

/** 将 OpenRouter per-token 价格转为 per-1M-token */
function toPer1M(value: string | undefined): number {
  if (!value) return 0;
  const num = parseFloat(value);
  if (isNaN(num)) return 0;
  return Math.round(num * 1_000_000 * 1000) / 1000;
}

/** 从 OpenRouter 模型数据构建项目的 PriceTier */
function buildTier(pricing: OpenRouterPricing): PriceTier {
  return {
    maxInputTokens: Infinity,
    inputCacheMiss: toPer1M(pricing.prompt),
    inputCacheHit: toPer1M(pricing.input_cache_read),
    output: toPer1M(pricing.completion),
    cacheWrite: toPer1M(pricing.input_cache_write),
  };
}

/**
 * 从 OpenRouter API 获取所有可用模型的定价，转换为项目格式
 *
 * @returns 以项目 model ID 为 key 的定价映射
 */
export async function fetchOpenRouterPricing(): Promise<
  Record<string, ModelPricing>
> {
  const response = await fetch(OPENROUTER_MODELS_URL);
  if (!response.ok) {
    throw new Error(
      `OpenRouter API 请求失败: ${response.status} ${response.statusText}`
    );
  }

  const data: OpenRouterModelsResponse = await response.json();
  const result: Record<string, ModelPricing> = {};

  for (const model of data.data) {
    const projectId = toProjectId(model.id);
    if (!projectId) continue;

    result[projectId] = {
      model: projectId,
      name: model.name,
      price: {
        currency: 'USD',
        tiers: [buildTier(model.pricing)],
      },
    };
  }

  return result;
}
