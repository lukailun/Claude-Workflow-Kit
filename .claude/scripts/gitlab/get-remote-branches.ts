/**
 * 获取远程分支列表
 */

import gitlabClient from './gitlab-client';
import getCurrentProjectId from './get-current-project-id';

/**
 * 获取远程所有分支列表
 * @returns 远程分支名称数组
 */
async function getRemoteBranches(): Promise<string[]> {
  const projectId = await getCurrentProjectId();
  if (!projectId) return [];

  const branches = await gitlabClient.Branches.all(projectId);
  return branches.map((b) => b.name);
}

export default getRemoteBranches;
