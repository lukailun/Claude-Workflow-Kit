/**
 * 创建 hotfix 分支
 *
 */

import { mainBranch } from '@cwkit/shared/git/main-branch';
import { createBranch } from './create-branch';

export async function createHotfixBranch(segment: string) {
  const branchName = `hotfix/${segment}`;
  await createBranch(mainBranch.fullName, branchName);
}
