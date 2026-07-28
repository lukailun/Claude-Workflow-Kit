/**
 * 删除 Merge Request 的某个 emoji reaction
 *
 */

import { gitlabClient } from './gitlab-client';

interface Params {
  projectId: number;
  mrIid: number;
  awardId: number;
}

export async function removeMergeRequestReaction(
  params: Params
): Promise<void> {
  const { projectId, mrIid, awardId } = params;
  try {
    return await gitlabClient.MergeRequestAwardEmojis.remove(
      projectId,
      mrIid,
      awardId
    );
  } catch {
    return;
  }
}
