/**
 * 生成 PR 标题和描述
 *
 * 功能：使用 AI 自动生成 Pull Request 的标题和描述
 */

import { generateText, LanguageModel } from 'ai';
import type { ModelConfig } from '@/ai/models';
import {
  getTitlePrompt,
  getDescriptionPrompt,
} from '@/ai/prompts/merge-request-prompts';
import type { TokenUsage } from '@/ai/types/token-usage';
import { formatTokenUsage } from '@/ai/types/token-usage';
import { getRepositoryCompare } from '@/github';
import { PullRequestContent } from '@/github';

interface GenerateMergeRequestContentParams {
  model: LanguageModel;
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

  const descriptionResult = await generateText({
    model: params.model,
    messages: [{ role: 'user', content: descriptionPrompt }],
    maxOutputTokens: 16384,
  });

  const titleResult = await generateText({
    model: params.model,
    messages: [
      {
        role: 'user',
        content: getTitlePrompt({
          description: descriptionResult.text ?? '',
        }),
      },
    ],
    maxOutputTokens: 2048,
  });

  const descriptionUsage: TokenUsage | undefined = descriptionResult.usage
    ? {
        input: descriptionResult.usage.inputTokens ?? 0,
        output: descriptionResult.usage.outputTokens ?? 0,
        cacheRead:
          descriptionResult.usage.inputTokenDetails?.cacheReadTokens ?? 0,
        cacheWrite:
          descriptionResult.usage.inputTokenDetails?.cacheWriteTokens ?? 0,
      }
    : undefined;

  const titleUsage: TokenUsage | undefined = titleResult.usage
    ? {
        input: titleResult.usage.inputTokens ?? 0,
        output: titleResult.usage.outputTokens ?? 0,
        cacheRead: titleResult.usage.inputTokenDetails?.cacheReadTokens ?? 0,
        cacheWrite: titleResult.usage.inputTokenDetails?.cacheWriteTokens ?? 0,
      }
    : undefined;

  const title =
    titleResult.text || `将 ${sourceBranch} 合并到 ${targetBranch}`;
  const tokenUsage: TokenUsage | undefined =
    descriptionUsage && titleUsage
      ? {
          input: descriptionUsage.input + titleUsage.input,
          output: descriptionUsage.output + titleUsage.output,
          cacheRead: descriptionUsage.cacheRead + titleUsage.cacheRead,
          cacheWrite: descriptionUsage.cacheWrite + titleUsage.cacheWrite,
        }
      : descriptionUsage || titleUsage;

  // const { name, url, model } = params.model;
  // const tokenInfo = tokenUsage
  //   ? `\n* ${await formatTokenUsage(tokenUsage, model)}`
  //   : '';
  // const generatedInfoSection = `\n\n## 生成信息\n* AI 提供商: [${name}](${url})\n* 模型: ${model}${tokenInfo}`;
  // const description = descriptionResult.text + generatedInfoSection;
  const description = descriptionResult.text

  return {
    title,
    description,
    tokenUsage,
  } satisfies PullRequestContent;
}

export { generateMergeRequestContent };
