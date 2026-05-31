/**
 * 项目 model ID ↔ OpenRouter model ID 双向映射
 *
 * 项目使用短 ID（如 `claude-sonnet-4-6`），OpenRouter 使用带前缀的 ID（如 `anthropic/claude-sonnet-4.6`）
 */

/** 项目 model ID → OpenRouter model ID（null 表示 OpenRouter 上不存在） */
const PROJECT_TO_OPENROUTER: Record<string, string | null> = {
  // Anthropic
  'claude-opus-4-7': 'anthropic/claude-opus-4.7',
  'claude-opus-4-6': 'anthropic/claude-opus-4.6',
  'claude-opus-4-5': 'anthropic/claude-opus-4.5',
  'claude-opus-4-1': 'anthropic/claude-opus-4.1',
  'claude-opus-4': 'anthropic/claude-opus-4',
  'claude-sonnet-4-6': 'anthropic/claude-sonnet-4.6',
  'claude-sonnet-4-5': 'anthropic/claude-sonnet-4.5',
  'claude-sonnet-4': 'anthropic/claude-sonnet-4',
  'claude-haiku-4-5': 'anthropic/claude-haiku-4.5',
  'claude-haiku-3-5': null,

  // BigModel (Zhipu)
  'glm-5.1': 'z-ai/glm-5.1',
  'glm-5-turbo': 'z-ai/glm-5-turbo',
  'glm-5': 'z-ai/glm-5',

  // DeepSeek
  'deepseek-v4-pro': 'deepseek/deepseek-v4-pro',
  'deepseek-v4-flash': 'deepseek/deepseek-v4-flash',

  // MiniMax
  'MiniMax-M2.7-highspeed': null,
  'MiniMax-M2.7': 'minimax/minimax-m2.7',
  'MiniMax-M2.5-highspeed': null,
  'MiniMax-M2.5': 'minimax/minimax-m2.5',

  // Xiaomi MiMo
  'mimo-v2.5-pro': 'xiaomi/mimo-v2.5-pro',
  'mimo-v2.5': 'xiaomi/mimo-v2.5',
  'mimo-v2-pro': 'xiaomi/mimo-v2-pro',
  'mimo-v2-omni': 'xiaomi/mimo-v2-omni',
  'mimo-v2-flash': 'xiaomi/mimo-v2-flash',

  // LongCat
  'LongCat-2.0-Preview': null,

  // Kimi
  'kimi-for-coding': null,
  'kimi-k2.6': 'moonshotai/kimi-k2.6',
  'kimi-k2.5': 'moonshotai/kimi-k2.5',
};

/** OpenRouter model ID → 项目 model ID 的反向映射（运行时构建） */
let OPENROUTER_TO_PROJECT: Record<string, string> | null = null;

/** 项目 model ID → OpenRouter model ID */
export function toOpenRouterId(projectModelId: string): string | null {
  return PROJECT_TO_OPENROUTER[projectModelId] ?? null;
}

/** OpenRouter model ID → 项目 model ID */
export function toProjectId(openRouterModelId: string): string | null {
  if (!OPENROUTER_TO_PROJECT) {
    OPENROUTER_TO_PROJECT = {};
    for (const [projectId, orId] of Object.entries(PROJECT_TO_OPENROUTER)) {
      if (orId) OPENROUTER_TO_PROJECT[orId] = projectId;
    }
  }
  return OPENROUTER_TO_PROJECT[openRouterModelId] ?? null;
}

/** 所有在 OpenRouter 上有映射的项目 model ID */
export function getMappedProjectIds(): string[] {
  return Object.entries(PROJECT_TO_OPENROUTER)
    .filter(([, orId]) => orId !== null)
    .map(([projectId]) => projectId);
}
