/**
 * GitHub Pull Request 查询工具模块
 *
 * 功能：获取所有打开的 Pull Request
 */

import { getOwner } from '@cwkit/shared/git/get-owner';
import { getRepo } from '@cwkit/shared/git/get-repo';
import { githubClient } from './github-client';

/**
 * 获取所有打开的 Pull Request
 * @returns Pull Request 列表
 */
export async function getPullRequests() {
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
