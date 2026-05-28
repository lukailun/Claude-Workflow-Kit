/**
 * 开启 Pull Request 的自动合并
 *
 * 功能：PR 在 CI 通过后自动合并
 */

import githubClient from './github-client';
import getOwner from './get-owner';
import getRepo from './get-repo';

interface Params {
  pullNumber: number;
}

/**
 * 开启自动合并
 * @param params.pullNumber PR 编号
 */
async function enableAutoMerge(params: Params): Promise<void> {
  const owner = await getOwner();
  const repo = await getRepo();
  if (!owner || !repo) {
    throw new Error('无法获取仓库信息');
  }

  await githubClient.pulls.merge({
    owner,
    repo,
    pull_number: params.pullNumber,
    merge_method: 'squash',
    commit_title: `Merge pull request #${params.pullNumber}`,
  });
}

export default enableAutoMerge;
