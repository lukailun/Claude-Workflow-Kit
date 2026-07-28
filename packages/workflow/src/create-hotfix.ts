/**
 * 创建 hotfix 分支的完整流程
 *
 * 用法：
 *   tsx create-hotfix.ts
 *
 * - 交互式确认版本号（y=使用建议版本，n=取消，x.y.z=指定版本）
 * - 从 main 分支创建 hotfix/x.y.z
 * - 如果已存在 hotfix 分支，直接切换并拉取最新代码
 */

import { createInterface } from 'readline';
import { sh } from '@cwkit/shared/utils/sh';
import { createHotfixBranch } from '@cwkit/gitlab/create-hotfix-branch';
import { getLatestTag } from '@cwkit/gitlab/get-latest-tag';
import { getRemoteBranches } from '@cwkit/gitlab/get-remote-branches';

async function promptVersion(suggested: string): Promise<string | null> {
  const readline = createInterface({
    input: process.stdin,
    output: process.stdout,
  });

  const answer = await new Promise<string>((resolve) => {
    readline.question(
      `hotfix 版本号 [${suggested}]（y/n/x.y.z）: `,
      (answer) => {
        readline.close();
        resolve(answer.trim());
      }
    );
  });

  if (answer === 'y' || answer === '') return suggested;
  if (answer === 'n') return null;

  if (!/^\d+\.\d+\.\d+$/.test(answer)) {
    console.error(`❌ 版本号格式错误: ${answer}，应为 x.y.z`);
    process.exit(1);
  }

  return answer;
}

async function createHotfixWorkflow() {
  const remoteBranches = await getRemoteBranches();
  const existingHotfix = remoteBranches.find((branch) =>
    /^hotfix\/\d+\.\d+\.\d+$/.test(branch)
  );

  if (existingHotfix) {
    console.log(`📌 已存在 hotfix 分支: ${existingHotfix}`);
    await sh`git checkout ${existingHotfix}`.quiet();
    await sh`git pull origin ${existingHotfix}`.quiet();
    console.log('\n✅ 已切换到最新 hotfix 分支');
    return;
  }

  const latestTag = await getLatestTag();
  const suggested = latestTag
    ? `${latestTag.major}.${latestTag.minor}.${latestTag.patch + 1}`
    : '0.0.1';

  const version = await promptVersion(suggested);
  if (!version) {
    console.log('已取消');
    return;
  }

  console.log(`\n📌 创建 hotfix/${version}（基于 main）\n`);
  await createHotfixBranch(version);
}

createHotfixWorkflow();
