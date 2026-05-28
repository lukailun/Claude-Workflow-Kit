/**
 * 查找已有的合并请求
 */

import { MergeRequestSchemaWithBasicLabels } from '@gitbeaker/rest';
import gitlabClient from './gitlab-client';

interface Params {
  projectId: number;
  sourceBranch: string;
  targetBranch: string;
}

/**
 * 根据源分支和目标分支查找已打开的合并请求
 * @returns 找到的合并请求，如果没有则返回 undefined
 */
async function getMergeRequest(
  params: Params
): Promise<MergeRequestSchemaWithBasicLabels | undefined> {
  const { projectId, sourceBranch, targetBranch } = params;
  const mergeRequests = await gitlabClient.MergeRequests.all({
    projectId,
    state: 'opened',
    sourceBranch,
    targetBranch,
  });
  if (mergeRequests.length === 0) {
    return undefined;
  }
  return mergeRequests[0];
}

export default getMergeRequest;
