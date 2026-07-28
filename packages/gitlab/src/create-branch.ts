/**
 * 通用分支创建方法
 *
 * 从指定源分支 checkout 并 pull，然后通过 GitLab API 创建并推送新分支。
 *
 * @param sourceBranch - 源分支名称
 * @param newBranch    - 要创建的新分支名称
 */

import { $ } from 'bun';
import { getCurrentBranch } from '@lukailun/dev-kit/git/get-current-branch';
import { getCurrentProjectId } from '@/get-current-project-id';
import { gitlabClient } from '@/gitlab-client';

export async function createBranch(sourceBranch: string, newBranch: string) {
  console.log(`📍 基于 ${sourceBranch} 分支`);

  const currentBranch = await getCurrentBranch();
  if (currentBranch !== sourceBranch) {
    console.log(`🔄 切换到 ${sourceBranch}...`);
    await $`git checkout ${sourceBranch}`.quiet();
  }
  await $`git pull origin ${sourceBranch}`.quiet();

  const projectId = await getCurrentProjectId();
  if (!projectId) {
    console.error('❌ 无法获取项目 ID');
    process.exit(1);
  }

  console.log(`🌿 创建分支: ${newBranch}`);
  await gitlabClient.Branches.create(projectId, newBranch, sourceBranch);

  // checkout 到新分支并设置上游追踪
  await $`git fetch origin`.quiet();
  await $`git checkout ${newBranch}`.quiet();

  console.log(`\n✅ 分支创建成功！`);
  console.log(`📌 分支: ${newBranch}`);
}
