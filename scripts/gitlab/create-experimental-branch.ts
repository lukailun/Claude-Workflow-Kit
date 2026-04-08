/**
 * 创建 experimental 分支
 *
 */

import createBranch from './create-branch';
import mainBranch from './main-branch';

export async function createExperimentalBranch(name: string) {
  const branchName = `experimental/${name}`;
  await createBranch(mainBranch, branchName);

  console.log(`🎯 目标: 验证通过后可合并到 release，或直接废弃`);
}
