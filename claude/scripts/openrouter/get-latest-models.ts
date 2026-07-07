/**
 * 获取最新发布的模型列表
 *
 * 传入模型列表，按发布时间倒序排列，返回前 n 项最新发布的模型。
 */

import type { Model } from '@openrouter/sdk/models';
import { getModels } from '@/openrouter/get-models';

/**
 * 从模型列表中获取最新发布的前 n 个模型
 *
 * @param models - 模型列表
 * @param options.count - 需要返回的模型数量，默认为 1
 * @returns 按发布时间倒序排列的前 n 个模型
 */
export async function getLatestModels(count?: number): Promise<Model[]> {
  const models = await getModels();
  return [...models].sort((a, b) => b.created - a.created).slice(0, count ?? 1);
}
