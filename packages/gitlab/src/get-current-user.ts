/**
 * 获取当前 GitLab 用户信息
 */

import { ExpandedUserSchema } from '@gitbeaker/rest';
import { gitlabClient } from '@/gitlab-client';

let cachedUser: ExpandedUserSchema | undefined;

/**
 * 获取当前认证用户的 GitLab 信息（带缓存）
 *
 * 用户信息在会话中不会变化，首次调用后缓存结果，后续调用直接返回。
 * @returns 用户信息，如果失败返回 undefined
 */
export async function getCurrentUser(): Promise<
  ExpandedUserSchema | undefined
> {
  if (cachedUser) {
    return cachedUser;
  }
  try {
    const user = await gitlabClient.Users.showCurrentUser();
    cachedUser = user;
    return cachedUser;
  } catch {
    return undefined;
  }
}
