import { sh } from '../utils/sh';

/**
 * 合并指定分支到当前分支，冲突时自动中止
 */
export async function gitMerge(source: string): Promise<void> {
  const result = await sh`git merge ${source} --no-edit`.nothrow();
  if (result.exitCode !== 0) {
    console.error(`\n❌ 合并 ${source} 时出现冲突：`);
    const conflicts = await sh`git diff --name-only --diff-filter=U`.text();
    console.error(conflicts);
    await sh`git merge --abort`.quiet();
    console.error('\n已自动中止合并，请手动解决冲突后重试。');
    process.exit(1);
  }
}
