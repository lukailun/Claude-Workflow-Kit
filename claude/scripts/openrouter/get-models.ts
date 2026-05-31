/**
 * 从 OpenRouter SDK 获取模型定价
 *
 * OpenRouter 定价单位：per-token（项目使用 per-1M-token）
 * OpenRouter 货币：USD（项目中部分模型使用 CNY，这里统一用 USD）
 */

import { OpenRouter } from '@openrouter/sdk';
import type { Model } from '@openrouter/sdk/models';

let _cachedModels: Model[] | null = null;

/**
 * 通过 OpenRouter SDK 获取所有可用模型（同一 session 只请求一次）
 */
export async function getModels(): Promise<Model[] | undefined> {
  if (_cachedModels) return _cachedModels;

  try {
    const client = new OpenRouter();
    const response = await client.models.list();
    _cachedModels = response.data;
    return _cachedModels;
  } catch {
    return undefined;
  }
}
