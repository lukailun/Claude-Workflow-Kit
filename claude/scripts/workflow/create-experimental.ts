/**
 * 创建 experimental 分支的完整流程
 *
 * 用法：
 *   tsx create-experimental.ts <branch-name>
 *
 * 示例：
 *   tsx create-experimental.ts new-idea
 */

import { createInterface } from 'readline';
import { createExperimentalBranch } from '@/github/create-experimental-branch';

function promptUser(question: string): Promise<string> {
  const readline = createInterface({
    input: process.stdin,
    output: process.stdout,
  });

  return new Promise((resolve) => {
    readline.question(question, (answer) => {
      readline.close();
      resolve(answer.trim());
    });
  });
}

async function createExperimentalWorkflow() {
  const argName = process.argv[2];

  let branchName: string;

  if (argName) {
    branchName = argName;
  } else {
    branchName = await promptUser('请输入 experimental 分支名称: ');
  }

  if (!branchName) {
    console.error('❌ 分支名称不能为空');
    process.exit(1);
  }

  console.log('\n🧪 开始创建 experimental 分支...\n');
  await createExperimentalBranch(branchName);
}

createExperimentalWorkflow();
