/**
 * 创建 experimental 分支
 *
 */

import { mainBranch } from '@lukailun/dev-kit/git/main-branch';
import { createBranch } from '@/create-branch';

export async function createExperimentalBranch(name: string) {
  const branchName = `experimental/${name}`;
  await createBranch(mainBranch.fullName, branchName);
}
