/**
 * 创建 hotfix 分支
 *
 */

import { mainBranch } from '@/git';
import { createBranch } from '@/github';

export async function createHotfixBranch(segment: string) {
  const branchName = `hotfix/${segment}`;
  await createBranch(mainBranch.fullName, branchName);
}
