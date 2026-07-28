/**
 * 创建 GitLab 合并请求的完整流程
 *
 * 用法：
 *   tsx create-merge-request.ts                # 使用默认 AI provider
 *   tsx create-merge-request.ts --ai mimo      # 使用指定 AI provider
 *   tsx create-merge-request.ts --receipt      # 创建 MR 并在 Linear 中添加 receipt 评论
 *   tsx create-merge-request.ts --auto-merge   # 创建/更新 MR 并开启 pipeline 通过后自动合并
 */

import { generateMergeRequest } from './generate-merge-request';
import {
  getLanguageModel,
  AI,
  AI_PROVIDERS,
  getLanguageModelInfo,
} from '@cwkit/ai/get-language-model';
import { formatTokenUsage } from '@cwkit/openrouter/format-token-usage';
import { getCurrentBranch } from '@cwkit/shared/git/get-current-branch';
import { mainBranch } from '@cwkit/shared/git/main-branch';
import { createMergeRequest } from '@cwkit/gitlab/create-merge-request';
import { enableAutoMerge } from '@cwkit/gitlab/enable-auto-merge';
import { getCurrentProjectId } from '@cwkit/gitlab/get-current-project-id';
import { getMergeRequest } from '@cwkit/gitlab/get-merge-request';
import { getMergeRequestTargetBranch } from '@cwkit/gitlab/get-merge-request-target-branch';
import { formatTitle } from '@cwkit/gitlab/merge-request-content';
import { updateMergeRequest } from '@cwkit/gitlab/update-merge-request';
import { createLinearComment } from '@cwkit/linear/create-linear-comment';
import { updateLinearIssueState } from '@cwkit/linear/update-linear-issue-state';
import { buildBranchReceiptWorkflow } from './build-branch-receipt';

export interface MergeRequestOptions {
  ai?: AI;
  receipt?: boolean;
  autoMerge?: boolean;
}

export interface MergeRequestResult {
  url: string;
}

export async function createMergeRequestWorkflow(
  options: MergeRequestOptions = {}
): Promise<MergeRequestResult> {
  console.log('🚀 开始创建合并请求...\n');

  const sourceBranch = await getCurrentBranch();
  console.log(`📍 当前分支: ${sourceBranch}`);

  const targetBranch = await getMergeRequestTargetBranch();
  console.log(`🎯 目标分支: ${targetBranch.fullName}\n`);

  const projectId = await getCurrentProjectId();
  if (!projectId) {
    throw new Error('无法获取项目 ID');
  }

  const isMergingToMainBranch = targetBranch.type === mainBranch.type;
  const model = await getLanguageModel(options.ai);
  const modelInfo = getLanguageModelInfo(model);
  console.log(`🤖 正在使用 ${modelInfo.modelId} 生成合并请求内容...`);

  const content = await generateMergeRequest({
    model,
    projectId,
    sourceBranch,
    targetBranch: targetBranch.fullName,
  });

  if (!content) {
    throw new Error('无法生成合并请求内容');
  }

  let receipt: string | undefined;
  if (options.receipt) {
    receipt = await buildBranchReceiptWorkflow(sourceBranch);
    if (receipt) {
      content.receipt = receipt;
    }
  }

  console.log(`\n📝 标题: ${formatTitle(content)}\n`);

  if (content.usage) {
    console.log(
      `${await formatTokenUsage(content.usage, getLanguageModelInfo(model).modelId)}\n`
    );
  }

  const existingMergeRequest = await getMergeRequest({
    projectId,
    sourceBranch,
    targetBranch: targetBranch.fullName,
  });

  let mergeRequest: Awaited<ReturnType<typeof createMergeRequest>> | undefined = undefined;
  if (existingMergeRequest) {
    console.log(`📝 已有合并请求 !${existingMergeRequest.iid}，正在更新...`);
    mergeRequest = await updateMergeRequest({
      projectId,
      mergeRequestId: existingMergeRequest.iid,
      content,
      squash: !isMergingToMainBranch,
    });
    console.log('\n✅ 合并请求更新成功！');
  } else {
    console.log('✨ 正在创建合并请求...');
    mergeRequest = await createMergeRequest({
      projectId,
      sourceBranch,
      targetBranch: targetBranch.fullName,
      content,
      squash: !isMergingToMainBranch,
    });
    console.log('\n✅ 合并请求创建成功！');
  }

  console.log(`🔗 ${mergeRequest.web_url}`);

  const issueIdMatch = sourceBranch.match(
    /(?:^|[a-zA-Z-]+\/)([a-zA-Z0-9]+-\d+)/
  );
  if (issueIdMatch) {
    const issueId = issueIdMatch[1];
    await updateLinearIssueState(issueId, 'In Code Review');

    if (receipt) {
      await createLinearComment(issueId, '```\n' + receipt + '\n```');
    }
  }

  if (mergeRequest && options.autoMerge) {
    try {
      await enableAutoMerge({
        projectId,
        mergeRequestId: mergeRequest.iid,
      });
      console.log('🤖 已开启 pipeline 通过后自动合并');
    } catch {
      console.log('⚠️ 自动合并开启失败，请手动设置');
    }
  }

  return { url: mergeRequest.web_url };
}

// CLI 入口
if (import.meta.main) {
  const args = process.argv.slice(2);
  const validAIProviders = AI_PROVIDERS;
  const options: MergeRequestOptions = {};

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

  createMergeRequestWorkflow(options).catch((err) => {
    console.error(`❌ ${err.message}`);
    process.exit(1);
  });
}
