/**
 * 环境变量加载与持久化核心
 *
 * 分层加载策略（优先级从高到低）：
 *   1. Shell export（process.env 中已有的值）
 *   2. 项目级 .claude/.env
 *   3. 用户级 ~/.cwkit/.env
 *
 * 参考 openwiki 的 env.ts，但增加了用户级/项目级分层。
 */

import { readFile, writeFile, chmod } from 'node:fs/promises';
import { USER_ENV_KEYS, PROJECT_ENV_KEYS } from './env-constants';
import {
  cwkitUserEnvPath,
  cwkitProjectEnvPath,
  ensureCwkitHome,
} from './home-dir';

type EnvMap = Record<string, string>;

/**
 * Shell 环境变量快照（启动时捕获一次）
 *
 * 用于判断某个值是来自 Shell export 还是从文件加载的。
 * Shell export 始终保持最高优先级，不会被文件值覆盖。
 */
let shellEnvSnapshot: Record<string, string> | undefined;

/**
 * 捕获 Shell 环境变量快照（幂等，仅首次调用生效）
 */
function captureShellEnv(): void {
  if (shellEnvSnapshot !== undefined) return;

  const snapshot: Record<string, string> = {};
  const allKeys = [...USER_ENV_KEYS, ...PROJECT_ENV_KEYS];

  for (const key of allKeys) {
    const value = process.env[key];
    if (value !== undefined) {
      snapshot[key] = value;
    }
  }

  shellEnvSnapshot = snapshot;
}

/**
 * 判断某个 key 的值是否来自 Shell export
 */
export function isShellEnv(key: string): boolean {
  return shellEnvSnapshot?.[key] !== undefined;
}

// ─── 解析与格式化 ───

/**
 * 解析 .env 文件内容为 key-value 映射
 *
 * 支持：
 * - KEY=value
 * - KEY="value"
 * - export KEY=value
 * - 注释行（# 开头）
 * - 空行
 */
export function parseEnv(content: string): EnvMap {
  const env: EnvMap = {};

  for (const rawLine of content.split(/\r?\n/)) {
    const line = rawLine.trim();

    if (line.length === 0 || line.startsWith('#')) continue;

    // 处理 "export KEY=value" 语法
    const exportPrefix = 'export ';
    const lineToParse = line.startsWith(exportPrefix)
      ? line.slice(exportPrefix.length)
      : line;

    const equalsIndex = lineToParse.indexOf('=');
    if (equalsIndex <= 0) continue;

    const key = lineToParse.slice(0, equalsIndex).trim();
    const rawValue = lineToParse.slice(equalsIndex + 1).trim();

    if (!/^[A-Z_][A-Z0-9_]*$/.test(key)) continue;

    env[key] = parseEnvValue(rawValue);
  }

  return env;
}

/**
 * 解析单个环境变量值（处理引号和转义）
 */
