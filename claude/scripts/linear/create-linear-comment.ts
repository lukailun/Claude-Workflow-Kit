/**
 * 给 Linear Issue 添加评论
 */

import { Comment } from '@linear/sdk';
import { linearClient } from '@/linear/linear-client';

/**
 * 给指定 issue 添加评论
 * @param issueId Issue 的 identifier（如 '4T-9192'）
 * @param body 评论内容（支持 Markdown）
 */
async function createLinearComment(
  issueId: string,
  body: string
): Promise<Comment | undefined> {
  const payload = await linearClient.createComment({
    issueId,
    body,
  });
  const comment = await payload.comment;
  return comment;
}

export { createLinearComment };
