/**
 * cwkit config 命令：环境变量管理
 */

import { readFile, writeFile, mkdir, chmod } from 'node:fs/promises';
import { existsSync } from 'node:fs';
import {
  getEnvDiagnostics,
  type EnvDiagnostic,
} from '@cwkit/shared/env/env-manager';
import {
  cwkitHomeDir,
  cwkitUserEnvPath,
  cwkitProjectEnvPath,
  ensureCwkitHome,
} from '@cwkit/shared/env/home-dir';
import { USER_ENV_KEYS, PROJECT_ENV_KEYS } from '@cwkit/shared/env/env-constants';

/**
 * cwkit config list — 显示所有环境变量配置状态
 */
export async function configList(): Promise<void> {
  const diagnostics = await getEnvDiagnostics();

  console.log('\n📋 环境变量配置状态\n');
  console.log(`  用户级文件: ${cwkitUserEnvPath}`);
  console.log(`  项目级文件: ${process.cwd()}/${cwkitProjectEnvPath}\n`);

  // 用户级
  console.log('── 用户级（~/.cwkit/.env）──\n');
  for (const key of USER_ENV_KEYS) {
    printDiagnostic(diagnostics.find((d) => d.key === key)!);
  }

  // 项目级
  console.log('\n── 项目级（.claude/.env）──\n');
  for (const key of PROJECT_ENV_KEYS) {
    printDiagnostic(diagnostics.find((d) => d.key === key)!);
  }

  console.log('');
}

function printDiagnostic(d: EnvDiagnostic): void {
  const status =
    d.source === 'shell'
      ? '🔵 shell'
      : d.source === 'project'
        ? '🟢 project'
        : d.source === 'user'
          ? '🟡 user'
          : d.source === 'project over user'
            ? '🟢 project'
            : '⚪ unset';

  const preview = d.value
    ? d.key.includes('TOKEN') ||
      d.key.includes('KEY') ||
      d.key.includes('SECRET')
      ? maskValue(d.value)
      : d.value
    : '-';

  const label = d.key.padEnd(28);
  console.log(`  ${status}  ${label}  ${preview}`);
}

function maskValue(value: string): string {
  if (value.length <= 10) return '*'.repeat(value.length);
  return `${value.slice(0, 6)}...${value.slice(-4)}`;
}

/**
 * cwkit config init — 初始化环境变量模板文件
 */
export async function configInit(): Promise<void> {
  // 1. 用户级模板
  const userEnvExists = existsSync(cwkitUserEnvPath);
  if (!userEnvExists) {
    await ensureCwkitHome();
    const userTemplate = generateUserEnvTemplate();
    await writeFile(cwkitUserEnvPath, userTemplate, {
      encoding: 'utf8',
      mode: 0o600,
    });
    await chmod(cwkitUserEnvPath, 0o600).catch(() => {});
    console.log(`✅ 已创建用户级环境变量模板: ${cwkitUserEnvPath}`);
    console.log('   请编辑此文件，填入你的 API keys 和 tokens。\n');
  } else {
    console.log(`ℹ️  用户级环境变量文件已存在: ${cwkitUserEnvPath}\n`);
  }

  // 2. 项目级模板
  const projectEnvExists = existsSync(cwkitProjectEnvPath);
  if (!projectEnvExists) {
    await mkdir('.claude', { recursive: true });
    const projectTemplate = generateProjectEnvTemplate();
    await writeFile(cwkitProjectEnvPath, projectTemplate, {
      encoding: 'utf8',
      mode: 0o600,
    });
    await chmod(cwkitProjectEnvPath, 0o600).catch(() => {});
    console.log(`✅ 已创建项目级环境变量模板: ${cwkitProjectEnvPath}`);
    console.log('   请编辑此文件，填入项目的 base URL 和 project ID。\n');
  } else {
    console.log(`ℹ️  项目级环境变量文件已存在: ${cwkitProjectEnvPath}\n`);
  }

  console.log('完成！编辑上述文件后即可使用 cwkit 命令。');
}

function generateUserEnvTemplate(): string {
  const lines: string[] = [
    '# Claude Workflow Kit — 用户级环境变量',
    '# 个人凭据，跨项目共享',
    '# 文件权限 0o600，仅当前用户可读写',
    '',
  ];

  lines.push('# ── 平台 Token ──');
  for (const key of [
    'GITHUB_TOKEN',
    'GITLAB_TOKEN',
    'LINEAR_API_KEY',
    'OPENROUTER_API_KEY',
    'SENTRY_API_KEY',
    'FIGMA_TOKEN',
  ]) {
    lines.push(`${key}=`);
  }

  lines.push('', '# ── AI 服务 API Key ──', '# 根据你使用的服务填写，未使用的可删除');
  for (const key of [
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
  ]) {
    lines.push(`${key}=`);
  }

  lines.push('');
  return lines.join('\n');
}

function generateProjectEnvTemplate(): string {
  const lines: string[] = [
    '# Claude Workflow Kit — 项目级环境变量',
    '# 项目配置，因项目而异',
    '',
  ];

  lines.push('# ── GitLab ──', 'GITLAB_BASE_URL=https://git.mampod.work', '');
  lines.push('# ── GitHub ──', 'GITHUB_BASE_URL=https://api.github.com', '');
  lines.push('# ── Linear ──', 'LINEAR_PROJECT_ID=', '');
  lines.push('# ── OpenRouter ──', 'OPENROUTER_BASE_URL=https://openrouter.ai/api/v1', '');
  lines.push('# ── Sentry ──', 'SENTRY_BASE_URL=', 'SENTRY_ORGANIZATION=', 'SENTRY_PROJECT=', '');
  lines.push('# ── Figma ──', 'FIGMA_BASE_URL=https://api.figma.com', 'FIGMA_FILE_ID=', 'FIGMA_PAGE_ID=', '');
  lines.push('# ── AI 服务 Base URL ──');
  for (const [key, defaultUrl] of [
    ['CLAUDE_BASE_URL', ''],
    ['DEEPSEEK_BASE_URL', 'https://api.deepseek.com'],
    ['GEMINI_BASE_URL', 'https://generativelanguage.googleapis.com'],
    ['GLM_BASE_URL', 'https://open.bigmodel.cn'],
    ['HY_BASE_URL', 'https://tokenhub.tencentmaas.com'],
    ['LONGCAT_BASE_URL', 'https://api.longcat.chat'],
    ['MIMO_BASE_URL', 'https://api.xiaomimimo.com'],
    ['MINIMAX_BASE_URL', 'https://api.minimaxi.com'],
    ['QWEN_BASE_URL', 'https://dashscope.aliyuncs.com'],
  ]) {
    lines.push(`${key}=${defaultUrl}`);
  }

  lines.push('');
  return lines.join('\n');
}
