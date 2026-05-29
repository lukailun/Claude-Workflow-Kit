/**
 * 获取远程分支列表
 */

import { getOwner } from '@/github';
import { getRepo } from '@/github';
import { githubClient } from '@/github';

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

export { getRemoteBranches };
