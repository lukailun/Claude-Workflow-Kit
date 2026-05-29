/**
 * release 开发完成后的发布流程
 *
 * 用法：
 *   tsx publish-release.ts
 *
 * 流程：
 *   1. 获取当前 release 分支名
 *   2. 创建 PR 合并到 main
 *   3. 合并后在 main 上打 tag（基于 release 版本号）
 *   4. 删除远程 release 分支
 */

import { $ } from 'bun';
import { getCurrentBranch } from '@/git';
import { mainBranch } from '@/git';
import { getOwner } from '@/github';
import { getRepo } from '@/github';
import { githubClient } from '@/github';

async function gitMerge(source: string) {
  const result = await $`git merge ${source} --no-edit`.nothrow();
  if (result.exitCode !== 0) {
    console.error(`\n❌ 合并 ${source} 时出现冲突：`);
    const conflicts = await $`git diff --name-only --diff-filter=U`.text();
    console.error(conflicts);
    await $`git merge --abort`.quiet();
    console.error('\n已自动中止合并，请手动解决冲突后重试。');
    process.exit(1);
  }
}

async function publishReleaseWorkflow() {
  const currentBranch = await getCurrentBranch();
  if (!/^release\/\d+\.\d+\.\d+$/.test(currentBranch)) {
    console.error('❌ 当前不在 release 分支上');
    process.exit(1);
  }

  const segment = currentBranch.replace('release/', '');
  const owner = await getOwner();
  const repo = await getRepo();
  if (!owner || !repo) {
    console.error('❌ 无法获取仓库信息');
    process.exit(1);
  }

  // 1. 创建 PR 合并到 main
  console.log(`\n📝 创建 PR: ${currentBranch} → ${mainBranch.fullName}`);
  const { data: pullRequest } = await githubClient.pulls.create({
    owner,
    repo,
    head: currentBranch,
    base: mainBranch.fullName,
    title: `release: ${segment}`,
    body: `合并 ${currentBranch} 到 ${mainBranch.fullName}`,
  });
  console.log(`✅ PR 已创建: ${pullRequest.html_url}`);

  // 2. 本地合并 release 到 main 并 force push
  console.log(`\n🔀 本地合并 ${currentBranch} 到 ${mainBranch.fullName}...`);
  await $`git checkout ${mainBranch.fullName}`.quiet();
  await $`git pull origin ${mainBranch.fullName}`.quiet();
  await gitMerge(currentBranch);
  await $`git push origin ${mainBranch.fullName} --force`.quiet();
  console.log(`✅ 已合并并推送到 ${mainBranch.fullName}`);

  // 3. 打 tag
  const tagName = `v${segment}`;
  console.log(`\n🏷️  创建 tag: ${tagName}`);

  // 获取 main 分支的 SHA
  const { data: mainRef } = await githubClient.git.getRef({
    owner,
    repo,
    ref: `heads/${mainBranch.fullName}`,
  });
  await githubClient.git.createRef({
    owner,
    repo,
    ref: `refs/tags/${tagName}`,
    sha: mainRef.object.sha,
  });
  console.log(`✅ tag ${tagName} 已创建`);

  // 4. 删除远程 release 分支
  console.log(`\n🗑️  删除远程分支: ${currentBranch}`);
  await githubClient.git.deleteRef({
    owner,
    repo,
    ref: `heads/${currentBranch}`,
  });
  console.log(`✅ 分支 ${currentBranch} 已删除`);

  // 本地删除 release 分支
  await $`git branch -D ${currentBranch}`.quiet();

  console.log(`\n🎉 release/${segment} 发布完成！`);
}

publishReleaseWorkflow();
