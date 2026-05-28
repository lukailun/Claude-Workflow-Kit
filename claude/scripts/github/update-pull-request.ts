/**
 * 更新 GitHub Pull Request
 */

import getOwner from '@/github/get-owner';
import getRepo from '@/github/get-repo';
import githubClient from '@/github/github-client';
import PullRequestContent from '@/github/pull-request-content';

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
  const owner = await getOwner();
  const repo = await getRepo();
  if (!owner || !repo) {
    throw new Error('无法获取仓库信息');
  }

  const { data: pullRequest } = await githubClient.pulls.update({
    owner,
    repo,
    pull_number: params.pullNumber,
    title: params.content.title,
    body: params.content.description,
  });
  return pullRequest;
}

export default updatePullRequest;
