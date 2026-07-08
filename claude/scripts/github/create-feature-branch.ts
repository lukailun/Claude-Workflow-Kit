/**
 * 创建 feature 分支
 *
 */

import { createBranch } from '@/github/create-branch';
import { getLatestReleaseBranch } from '@/github/get-latest-release-branch';

export async function createFeatureBranch(segment: string) {
  const releaseBranch = await getLatestReleaseBranch();
  if (!releaseBranch) {
    console.error('❌ 未找到远程 release 分支，请先创建 release 分支');
    process.exit(1);
  }

  const branchName = `feature/${segment}`;
  await createBranch(releaseBranch.fullName, branchName);
}
