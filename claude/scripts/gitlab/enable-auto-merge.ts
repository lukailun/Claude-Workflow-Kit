/**
 * 开启合并请求的自动合并
 *
 * 功能：MR 在 pipeline 通过后自动合并
 */

import { getVersion, compareVersion } from '@/gitlab/get-version';
import { gitlabClient } from '@/gitlab/gitlab-client';

interface Params {
  projectId: number;
  mergeRequestId: number;
}

function delay(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

/**
 * 开启自动合并
 * @param params.projectId 项目 ID
 * @param params.mergeRequestId 合并请求 ID
 */
export async function enableAutoMerge(params: Params): Promise<void> {
  const { projectId, mergeRequestId } = params;

  const versionInfo = await getVersion();
  const isNewApi = versionInfo.version
    ? compareVersion(versionInfo.version, '17.11.0') >= 0
    : true;

  const retryDelays = [500, 1000, 2000];
  let lastError: unknown;

  for (let attempt = 0; attempt <= retryDelays.length; attempt++) {
    try {
      if (isNewApi) {
        await gitlabClient.MergeRequests.merge(projectId, mergeRequestId, {
          autoMerge: true,
        });
      } else {
        await gitlabClient.MergeRequests.merge(projectId, mergeRequestId, {
          mergeWhenPipelineSucceeds: true,
        });
      }
      return;
    } catch (error) {
      lastError = error;
      if (attempt < retryDelays.length) {
        await delay(retryDelays[attempt]);
      }
    }
  }

  throw lastError;
}
