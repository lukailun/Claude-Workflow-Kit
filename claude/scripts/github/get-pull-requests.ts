/**
 * GitHub Pull Request 查询工具模块
 *
 * 功能：获取所有打开的 Pull Request
 */

import githubClient from './github-client';
import getOwner from './get-owner';
import getRepo from './get-repo';

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

export default getPullRequests;
