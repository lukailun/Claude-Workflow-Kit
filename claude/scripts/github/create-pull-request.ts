/**
 * 创建 GitHub Pull Request
 *
 * 功能：通过 GitHub API 创建 Pull Request
 */

import { getOwner, getRepo, githubClient } from '@/github';
import type { PullRequestContent, PullRequestDescription } from '@/github';

interface Params {
  sourceBranch: string;
  targetBranch: string;
  content: PullRequestContent;
  squash?: boolean;
}

function formatDescription(desc: PullRequestDescription): string {
  const sections: string[] = [];

  sections.push(`## 改动概述\n${desc.overview}`);

  if (desc.changes.length > 0) {
    sections.push(`## 主要变更\n${desc.changes.map(c => `* ${c}`).join('\n')}`);
  }

  const impactItems: string[] = [];
  if (desc.impact.files.length > 0) {
    impactItems.push(`* **改动文件**: ${desc.impact.files.join(', ')}`);
  }
  if (desc.impact.features.length > 0) {
    impactItems.push(`* **影响功能**: ${desc.impact.features.join(', ')}`);
  }
  if (impactItems.length > 0) {
    sections.push(`## 影响范围\n${impactItems.join('\n')}`);
  }

  if (desc.tests.length > 0) {
    sections.push(`## 测试说明\n${desc.tests.map(t => `* ${t}`).join('\n')}`);
  }

  return sections.join('\n\n');
}

/**
 * 创建 Pull Request
 * @param params.sourceBranch 源分支
 * @param params.targetBranch 目标分支
 * @param params.content PR 内容
 * @param params.squash 是否 squash 合并
 * @returns 创建的 Pull Request 信息
 */
async function createPullRequest(params: Params) {
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
    body: formatDescription(params.content.description),
  });
  return pullRequest;
}

export { createPullRequest };
