/**
 * 获取当前 Git 分支
 */

import { sh } from '../utils/sh';

/**
 * 获取当前 git 分支
 * @returns 当前分支名称
 */
export async function getCurrentBranch(): Promise<string> {
  const branch = await sh`git branch --show-current`.text();
  return branch.trim();
}
