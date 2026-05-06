/**
 * 获取所有 Linear 项目
 */

import { Project } from '@linear/sdk';
import linearClient from './linear-client';

/**
 * 获取所有 Linear 项目
 * @returns 项目列表
 */
async function getLinearProjects(): Promise<Project[]> {
  const projects = await linearClient.projects();
  return projects.nodes;
}

export default getLinearProjects;
