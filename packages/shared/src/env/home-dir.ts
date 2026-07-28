/**
 * ~/.cwkit/ 用户级目录结构
 *
 * 存放个人凭据（API keys、tokens），跨项目共享。
 * 参考 openwiki 的 openwiki-home.ts 设计。
 */

import { mkdir, chmod } from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';

/** ~/.cwkit/ 用户级根目录 */
export const cwkitHomeDir = path.join(os.homedir(), '.cwkit');

/** ~/.cwkit/.env 用户级环境变量文件 */
export const cwkitUserEnvPath = path.join(cwkitHomeDir, '.env');

/** .claude/.env 项目级环境变量文件（相对于项目根目录） */
export const cwkitProjectEnvPath = '.claude/.env';

/**
 * 确保 ~/.cwkit/ 目录存在，权限 0o700（仅当前用户可读写执行）
 */
export async function ensureCwkitHome(): Promise<void> {
  await mkdir(cwkitHomeDir, { recursive: true, mode: 0o700 });
  await chmod(cwkitHomeDir, 0o700).catch(() => {
    // chmod 失败不阻断流程（例如 Windows 上权限模型不同）
  });
}
