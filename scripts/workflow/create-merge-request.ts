/**
 * 创建 GitLab 合并请求的完整流程
 *
 * 用法：
 *   tsx create-merge-request.ts                # 使用默认 AI provider（ark）
 *   tsx create-merge-request.ts --ai mimo      # 使用指定 AI provider
 *   tsx create-merge-request.ts --receipt      # 创建 MR 并在 Linear 中添加 receipt 评论
 */

import getCurrentBranch from '../gitlab/get-current-branch';
import getMergeRequestTargetBranch from '../gitlab/get-merge-request-target-branch';
import mainBranch from '../git/main-branch';
import getCurrentProjectId from '../gitlab/get-current-project-id';
import generateMergeRequestContent from '../ai/generate-merge-request-content';
import createMergeRequest from '../gitlab/create-merge-request';
import getAIProvider, {
  AI,
  AI_PROVIDERS,
  DEFAULT_AI,
} from '../ai/get-ai-provider';
import updateLinearIssueState from '../linear/update-linear-issue-state';
import createLinearComment from '../linear/create-linear-comment';
import { buildBranchReceiptWorkflow } from './build-branch-receipt';
import { formatTokenUsage } from '../ai/types/token-usage';

export interface MergeRequestOptions {
  ai?: AI;
  receipt?: boolean;
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
  console.log(`🤖 正在使用 ${options.ai ?? DEFAULT_AI} 生成 MR 内容...`);
  const provider = await getAIProvider(options.ai);

  const content = await generateMergeRequestContent({
    aiProvider: provider,
    projectId,
    sourceBranch,
    targetBranch: targetBranch.fullName,
  });

  if (!content) {
    throw new Error('无法生成 MR 内容');
  }

  console.log(`\n📝 标题: ${content.title}\n`);

  if (content.tokenUsage) {
    console.log(
      `${formatTokenUsage(content.tokenUsage, provider.info.model)}\n`
    );
  }

  console.log('✨ 正在创建合并请求...');
  const mergeRequest = await createMergeRequest({
    projectId,
    sourceBranch,
    targetBranch: targetBranch.fullName,
    content,
    squash: !isMergingToMainBranch,
  });

  console.log(`\n✅ 合并请求创建成功！`);
  console.log(`🔗 ${mergeRequest.web_url}`);

  const issueIdMatch = sourceBranch.match(
    /(?:^|[a-zA-Z-]+\/)([a-zA-Z0-9]+-\d+)/
  );
  if (issueIdMatch) {
    const issueId = issueIdMatch[1];
    await updateLinearIssueState(issueId, 'In Code Review');

    if (options.receipt) {
      const receipt = await buildBranchReceiptWorkflow(sourceBranch);
      if (receipt) {
        await createLinearComment(issueId, receipt);
      }
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
    }
  }

  createMergeRequestWorkflow(options).catch((err) => {
    console.error(`❌ ${err.message}`);
    process.exit(1);
  });
}
