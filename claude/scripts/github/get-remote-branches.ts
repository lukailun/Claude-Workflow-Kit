/**
 * 获取远程分支列表
 */

import githubClient from './github-client';
import getOwnerAndRepo from './get-owner-and-repo';

/**
 * 获取远程所有分支列表
 * @returns 远程分支名称数组
 */
async function getRemoteBranches(): Promise<string[]> {
  const repoInfo = await getOwnerAndRepo();
  if (!repoInfo) return [];

  const branches = await githubClient.paginate(githubClient.repos.listBranches, {
    ...repoInfo,
    per_page: 100,
  });
  return branches.map((b) => b.name);
}

export default getRemoteBranches;
