/**
 * 创建 release 分支
 *
 */

import { mainBranch } from '@/git';
import { createBranch } from '@/github';

export async function createReleaseBranch(segment: string) {
  const branchName = `release/${segment}`;
  await createBranch(mainBranch.fullName, branchName);
}
