/**
 * 重试行为类型
 */
export type RepeatBehavior =
  | { type: 'immediate'; maxCount: number }
  | { type: 'delayed'; maxCount: number; time: number } // time 单位：秒
  | { type: 'exponentialDelayed'; maxCount: number; initial: number; multiplier: number }; // initial 单位：秒，multiplier：延迟递增倍数（如 1 表示每次翻倍）

/**
 * 计算当前轮次对应的最大尝试次数与延迟毫秒数
 */
function calculateConditions(
  behavior: RepeatBehavior,
  currentRepetition: number
): { maxCount: number; delayMs: number } {
  switch (behavior.type) {
    case 'immediate':
      return { maxCount: behavior.maxCount, delayMs: 0 };
    case 'delayed':
      return { maxCount: behavior.maxCount, delayMs: behavior.time * 1000 };
    case 'exponentialDelayed': {
      const delay =
        currentRepetition === 1
          ? behavior.initial
          : behavior.initial * Math.pow(1 + behavior.multiplier, currentRepetition - 1);
      return { maxCount: behavior.maxCount, delayMs: delay * 1000 };
    }
  }
}

/**
 * 重试配置选项
 */
interface RetryOptions<T> {
  behavior: RepeatBehavior,
  /** 成功结果重试谓词：返回 true 则触发重试，默认成功不重试 */
  shouldRetryWhenSuccess?: (value: T) => boolean;
  /** 错误重试谓词：返回 true 则触发重试，默认所有错误都重试 */
  shouldRetryWhenError?: (error: unknown) => boolean;
  /** 重试耗尽后的默认返回值，设置后不再抛出错误 */
  defaultValue?: T;
}

/**
 * 核心重试函数
 * @param task 异步任务工厂函数，每次重试都会重新执行
 * @param options 重试配置选项
 */
export function retry<T>(
  task: () => Promise<T>,
  options: RetryOptions<T> = { behavior: {type: 'immediate', maxCount: 2}}
): Promise<T> {
  const { shouldRetryWhenSuccess, shouldRetryWhenError } = options;
  async function attempt(currentAttempt: number): Promise<T> {
    if (currentAttempt <= 0) {
      return new Promise(() => {});
    }
    const conditions = calculateConditions(options.behavior, currentAttempt);
    return task()
      .then((value) => {
        const successPredicate = shouldRetryWhenSuccess ?? (() => false);
        // 成功但满足重试条件：判断是否还有重试次数
        if (successPredicate(value)) {
          if (currentAttempt >= conditions.maxCount) {
            // 达到最大次数，直接返回最终结果
            return value;
          }
          // 还有次数，执行重试
          if (conditions.delayMs <= 0) {
            return attempt(currentAttempt + 1);
          }
          return new Promise<void>((resolve) => setTimeout(resolve, conditions.delayMs)).then(
            () => attempt(currentAttempt + 1)
          );
        }
        // 成功且无需重试，直接返回
        return value;
      })
      .catch(async (error: unknown) => {
        // 达到最大尝试次数
        if (currentAttempt >= conditions.maxCount) {
          // 有默认值则返回，否则抛出错误
          if (options.defaultValue !== undefined) {
            return options.defaultValue;
          }
          throw error;
        }
        const errorPredicate = shouldRetryWhenError ?? (() => true);
        // 错误不满足重试条件，直接抛出
        if (!errorPredicate(error)) {
          throw error;
        }
        // 无延迟立即重试
        if (conditions.delayMs <= 0) {
          return attempt(currentAttempt + 1);
        }
        // 延迟后重试
        return new Promise<void>((resolve) => setTimeout(resolve, conditions.delayMs)).then(
          () => attempt(currentAttempt + 1)
        );
      });
  }
  return attempt(1);
}