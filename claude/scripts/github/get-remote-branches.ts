/**
 * 获取远程分支列表
 */
import { getOwner } from '@/git/get-owner';
import { getRepo } from '@/git/get-repo';
import {  githubClient } from '@/github/github-client';

/**
 * 获取远程所有分支列表
 * @returns 远程分支名称数组
 */
export async function getRemoteBranches(): Promise<string[]> {
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
