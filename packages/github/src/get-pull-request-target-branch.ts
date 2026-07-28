/**
 * GitHub 目标分支查询工具
 *
 * 功能：根据当前分支自动确定目标分支
 * - 如果当前是 release 或 hotfix 分支，目标分支为 main
 * - 如果当前不是 release/hotfix 分支，目标分支为最新的 release 分支
 */

import { Branch, ReleaseBranch } from '@cwkit/shared/git/branch';
import { getCurrentBranch } from '@cwkit/shared/git/get-current-branch';
import { mainBranch } from '@cwkit/shared/git/main-branch';
import { getRemoteBranches } from './get-remote-branches';

/**
 * 获取 PR 目标分支
 * @returns 目标分支名称
 */
export async function getPullRequestTargetBranch(): Promise<Branch> {
  const currentBranch = await getCurrentBranch();
  if (!currentBranch) {
    return mainBranch;
  }

  const isReleaseBranch = /^release\/\d+\.\d+\.\d+$/.test(currentBranch);
  const isHotfixBranch = /^hotfix\/\d+\.\d+\.\d+$/.test(currentBranch);

  if (isReleaseBranch || isHotfixBranch) {
    return mainBranch;
  }

  const remoteBranches = (await getRemoteBranches()).filter((branch) =>
    /^release\/\d+\.\d+\.\d+$/.test(branch)
  );

  if (remoteBranches.length === 0) {
    return mainBranch;
  }

  const branches = remoteBranches
    .map((branch) => {
      const match = branch.match(/^release\/(\d+)\.(\d+)\.(\d+)$/);
      if (!match) return null;
      return {
        type: 'release',
        fullName: branch,
        segment: `${match[1]}.${match[2]}.${match[3]}`,
        major: parseInt(match[1], 10),
        minor: parseInt(match[2], 10),
        patch: parseInt(match[3], 10),
      } satisfies ReleaseBranch;
    })
    .filter((b) => b !== null);

  const targetBranch = branches.sort((a, b) => {
    if (a.major !== b.major) return b.major - a.major;
    if (a.minor !== b.minor) return b.minor - a.minor;
    return b.patch - a.patch;
  })[0];

  if (!targetBranch) {
    return mainBranch;
  }
  return targetBranch;
}
