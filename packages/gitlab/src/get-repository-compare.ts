/**
 * GitLab 仓库分支对比工具
 *
 * 功能：对比指定项目中两个分支之间的差异
 */

import { RepositoryCompareSchema } from '@gitbeaker/rest';
import { gitlabClient } from '@/gitlab-client';

interface Params {
  projectId: number;
  sourceBranch: string;
  targetBranch: string;
}

/**
 * 对比两个分支的差异
 * @returns 分支对比结果
 */
export async function getRepositoryCompare(
  params: Params
): Promise<RepositoryCompareSchema> {
  const { projectId, sourceBranch, targetBranch } = params;
  const compare = (await gitlabClient.Repositories.compare(
    projectId,
    targetBranch,
    sourceBranch
  )) as any;
  return compare;
}
