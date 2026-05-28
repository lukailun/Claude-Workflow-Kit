/**
 * 生成 MR 标题和描述
 *
 * 功能：使用 AI 自动生成合并请求的标题和描述
 */

import { Issue } from '@linear/sdk';
import getRepositoryCompare from '../gitlab/get-repository-compare';
import MergeRequestContent from '../gitlab/merge-request-content';
import getLinearIssue from '../linear/get-linear-issue';
import {
  getTitlePrompt,
  getDescriptionPrompt,
} from './prompts/merge-request-prompts';
import AIProvider from './types/ai-provider';
import type { TokenUsage } from './types/token-usage';
import { formatTokenUsage } from './types/token-usage';

interface GenerateMergeRequestContentParams {
  aiProvider: AIProvider;
  projectId: number;
  sourceBranch: string;
  targetBranch: string;
}

async function findRelatedIssue(
  sourceBranch: string
): Promise<Issue | undefined> {
  const issueIdPattern = /[a-zA-Z0-9]+-\d+/i;
  const match = sourceBranch.match(issueIdPattern);
  if (!match) return undefined;
  const issueId = match[0].toUpperCase();
  return getLinearIssue(issueId);
}

/**
 * 生成 MR 标题和描述
 * @param params.projectId 项目 ID
 * @param params.targetBranch 目标分支
 * @param params.sourceBranch 源分支
 * @returns MR 标题和描述
 */
async function generateMergeRequestContent(
  params: GenerateMergeRequestContentParams
): Promise<MergeRequestContent | undefined> {
  const { projectId, sourceBranch, targetBranch } = params;
  const compare = await getRepositoryCompare({
    projectId,
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
      const shortId = commit.short_id;
      const message = commit.title || commit.message;
      return `${shortId} ${message}`;
    })
    .join('\n');

  const diffs = compare.diffs || [];
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

  const descriptionPrompt = getDescriptionPrompt({
    sourceBranch,
    targetBranch,
    diffStat,
    diffLog,
  });

  const [descriptionMessage, relatedIssue] = await Promise.all([
    params.aiProvider.generate({
      messages: [{ role: 'user', content: descriptionPrompt }],
      maxTokens: 16384,
    }),
    findRelatedIssue(sourceBranch),
  ]);

  const titleMessage = await params.aiProvider.generate({
    messages: [
      {
        role: 'user',
        content: getTitlePrompt({
          description: descriptionMessage.text || '',
          relatedIssue,
        }),
      },
    ],
    maxTokens: 2048,
  });

  const title =
    titleMessage.text || `将 ${sourceBranch} 合并到 ${targetBranch}`;
  const issuesText = relatedIssue
    ? `- [${relatedIssue.identifier}: ${relatedIssue.title}](${relatedIssue.url})`
    : '无';
  const relatedIssuesSection = `\n\n## 相关工单\n${issuesText}`;

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
    ? `\n* ${formatTokenUsage(tokenUsage, model)}`
    : '';
  const generatedInfoSection = `\n\n## 生成信息\n* **AI 提供商**: [${name}](${url})\n* **模型**: ${model}${tokenInfo}`;
  const description =
    descriptionMessage.text + relatedIssuesSection + generatedInfoSection;

  return {
    title,
    description,
    tokenUsage,
  } satisfies MergeRequestContent;
}

export default generateMergeRequestContent;
