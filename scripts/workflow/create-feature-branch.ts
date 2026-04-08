/**
 * 创建 feature 分支的完整流程
 *
 * 用法：
 *   tsx create-feature-branch.ts                  # 从 Linear issues 中选择
 *   tsx create-feature-branch.ts <branch-name>    # 直接指定分支名称
 *
 * 示例：
 *   tsx create-feature-branch.ts 4t-9192-conversation-red-dot
 */

import * as readline from 'readline';
import { createFeatureBranch } from '../gitlab/create-feature-branch';
import getLinearIssues from '../linear/get-linear-issues';
import getLinearUser from '../linear/get-linear-user';
import updateLinearIssueState from '../linear/update-linear-issue-state';
import { Issue } from '@linear/sdk';

async function promptIssueSelection(issues: Issue[]): Promise<string> {
  console.log('📋 你的 Linear 待办任务：\n');
  issues.forEach((issue, index) => {
    console.log(`  ${index + 1}. [${issue.identifier}] ${issue.title}`);
  });

  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
  });

  return new Promise((resolve) => {
    rl.question('\n请输入序号选择 issue: ', (answer) => {
      rl.close();
      const index = parseInt(answer, 10) - 1;
      if (isNaN(index) || index < 0 || index >= issues.length) {
        console.error('❌ 无效的选择');
        process.exit(1);
      }
      const selected = issues[index];
      console.log(`\n✅ 已选择: [${selected.identifier}] ${selected.title}`);
      resolve(selected.identifier.toLowerCase());
    });
  });
}

async function createFeatureBranchWorkflow() {
  const argName = process.argv[2];

  let branchName: string;

  if (argName) {
    branchName = argName;
  } else {
    console.log('🔍 正在获取 Linear issues...\n');

    const user = await getLinearUser();
    const issues = await getLinearIssues({
      userId: user.id,
      state: 'unstarted',
    });

    if (issues.length === 0) {
      console.error('❌ 没有找到待开始的 issue');
      process.exit(1);
    }

    branchName = await promptIssueSelection(issues);
  }

  console.log('\n🚀 开始创建 feature 分支...\n');
  await createFeatureBranch(branchName);

  const issueIdMatch = branchName.match(/^([a-zA-Z]+-\d+)/);
  if (issueIdMatch) {
    const issueId = issueIdMatch[1].toUpperCase();
    await updateLinearIssueState(issueId, 'Developing');
  }
}

createFeatureBranchWorkflow();
