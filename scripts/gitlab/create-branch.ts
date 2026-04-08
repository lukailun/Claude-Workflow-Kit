/**
 * 通用分支创建方法
 *
 * 从指定源分支 checkout 并 pull，然后创建并推送新分支。
 *
 * @param sourceBranch - 源分支名称
 * @param newBranch    - 要创建的新分支名称
 */

import { $ } from 'bun';
import getCurrentBranch from './get-current-branch';

async function createBranch(sourceBranch: string, newBranch: string) {
  console.log(`📍 基于 ${sourceBranch} 分支`);

  const currentBranch = await getCurrentBranch();
  if (currentBranch !== sourceBranch) {
    console.log(`🔄 切换到 ${sourceBranch}...`);
    await $`git checkout ${sourceBranch}`.quiet();
  }
  await $`git pull origin ${sourceBranch}`.quiet();

  console.log(`🌿 创建分支: ${newBranch}`);
  await $`git checkout -b ${newBranch}`.quiet();
  await $`git push -u origin ${newBranch}`.quiet();

  console.log(`\n✅ 分支创建成功！`);
  console.log(`📌 分支: ${newBranch}`);
}

export default createBranch;
