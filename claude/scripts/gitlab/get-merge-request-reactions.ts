/**
 * 查看 Merge Request 的 emoji reaction 列表
 *
 */

import { AwardEmojiSchema } from '@gitbeaker/rest';
import { gitlabClient } from '@/gitlab/gitlab-client';

interface Params {
  projectId: number;
  mrIid: number;
}

export async function getMergeRequestReactions(
  params: Params
): Promise<AwardEmojiSchema[]> {
  try {
    const { projectId, mrIid } = params;
    const reactions = await gitlabClient.MergeRequestAwardEmojis.all(
      projectId,
      mrIid
    );
    return reactions;
  } catch {
    return [];
  }
}
