/**
 * 从当前 Git 仓库获取 GitLab 项目数字 ID
 *
 * 通过解析 Git remote URL 提取项目路径，然后调用 GitLab API 获取项目的数字 ID
 */

import { $ } from 'bun';
import getProjectDetails from './get-project-details';

/**
 * 获取当前 git 项目的 GitLab 数字 ID
 * @returns 项目数字 ID，如果失败返回 undefined
 */
async function getCurrentProjectId(): Promise<number | undefined> {
  const remoteUrl = await $`git remote get-url origin`.text();
  const match = remoteUrl
    .trim()
    .match(/(?:git@[^:]+:|https?:\/\/[^/]+\/)(.+?)(?:\.git)?$/);
  if (!match) {
    return undefined;
  }
  const pathWithNamespace = match[1];
  const project = await getProjectDetails({
    projectPathWithNamespace: pathWithNamespace,
  });
  return project?.id;
}

export default getCurrentProjectId;
