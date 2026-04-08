/**
 * 获取远程分支列表
 */

import { $ } from 'bun';

/**
 * 获取远程所有分支列表
 * @returns 远程分支名称数组（不含 origin/HEAD 指向）
 */
async function getRemoteBranches(): Promise<string[]> {
  const output = await $`git branch -r`.text();
  return output
    .split('\n')
    .map((b) => b.trim())
    .filter((b) => b.length > 0 && !b.includes('HEAD'));
}

export default getRemoteBranches;
