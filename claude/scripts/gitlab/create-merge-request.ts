/**
 * 创建 GitLab 合并请求
 *
 * 功能：通过 GitLab API 创建合并请求
 */

import { ExpandedMergeRequestSchema } from '@gitbeaker/rest';
import { gitlabClient } from '@/gitlab/gitlab-client';
import {
  formatDescription,
  formatTitle,
  MergeRequestContent,
} from '@/gitlab/merge-request-content';

interface Params {
  projectId: number;
  sourceBranch: string;
  targetBranch: string;
  content: MergeRequestContent;
  squash?: boolean;
}

/**
 * 创建合并请求
 * @param params.projectId 项目 ID
 * @param params.sourceBranch 源分支
 * @param params.targetBranch 目标分支
 * @param params.content MR 内容
 * @param params.squash 是否 squash 合并
 * @returns 创建的合并请求信息
 */
async function createMergeRequest(
  params: Params
): Promise<ExpandedMergeRequestSchema> {
  const mergeRequest = await gitlabClient.MergeRequests.create(
    params.projectId,
    params.sourceBranch,
    params.targetBranch,
    formatTitle(params.content),
    {
      description: await formatDescription(params.content),
      removeSourceBranch: true,
      squash: params.squash,
    }
  );
  return mergeRequest;
}

export { createMergeRequest };
