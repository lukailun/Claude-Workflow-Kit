/**
 * 获取 GitHub Pull Request 详情
 */

import githubClient from './github-client';
import getOwnerAndRepo from './get-owner-and-repo';

interface Params {
  pullNumber: number;
}

/**
 * 获取 Pull Request 详情
 * @param params.pullNumber PR 编号
 * @returns Pull Request 详情
 */
async function getPullRequestDetails(params: Params) {
  const repoInfo = await getOwnerAndRepo();
  if (!repoInfo) {
    throw new Error('无法获取仓库信息');
  }

  const { data: pullRequest } = await githubClient.pulls.get({
    ...repoInfo,
    pull_number: params.pullNumber,
  });
  return pullRequest;
}

export default getPullRequestDetails;
