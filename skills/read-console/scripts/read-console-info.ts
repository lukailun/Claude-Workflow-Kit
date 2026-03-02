#!/usr/bin/env bun

/**
 * Logs 文件夹信息查询脚本
 *
 * 功能：
 * 1. 显示 logs 文件夹的总大小
 * 2. 列出所有日志文件及其大小
 * 3. 显示每个文件的修改时间
 * 4. 按日期排序显示
 *
 * 使用方法：
 * bun run read-console-info.ts
 */

import { readdir, stat } from 'fs/promises';
import { join } from 'path';
import { existsSync } from 'fs';

const LOG_DIR = join(process.cwd(), 'logs');

/**
 * 格式化文件大小
 */
function formatFileSize(bytes: number): string {
  if (bytes === 0) return '0 B';
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return `${(bytes / Math.pow(k, i)).toFixed(2)} ${sizes[i]}`;
}

/**
 * 格式化日期时间
 */
function formatDate(date: Date): string {
  return date.toLocaleString('zh-CN', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
  });
}

/**
 * 获取 logs 文件夹的详细信息
 */
async function getLogsInfo() {
  try {
    if (!existsSync(LOG_DIR)) {
      console.log('\n❌ 日志目录不存在: logs/\n');
      return;
    }

    const files = await readdir(LOG_DIR);
    const logFiles = files.filter((file) => file.endsWith('.log'));

    if (logFiles.length === 0) {
      console.log('\n📁 Logs 文件夹为空\n');
      return;
    }

    // 获取每个文件的详细信息
    const fileInfos = await Promise.all(
      logFiles.map(async (file) => {
        const filePath = join(LOG_DIR, file);
        const stats = await stat(filePath);
        return {
          name: file,
          size: stats.size,
          formattedSize: formatFileSize(stats.size),
          modifiedTime: stats.mtime,
        };
      })
    );

    // 按修改时间排序（最新的在前面）
    fileInfos.sort(
      (a, b) => b.modifiedTime.getTime() - a.modifiedTime.getTime()
    );

    // 计算总大小
    const totalSize = fileInfos.reduce((sum, file) => sum + file.size, 0);

    // 显示信息
    console.log('\n📁 Logs 文件夹信息');
    console.log('═'.repeat(80));
    console.log(`📊 总文件数: ${fileInfos.length}`);
    console.log(`💾 总大小: ${formatFileSize(totalSize)}`);
    console.log(`📂 路径: ${LOG_DIR}`);
    console.log('─'.repeat(80));
    console.log('\n📄 文件列表:\n');

    // 显示每个文件的信息
    fileInfos.forEach((file, index) => {
      console.log(`${index + 1}. ${file.name}`);
      console.log(`   大小: ${file.formattedSize}`);
      console.log(`   修改时间: ${formatDate(file.modifiedTime)}`);
      console.log('');
    });

    console.log('═'.repeat(80));
    console.log('');
  } catch (error) {
    console.error('❌ 读取日志文件夹失败:', error);
    process.exit(1);
  }
}

getLogsInfo();
