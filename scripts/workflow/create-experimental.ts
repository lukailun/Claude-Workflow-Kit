/**
 * 创建 experimental 分支的完整流程
 *
 * 用法：
 *   tsx create-experimental.ts                  # 从 Linear issues 中选择
 *   tsx create-experimental.ts <branch-name>   # 直接指定分支名称
 *
 * 示例：
 *   tsx create-experimental.ts 4t-9192
 */

import { createInterface } from 'readline';
import { createExperimentalBranch } from '../gitlab/create-experimental-branch';
import createLinearIssue from '../linear/create-linear-issue';
import getLinearIssues from '../linear/get-linear-issues';
import getLinearUser from '../linear/get-linear-user';
import updateLinearIssueState from '../linear/update-linear-issue-state';
import promptBranchName from '../linear/prompt-branch-name';

async function createExperimentalWorkflow() {
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

    branchName = await promptBranchName(issues);
  }

  const issueIdMatch = branchName.match(/(?:^|[a-zA-Z-]+\/)([a-zA-Z0-9]+-\d+)/);
  let finalBranchName = branchName;
  let issueId: string | undefined;

  if (issueIdMatch) {
    issueId = issueIdMatch[1];
  } else {
    const readline = createInterface({
      input: process.stdin,
      output: process.stdout,
    });

    const shouldCreate = await new Promise<boolean>((resolve) => {
      readline.question('\n是否创建 Linear 任务？(y/n):', (answer) => {
        readline.close();
        resolve(answer.trim().toLowerCase() === 'y');
      });
    });

    if (shouldCreate) {
      issueId = await createLinearIssue(branchName);
      finalBranchName = issueId;
    }
  }

  console.log('\n🧪 开始创建 experimental 分支...\n');
  await createExperimentalBranch(finalBranchName);

  if (issueId) {
    await updateLinearIssueState(issueId, 'Developing');
  }
}

createExperimentalWorkflow();
