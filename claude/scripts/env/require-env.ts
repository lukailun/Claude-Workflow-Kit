import { env } from 'process';
import { envPath } from '@/env/env-path';

/**
 * 读取并验证单个环境变量，缺失时抛出错误
 *
 * 使用懒加载模式：仅在首次访问时验证，避免模块加载时的级联退出。
 */
export function requireEnv(name: string): string {
  const value = env[name];
  if (!value) {
    throw new Error(
      `[错误]: 未配置 ${name} 环境变量，请在 ${envPath} 文件中配置`
    );
  }
  return value;
}

/**
 * 读取可选环境变量，不存在时返回 undefined
 */
export function optionalEnv(name: string): string | undefined {
  return env[name] ?? undefined;
}
