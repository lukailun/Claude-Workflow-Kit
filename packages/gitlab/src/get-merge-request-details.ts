/**
 * 获取 GitLab 合并请求详情
 */

import { ExpandedMergeRequestSchema } from '@gitbeaker/rest';
import { gitlabClient } from '@/gitlab-client';

interface Params {
  projectId: number;
  mergeRequestIid: number;
}

/**
 * 获取合并请求详情
 * @param projectId GitLab 项目 ID
 * @param mergeRequestIid 合并请求 IID
 * @returns 合并请求详情
 */
export async function getMergeRequestDetails(
  params: Params
): Promise<ExpandedMergeRequestSchema> {
  const { projectId, mergeRequestIid } = params;
  const mergeRequest = (await gitlabClient.MergeRequests.show(
    projectId,
    mergeRequestIid
  )) as any;
  return mergeRequest;
}
