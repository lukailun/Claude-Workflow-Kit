/**
 * 创建 release 分支的完整流程
 *
 * 用法：
 *   tsx create-release.ts
 *
 * - 交互式确认版本号（y=使用建议版本，n=取消，x.y.z=指定版本）
 * - 从 main 分支创建 release/x.y.z
 * - 如果已存在同名 release 分支，直接切换并拉取最新代码
 */

import { createInterface } from 'readline';
import { $ } from 'bun';
import { createReleaseBranch } from '../gitlab/create-release-branch';
import getLatestTag from '../gitlab/get-latest-tag';
import getRemoteBranches from '../gitlab/get-remote-branches';

async function promptVersion(
  suggested: string,
  existingBranches: string[]
): Promise<string | null> {
  if (existingBranches.length > 0) {
    console.log('\n⚠️  已存在以下 release 分支:');
    existingBranches.forEach((branch) => console.log(`   - ${branch}`));
    console.log('');
  }

  const readline = createInterface({
    input: process.stdin,
    output: process.stdout,
  });

  const answer = await new Promise<string>((resolve) => {
    readline.question(
      `release 版本号 [${suggested}]（y/n/x.y.z）: `,
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

async function createReleaseWorkflow() {
  const remoteBranches = await getRemoteBranches();
  const existingReleases = remoteBranches
    .filter((branch) => /^release\/\d+\.\d+\.\d+$/.test(branch))
    .sort()
    .reverse();

  const latestTag = await getLatestTag();
  const suggested = latestTag
    ? `${latestTag.major}.${latestTag.minor + 1}.0`
    : '1.0.0';

  const version = await promptVersion(suggested, existingReleases);
  if (!version) {
    console.log('已取消');
    return;
  }

  const existing = existingReleases.find((b) => b === `release/${version}`);
  if (existing) {
    console.log(`\n📌 release 分支 ${existing} 已存在，直接切换`);
    await $`git checkout ${existing}`.quiet();
    await $`git pull origin ${existing}`.quiet();
    console.log('✅ 已切换到最新 release 分支');
    return;
  }

  console.log(`\n📌 创建 release/${version}（基于 main）\n`);
  await createReleaseBranch(version);
}

createReleaseWorkflow();
