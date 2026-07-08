/**
 * 从当前 Git 仓库获取 GitHub owner
 */

import { $ } from 'bun';

/**
 * 获取当前 git 项目的 GitHub owner
 * @returns owner，如果失败返回 undefined
 */
export async function getOwner(): Promise<string | undefined> {
  const remoteUrl = await $`git remote get-url origin`.text();
  const match = remoteUrl
    .trim()
    .match(/(?:git@[^:]+:|https?:\/\/[^/]+\/)(.+?)\//);
  if (!match) {
    return undefined;
  }
  return match[1];
}