function parseEnvValue(value: string): string {
  if (value.startsWith('"') && value.endsWith('"')) {
    return value
      .slice(1, -1)
      .replace(/\\n/g, '\n')
      .replace(/\\r/g, '\r')
      .replace(/\\"/g, '"')
      .replace(/\\\\/g, '\\');
  }
  return value;
}

/**
 * 将 key-value 映射格式化为 .env 文件内容
 *
 * 管理的 key 按定义顺序排列在前，其余按字母序排列在后。
 */
export function formatEnv(
  env: EnvMap,
  managedKeys: readonly string[],
): string {
  const keys = [
    ...managedKeys.filter((key) => env[key] !== undefined),
    ...Object.keys(env)
      .filter((key) => !managedKeys.includes(key))
      .sort(),
  ];

  return `${keys.map((key) => `${key}=${formatEnvValue(env[key] ?? '')}`).join('\n')}\n`;
}

/**
 * 格式化单个环境变量值（添加引号和转义）
 */
function formatEnvValue(value: string): string {
  return `"${value
    .replace(/\\/g, '\\\\')
    .replace(/"/g, '\\"')
    .replace(/\n/g, '\\n')
    .replace(/\r/g, '\\r')}"`;
}

// ─── 文件读取 ───

/**
 * 读取用户级环境变量文件（~/.cwkit/.env）
 */
async function readUserEnv(): Promise<EnvMap> {
  try {
    return parseEnv(await readFile(cwkitUserEnvPath, 'utf8'));
  } catch {
    return {};
  }
}

/**
 * 读取项目级环境变量文件（.claude/.env）
 */
async function readProjectEnv(): Promise<EnvMap> {
  try {
    return parseEnv(await readFile(cwkitProjectEnvPath, 'utf8'));
  } catch {
    return {};
  }
}

// ─── 加载 ───

/**
 * 分层加载环境变量到 process.env
 *
 * 优先级：Shell export > 项目级 .claude/.env > 用户级 ~/.cwkit/.env
 *
 * 只填充 process.env 中尚未设置的 key（Shell export 始终优先）。
 * 项目级值覆盖用户级值（因为项目级更具体）。
 */
export async function loadEnv(): Promise<void> {
  captureShellEnv();

  const userEnv = await readUserEnv();
  const projectEnv = await readProjectEnv();

  // 合并：项目级覆盖用户级
  const merged: EnvMap = { ...userEnv, ...projectEnv };

  for (const [key, value] of Object.entries(merged)) {
    // Shell export 始终优先，不覆盖
    if (process.env[key] === undefined) {
      process.env[key] = value;
    }
  }
}

// ─── 保存 ───

/**
 * 保存用户级环境变量到 ~/.cwkit/.env
 *
 * 合并已有值和更新值，空值表示删除。
 * 文件权限 0o600，目录权限 0o700。
 */
export async function saveUserEnv(updates: EnvMap): Promise<void> {
  await ensureCwkitHome();

  const current = await readUserEnv();
  const next: EnvMap = { ...current, ...updates };

  // 空值表示删除
  for (const key of Object.keys(next)) {
    if (next[key] === '') delete next[key];
  }

  await writeFile(cwkitUserEnvPath, formatEnv(next, USER_ENV_KEYS), {
    encoding: 'utf8',
    mode: 0o600,
  });
  await chmod(cwkitUserEnvPath, 0o600).catch(() => {});

  // 同步到 process.env（不覆盖 Shell export）
  for (const [key, value] of Object.entries(updates)) {
    if (isShellEnv(key)) continue;
    if (value === '') {
      delete process.env[key];
    } else {
      process.env[key] = value;
    }
  }
}

/**
 * 保存项目级环境变量到 .claude/.env
 *
 * 合并已有值和更新值，空值表示删除。
 */
export async function saveProjectEnv(updates: EnvMap): Promise<void> {
  const current = await readProjectEnv();
  const next: EnvMap = { ...current, ...updates };

  // 空值表示删除
  for (const key of Object.keys(next)) {
    if (next[key] === '') delete next[key];
  }

  // 确保 .claude/ 目录存在
  const { mkdir } = await import('node:fs/promises');
  await mkdir('.claude', { recursive: true });

  await writeFile(cwkitProjectEnvPath, formatEnv(next, PROJECT_ENV_KEYS), {
    encoding: 'utf8',
    mode: 0o600,
  });
  await chmod(cwkitProjectEnvPath, 0o600).catch(() => {});

  // 同步到 process.env（不覆盖 Shell export）
  for (const [key, value] of Object.entries(updates)) {
    if (isShellEnv(key)) continue;
    if (value === '') {
      delete process.env[key];
    } else {
      process.env[key] = value;
    }
  }
}

// ─── 诊断 ───

export type EnvSource =
  | 'shell'
  | 'project'
  | 'user'
  | 'project over user'
  | 'unset';

export interface EnvDiagnostic {
  key: string;
  source: EnvSource;
  value: string | undefined;
  scope: 'user' | 'project';
}

/**
 * 获取所有管理环境变量的诊断信息
 */
export async function getEnvDiagnostics(): Promise<EnvDiagnostic[]> {
  const userEnv = await readUserEnv();
  const projectEnv = await readProjectEnv();
  const allKeys = [...USER_ENV_KEYS, ...PROJECT_ENV_KEYS];

  return allKeys.map((key) => {
    const shellValue = shellEnvSnapshot?.[key];
    const projectValue = projectEnv[key];
    const userValue = userEnv[key];

    let source: EnvSource;
    if (shellValue !== undefined) {
      source = 'shell';
    } else if (projectValue !== undefined && userValue !== undefined) {
      source = 'project over user';
    } else if (projectValue !== undefined) {
      source = 'project';
    } else if (userValue !== undefined) {
      source = 'user';
    } else {
      source = 'unset';
    }

    const scope: 'user' | 'project' = USER_ENV_KEYS.includes(
      key as (typeof USER_ENV_KEYS)[number],
    )
      ? 'user'
      : 'project';

    return {
      key,
      source,
      value: shellValue ?? projectValue ?? userValue,
      scope,
    };
  });
}
