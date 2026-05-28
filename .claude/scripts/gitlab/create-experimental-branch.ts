/**
 * 创建 experimental 分支
 *
 */

import createBranch from './create-branch';
import mainBranch from '../git/main-branch';

export async function createExperimentalBranch(name: string) {
  const branchName = `experimental/${name}`;
  await createBranch(mainBranch.fullName, branchName);
}
