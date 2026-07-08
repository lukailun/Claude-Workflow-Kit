/**
 * 生成 MR 标题和描述
 *
 * 功能：使用 AI 自动生成合并请求的标题和描述
 */

import { LanguageModel, Output } from 'ai';
import z from 'zod';
import { generateObject } from '@/ai/generate-object';
import { getMergeRequestPrompt } from '@/ai/prompts/get-merge-request-prompt';
import { commitTypes } from '@/git/commit-type';
import { getRepositoryCompare } from '@/gitlab/get-repository-compare';
import {
  ChangedFileStatus,
  MergeRequestContent,
} from '@/gitlab/merge-request-content';
import { getRelatedIssueFromBranch } from '@/linear/get-related-issue-from-branch';
import { retry } from '@/utils/retry';

interface GenerateMergeRequestParams {
  model: LanguageModel;
  projectId: number;
  sourceBranch: string;
  targetBranch: string;
}

/**
 * 生成 MR 标题和描述
 * @param params.projectId 项目 ID
 * @param params.targetBranch 目标分支
 * @param params.sourceBranch 源分支
 * @returns MR 标题和描述
 */
export async function generateMergeRequest(
  params: GenerateMergeRequestParams
): Promise<MergeRequestContent | undefined> {
  const { projectId, sourceBranch, targetBranch } = params;
  const compare = await getRepositoryCompare({
    projectId,
    sourceBranch,
    targetBranch,
  });

  if (!compare.commits || compare.commits.length === 0) {
    return {
      title: {
        type: 'chore',
        subject: `将 ${sourceBranch} 合并到 ${targetBranch}`,
      },
      model: params.model,
      description: {
        overview: '无提交记录',
        changes: [],
        impact: { files: [], features: [] },
        tests: [],
      },
    };
  }

  const commits = compare.commits;
  const diffLog = commits
    .map((commit) => {
      const shortId = commit.short_id;
      const message = commit.title || commit.message;
      return `${shortId} ${message}`;
    })
    .join('\n');

  const diffs = compare.diffs || [];
  const changedFiles = diffs.map((diff) => {
    const status: ChangedFileStatus = diff.deleted_file
      ? 'deleted'
      : diff.new_file
        ? 'new'
        : 'modified';
    return { path: diff.new_path, status };
  });
  const diffStat = diffs
    .map((diff) => {
      const oldPath = diff.old_path;
      const newPath = diff.new_path;

      if (diff.new_file) {
        return `[新增] ${newPath}`;
      }
      if (diff.deleted_file) {
        return `[删除] ${oldPath}`;
      }
      if (diff.renamed_file) {
        return `[重命名] ${oldPath} => ${newPath}`;
      }
      return `[修改] ${newPath}`;
    })
    .join('\n');

  const mergeRequestPrompt = getMergeRequestPrompt({
    sourceBranch,
    targetBranch,
    diffStat,
    diffLog,
  });

  const [result, relatedIssue] = await Promise.all([
    retry(
      async () => {
        return await generateObject({
          model: params.model,
          prompt: mergeRequestPrompt,
          maxOutputTokens: 16384,
          output: Output.object({
            schema: z.object({
              title: z.object({
                type: z.enum(commitTypes),
                subject: z.string().meta({ description: '合并请求标题' }),
              }),
              description: z.object({
                overview: z.string().meta({ description: '改动概述' }),
                changes: z
                  .array(z.string())
                  .meta({ description: '主要变更列表' }),
                impact: z.object({
                  features: z
                    .array(z.string())
                    .meta({ description: '受影响的功能列表' }),
                }),
                tests: z
                  .array(z.string())
                  .meta({ description: '测试说明列表' }),
              }),
            }),
          }),
        });
      },
           { behavior: { type: 'immediate', maxCount: 3 } }
    ),
    getRelatedIssueFromBranch(sourceBranch),
  ]);

  return {
    ...result.output,
    description: {
      ...result.output.description,
      impact: {
        ...result.output.description.impact,
        files: changedFiles,
      },
    },
    relatedIssue,
    model: params.model,
    usage: result.usage,
  } satisfies MergeRequestContent;
}
