/**
 * 创建 release 分支
 *
 */

import createBranch from './create-branch';
import mainBranch from './main-branch';

export async function createReleaseBranch(version: string) {
  const branchName = `release/${version}`;
  await createBranch(mainBranch, branchName);
}
