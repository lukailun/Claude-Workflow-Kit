import { addMergeRequestReaction } from '@cwkit/gitlab/add-merge-request-reaction';
import { getCurrentUser } from '@cwkit/gitlab/get-current-user';
import { getMergeRequestReactions } from '@cwkit/gitlab/get-merge-request-reactions';
import { removeMergeRequestReaction } from '@cwkit/gitlab/remove-merge-request-reaction';
import { ReactionType } from './types';

interface Params {
  projectId: number;
  mrIid: number;
}

export async function addReaction(params: Params, emoji: ReactionType) {
  try {
    const existedEmoji = await getExistedEmoji(params, emoji);
    if (existedEmoji) {
      return existedEmoji;
    }
    return await addMergeRequestReaction({ ...params, name: emoji });
  } catch {
    return undefined;
  }
}

export async function removeReaction(params: Params, emoji: ReactionType) {
  try {
    const existedEmoji = await getExistedEmoji(params, emoji);
    if (!existedEmoji) {
      return;
    }
    return await removeMergeRequestReaction({
      ...params,
      awardId: existedEmoji.id,
    });
  } catch {
    return undefined;
  }
}

async function getExistedEmoji(params: Params, emoji: ReactionType) {
  try {
    const user = await getCurrentUser();
    const emojis = await getMergeRequestReactions(params);
    const existedEmoji = emojis.find(
      (e) => e.name === emoji && e.user.id === user?.id
    );
    return existedEmoji;
  } catch {
    return;
  }
}
