/**
 * GitHub 仓库分支对比工具
 *
 * 功能：对比指定项目中两个分支之间的差异
 */

import githubClient from './github-client';
import getOwnerAndRepo from './get-owner-and-repo';

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
  const repoInfo = await getOwnerAndRepo();
  if (!repoInfo) {
    throw new Error('无法获取仓库信息');
  }

  const { data: compare } = await githubClient.repos.compareCommits({
    ...repoInfo,
    base: targetBranch,
    head: sourceBranch,
  });
  return compare;
}

export default getRepositoryCompare;
