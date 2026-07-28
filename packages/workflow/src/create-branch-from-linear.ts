/**
 * 从 Linear issues 创建分支的通用工作流
 *
 * create-experimental.ts 和 create-feature.ts 共享此逻辑，
 * 差异仅在 emoji、分支类型名和创建函数。
 */

import { createInterface } from 'readline';
import { createLinearIssue } from '@cwkit/linear/create-linear-issue';
import { getLinearIssues } from '@cwkit/linear/get-linear-issues';
import { getLinearUser } from '@cwkit/linear/get-linear-user';
import { promptBranchName } from '@cwkit/linear/prompt-branch-name';
import { updateLinearIssueState } from '@cwkit/linear/update-linear-issue-state';

interface CreateBranchConfig {
  emoji: string;
  branchType: string;
  createBranch: (name: string) => Promise<void>;
  /** 可选分支名，未提供时回退到 process.argv[2] */
  branchName?: string;
}

export async function createBranchFromLinearWorkflow(
  config: CreateBranchConfig
) {
  const argName = config.branchName ?? process.argv[2];

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

  console.log(`\n${config.emoji} 开始创建 ${config.branchType} 分支...\n`);
  await config.createBranch(finalBranchName);

  if (issueId) {
    await updateLinearIssueState(issueId, 'Developing');
  }
}
