/**
 * 创建 hotfix 分支
 *
 */

import createBranch from './create-branch';
import mainBranch from './main-branch';

export async function createHotfixBranch(version: string) {
  const branchName = `hotfix/${version}`;
  await createBranch(mainBranch, branchName);
}
