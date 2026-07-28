/**
 * 从 OpenRouter SDK 获取模型列表
 *
 * OpenRouter 定价单位：per-token（项目使用 per-1M-token）
 * OpenRouter 货币：USD（项目中部分模型使用 CNY，这里统一用 USD）
 */

import type { Model } from '@openrouter/sdk/models';
import { getOpenRouterClient } from './openrouter-client';

let _cachedModels: Model[] | null = null;

/**
 * 通过 OpenRouter SDK 获取所有可用模型
 */
export async function getModels(): Promise<Model[]> {
  if (_cachedModels) return _cachedModels;

  try {
    const client = getOpenRouterClient();
    const response = await client.models.list();
    _cachedModels = response.result.data;
    return _cachedModels;
  } catch {
    return [];
  }
}
