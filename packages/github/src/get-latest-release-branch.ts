/**
 * 获取最新的远程 release 分支
 *
 * 功能：扫描远程分支，返回版本号最大的 release/x.y.z 分支
 */

import { ReleaseBranch } from '@cwkit/shared/git/branch';
import { getRemoteBranches } from './get-remote-branches';

/**
 * 获取最新的远程 release 分支
 * @returns 最新 release 分支，无则返回 null
 */
export async function getLatestReleaseBranch(): Promise<ReleaseBranch | null> {
  const remoteBranches = await getRemoteBranches();

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
    .filter((b) => b !== null)
    .sort((a, b) => {
      if (a.major !== b.major) return b.major - a.major;
      if (a.minor !== b.minor) return b.minor - a.minor;
      return b.patch - a.patch;
    });

  return branches[0] ?? null;
}
