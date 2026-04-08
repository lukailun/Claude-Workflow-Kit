/**
 * 获取最新的远程 release 分支
 *
 * 功能：扫描远程分支，返回版本号最大的 release/x.y.z 分支
 */

import getRemoteBranches from './get-remote-branches';

interface ReleaseBranch {
  name: string;
  major: number;
  minor: number;
  patch: number;
}

/**
 * 获取最新的远程 release 分支
 * @returns 最新 release 分支名称（不含 origin/ 前缀），无则返回 null
 */
async function getLatestReleaseBranch(): Promise<string | null> {
  const remoteBranches = await getRemoteBranches();

  const branches = remoteBranches
    .map((branch) => {
      const match = branch.match(/^origin\/release\/(\d+)\.(\d+)\.(\d+)$/);
      if (!match) return null;
      return {
        name: branch.replace('origin/', ''),
        major: parseInt(match[1]),
        minor: parseInt(match[2]),
        patch: parseInt(match[3]),
      } as ReleaseBranch;
    })
    .filter((b): b is ReleaseBranch => b !== null)
    .sort((a, b) => {
      if (a.major !== b.major) return b.major - a.major;
      if (a.minor !== b.minor) return b.minor - a.minor;
      return b.patch - a.patch;
    });

  return branches[0]?.name ?? null;
}

export default getLatestReleaseBranch;
