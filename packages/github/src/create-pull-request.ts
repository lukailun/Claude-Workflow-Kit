/**
 * 创建 GitHub Pull Request
 *
 * 功能：通过 GitHub API 创建 Pull Request
 */

import { getOwner } from '@cwkit/shared/git/get-owner';
import { getRepo } from '@cwkit/shared/git/get-repo';
import { githubClient } from './github-client';
import { PullRequestContent } from './pull-request-content';

interface Params {
  sourceBranch: string;
  targetBranch: string;
  content: PullRequestContent;
  squash?: boolean;
}

/**
 * 创建 Pull Request
 * @param params.sourceBranch 源分支
 * @param params.targetBranch 目标分支
 * @param params.content PR 内容
 * @param params.squash 是否 squash 合并
 * @returns 创建的 Pull Request 信息
 */
export async function createPullRequest(params: Params) {
  const owner = await getOwner();
  const repo = await getRepo();
  if (!owner || !repo) {
    throw new Error('无法获取仓库信息');
  }

  const { data: pullRequest } = await githubClient.pulls.create({
    owner,
    repo,
    head: params.sourceBranch,
    base: params.targetBranch,
    title: params.content.title,
    body: params.content.description,
  });
  return pullRequest;
}
