/**
 * 从当前 Git 仓库获取 GitHub owner
 */

import { sh } from '../utils/sh';

/**
 * 获取当前 git 项目的 GitHub owner
 * @returns owner，如果失败返回 undefined
 */
export async function getOwner(): Promise<string | undefined> {
  const remoteUrl = await sh`git remote get-url origin`.text();
  const match = remoteUrl
    .trim()
    .match(/(?:git@[^:]+:|https?:\/\/[^/]+\/)(.+?)\//);
  if (!match) {
    return undefined;
  }
  return match[1];
}
