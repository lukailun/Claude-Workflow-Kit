/**
 * 创建 GitHub Pull Request 的完整流程
 *
 * 用法：
 *   tsx create-merge-request.ts                # 使用默认 AI provider（ark）
 *   tsx create-merge-request.ts --ai mimo      # 使用指定 AI provider
 *   tsx create-merge-request.ts --receipt      # 创建 PR 并显示分支收据
 *   tsx create-merge-request.ts --auto-merge   # 创建/更新 PR 并开启 CI 通过后自动合并
 */

import { generatePullRequestContent } from '@/ai/generate-pull-request-content';
import {
  getLanguageModel,
  AI,
  AI_PROVIDERS,
  DEFAULT_AI,
} from '@/ai/get-language-model';
import { getCurrentBranch } from '@/git/get-current-branch';
import { mainBranch } from '@/git/main-branch';
import { createPullRequest } from '@/github';
import { enableAutoMerge } from '@/github';
import { getPullRequest } from '@/github';
import { getPullRequestTargetBranch } from '@/github';
import { getRepo } from '@/github';
import { updatePullRequest } from '@/github';
import { buildBranchReceiptWorkflow } from '@/workflow/build-branch-receipt';

export interface PullRequestOptions {
  ai?: AI;
  receipt?: boolean;
  autoMerge?: boolean;
}

export interface PullRequestResult {
  url: string;
}

export async function createPullRequestWorkflow(
  options: PullRequestOptions = {}
): Promise<PullRequestResult> {
  console.log('🚀 开始创建 Pull Request...\n');

  const sourceBranch = await getCurrentBranch();
  console.log(`📍 当前分支: ${sourceBranch}`);

  const targetBranch = await getPullRequestTargetBranch();
  console.log(`🎯 目标分支: ${targetBranch.fullName}\n`);

  const repo = await getRepo();
  if (!repo) {
    throw new Error('无法获取仓库信息');
  }

  const isMergingToMainBranch = targetBranch.type === mainBranch.type;
  console.log(`🤖 正在使用 ${options.ai ?? DEFAULT_AI} 生成 PR 内容...`);
  const model = await getLanguageModel(options.ai);

  const content = await generatePullRequestContent({
    model,
    sourceBranch,
    targetBranch: targetBranch.fullName,
  });

  if (!content) {
    throw new Error('无法生成 PR 内容');
  }

  console.log(`\n📝 标题: ${content.title}\n`);

  if (content.usage) {
    content.usage.inputTokenDetails
    // console.log(
    //   `${await formatTokenUsage(content.usage, model.toString())}\n`
    // );
  }

  const existingPullRequest = await getPullRequest({
    sourceBranch,
    targetBranch: targetBranch.fullName,
  });

  let pullRequest;
  if (existingPullRequest) {
    console.log(`📝 已有 Pull Request #${existingPullRequest.number}，正在更新...`);
    pullRequest = await updatePullRequest({
      pullNumber: existingPullRequest.number,
      content,
      squash: !isMergingToMainBranch,
    });
    console.log(`\n✅ Pull Request 更新成功！`);
  } else {
    console.log('✨ 正在创建 Pull Request...');
    pullRequest = await createPullRequest({
      sourceBranch,
      targetBranch: targetBranch.fullName,
      content,
      squash: !isMergingToMainBranch,
    });
    console.log(`\n✅ Pull Request 创建成功！`);
  }

  console.log(`🔗 ${pullRequest.html_url}`);

  if (options.receipt) {
    const receipt = await buildBranchReceiptWorkflow(sourceBranch);
    if (receipt) {
      console.log('\n📊 分支收据:');
      console.log(receipt);
    }
  }

  if (pullRequest && options.autoMerge) {
    try {
      await enableAutoMerge({
        pullNumber: pullRequest.number,
      });
      console.log('🤖 已开启 CI 通过后自动合并');
    } catch {
      console.log('⚠️ 自动合并开启失败，请手动设置');
    }
  }

  return { url: pullRequest.html_url };
}

// CLI 入口
if (import.meta.main) {
  const args = process.argv.slice(2);
  const validAIProviders = AI_PROVIDERS;
  const options: PullRequestOptions = {};

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
    } else if (args[i] === '--receipt') {
      options.receipt = true;
    } else if (args[i] === '--auto-merge') {
      options.autoMerge = true;
    }
  }

  createPullRequestWorkflow(options).catch((err) => {
    console.error(`❌ ${err.message}`);
    process.exit(1);
  });
}
