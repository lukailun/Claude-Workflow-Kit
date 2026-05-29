/**
 * GitHub Pull Request 查询工具模块
 *
 * 功能：获取所有打开的 Pull Request
 */

import { getOwner } from '@/github';
import { getRepo } from '@/github';
import { githubClient } from '@/github';

/**
 * 获取所有打开的 Pull Request
 * @returns Pull Request 列表
 */
async function getPullRequests() {
  const owner = await getOwner();
  const repo = await getRepo();
  if (!owner || !repo) return [];

  const { data: pullRequests } = await githubClient.pulls.list({
    owner,
    repo,
    state: 'open',
  });
  return pullRequests;
}

export { getPullRequests };
