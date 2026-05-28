/**
 * Git add、commit、push 完整流程
 *
 * 用法：
 *   tsx commit-and-push.ts                # 使用默认 AI provider（ark）
 *   tsx commit-and-push.ts --ai anthropic # 使用指定 AI provider
 */

import { $ } from 'bun';
import { createInterface } from 'readline';
import getCurrentBranch from '../git/get-current-branch';
import getAIProvider, {
  AI,
  AI_PROVIDERS,
  DEFAULT_AI,
} from '../ai/get-ai-provider';
import generateCommitMessage from '../ai/generate-commit-message';
import { formatTokenUsage } from '../ai/types/token-usage';

export interface CommitOptions {
  ai?: AI;
}

export type CommitResult =
  | { status: 'committed'; message: string }
  | { status: 'no_changes' }
  | { status: 'cancelled' };

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

export async function commitAndPush(
  options: CommitOptions
): Promise<CommitResult> {
  const branch = await getCurrentBranch();
  console.log(`📍 当前分支: ${branch}\n`);

  // 1. 检查是否有未提交的改动
  const unstaged = await $`git diff --name-only`.text();
  const untracked = await $`git ls-files --others --exclude-standard`.text();
  const stagedNow = await $`git diff --cached --name-only`.text();

  if (!unstaged && !untracked && !stagedNow.trim()) {
    console.log('⚠️  没有未提交的改动');
    return { status: 'no_changes' };
  }

  // 显示未暂存的改动文件
  if (unstaged || untracked) {
    const modifiedFiles = unstaged.trim().split('\n').filter(Boolean);
    const newFiles = untracked.trim().split('\n').filter(Boolean);

    if (modifiedFiles.length > 0) {
      console.log('📄 已修改的文件:');
      modifiedFiles.forEach((f) => console.log(`   ${f}`));
    }
    if (newFiles.length > 0) {
      console.log('📄 未跟踪的文件:');
      newFiles.forEach((f) => console.log(`   ${f}`));
    }

    const stageAnswer = await promptUser(
      '是否暂存这些改动？(y=全部暂存 / n=跳过，仅提交已暂存的): '
    );

    if (stageAnswer.toLowerCase() === 'y' || stageAnswer === '') {
      console.log('📦 正在暂存所有改动...');
      await $`git add -A`.quiet();
      console.log('✅ 所有改动已暂存\n');
    } else {
      console.log('⏭️  跳过暂存，仅提交已暂存的改动\n');
    }
  }

  // 2. 检查是否有暂存的改动
  const staged = await $`git diff --cached --name-only`.text();
  if (!staged.trim()) {
    console.log('⚠️  没有需要提交的改动');
    return { status: 'no_changes' };
  }

  console.log('📝 已暂存的文件:');
  const stagedFiles = staged.trim().split('\n');
  for (const file of stagedFiles) {
    console.log(`   ${file}`);
  }
  console.log();

  // 3. 获取 diff 信息
  const diffStat = await $`git diff --cached --stat`.text();
  const diffContent = await $`git diff --cached --no-color`.text();

  // 4. 使用 AI 生成 commit message
  console.log(`🤖 正在使用 ${options.ai ?? DEFAULT_AI} 生成 commit message...`);
  const provider = await getAIProvider(options.ai);
  const commitResult = await generateCommitMessage({
    aiProvider: provider,
    diffStat,
    diffContent: diffContent.slice(0, 8000), // 限制长度避免 token 超限
    branchName: branch,
  });

  if (!commitResult.message) {
    throw new Error('无法生成 commit message');
  }

  console.log(`\n💬 生成的 commit message:\n   ${commitResult.message}\n`);

  if (commitResult.tokenUsage) {
    console.log(
      `${formatTokenUsage(commitResult.tokenUsage, provider.info.model)}\n`
    );
  }

  // 5. 确认或修改 commit message
  const answer = await promptUser(
    '是否使用此 message？(y=确认 / n=取消 / 直接输入自定义 message): '
  );

  let finalMessage: string;
  if (answer.toLowerCase() === 'y' || answer === '') {
    finalMessage = commitResult.message;
  } else if (answer.toLowerCase() === 'n') {
    console.log('❌ 已取消提交');
    return { status: 'cancelled' };
  } else {
    finalMessage = answer;
  }

  // 6. 执行 commit
  console.log('\n📝 正在提交...');
  const gitCommitOutput = await $`git commit -m ${finalMessage}`.text();
  console.log(gitCommitOutput);

  // 7. 执行 push
  console.log('🚀 正在推送...');
  const pushResult = await $`git push origin ${branch}`.text();
  console.log(pushResult);

  console.log('\n✅ 提交并推送成功！');
  return { status: 'committed', message: finalMessage };
}

// CLI 入口
if (import.meta.main) {
  const args = process.argv.slice(2);
  const validAIProviders = AI_PROVIDERS;
  const options: CommitOptions = {};

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
    }
  }

  commitAndPush(options).catch((err) => {
    console.error(`❌ ${err.message}`);
    process.exit(1);
  });
}
