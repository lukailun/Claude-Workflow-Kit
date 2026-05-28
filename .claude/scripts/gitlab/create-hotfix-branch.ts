/**
 * 创建 hotfix 分支
 *
 */

import createBranch from './create-branch';
import mainBranch from '../git/main-branch';

export async function createHotfixBranch(segment: string) {
  const branchName = `hotfix/${segment}`;
  await createBranch(mainBranch.fullName, branchName);
}
