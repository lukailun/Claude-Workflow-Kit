/**
 * 获取 GitHub Pull Request 详情
 */

import { getOwner } from '@/github';
import { getRepo } from '@/github';
import { githubClient } from '@/github';

interface Params {
  pullNumber: number;
}

/**
 * 获取 Pull Request 详情
 * @param params.pullNumber PR 编号
 * @returns Pull Request 详情
 */
async function getPullRequestDetails(params: Params) {
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

export { getPullRequestDetails };
