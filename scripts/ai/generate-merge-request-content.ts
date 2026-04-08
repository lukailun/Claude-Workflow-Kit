/**
 * 生成 MR 标题和描述
 *
 * 功能：使用 AI 自动生成合并请求的标题和描述
 */

import getRepositoryCompare from '../gitlab/get-repository-compare';
import MergeRequestContent from '../gitlab/merge-request-content';
import getLinearIssues from '../linear/get-linear-issues';
import linearClient from '../linear/linear-client';
import {
  getRelatedIssuesPrompt,
  getTitlePrompt,
  getDescriptionPrompt,
} from './merge-request-prompts';
import AIProvider from './types/ai-provider';

interface GenerateMergeRequestContentParams {
  aiProvider: AIProvider;
  projectId: number;
  sourceBranch: string;
  targetBranch: string;
}

async function findRelatedIssues(
  aiProvider: AIProvider,
  sourceBranch: string,
  commitMessages: string[],
  diffStat: string
) {
  const viewer = await linearClient.viewer;
  const allIssues = await Promise.all([
    getLinearIssues({ userId: viewer.id, state: 'backlog' }),
    getLinearIssues({ userId: viewer.id, state: 'unstarted' }),
    getLinearIssues({ userId: viewer.id, state: 'started' }),
  ]);
  const issues = allIssues.flat();

  if (issues.length === 0) return [];

  const issuesList = issues
    .map((issue) => `${issue.identifier}: ${issue.title}`)
    .join('\n');

  const prompt = getRelatedIssuesPrompt({
    sourceBranch,
    commitMessages,
    diffStat,
    issuesList,
  });

  const response = await aiProvider.generate({
    messages: [{ role: 'user', content: prompt }],
    maxTokens: 256,
  });

  if (response.text === '无') return [];

  const identifiers = response.text.split(',').map((id) => id.trim());
  return issues.filter((issue) => identifiers.includes(issue.identifier));
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
      const shortId = commit.id.substring(0, 8);
      const message = commit.title || commit.message;
      return `${shortId} ${message}`;
    })
    .join('\n');

  const diffs = compare.diffs || [];
  const diffStat = diffs
    .map((diff) => {
      const oldPath = diff.old_path;
      const newPath = diff.new_path;
      const path = newPath !== oldPath ? `${oldPath} => ${newPath}` : newPath;
      return path;
    })
    .join('\n');
  const commitMessages = commits.map((commit) => commit.title);
  const relatedIssues = await findRelatedIssues(
    params.aiProvider,
    sourceBranch,
    commitMessages,
    diffStat
  );
  const issuesText = relatedIssues
    .map((issue) => `- ${issue.identifier}: ${issue.title} (${issue.url})`)
    .join('\n');

  const titlePrompt = getTitlePrompt({
    sourceBranch,
    targetBranch,
    diffStat,
    diffLog,
  });

  const descriptionPrompt = getDescriptionPrompt({
    sourceBranch,
    targetBranch,
    diffStat,
    diffLog,
    issuesText,
  });

  const [titleMessage, descriptionMessage] = await Promise.all([
    params.aiProvider.generate({
      messages: [{ role: 'user', content: titlePrompt }],
      maxTokens: 256,
    }),
    params.aiProvider.generate({
      messages: [{ role: 'user', content: descriptionPrompt }],
      maxTokens: 16384,
    }),
  ]);

  const title =
    titleMessage.text || `将 ${sourceBranch} 合并到 ${targetBranch}`;
  const description = descriptionMessage.text;

  return {
    title,
    description,
  } satisfies MergeRequestContent;
}

export default generateMergeRequestContent;
