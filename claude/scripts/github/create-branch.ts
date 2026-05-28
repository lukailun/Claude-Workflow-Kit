/**
 * 通用分支创建方法
 *
 * 从指定源分支 checkout 并 pull，然后通过 GitHub API 创建并推送新分支。
 *
 * @param sourceBranch - 源分支名称
 * @param newBranch    - 要创建的新分支名称
 */

import { $ } from 'bun';
import githubClient from './github-client';
import getOwnerAndRepo from './get-owner-and-repo';
import getCurrentBranch from '../git/get-current-branch';

async function createBranch(sourceBranch: string, newBranch: string) {
  console.log(`📍 基于 ${sourceBranch} 分支`);

  const currentBranch = await getCurrentBranch();
  if (currentBranch !== sourceBranch) {
    console.log(`🔄 切换到 ${sourceBranch}...`);
    await $`git checkout ${sourceBranch}`.quiet();
  }
  await $`git pull origin ${sourceBranch}`.quiet();

  const repoInfo = await getOwnerAndRepo();
  if (!repoInfo) {
    console.error('❌ 无法获取仓库信息');
    process.exit(1);
  }

  // 获取源分支的 SHA
  const { data: ref } = await githubClient.git.getRef({
    ...repoInfo,
    ref: `heads/${sourceBranch}`,
  });

  console.log(`🌿 创建分支: ${newBranch}`);
  await githubClient.git.createRef({
    ...repoInfo,
    ref: `refs/heads/${newBranch}`,
    sha: ref.object.sha,
  });

  // checkout 到新分支并设置上游追踪
  await $`git fetch origin`.quiet();
  await $`git checkout ${newBranch}`.quiet();

  console.log(`\n✅ 分支创建成功！`);
  console.log(`📌 分支: ${newBranch}`);
}

export default createBranch;
