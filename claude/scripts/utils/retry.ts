/**
 * 通用重试工具
 *
 * 请求出错或 JSON 解析失败时自动重试。
 * - 提供 fallback：重试耗尽后返回 fallback，不中断流程
 * - 未提供 fallback：重试耗尽后抛出最后一个错误
 */

interface RetryOptions<T> {
  /** 重试仍失败时的返回值；未提供则抛出错误 */
  fallback?: T;
  /** 日志标签（便于定位是哪个请求失败） */
  label?: string;
  /** 最大重试次数（默认 1） */
  retryCount?: number;
}

/** 提供 fallback 时返回 T */
export async function retry<T>(
  fn: () => Promise<T>,
  options: RetryOptions<T>
): Promise<T>;
/** 未提供 fallback 时返回 T | void，失败则抛出 */
export async function retry<T>(
  fn: () => Promise<T>,
  options?: RetryOptions<T>
): Promise<T>;
export async function retry<T>(
  fn: () => Promise<T>,
  options: RetryOptions<T> = {}
): Promise<T> {
  const { fallback, label, retryCount = 1 } = options;
  let lastError: unknown;

  for (let attempt = 0; attempt <= retryCount; attempt++) {
    try {
      return await fn();
    } catch (error) {
      lastError = error;

      if (attempt < retryCount && label) {
        console.warn(
          `  ⚠️ [${label}] 第 ${attempt + 1} 次请求失败，正在重试 (${attempt + 1}/${retryCount})...`
        );
        if (error instanceof Error) {
          console.warn(`    原因: ${error.message}`);
        }
      }
    }
  }

  if (fallback !== undefined) {
    if (label) {
      console.error(`  ❌ [${label}] ${retryCount} 次重试仍然失败，跳过`);
      if (lastError instanceof Error) {
        console.error(`    原因: ${lastError.message}`);
      }
    }
    return fallback;
  }

  throw lastError;
}
