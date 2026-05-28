/**
 * GitHub 仓库分支对比工具
 *
 * 功能：对比指定项目中两个分支之间的差异
 */

import githubClient from './github-client';
import getOwner from './get-owner';
import getRepo from './get-repo';

interface Params {
  sourceBranch: string;
  targetBranch: string;
}

/**
 * 对比两个分支的差异
 * @returns 分支对比结果
 */
async function getRepositoryCompare(params: Params) {
  const { sourceBranch, targetBranch } = params;
  const owner = await getOwner();
  const repo = await getRepo();
  if (!owner || !repo) {
    throw new Error('无法获取仓库信息');
  }

  const { data: compare } = await githubClient.repos.compareCommits({
    owner,
    repo,
    base: targetBranch,
    head: sourceBranch,
  });
  return compare;
}

export default getRepositoryCompare;
