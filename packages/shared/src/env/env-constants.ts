/**
 * 环境变量常量定义
 *
 * 将所有管理的环境变量分为两层：
 * - 用户级（~/.cwkit/.env）：个人凭据，跨项目共享
 * - 项目级（.claude/.env）：项目配置，因项目而异
 */

/**
 * 用户级环境变量 key 列表
 *
 * 这些是个人凭据（API keys、tokens），在所有项目间共享。
 * 存储在 ~/.cwkit/.env，权限 0o600。
 */
export const USER_ENV_KEYS = [
  // ── 平台 Token ──
  'GITHUB_TOKEN',
  'GITLAB_TOKEN',
  'LINEAR_API_KEY',
  'OPENROUTER_API_KEY',
  'SENTRY_API_KEY',
  'FIGMA_TOKEN',

  // ── AI 服务 API Key ──
  'CLAUDE_API_KEY',
  'CLAUDE_AUTH_TOKEN',
  'DEEPSEEK_API_KEY',
  'GEMINI_API_KEY',
  'GLM_API_KEY',
  'HY_API_KEY',
  'LONGCAT_API_KEY',
  'MIMO_API_KEY',
  'MINIMAX_API_KEY',
  'QWEN_API_KEY',
] as const;

/**
 * 项目级环境变量 key 列表
 *
 * 这些是项目级配置（base URL、project ID 等），因项目而异。
 * 存储在 .claude/.env，跟随项目仓库（但 .env 本身被 gitignore）。
 */
export const PROJECT_ENV_KEYS = [
  // ── GitLab ──
  'GITLAB_BASE_URL',

  // ── GitHub ──
  'GITHUB_BASE_URL',

  // ── Linear ──
  'LINEAR_PROJECT_ID',

  // ── OpenRouter ──
  'OPENROUTER_BASE_URL',

  // ── Sentry ──
  'SENTRY_BASE_URL',
  'SENTRY_ORGANIZATION',
  'SENTRY_PROJECT',

  // ── Figma ──
  'FIGMA_BASE_URL',
  'FIGMA_FILE_ID',
  'FIGMA_PAGE_ID',

  // ── AI 服务 Base URL ──
  'CLAUDE_BASE_URL',
  'DEEPSEEK_BASE_URL',
  'GEMINI_BASE_URL',
  'GLM_BASE_URL',
  'HY_BASE_URL',
  'LONGCAT_BASE_URL',
  'MIMO_BASE_URL',
  'MINIMAX_BASE_URL',
  'QWEN_BASE_URL',
] as const;

/** 所有被管理的环境变量 key（用户级 + 项目级） */
export const ALL_MANAGED_ENV_KEYS: readonly string[] = [
  ...USER_ENV_KEYS,
  ...PROJECT_ENV_KEYS,
];

/** 用户级 key 集合，用于快速查找 */
const userKeySet = new Set<string>(USER_ENV_KEYS);

/** 项目级 key 集合，用于快速查找 */
const projectKeySet = new Set<string>(PROJECT_ENV_KEYS);

/**
 * 判断一个 key 是否属于用户级环境变量
 */
export function isUserEnvKey(key: string): boolean {
  return userKeySet.has(key);
}

/**
 * 判断一个 key 是否属于项目级环境变量
 */
export function isProjectEnvKey(key: string): boolean {
  return projectKeySet.has(key);
}
