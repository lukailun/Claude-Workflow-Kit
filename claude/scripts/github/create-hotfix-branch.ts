/**
 * 创建 hotfix 分支
 *
 */

import mainBranch from '@/git/main-branch';
import createBranch from '@/github/create-branch';

export async function createHotfixBranch(segment: string) {
  const branchName = `hotfix/${segment}`;
  await createBranch(mainBranch.fullName, branchName);
}
