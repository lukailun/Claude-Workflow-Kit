/**
 * 创建 Linear Issue
 */

import { getLinearUser } from '@/get-linear-user';
import { linearClient } from '@/linear-client';

/**
 * 创建 Linear Issue
 * @param title Issue 标题
 * @returns 创建的 issue identifier
 */
async function createLinearIssue(title: string): Promise<string> {
  const user = await getLinearUser();

  // 获取用户的默认团队
  const teams = await user.teams();
  if (!teams.nodes.length) {
    throw new Error('未找到团队信息');
  }
  const team = teams.nodes[0];

  const projectId = process.env.LINEAR_PROJECT_ID || undefined;

  const result = await linearClient.createIssue({
    title,
    teamId: team.id,
    assigneeId: user.id,
    projectId,
  });

  const issue = await result.issue;
  if (!issue) {
    throw new Error('创建 issue 失败');
  }

  const identifier = issue.identifier;
  console.log(`✅ 已创建 Linear issue: [${identifier}] ${title}`);
  return identifier.toLowerCase();
}

export { createLinearIssue };
