/**
 * 创建 GitLab 合并请求的完整流程
 *
 * 用法：
 *   tsx merge-request.ts                # 使用默认 AI provider（ark）
 *   tsx merge-request.ts --ai anthropic
 *   tsx merge-request.ts --ai zai
 *   tsx merge-request.ts --ai minimax
 *   tsx merge-request.ts --ai ark
 */

import getCurrentBranch from '../gitlab/get-current-branch';
import getMergeRequestTargetBranch from '../gitlab/get-merge-request-target-branch';
import mainBranch from '../gitlab/main-branch';
import getCurrentProjectId from '../gitlab/get-current-project-id';
import generateMergeRequestContent from '../ai/generate-merge-request-content';
import createMergeRequest from '../gitlab/create-merge-request';
import getAIProvider, { AI, DEFAULT_AI } from '../ai/get-ai-provider';

async function mergeRequest(ai?: AI) {
  console.log('🚀 开始创建合并请求...\n');

  const sourceBranch = await getCurrentBranch();
  console.log(`📍 当前分支: ${sourceBranch}`);

  const targetBranch = await getMergeRequestTargetBranch();
  console.log(`🎯 目标分支: ${targetBranch}\n`);

  const projectId = await getCurrentProjectId();
  if (!projectId) {
    console.error('❌ 无法获取项目 ID');
    process.exit(1);
  }
  const isMergingToDefaultTargetBranch = targetBranch === mainBranch;
  console.log(`🤖 正在使用 ${ai ?? DEFAULT_AI} 生成 MR 内容...`);
  const provider = await getAIProvider(ai);

  const content = await generateMergeRequestContent({
    aiProvider: provider,
    projectId,
    sourceBranch,
    targetBranch,
  });

  if (!content) {
    console.error('❌ 无法生成 MR 内容');
    process.exit(1);
  }

  console.log(`\n📝 标题: ${content.title}\n`);

  console.log('✨ 正在创建合并请求...');
  const mergeRequest = await createMergeRequest({
    projectId,
    sourceBranch,
    targetBranch,
    content,
    squash: !isMergingToDefaultTargetBranch,
  });

  console.log(`\n✅ 合并请求创建成功！`);
  console.log(`🔗 ${mergeRequest.web_url}`);
}

// 解析命令行参数
const args = process.argv.slice(2);
const validAIProviders: AI[] = ['anthropic', 'zai', 'minimax', 'ark'];
let aiProviderArg: AI | undefined;

for (let i = 0; i < args.length; i++) {
  if (args[i] === '--ai' && args[i + 1]) {
    const value = args[i + 1];
    if (validAIProviders.includes(value as AI)) {
      aiProviderArg = value as AI;
    } else {
      console.error(`❌ 无效的 AI provider: ${value}`);
      console.error(`可用的选项: ${validAIProviders.join(', ')}`);
      process.exit(1);
    }
    break;
  }
}

mergeRequest(aiProviderArg);
