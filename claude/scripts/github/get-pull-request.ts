/**
 * 查找已有的 Pull Request
 */

import githubClient from './github-client';
import getOwnerAndRepo from './get-owner-and-repo';

interface Params {
  sourceBranch: string;
  targetBranch: string;
}

/**
 * 根据源分支和目标分支查找已打开的 Pull Request
 * @returns 找到的 Pull Request，如果没有则返回 undefined
 */
async function getPullRequest(params: Params) {
  const repoInfo = await getOwnerAndRepo();
  if (!repoInfo) return undefined;

  const { data: pullRequests } = await githubClient.pulls.list({
    ...repoInfo,
    state: 'open',
    head: `${repoInfo.owner}:${params.sourceBranch}`,
    base: params.targetBranch,
  });

  if (pullRequests.length === 0) {
    return undefined;
  }
  return pullRequests[0];
}

export default getPullRequest;
