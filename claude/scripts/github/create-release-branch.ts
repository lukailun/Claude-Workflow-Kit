/**
 * 创建 release 分支
 *
 */

import mainBranch from '@/git/main-branch';
import createBranch from '@/github/create-branch';

export async function createReleaseBranch(segment: string) {
  const branchName = `release/${segment}`;
  await createBranch(mainBranch.fullName, branchName);
}
