/**
 * Linear 用户选择工具模块
 *
 */

import { User } from '@linear/sdk';
import { linearClient } from '@/linear-client';

/**
 * 获取 Linear 用户
 * @returns 匹配的用户
 */
async function getLinearUser(): Promise<User> {
  const me = await linearClient.viewer;
  return me;
}

export { getLinearUser };
