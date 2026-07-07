/**
 * model ID 双向转换
 *
 * OpenRouter ID（如 `anthropic/claude-sonnet-4.6`）
 * 短 ID（如 `claude-sonnet-4-6`，Claude Code 转录文件使用）
 *
 * 转换规则：取 `/` 后面的部分，小写；匹配时 `.` 和 `-` 视为等价
 */

import { getModels } from '@/openrouter/get-models';

/** 归一化：小写 + `.` 替换为 `-`（用于宽松匹配） */
function normalize(id: string): string {
  return id.toLowerCase().replace(/\./g, '-');
}

/**
 * OpenRouter ID → 短 ID
 *
 * `anthropic/claude-sonnet-4.6` → `claude-sonnet-4.6`
 */
export function toShortId(openRouterId: string): string {
  const suffix = openRouterId.includes('/')
    ? openRouterId.split('/').pop()!
    : openRouterId;
  return suffix.toLowerCase();
}

/**
 * 短 ID → OpenRouter ID
 *
 * 已是 OpenRouter 格式（含 `/`）则直接返回
 * 否则遍历 OpenRouter 模型列表，归一化后匹配
 */
export async function toOpenRouterId(modelId: string): Promise<string | null> {
  if (modelId.includes('/')) return modelId;

  const normalized = normalize(modelId);
  const models = await getModels();
  if (!models) return null;

  for (const model of models) {
    if (normalize(toShortId(model.id)) === normalized) {
      return model.id;
    }
  }
  return null;
}
