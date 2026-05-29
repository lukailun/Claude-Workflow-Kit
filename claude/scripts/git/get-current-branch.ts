/**
 * 获取当前 Git 分支
 */

import { $ } from 'bun';

/**
 * 获取当前 git 分支
 * @returns 当前分支名称
 */
async function getCurrentBranch(): Promise<string> {
  const branch = await $`git branch --show-current`.text();
  return branch.trim();
}

export { getCurrentBranch };
