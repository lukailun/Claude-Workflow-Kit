/**
 * 获取 GitLab 版本号
 */

import gitlabFromEnv from '../env/gitlab-from-env';

interface GitLabVersion {
  version: string | undefined;
  revision: string | undefined;
}

/**
 * 解析版本号字符串，返回 [major, minor, patch]
 * 支持格式如 "16.11.2-ee", "17.0.0"
 */
function parseVersion(versionStr: string): [number, number, number] {
  const match = versionStr.match(/(\d+)\.(\d+)\.(\d+)/);
  if (!match) {
    throw new Error(`无法解析版本号: ${versionStr}`);
  }
  return [
    parseInt(match[1], 10),
    parseInt(match[2], 10),
    parseInt(match[3], 10),
  ];
}

/**
 * 比较两个版本号
 * @returns >0 if v1 > v2, 0 if equal, <0 if v1 < v2
 */
export function compareVersion(v1: string, v2: string): number {
  const [major1, minor1, patch1] = parseVersion(v1);
  const [major2, minor2, patch2] = parseVersion(v2);

  if (major1 !== major2) return major1 - major2;
  if (minor1 !== minor2) return minor1 - minor2;
  return patch1 - patch2;
}

/**
 * 获取 GitLab 实例版本信息
 */
async function getVersion(): Promise<GitLabVersion> {
  const response = await fetch(`${gitlabFromEnv.host}/api/v4/version`, {
    headers: {
      'PRIVATE-TOKEN': gitlabFromEnv.token,
    },
  });

  if (!response.ok) {
    throw new Error(
      `获取 GitLab 版本失败: ${response.status} ${response.statusText}`
    );
  }

  return response.json() as Promise<GitLabVersion>;
}

export default getVersion;
