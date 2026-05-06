/**
 * 创建 release 分支
 *
 */

import createBranch from './create-branch';
import mainBranch from '../git/main-branch';

export async function createReleaseBranch(segment: string) {
  const branchName = `release/${segment}`;
  await createBranch(mainBranch.fullName, branchName);
}
