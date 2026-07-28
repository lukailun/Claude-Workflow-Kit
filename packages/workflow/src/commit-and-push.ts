/**
 * Git add、commit、push 完整流程
 *
 * 用法：
 *   tsx commit-and-push.ts                # 使用默认 AI provider（ark）
 *   tsx commit-and-push.ts --ai anthropic # 使用指定 AI provider
 */

import { createInterface } from 'readline';
import { $ } from 'bun';
import { generateCommitMessage } from '@/generate-commit-message';
import {
  getLanguageModel,
  AI,
  AI_PROVIDERS,
  getLanguageModelInfo,
} from '@/get-language-model';
import { formatTokenUsage } from '@/token-usage';
import { getCurrentBranch } from '@lukailun/dev-kit/git/get-current-branch';

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

  const unstaged = await $`git diff --name-only`.text();
  const untracked = await $`git ls-files --others --exclude-standard`.text();
  const stagedNow = await $`git diff --cached --name-only`.text();

  if (!unstaged && !untracked && !stagedNow.trim()) {
    console.log('⚠️  没有未提交的改动');
    return { status: 'no_changes' };
  }

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

  const diffStat = await $`git diff --cached --stat`.text();
  const diffContent = await $`git diff --cached --no-color`.text();
  const model = await getLanguageModel(options.ai);
  const modelInfo = getLanguageModelInfo(model);
  console.log(`🤖 正在使用 ${modelInfo.modelId} 生成提交信息...`);
  const commitResult = await generateCommitMessage({
    model,
    diffStat,
    diffContent: diffContent.slice(0, 8000),
    branchName: branch,
  });

  if (!commitResult.type || !commitResult.subject) {
    throw new Error('无法生成提交信息');
  }

  const commitMessage = `${commitResult.type}: ${commitResult.subject}`;

  console.log(`\n💬 生成的提交信息:\n   ${commitMessage}\n`);

  if (commitResult.usage) {
    console.log(
      `${await formatTokenUsage(commitResult.usage, modelInfo.modelId)}\n`
    );
  }

  const answer = await promptUser(
    '是否使用此提交信息？(y=确认 / n=取消 / 直接输入自定义提交信息): '
  );

  let finalMessage: string;
  if (answer.toLowerCase() === 'y' || answer === '') {
    finalMessage = commitMessage;
  } else if (answer.toLowerCase() === 'n') {
    console.log('❌ 已取消提交');
    return { status: 'cancelled' };
  } else {
    finalMessage = answer;
  }

  console.log('\n📝 正在提交...');
  const gitCommitOutput = await $`git commit -m ${finalMessage}`.text();
  console.log(gitCommitOutput);

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
