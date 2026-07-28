/**
 * 通用分支创建方法
 *
 * 从指定源分支 checkout 并 pull，然后通过 GitHub API 创建并推送新分支。
 *
 * @param sourceBranch - 源分支名称
 * @param newBranch    - 要创建的新分支名称
 */

import { sh } from '@cwkit/shared/utils/sh';
import { getCurrentBranch } from '@cwkit/shared/git/get-current-branch';
import { getOwner } from '@cwkit/shared/git/get-owner';
import { getRepo } from '@cwkit/shared/git/get-repo';
import { githubClient } from './github-client';

export async function createBranch(sourceBranch: string, newBranch: string) {
  console.log(`📍 基于 ${sourceBranch} 分支`);

  const currentBranch = await getCurrentBranch();
  if (currentBranch !== sourceBranch) {
    console.log(`🔄 切换到 ${sourceBranch}...`);
    await sh`git checkout ${sourceBranch}`.quiet();
  }
  await sh`git pull origin ${sourceBranch}`.quiet();

  const owner = await getOwner();
  const repo = await getRepo();
  if (!owner || !repo) {
    console.error('❌ 无法获取仓库信息');
    process.exit(1);
  }

  // 获取源分支的 SHA
  const { data: ref } = await githubClient.git.getRef({
    owner,
    repo,
    ref: `heads/${sourceBranch}`,
  });

  console.log(`🌿 创建分支: ${newBranch}`);
  await githubClient.git.createRef({
    owner,
    repo,
    ref: `refs/heads/${newBranch}`,
    sha: ref.object.sha,
  });

  // checkout 到新分支并设置上游追踪
  await sh`git fetch origin`.quiet();
  await sh`git checkout ${newBranch}`.quiet();

  console.log(`\n✅ 分支创建成功！`);
  console.log(`📌 分支: ${newBranch}`);
}
