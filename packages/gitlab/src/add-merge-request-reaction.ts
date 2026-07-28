/**
 * 给 Merge Request 添加 emoji reaction
 *
 */

import { AwardEmojiSchema } from '@gitbeaker/rest';
import { gitlabClient } from '@/gitlab-client';

interface Params {
  projectId: number;
  mrIid: number;
  name: string;
}

export async function addMergeRequestReaction(
  params: Params
): Promise<AwardEmojiSchema | undefined> {
  const { projectId, mrIid, name } = params;
  try {
    const emoji = await gitlabClient.MergeRequestAwardEmojis.award(
      projectId,
      mrIid,
      name
    );
    return emoji;
  } catch {
    return undefined;
  }
}
