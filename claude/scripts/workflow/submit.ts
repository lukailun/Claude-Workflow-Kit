/**
 * 完整工作流：git add → commit → push → 创建 MR
 *
 * 用法：
 *   tsx submit.ts                # 使用默认 AI provider（ark）
 *   tsx submit.ts --ai claude    # 使用指定 AI provider
 *   tsx submit.ts --receipt      # 创建 MR 并在 Linear 中添加 receipt 评论
 *   tsx submit.ts --auto-merge   # 创建/更新 MR 并开启 pipeline 通过后自动合并
 */

import { createInterface } from 'readline';
import { AI, AI_PROVIDERS } from '@/ai/get-language-model';
import { commitAndPush } from '@/workflow/commit-and-push';
import { createMergeRequestWorkflow } from '@/workflow/create-merge-request';

interface SubmitOptions {
  ai?: AI;
  receipt?: boolean;
  autoMerge?: boolean;
}

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

async function submitWorkflow(options: SubmitOptions) {
  // 阶段一：commit & push
  const commitResult = await commitAndPush(options);

  if (commitResult.status === 'cancelled') {
    process.exit(0);
  }

  if (commitResult.status === 'no_changes') {
    const answer = await promptUser('没有新提交，是否仍要创建 MR？(y/n): ');
    if (answer.toLowerCase() !== 'y' && answer !== '') {
      console.log('❌ 已取消');
      process.exit(0);
    }
  }

  // 阶段二：创建 MR
  await createMergeRequestWorkflow(options);
}

// CLI 入口
const args = process.argv.slice(2);
const validAIProviders = AI_PROVIDERS;
const options: SubmitOptions = {};

for (let i = 0; i < args.length; i++) {
  if (args[i] === '--ai' && args[i + 1]) {
    const value = args[i + 1];
    if (validAIProviders.includes(value as AI)) {
      options.ai = value as AI;
    } else {
      console.error(`❌ 无效的 AI provider: ${value}`);
      console.error(`可用的选项: ${validAIProviders.join(', ')}`);
      process.exit(1);
    }
    i++;
  } else if (args[i] === '--receipt') {
    options.receipt = true;
  } else if (args[i] === '--auto-merge') {
    options.autoMerge = true;
  }
}

submitWorkflow(options).catch((err) => {
  console.error(`❌ ${err.message}`);
  process.exit(1);
});
