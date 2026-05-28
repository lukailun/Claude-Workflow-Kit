/**
 * 从当前 Git 仓库获取 GitHub repo 名称
 */

import { $ } from 'bun';

/**
 * 获取当前 git 项目的 GitHub repo 名称
 * @returns repo 名称（如 "claude-code"），如果失败返回 undefined
 */
async function getRepo(): Promise<string | undefined> {
  const remoteUrl = await $`git remote get-url origin`.text();
  const match = remoteUrl
    .trim()
    .match(/(?:git@[^:]+:|https?:\/\/[^/]+\/)(?:.+?\/)(.+?)(?:\.git)?$/);
  if (!match) {
    return undefined;
  }
  return match[1];
}

export default getRepo;
