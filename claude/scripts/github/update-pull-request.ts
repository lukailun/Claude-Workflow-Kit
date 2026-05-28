/**
 * 更新 GitHub Pull Request
 */

import githubClient from './github-client';
import getOwnerAndRepo from './get-owner-and-repo';
import PullRequestContent from './pull-request-content';

interface Params {
  pullNumber: number;
  content: PullRequestContent;
  squash?: boolean;
}

/**
 * 更新 Pull Request
 * @param params.pullNumber PR 编号
 * @param params.content PR 内容
 * @param params.squash 是否 squash 合并
 * @returns 更新后的 Pull Request 信息
 */
async function updatePullRequest(params: Params) {
  const repoInfo = await getOwnerAndRepo();
  if (!repoInfo) {
    throw new Error('无法获取仓库信息');
  }

  const { data: pullRequest } = await githubClient.pulls.update({
    ...repoInfo,
    pull_number: params.pullNumber,
    title: params.content.title,
    body: params.content.description,
  });
  return pullRequest;
}

export default updatePullRequest;
