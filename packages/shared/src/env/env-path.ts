/**
 * 环境变量加载入口
 *
 * 分层加载策略（优先级从高到低）：
 *   1. Shell export（process.env 中已有的值）
 *   2. 项目级 .dev-kit/.env
 *   3. 用户级 ~/.dev-kit/.env
 *
 * CI 环境下跳过本地文件加载，仅使用 CI/CD 变量。
 */

import { loadEnv } from './env-manager';
import { cwkitUserEnvPath, cwkitProjectEnvPath } from './home-dir';
import { isCI } from './is-ci';

/** 环境变量文件位置描述（用于错误提示） */
const envLocations = isCI
  ? 'CI/CD Settings > Variables'
  : `~/.dev-kit/.env（用户级）或 ${cwkitProjectEnvPath}（项目级）`;

/** 加载环境变量（幂等，模块加载时执行一次） */
if (!isCI) {
  loadEnv().catch((err) => {
    // 加载失败不阻断流程，后续 requireEnv 会给出明确的错误提示
    console.error(`[警告] 环境变量加载失败: ${err instanceof Error ? err.message : err}`);
  });
}

export { envLocations, cwkitUserEnvPath, cwkitProjectEnvPath };
