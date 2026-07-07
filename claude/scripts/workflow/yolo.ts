/**
 * YOLO 一键开发流程
 *
 * 用法：
 *   bun .claude/scripts/workflow/yolo.ts
 *
 * - 从当前分支名解析关联的 Linear issue
 * - 构建包含 issue 信息的 prompt
 */

import { $ } from 'bun';
import { getCurrentBranch } from '@/git/get-current-branch';
import { getRelatedIssueFromBranch } from '@/linear/get-related-issue-from-branch';

async function yoloWorkflow() {
  const branch = await getCurrentBranch();
  const issue = await getRelatedIssueFromBranch(branch);
  if (!issue) {
    console.error('未查找到关联工单，已取消');
    process.exit(1);
  }

  console.log(`Issue: ${issue.identifier} - ${issue.title}`);

  const prompt = [
    `处理 Linear 工单 ${issue.identifier}：`,
    `<issue identifier="${issue.identifier}" created-at="${issue.createdAt.toISOString()}">`,
    `<title>${issue.title}</title>`,
    issue.description
      ? `<description>\n${issue.description}\n</description>`
      : '',
    `</issue>`,
  ]
    .filter(Boolean)
    .join('\n');

  console.log(`Prompt: \n${prompt}`);
  await $`echo -n ${prompt} | pbcopy`.quiet();
}

yoloWorkflow();
