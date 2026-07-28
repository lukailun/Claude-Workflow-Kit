/**
 * GitLab 平台适配器
 *
 * 封装 GitLab API 调用，实现 ReviewPlatform 接口。
 */

import { addMergeRequestReaction } from '@cwkit/gitlab/add-merge-request-reaction';
import { getCurrentUser } from '@cwkit/gitlab/get-current-user';
import { getMergeRequestDiffText as gitlabGetDiffText } from '@cwkit/gitlab/get-merge-request-diff-text';
import { getMergeRequestReactions } from '@cwkit/gitlab/get-merge-request-reactions';
import { postMrReviewComments as gitlabPostComments } from '@cwkit/gitlab/post-mr-review-comments';
import { removeMergeRequestReaction } from '@cwkit/gitlab/remove-merge-request-reaction';
import type {
  ReviewPlatform,
  ReviewPlatformParams,
  ReactionType,
} from './types';

export class GitLabReviewPlatform implements ReviewPlatform {
  async getDiffText(
    params: ReviewPlatformParams & { include?: string[]; exclude?: string[] }
  ): Promise<string> {
    return gitlabGetDiffText({
      projectId: params.projectId,
      mrIid: params.mrIid,
      include: params.include,
      exclude: params.exclude,
    });
  }

  async postReviewComments(
    params: ReviewPlatformParams & {
      baseSha: string;
      headSha: string;
      summaryBody: string;
      comments: Array<{ filePath: string; lineNumber: number; body: string }>;
    }
  ): Promise<void> {
    await gitlabPostComments({
      projectId: params.projectId,
      mrIid: params.mrIid,
      baseSha: params.baseSha,
      headSha: params.headSha,
      summaryBody: params.summaryBody,
      comments: params.comments,
    });
  }

  async addReaction(
    params: ReviewPlatformParams,
    emoji: ReactionType
  ): Promise<void> {
    try {
      const existedEmoji = await this.getExistedEmoji(params, emoji);
      if (existedEmoji) return;
      await addMergeRequestReaction({ ...params, name: emoji });
    } catch {
      // ignore
    }
  }

  async removeReaction(
    params: ReviewPlatformParams,
    emoji: ReactionType
  ): Promise<void> {
    try {
      const existedEmoji = await this.getExistedEmoji(params, emoji);
      if (!existedEmoji) return;
      await removeMergeRequestReaction({
        ...params,
        awardId: existedEmoji.id,
      });
    } catch {
      // ignore
    }
  }

  private async getExistedEmoji(
    params: ReviewPlatformParams,
    emoji: ReactionType
  ) {
    try {
      const user = await getCurrentUser();
      const emojis = await getMergeRequestReactions(params);
      return emojis.find(
        (e) => e.name === emoji && e.user.id === user?.id
      );
    } catch {
      return undefined;
    }
  }
}
