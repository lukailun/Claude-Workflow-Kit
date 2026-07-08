/**
 * 获取 GitHub Pull Request 详情
 */

import { getOwner } from '@/git/get-owner';
import { getRepo } from '@/git/get-repo';
import { githubClient } from '@/github/github-client';

interface Params {
  pullNumber: number;
}

/**
 * 获取 Pull Request 详情
 * @param params.pullNumber PR 编号
 * @returns Pull Request 详情
 */
export async function getPullRequestDetails(params: Params) {
  const owner = await getOwner();
  const repo = await getRepo();
  if (!owner || !repo) {
    throw new Error('无法获取仓库信息');
  }

  const { data: pullRequest } = await githubClient.pulls.get({
    owner,
    repo,
    pull_number: params.pullNumber,
  });
  return pullRequest;
}
