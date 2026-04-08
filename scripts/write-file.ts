/**
 * 文件写入工具模块
 *
 * 功能：
 * 1. 自动创建目录结构（如果不存在）
 * 2. 将内容写入文件
 */

import { mkdir, writeFile as writeFileWithoutDir } from 'fs/promises';
import { dirname } from 'path';

/**
 * 写入文件并自动创建目录结构
 * @param filePath 文件路径
 * @param content 文件内容
 */
async function writeFile(filePath: string, content: string): Promise<void> {
  const dir = dirname(filePath);
  await mkdir(dir, { recursive: true });
  await writeFileWithoutDir(filePath, content, 'utf-8');
}

export default writeFile;
