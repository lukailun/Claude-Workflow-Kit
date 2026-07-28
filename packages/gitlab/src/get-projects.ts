/**
 * GitLab 项目列表查询工具
 *
 * 功能：获取当前用户可访问的所有 GitLab 项目
 */

import { ProjectSchema } from '@gitbeaker/rest';
import { gitlabClient } from './gitlab-client';

/**
 * 获取所有项目列表
 * @returns 项目列表
 */
export async function getProjects(): Promise<ProjectSchema[]> {
  const projects = await gitlabClient.Projects.all();
  return projects;
}
