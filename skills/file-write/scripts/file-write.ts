#!/usr/bin/env bun

/**
 * 文件写入脚本
 *
 * 功能：
 * 1. 接收文件路径和内容作为参数
 * 2. 自动创建目录结构（如果不存在）
 * 3. 将内容写入文件
 *
 * 使用方法：
 * bun run file-write.ts <file_path> <content>
 */

import { mkdir, writeFile } from 'fs/promises';
import { dirname } from 'path';

async function main() {
  try {
    const filePath = process.argv[2];
    const content = process.argv[3];

    if (!filePath) {
      console.error('错误: 未提供文件路径参数');
      console.error('使用方法: bun run file-write.ts <file_path> <content>');
      process.exit(1);
    }

    if (content === undefined) {
      console.error('错误: 未提供内容参数');
      console.error('使用方法: bun run file-write.ts <file_path> <content>');
      process.exit(1);
    }

    const dir = dirname(filePath);
    await mkdir(dir, { recursive: true });
    await writeFile(filePath, content, 'utf-8');

    console.log(`文件已成功写入: ${filePath}`);
  } catch (error) {
    console.error('[错误]: ', error);
    process.exit(1);
  }
}

main();
