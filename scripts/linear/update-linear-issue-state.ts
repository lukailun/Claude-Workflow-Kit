/**
 * 更新 Linear Issue 状态
 *
 * 用法：
 *   updateLinearIssueState('4T-9192', 'Developing')
 */

import linearClient from './linear-client';
import getLinearIssueTeamStates from './get-linear-issue-team-states';

/**
 * 更新 Linear Issue 的状态
 * @param issueId Issue 的 identifier（如 '4T-9192'）
 * @param stateName 目标状态名称（如 'Developing'）
 */
async function updateLinearIssueState(
  issueId: string,
  stateName: string
): Promise<void> {
  // 1. 通过 identifier 获取 issue
  const issue = await linearClient.issue(issueId);
  if (!issue) {
    console.error(`❌ 未找到 issue: ${issueId}`);
    process.exit(1);
  }

  // 2. 获取团队的工作流状态列表
  const states = await getLinearIssueTeamStates(issueId);
  const targetState = states.find(
    (state) => state.name.toLowerCase() === stateName.toLowerCase()
  );

  if (!targetState) {
    const availableStates = states.map((state) => state.name).join(', ');
    console.error(`❌ 团队中不存在状态 "${stateName}"`);
    console.error(`   可用状态: ${availableStates}`);
    process.exit(1);
  }

  // 3. 更新 issue 状态
  await linearClient.updateIssue(issue.id, { stateId: targetState.id });
  console.log(`✅ 已将 [${issueId}] 状态更新为 "${targetState.name}"`);
}

export default updateLinearIssueState;
