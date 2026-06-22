/**
 * 生成 PR 标题和描述
 *
 * 功能：使用 AI 自动生成 Pull Request 的标题和描述
 */
import { z } from 'zod';
import { generateText, LanguageModel, Output } from 'ai';
import {
  getPullRequestPrompts,
} from '@/ai/prompts/get-pull-request-prompts';
import { getRepositoryCompare } from '@/github';
import type { PullRequestContent } from '@/github';

interface GeneratePullRequestContentParams {
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
async function generatePullRequestContent(
  params: GeneratePullRequestContentParams
): Promise<PullRequestContent | undefined> {
  const { sourceBranch, targetBranch } = params;
  const compare = await getRepositoryCompare({
    sourceBranch,
    targetBranch,
  });

  if (!compare.commits || compare.commits.length === 0) {
    return {
      type: 'chore',
      title: `将 ${sourceBranch} 合并到 ${targetBranch}`,
      description: {
        overview: '无提交记录',
        changes: [],
        impact: { files: [], features: [] },
        tests: [],
      },
      usage: undefined,
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

  const descriptionPrompt = getPullRequestPrompts({
    sourceBranch,
    targetBranch,
    diffStat,
    diffLog,
  });

  const { output: pullRequest, totalUsage } = await generateText({
    model: params.model,
    prompt: descriptionPrompt,
    maxOutputTokens: 16384,
    output: Output.object({
      schema: z.object({
        type: z.enum(['feat', 'fix', 'docs', 'style', 'refactor', 'test', 'chore', 'perf']),
        title: z.string(),
        description: z.object({
          overview: z.string(),
          changes: z.array(z.string()),
          impact: z.object({
            files: z.array(z.string()),
            features: z.array(z.string()),
          }),
          tests: z.array(z.string()),
        }),
      })
    }),
  });


  // const descriptionUsage: TokenUsage | undefined = descriptionResult.usage
  //   ? {
  //       input: descriptionResult.usage.inputTokens ?? 0,
  //       output: descriptionResult.usage.outputTokens ?? 0,
  //       cacheRead:
  //         descriptionResult.usage.inputTokenDetails?.cacheReadTokens ?? 0,
  //       cacheWrite:
  //         descriptionResult.usage.inputTokenDetails?.cacheWriteTokens ?? 0,
  //     }
  //   : undefined;

  // const tokenUsage: TokenUsage | undefined =
  //   descriptionUsage && titleUsage
  //     ? {
  //         input: descriptionUsage.input + titleUsage.input,
  //         output: descriptionUsage.output + titleUsage.output,
  //         cacheRead: descriptionUsage.cacheRead + titleUsage.cacheRead,
  //         cacheWrite: descriptionUsage.cacheWrite + titleUsage.cacheWrite,
  //       }
  //     : descriptionUsage || titleUsage;

  // const { name, url, model } = params.model;
  // const tokenInfo = tokenUsage
  //   ? `\n* ${await formatTokenUsage(tokenUsage, model)}`
  //   : '';
  // const generatedInfoSection = `\n\n## 生成信息\n* AI 提供商: [${name}](${url})\n* 模型: ${model}${tokenInfo}`;
  // const description = descriptionResult.text + generatedInfoSection;

  return {
    ...pullRequest,
    usage: totalUsage,
  } satisfies PullRequestContent;
}

export { generatePullRequestContent };
