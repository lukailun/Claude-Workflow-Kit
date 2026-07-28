/**
 * 创建 experimental 分支
 *
 */

import { mainBranch } from '@cwkit/shared/git/main-branch';
import { createBranch } from './create-branch';

export async function createExperimentalBranch(name: string) {
  const branchName = `experimental/${name}`;
  await createBranch(mainBranch.fullName, branchName);
}
