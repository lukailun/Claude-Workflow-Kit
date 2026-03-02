#!/usr/bin/env bun

/**
 * 生成 Git 状态摘要脚本
 *
 * 功能：
 * 1. 获取当前 Git 状态信息
 * 2. 从模板文件读取格式
 * 3. 生成摘要内容并输出到标准输出
 *
 * 使用方法：
 * bun run git-status.ts <timestamp>
 */

import { $ } from 'bun';
import { readFile } from 'fs/promises';
import { resolve, dirname } from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

async function main() {
  try {
    // 1. 获取时间戳
    const timestamp = process.argv[2];
    if (!timestamp) {
      console.error('[错误]: 缺少时间戳参数');
      console.error('使用方法: bun run git-status.ts <timestamp>');
      process.exit(1);
    }

    // 2. 获取 Git 状态信息
    const currentBranch = (await $`git branch --show-current`.text()).trim();
    const untrackedFiles = (
      await $`git ls-files --others --exclude-standard`.text()
    ).trim();
    const stagedFiles = (await $`git diff --cached --name-only`.text()).trim();
    const unstagedFiles = (await $`git diff --name-only`.text()).trim();

    // 3. 格式化文件列表
    const formatFileList = (files: string) => {
      if (!files) return '无';
      return files
        .split('\n')
        .map((f) => `- ${f}`)
        .join('\n');
    };

    // 4. 统计变更数量
    const countFiles = (files: string) =>
      files ? files.split('\n').length : 0;
    const totalChanges =
      countFiles(untrackedFiles) +
      countFiles(stagedFiles) +
      countFiles(unstagedFiles);

    // 5. 读取模板文件
    const templatePath = resolve(__dirname, '../references/git-status.md');
    const template = await readFile(templatePath, 'utf-8');

    // 6. 替换模板占位符
    const summary = template
      .replace('{{timestamp}}', timestamp)
      .replace('{{currentBranch}}', currentBranch)
      .replace('{{untrackedFiles}}', formatFileList(untrackedFiles))
      .replace('{{stagedFiles}}', formatFileList(stagedFiles))
      .replace('{{unstagedFiles}}', formatFileList(unstagedFiles))
      .replace('{{totalChanges}}', totalChanges.toString());

    // 7. 输出摘要到标准输出
    console.log(summary);
  } catch (error) {
    console.error('[错误]: ', error);
    process.exit(1);
  }
}

main();
