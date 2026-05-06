/**
 * 从 Linear issues 中选择或输入分支名称
 */

import { createInterface } from 'readline';
import { Issue } from '@linear/sdk';

async function promptBranchName(issues: Issue[]): Promise<string> {
  const readline = createInterface({
    input: process.stdin,
    output: process.stdout,
  });

  if (issues.length === 0) {
    return new Promise((resolve) => {
      readline.question('\n请输入分支名称: ', (answer) => {
        readline.close();
        resolve(answer.trim());
      });
    });
  }

  console.log('📋 你的 Linear 待办任务：\n');
  issues.forEach((issue, index) => {
    console.log(`  ${index + 1}. [${issue.identifier}] ${issue.title}`);
  });
  return new Promise((resolve) => {
    readline.question('\n请输入序号选择任务或输入分支名称: ', (answer) => {
      readline.close();
      const trimmed = answer.trim();
      const index = parseInt(trimmed, 10) - 1;
      if (!isNaN(index) && index >= 0 && index < issues.length) {
        const selected = issues[index];
        console.log(`\n✅ 已选择: [${selected.identifier}] ${selected.title}`);
        resolve(selected.identifier.toLowerCase());
      } else {
        resolve(trimmed);
      }
    });
  });
}

export default promptBranchName;
