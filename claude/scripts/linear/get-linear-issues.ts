/**
 * Linear Issues 查询工具模块
 *
 * 功能：
 * 1. 从 Linear 获取 issues 列表
 * 2. 支持按用户过滤 issues
 */

import { Issue } from '@linear/sdk';
import { linearClient } from '@/linear/linear-client';

/**
 * Linear Issues 查询参数
 */
type GetLinearIssuesParams = NonNullable<NonNullable<Parameters<typeof linearClient.issues>[0]>['filter']>;

/**
 * 获取 Linear Issues
 * @param params 查询参数对象
 * @returns Issues 列表（按优先级排序），如果 API Key 不存在或请求失败则返回 undefined
 */
export async function getLinearIssues(
  params?: GetLinearIssuesParams
): Promise<Issue[]> {
  const issuesConnection =
    Object.keys(params ?? {}).length > 0
      ? await linearClient.issues({ filter: params })
      : await linearClient.issues();
  return issuesConnection.nodes;
}
