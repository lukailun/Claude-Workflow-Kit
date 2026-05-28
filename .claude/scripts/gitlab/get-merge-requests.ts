/**
 * GitLab 合并请求查询工具模块
 *
 * 功能：
 * 1. 从 GitLab 获取所有打开的合并请求
 * 2. 自动处理 API Token 缺失情况
 */

import { MergeRequestSchemaWithBasicLabels } from '@gitbeaker/rest';
import gitlabClient from './gitlab-client';

interface Params {
  projectId: number;
}

/**
 * 获取所有打开的合并请求
 * @param projectId GitLab 项目 ID（可选，默认从当前 git 仓库获取）
 * @returns 合并请求列表
 */
async function getMergeRequests(
  params: Params
): Promise<MergeRequestSchemaWithBasicLabels[]> {
  const { projectId } = params;
  const mergeRequests = await gitlabClient.MergeRequests.all({
    projectId,
    state: 'opened',
  });
  return mergeRequests;
}

export default getMergeRequests;
