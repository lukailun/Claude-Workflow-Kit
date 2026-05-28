/**
 * 创建 feature 分支的完整流程
 *
 * 用法：
 *   tsx create-feature.ts <branch-name>
 *
 * 示例：
 *   tsx create-feature.ts ui-redesign
 */

import { createInterface } from 'readline';
import { createFeatureBranch } from '../github/create-feature-branch';

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

async function createFeatureWorkflow() {
  const argName = process.argv[2];

  let branchName: string;

  if (argName) {
    branchName = argName;
  } else {
    branchName = await promptUser('请输入 feature 分支名称: ');
  }

  if (!branchName) {
    console.error('❌ 分支名称不能为空');
    process.exit(1);
  }

  console.log('\n🚀 开始创建 feature 分支...\n');
  await createFeatureBranch(branchName);
}

createFeatureWorkflow();
