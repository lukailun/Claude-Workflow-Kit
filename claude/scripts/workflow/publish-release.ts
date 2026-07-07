/**
 * release 开发完成后的发布流程
 *
 * 用法：
 *   tsx publish-release.ts
 *
 * 流程：
 *   1. 获取当前 release 分支名
 *   2. 创建 MR 合并到 main
 *   3. 合并后在 main 上打 tag（基于 release 版本号）
 *   4. 删除远程 release 分支
 */

import { $ } from 'bun';
import { getCurrentBranch } from '@/git/get-current-branch';
import { mainBranch } from '@/git/main-branch';
import { gitMerge } from '@/git/merge';
import { getCurrentProjectId } from '@/gitlab/get-current-project-id';
import { gitlabClient } from '@/gitlab/gitlab-client';

async function publishReleaseWorkflow() {
  const currentBranch = await getCurrentBranch();
  if (!/^release\/\d+\.\d+\.\d+$/.test(currentBranch)) {
    console.error('❌ 当前不在 release 分支上');
    process.exit(1);
  }

  const segment = currentBranch.replace('release/', '');
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
    `release: ${segment}`,
    {
      description: `合并 ${currentBranch} 到 ${mainBranch.fullName}`,
      removeSourceBranch: false,
    }
  );
  console.log(`✅ MR 已创建: ${mergeRequest.web_url}`);

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
  await gitlabClient.Tags.create(projectId, tagName, mainBranch.fullName, {
    message: `Release ${tagName}`,
  });
  console.log(`✅ tag ${tagName} 已创建`);

  // 4. 删除远程 release 分支
  console.log(`\n🗑️  删除远程分支: ${currentBranch}`);
  await gitlabClient.Branches.remove(projectId, currentBranch);
  console.log(`✅ 分支 ${currentBranch} 已删除`);

  // 本地删除 release 分支
  await $`git branch -D ${currentBranch}`.quiet();

  console.log(`\n🎉 release/${segment} 发布完成！`);
}

publishReleaseWorkflow();
