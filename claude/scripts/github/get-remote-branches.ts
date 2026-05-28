/**
 * 获取远程分支列表
 */

import githubClient from './github-client';
import getOwner from './get-owner';
import getRepo from './get-repo';

/**
 * 获取远程所有分支列表
 * @returns 远程分支名称数组
 */
async function getRemoteBranches(): Promise<string[]> {
  const owner = await getOwner();
  const repo = await getRepo();
  if (!owner || !repo) return [];

  const branches = await githubClient.paginate(githubClient.repos.listBranches, {
    owner,
    repo,
    per_page: 100,
  });
  return branches.map((b) => b.name);
}

export default getRemoteBranches;
