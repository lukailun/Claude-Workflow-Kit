/**
 * Linear 用户查询工具模块
 *
 */

import { User } from '@linear/sdk';
import { linearClient } from '@/linear-client';

/**
 * 获取 Linear 所有用户
 * @returns 用户列表
 */
async function getLinearUsers(): Promise<User[]> {
  const usersConnection = await linearClient.users();
  return usersConnection.nodes;
}

export { getLinearUsers };
