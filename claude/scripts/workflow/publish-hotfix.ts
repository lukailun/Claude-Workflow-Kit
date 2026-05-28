/**
 * hotfix 开发完成后的发布流程
 *
 * 用法：
 *   tsx finish-hotfix-branch.ts
 *
 * 流程：
 *   1. 获取当前 hotfix 分支名
 *   2. 创建 MR 合并到 main
 *   3. 合并后在 main 上打 tag（基于 hotfix 版本号）
 *   4. 删除远程 hotfix 分支
 *   5. 将 main 同步到最新的 release 分支
 */

import { $ } from 'bun';
import gitlabClient from '../gitlab/gitlab-client';
import getCurrentBranch from '../gitlab/get-current-branch';
import getCurrentProjectId from '../gitlab/get-current-project-id';
import getLatestReleaseBranch from '../gitlab/get-latest-release-branch';
import mainBranch from '../git/main-branch';

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

async function publishHotfixWorkflow() {
  const currentBranch = await getCurrentBranch();
  if (!/^hotfix\/\d+\.\d+\.\d+$/.test(currentBranch)) {
    console.error('❌ 当前不在 hotfix 分支上');
    process.exit(1);
  }

  const segment = currentBranch.replace('hotfix/', '');
  const projectId = await getCurrentProjectId();
  if (!projectId) {
    console.error('❌ 无法获取项目 ID');
    process.exit(1);
  }

  // 1. 创建 MR 合并到 main
  console.log(`\n📝 创建 MR: ${currentBranch} → ${mainBranch.fullName}`);
  const mergeRequest = await gitlabClient.MergeRequests.create(
    projectId,
    currentBranch,
    mainBranch.fullName,
    `hotfix: ${segment}`,
    {
      description: `合并 hotfix/${segment} 到 ${mainBranch.fullName}`,
      removeSourceBranch: false,
    }
  );
  console.log(`✅ MR 已创建: ${mergeRequest.web_url}`);

  // 2. 本地合并 hotfix 到 main 并 force push
  console.log(`\n🔀 本地合并 ${currentBranch} 到 ${mainBranch.fullName}...`);
  await $`git checkout ${mainBranch.fullName}`.quiet();
  await $`git pull origin ${mainBranch.fullName}`.quiet();
  await gitMerge(currentBranch);
  await $`git push origin ${mainBranch.fullName} --force`.quiet();
  console.log(`✅ 已合并并推送到 ${mainBranch.fullName}`);

  // 3. 打 tag
  const tagName = `v${segment}`;
  console.log(`\n🏷️  创建 tag: ${tagName}`);
  await gitlabClient.Tags.create(projectId, tagName, mainBranch.fullName, {
    message: `Release ${tagName}`,
  });
  console.log(`✅ tag ${tagName} 已创建`);

  // 4. 删除远程 hotfix 分支
  console.log(`\n🗑️  删除远程分支: ${currentBranch}`);
  await gitlabClient.Branches.remove(projectId, currentBranch);
  console.log(`✅ 分支 ${currentBranch} 已删除`);

  // 5. 将 main 同步到最新的 release 分支
  const releaseBranch = await getLatestReleaseBranch();
  if (releaseBranch) {
    console.log(
      `\n🔀 同步 ${mainBranch.fullName} 到 ${releaseBranch.fullName}...`
    );
    await $`git checkout ${releaseBranch.fullName}`.quiet();
    await $`git pull origin ${releaseBranch.fullName}`.quiet();
    await gitMerge(mainBranch.fullName);
    await $`git push origin ${releaseBranch.fullName} --force`.quiet();
    console.log(`✅ 已同步到 ${releaseBranch.fullName}`);
  } else {
    console.log('\n⚠️  未找到 release 分支，跳过同步');
  }

  // 本地切回 main 并删除 hotfix 分支
  await $`git checkout ${mainBranch.fullName}`.quiet();
  await $`git branch -D ${currentBranch}`.quiet();

  console.log(`\n🎉 hotfix/${segment} 发布完成！`);
}

publishHotfixWorkflow();
