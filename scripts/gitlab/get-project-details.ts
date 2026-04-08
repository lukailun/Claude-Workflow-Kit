/**
 * 获取当前 GitLab 项目详情
 */

import { ProjectSchema } from '@gitbeaker/rest';
import gitlabClient from './gitlab-client';

interface Params {
  projectId?: number;
  projectPathWithNamespace?: string;
}

/**
 * 获取当前项目的 GitLab 详细信息
 * @returns 项目详情，如果失败返回 undefined
 */
async function getProjectDetails(
  params: Params
): Promise<ProjectSchema | undefined> {
  const { projectId, projectPathWithNamespace } = params;
  if (projectId) {
    const project = await gitlabClient.Projects.show(projectId);
    return project;
  }
  if (projectPathWithNamespace) {
    const project = await gitlabClient.Projects.show(projectPathWithNamespace);
    return project;
  }
  return undefined;
}

export default getProjectDetails;
