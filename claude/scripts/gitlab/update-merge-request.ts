/**
 * 更新 GitLab 合并请求
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
  mergeRequestId: number;
  content: MergeRequestContent;
  squash?: boolean;
}

/**
 * 更新合并请求
 * @param params.projectId 项目 ID
 * @param params.mergeRequestId 合并请求 ID
 * @param params.content MR 内容
 * @param params.squash 是否 squash 合并
 * @returns 更新后的合并请求信息
 */
async function updateMergeRequest(
  params: Params
): Promise<ExpandedMergeRequestSchema> {
  const { projectId, mergeRequestId, content, squash } = params;
  const mergeRequest = await gitlabClient.MergeRequests.edit(
    projectId,
    mergeRequestId,
    {
      title: formatTitle(content),
      description: await formatDescription(content),
      squash,
    }
  );
  return mergeRequest;
}

export { updateMergeRequest };
