/**
 * 开启合并请求的自动合并
 *
 * 功能：MR 在 pipeline 通过后自动合并
 */

import { AcceptMergeRequestOptions } from '@gitbeaker/core';
import { getVersion, compareVersion } from '@/get-version';
import { gitlabClient } from '@/gitlab-client';
import { retry } from '@lukailun/dev-kit/utils/retry';

interface Params {
  projectId: number;
  mergeRequestId: number;
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

  await retry(
    async () => {
      const options: AcceptMergeRequestOptions = isNewApi
        ? { autoMerge: true }
        : { mergeWhenPipelineSucceeds: true };
      await gitlabClient.MergeRequests.merge(
        projectId,
        mergeRequestId,
        options
      );
    },
    {
      behavior: {
        type: 'exponentialDelayed',
        maxCount: 3,
        initial: 0.5,
        multiplier: 1,
      },
    }
  );
}
