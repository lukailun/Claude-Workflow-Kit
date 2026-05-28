/**
 * 获取最新的 tag
 *
 * 功能：获取项目 tag，返回版本号最大的 vx.x.x tag
 */

import githubClient from './github-client';
import getOwnerAndRepo from './get-owner-and-repo';

interface Tag {
  name: string;
  major: number;
  minor: number;
  patch: number;
}

/**
 * 获取最新的 tag
 * @returns 最新 tag，无则返回 null
 */
async function getLatestTag(): Promise<Tag | null> {
  const repoInfo = await getOwnerAndRepo();
  if (!repoInfo) return null;

  const tags = await githubClient.paginate(githubClient.repos.listTags, {
    ...repoInfo,
    per_page: 100,
  });

  const parsed = tags
    .map((tag) => {
      const match = tag.name.match(/^v(\d+)\.(\d+)\.(\d+)$/);
      if (!match) return null;
      return {
        name: tag.name,
        major: parseInt(match[1], 10),
        minor: parseInt(match[2], 10),
        patch: parseInt(match[3], 10),
      } satisfies Tag;
    })
    .filter((t) => t !== null)
    .sort((a, b) => {
      if (a.major !== b.major) return b.major - a.major;
      if (a.minor !== b.minor) return b.minor - a.minor;
      return b.patch - a.patch;
    });

  return parsed[0] ?? null;
}

export default getLatestTag;
