/**
 * AI Model 配置
 *
 * 使用 Vercel AI SDK 统一管理所有 AI 模型
 */

import { createAnthropic } from '@ai-sdk/anthropic';
import { createOpenAI } from '@ai-sdk/openai';
import type { LanguageModel } from 'ai';
import { getAnthropicFromEnv } from '@/env/get-anthropic-from-env';
import { getBigModelFromEnv } from '@/env/get-bigmodel-from-env';
import { getDeepSeekFromEnv } from '@/env/get-deepseek-from-env';
import { getLongCatFromEnv } from '@/env/get-longcat-from-env';
import { getMiniMaxFromEnv } from '@/env/get-minimax-from-env';
import { getXiaomiMimoFromEnv } from '@/env/get-xiaomi-mimo-from-env';

export interface ModelConfig {
  name: string;
  url: string;
  model: string;
  languageModel: LanguageModel;
}

// --- OpenAI 兼容 provider ---

function openaiModel(config: {
  name: string;
  url: string;
  model: string;
  baseUrl: string;
  apiKey: string;
}): ModelConfig {
  const provider = createOpenAI({
    baseURL: config.baseUrl,
    apiKey: config.apiKey,
    name: config.name,
  });
  return {
    name: config.name,
    url: config.url,
    model: config.model,
    languageModel: provider(config.model),
  };
}

const longCatEnv = getLongCatFromEnv();
export const longcatModel = openaiModel({
  name: 'LongCat',
  url: 'https://longcat.chat/platform/usage',
  model: 'LongCat-2.0-Preview',
  baseUrl: `${longCatEnv.baseUrl}/openai`,
  apiKey: longCatEnv.apiKey,
});

const deepSeekEnv = getDeepSeekFromEnv();
export const deepseekModel = openaiModel({
  name: 'DeepSeek',
  url: 'https://platform.deepseek.com/',
  model: 'deepseek-v4-flash',
  baseUrl: deepSeekEnv.baseUrl,
  apiKey: deepSeekEnv.apiKey,
});

const bigModelEnv = getBigModelFromEnv();
export const bigmodelModel = openaiModel({
  name: '智谱 BigModel',
  url: 'https://open.bigmodel.cn/',
  model: 'glm-5.1',
  baseUrl: `${bigModelEnv.baseUrl}/api/paas/v4`,
  apiKey: bigModelEnv.apiKey,
});

const miniMaxEnv = getMiniMaxFromEnv();
export const minimaxModel = openaiModel({
  name: 'MiniMax',
  url: 'https://minimaxi.com/',
  model: 'MiniMax-M2.7',
  baseUrl: `${miniMaxEnv.baseUrl}/v1`,
  apiKey: miniMaxEnv.apiKey,
});

// --- Anthropic 兼容 provider ---

const anthropicEnv = getAnthropicFromEnv();
const anthropicProvider = createAnthropic({
  baseURL: anthropicEnv.baseUrl,
  apiKey: anthropicEnv.apiKey,
  authToken: anthropicEnv.authToken,
});
export const anthropicModel: ModelConfig = {
  name: 'Anthropic',
  url: 'https://www.anthropic.com/',
  model: 'claude-sonnet-4-6',
  languageModel: anthropicProvider('claude-sonnet-4-6'),
};

const mimoEnv = getXiaomiMimoFromEnv();
const mimoProvider = createAnthropic({
  baseURL: mimoEnv.baseUrl,
  apiKey: mimoEnv.apiKey,
});
export const mimoModel: ModelConfig = {
  name: 'Xiaomi MiMo',
  url: 'https://platform.xiaomimimo.com/',
  model: 'mimo-v2.5-pro',
  languageModel: mimoProvider('mimo-v2.5-pro'),
};
