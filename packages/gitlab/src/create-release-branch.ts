/**
 * 创建 release 分支
 *
 */

import { mainBranch } from '@lukailun/dev-kit/git/main-branch';
import { createBranch } from '@/create-branch';

export async function createReleaseBranch(segment: string) {
  const branchName = `release/${segment}`;
  await createBranch(mainBranch.fullName, branchName);
}
