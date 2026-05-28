/**
 * 从当前 Git 仓库获取 GitHub owner 和 repo
 *
 * 通过解析 Git remote URL 提取 owner/repo
 */

import { $ } from 'bun';

interface OwnerAndRepo {
  owner: string;
  repo: string;
}

/**
 * 获取当前 git 项目的 GitHub owner 和 repo
 * @returns owner 和 repo，如果失败返回 undefined
 */
async function getOwnerAndRepo(): Promise<OwnerAndRepo | undefined> {
  const remoteUrl = await $`git remote get-url origin`.text();
  const match = remoteUrl
    .trim()
    .match(/(?:git@[^:]+:|https?:\/\/[^/]+\/)(.+?)\/(.+?)(?:\.git)?$/);
  if (!match) {
    return undefined;
  }
  return { owner: match[1], repo: match[2] };
}

export default getOwnerAndRepo;
