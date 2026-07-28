/**
 * 发布 MR 代码审查评论（总结评论 + 行内评论）
 */

import { gitlabClient } from '@/gitlab-client';

interface InlineComment {
  filePath: string;
  lineNumber: number;
  body: string;
}

interface PostReviewCommentsParams {
  projectId: number;
  mrIid: number;
  /** diff base SHA，用于行内评论定位 */
  baseSha: string;
  /** head SHA，用于行内评论定位 */
  headSha: string;
  /** 总结评论内容 */
  summaryBody: string;
  /** 行内评论列表 */
  comments: InlineComment[];
  /** 评论间隔（ms），避免触发 API 限流，默认 1000 */
  intervalMs?: number;
}

/**
 * 发布审查总结评论
 */
export async function postMrSummaryComment(
  projectId: number,
  mrIid: number,
  body: string
): Promise<void> {
  try {
    await gitlabClient.MergeRequestNotes.create(projectId, mrIid, body);
  } catch {
    // 总结评论失败不阻塞流程
  }
}

/**
 * 发布单条行内评论
 */
export async function postMrInlineComment(
  projectId: number,
  mrIid: number,
  baseSha: string,
  headSha: string,
  filePath: string,
  lineNumber: number,
  body: string
): Promise<void> {
  try {
    await gitlabClient.MergeRequestDiscussions.create(projectId, mrIid, body, {
      position: {
        baseSha,
        startSha: baseSha,
        headSha,
        positionType: 'text',
        newPath: filePath,
        newLine: String(lineNumber),
      },
    });
    console.log(`  ✓ 评论已发布：${filePath}:${lineNumber}`);
  } catch {
    console.error(`  ✗ 评论发布失败：${filePath}:${lineNumber}`);
  }
}

/**
 * 批量发布审查评论：先发总结，再逐条发行内评论
 */
export async function postMrReviewComments(
  params: PostReviewCommentsParams
): Promise<void> {
  const {
    projectId,
    mrIid,
    baseSha,
    headSha,
    summaryBody,
    comments,
    intervalMs = 1000,
  } = params;

  // 发总结评论
  await postMrSummaryComment(projectId, mrIid, summaryBody);

  // 逐条发行内评论
  for (const comment of comments) {
    await postMrInlineComment(
      projectId,
      mrIid,
      baseSha,
      headSha,
      comment.filePath,
      comment.lineNumber,
      comment.body
    );

    if (intervalMs > 0) {
      await sleep(intervalMs);
    }
  }
}

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}
