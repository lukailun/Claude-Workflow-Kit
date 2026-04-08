/**
 * GitLab 目标分支查询工具
 *
 * 功能：根据当前分支自动确定目标分支
 * - 如果当前是 release 或 hotfix 分支，目标分支为 main
 * - 如果当前不是 release/hotfix 分支，目标分支为最新的 release 分支
 */

import { $ } from 'bun';
import getCurrentBranch from './get-current-branch';
import mainBranch from './main-branch';

interface Branch {
  full: string;
  name: string;
  major: number;
  minor: number;
  patch: number;
}

/**
 * 获取 MR 目标分支
 * @returns 目标分支名称
 */
async function getMergeRequestTargetBranch(): Promise<string> {
  const currentBranch = await getCurrentBranch();
  if (!currentBranch) {
    return mainBranch;
  }

  const isReleaseBranch = /^release\/\d+\.\d+\.\d+$/.test(currentBranch);
  const isHotfixBranch = /^hotfix\/\d+\.\d+\.\d+$/.test(currentBranch);

  if (isReleaseBranch || isHotfixBranch) {
    return mainBranch;
  }

  const remoteBranches = (await $`git branch -r`.text())
    .split('\n')
    .map((b) => b.trim())
    .filter((branch) => /^origin\/release\/\d+\.\d+\.\d+$/.test(branch));

  if (remoteBranches.length === 0) {
    return mainBranch;
  }

  const branches = remoteBranches
    .map((branch) => {
      const match = branch.match(/^origin\/release\/(\d+)\.(\d+)\.(\d+)$/);
      if (!match) return null;
      return {
        full: branch,
        name: branch.replace('origin/', ''),
        major: parseInt(match[1]),
        minor: parseInt(match[2]),
        patch: parseInt(match[3]),
      } as Branch;
    })
    .filter((b): b is Branch => b !== null);

  const targetBranch = branches.sort((a, b) => {
    if (a.major !== b.major) return b.major - a.major;
    if (a.minor !== b.minor) return b.minor - a.minor;
    return b.patch - a.patch;
  })[0];

  if (!targetBranch) {
    return mainBranch;
  }
  return targetBranch.name;
}

export default getMergeRequestTargetBranch;
