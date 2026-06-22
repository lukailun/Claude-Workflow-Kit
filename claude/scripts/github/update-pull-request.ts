/**
 * 更新 GitHub Pull Request
 */

import { getOwner } from '@/github';
import { getRepo } from '@/github';
import { githubClient } from '@/github';
import { PullRequestContent, PullRequestDescription } from '@/github';

interface Params {
  pullNumber: number;
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
  if (desc.impact.modules.length > 0) {
    impactItems.push(`* **影响模块**: ${desc.impact.modules.join(', ')}`);
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
    body: formatDescription(params.content.description),
  });
  return pullRequest;
}

export { updatePullRequest };
