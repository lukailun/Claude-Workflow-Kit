/**
 * GitHub Pull Request 查询工具模块
 *
 * 功能：获取所有打开的 Pull Request
 */

import githubClient from './github-client';
import getOwnerAndRepo from './get-owner-and-repo';

/**
 * 获取所有打开的 Pull Request
 * @returns Pull Request 列表
 */
async function getPullRequests() {
  const repoInfo = await getOwnerAndRepo();
  if (!repoInfo) return [];

  const { data: pullRequests } = await githubClient.pulls.list({
    ...repoInfo,
    state: 'open',
  });
  return pullRequests;
}

export default getPullRequests;
