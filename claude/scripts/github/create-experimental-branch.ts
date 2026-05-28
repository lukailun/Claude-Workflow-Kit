/**
 * 创建 experimental 分支
 *
 */

import mainBranch from '@/git/main-branch';
import createBranch from '@/github/create-branch';

export async function createExperimentalBranch(name: string) {
  const branchName = `experimental/${name}`;
  await createBranch(mainBranch.fullName, branchName);
}
