#!/usr/bin/env bun

/**
 * Console 日志读取脚本
 *
 * 功能：
 * 1. 查找最新的日志文件（logs/dev-YYYY-MM-DD.log）
 * 2. 从文件底部开始读取指定行数的日志
 * 3. 支持按关键词筛选日志
 * 4. 按时间倒序显示（最新的在最前面）
 *
 * 使用方法：
 * bun run read-console.ts [lines] [keyword]
 *
 * 参数：
 * - lines: 要读取的行数（可选，默认 100）
 * - keyword: 筛选关键词（可选，不提供则显示所有日志）
 */

import { readdir, readFile } from 'fs/promises';
import { join } from 'path';
import { existsSync } from 'fs';

const LOG_DIR = join(process.cwd(), 'logs');
const DEFAULT_LINES = 100;

/**
 * 获取最新的日志文件
 */
async function getLatestLogFile(): Promise<string | null> {
  try {
    if (!existsSync(LOG_DIR)) {
      console.error('日志目录不存在: logs/');
      return null;
    }

    const files = await readdir(LOG_DIR);
    const logFiles = files
      .filter((file) => file.startsWith('dev-') && file.endsWith('.log'))
      .sort()
      .reverse();

    if (logFiles.length === 0) {
      console.error('未找到日志文件');
      return null;
    }

    return join(LOG_DIR, logFiles[0]);
  } catch (error) {
    console.error('读取日志目录失败:', error);
    return null;
  }
}

/**
 * 读取文件的最后 N 行（支持关键词筛选）
 */
async function readLastLines(
  filePath: string,
  lines: number,
  keyword?: string
): Promise<string[]> {
  try {
    const content = await readFile(filePath, 'utf-8');
    const allLines = content.split('\n');

    // 过滤空行
    let nonEmptyLines = allLines.filter((line) => line.trim() !== '');

    // 如果提供了关键词，进行筛选
    if (keyword) {
      nonEmptyLines = nonEmptyLines.filter((line) => line.includes(keyword));
    }

    // 获取最后 N 行
    const lastLines = nonEmptyLines.slice(-lines);

    // 倒序排列（最新的在最前面）
    return lastLines.reverse();
  } catch (error) {
    console.error('读取文件失败:', error);
    return [];
  }
}

async function main() {
  try {
    // 获取参数
    const linesArg = process.argv[2];
    const keyword = process.argv[3];
    const lines = linesArg ? parseInt(linesArg, 10) : DEFAULT_LINES;

    if (linesArg && (isNaN(lines) || lines <= 0)) {
      console.error('错误: 行数必须是正整数');
      console.error('使用方法: bun run read-console.ts [lines] [keyword]');
      process.exit(1);
    }

    // 获取最新的日志文件
    const logFile = await getLatestLogFile();
    if (!logFile) {
      process.exit(1);
    }

    console.log(`\n📋 读取日志文件: ${logFile}`);
    if (keyword) {
      console.log(`🔍 筛选关键词: "${keyword}"`);
    }
    console.log(`📊 显示最近 ${lines} 行日志\n`);
    console.log('─'.repeat(80));

    // 读取并显示日志
    const logLines = await readLastLines(logFile, lines, keyword);

    if (logLines.length === 0) {
      if (keyword) {
        console.log(`未找到包含关键词 "${keyword}" 的日志`);
      } else {
        console.log('日志文件为空');
      }
    } else {
      logLines.forEach((line) => {
        console.log(line);
      });
    }

    console.log('─'.repeat(80));
    console.log(`\n✅ 共显示 ${logLines.length} 行日志\n`);
  } catch (error) {
    console.error('[错误]:', error);
    process.exit(1);
  }
}

main();
