/**
 * 通过 Linear Issue 获取其所在团队的工作流状态列表
 */

import { WorkflowState } from '@linear/sdk';
import { getLinearIssue } from '@/get-linear-issue';

/**
 * 通过 issue identifier 获取其所在团队的工作流状态列表
 * @param issueId Issue 的 identifier（如 '4T-9192'）
 * @returns 工作流状态列表
 */
async function getLinearIssueTeamStates(
  issueId: string
): Promise<WorkflowState[]> {
  const issue = await getLinearIssue(issueId);
  if (!issue) {
    throw new Error(`未找到 issue: ${issueId}`);
  }

  const team = await issue.team;
  if (!team) {
    throw new Error(`无法获取 issue ${issueId} 的团队信息`);
  }

  const states = await team.states();
  return states.nodes;
}

export { getLinearIssueTeamStates };
