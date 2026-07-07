/**
 * 生成 PR 标题和描述
 *
 * 功能：使用 AI 自动生成 Pull Request 的标题和描述
 */

import {
  getTitlePrompt,
  getDescriptionPrompt,
} from '@/ai/prompts/merge-request-prompts';
import type { AIProvider } from '@/ai/types';
import type { TokenUsage } from '@/ai/types/token-usage';
import { formatTokenUsage } from '@/ai/types/token-usage';
import { getRepositoryCompare } from '@/github';
import { PullRequestContent } from '@/github';

interface GenerateMergeRequestContentParams {
  aiProvider: AIProvider;
  sourceBranch: string;
  targetBranch: string;
}

/**
 * 生成 PR 标题和描述
 * @param params.targetBranch 目标分支
 * @param params.sourceBranch 源分支
 * @returns PR 标题和描述
 */
async function generateMergeRequestContent(
  params: GenerateMergeRequestContentParams
): Promise<PullRequestContent | undefined> {
  const { sourceBranch, targetBranch } = params;
  const compare = await getRepositoryCompare({
    sourceBranch,
    targetBranch,
  });

  if (!compare.commits || compare.commits.length === 0) {
    return {
      title: `将 ${sourceBranch} 合并到 ${targetBranch}`,
      description: '',
    };
  }

  const commits = compare.commits;
  const diffLog = commits
    .map((commit) => {
      const shortId = commit.sha.slice(0, 7);
      const message = commit.commit.message.split('\n')[0];
      return `${shortId} ${message}`;
    })
    .join('\n');

  const files = compare.files || [];
  const diffStat = files
    .map((file) => {
      if (file.status === 'added') {
        return `[新增] ${file.filename}`;
      }
      if (file.status === 'removed') {
        return `[删除] ${file.filename}`;
      }
      if (file.status === 'renamed') {
        return `[重命名] ${file.filename}`;
      }
      return `[修改] ${file.filename}`;
    })
    .join('\n');

  const descriptionPrompt = getDescriptionPrompt({
    sourceBranch,
    targetBranch,
    diffStat,
    diffLog,
  });

  const descriptionMessage = await params.aiProvider.generate({
    messages: [{ role: 'user', content: descriptionPrompt }],
    maxTokens: 16384,
  });

  const titleMessage = await params.aiProvider.generate({
    messages: [
      {
        role: 'user',
        content: getTitlePrompt({
          description: descriptionMessage.text ?? '',
        }),
      },
    ],
    maxTokens: 2048,
  });

  const title =
    titleMessage.text || `将 ${sourceBranch} 合并到 ${targetBranch}`;
  const tokenUsage: TokenUsage | undefined =
    descriptionMessage.tokenUsage && titleMessage.tokenUsage
      ? {
          input:
            descriptionMessage.tokenUsage.input + titleMessage.tokenUsage.input,
          output:
            descriptionMessage.tokenUsage.output +
            titleMessage.tokenUsage.output,
          cacheRead:
            descriptionMessage.tokenUsage.cacheRead +
            titleMessage.tokenUsage.cacheRead,
          cacheWrite:
            descriptionMessage.tokenUsage.cacheWrite +
            titleMessage.tokenUsage.cacheWrite,
        }
      : descriptionMessage.tokenUsage || titleMessage.tokenUsage;

  const { name, url, model } = params.aiProvider.info;
  const tokenInfo = tokenUsage
    ? `\n* ${await formatTokenUsage(tokenUsage, model)}`
    : '';
  const generatedInfoSection = `\n\n## 生成信息\n* AI 提供商: [${name}](${url})\n* 模型: ${model}${tokenInfo}`;
  const description =
    descriptionMessage.text + generatedInfoSection;

  return {
    title,
    description,
    tokenUsage,
  } satisfies PullRequestContent;
}

export { generateMergeRequestContent };
