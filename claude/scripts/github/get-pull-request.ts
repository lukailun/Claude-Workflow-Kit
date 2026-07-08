/**
 * 查找已有的 Pull Request
 */

import { getOwner } from '@/git/get-owner';
import { getRepo } from '@/git/get-repo';
import { githubClient } from '@/github/github-client';

interface Params {
  sourceBranch: string;
  targetBranch: string;
}

/**
 * 根据源分支和目标分支查找已打开的 Pull Request
 * @returns 找到的 Pull Request，如果没有则返回 undefined
 */
export async function getPullRequest(params: Params) {
  const owner = await getOwner();
  const repo = await getRepo();
  if (!owner || !repo) return undefined;

  const { data: pullRequests } = await githubClient.pulls.list({
    owner,
    repo,
    state: 'open',
    head: `${owner}:${params.sourceBranch}`,
    base: params.targetBranch,
  });

  if (pullRequests.length === 0) {
    return undefined;
  }
  return pullRequests[0];
} 
