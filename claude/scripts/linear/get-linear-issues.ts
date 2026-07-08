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
interface GetLinearIssuesParams {
  /** 用户 ID，如果为 undefined 则返回所有 issues */
  userId?: string;
  /** Issue 状态类型 */
  state?: 'backlog' | 'unstarted' | 'started' | 'completed' | 'canceled';
}

/**
 * 获取 Linear Issues
 * @param params 查询参数对象
 * @returns Issues 列表（按优先级排序），如果 API Key 不存在或请求失败则返回 undefined
 */
export async function getLinearIssues(
  params?: GetLinearIssuesParams
): Promise<Issue[]> {
  const filter: NonNullable<NonNullable<Parameters<typeof linearClient.issues>[0]>['filter']> = {};
  if (params?.userId) {
    filter.assignee = { id: { eq: params.userId } };
  }
  if (params?.state) {
    filter.state = { type: { eq: params.state } };
  }
  const issuesConnection =
    Object.keys(filter).length > 0
      ? await linearClient.issues({ filter })
      : await linearClient.issues();
  return issuesConnection.nodes;
}