/**
 * 代码审查平台适配器接口
 *
 * 抽象 GitLab/GitHub 等平台的差异，使审查逻辑与平台无关。
 */

export interface ReviewPlatformParams {
  projectId: number;
  /** GitLab MR IID 或 GitHub PR number */
  mrIid: number;
}

export interface ReviewComment {
  filePath: string;
  lineNumber: number;
  body: string;
}

export type ReactionType = 'eyes' | 'thumbsup' | 'thumbsdown';

export interface ReviewPlatform {
  /** 获取 MR/PR diff 文本（含行号标注） */
  getDiffText(
    params: ReviewPlatformParams & { include?: string[]; exclude?: string[] }
  ): Promise<string>;

  /** 发布总结评论 + 行内审查评论 */
  postReviewComments(
    params: ReviewPlatformParams & {
      baseSha: string;
      headSha: string;
      summaryBody: string;
      comments: ReviewComment[];
    }
  ): Promise<void>;

  /** 添加 emoji reaction */
  addReaction(params: ReviewPlatformParams, emoji: ReactionType): Promise<void>;

  /** 移除 emoji reaction */
  removeReaction(
    params: ReviewPlatformParams,
    emoji: ReactionType
  ): Promise<void>;
}
