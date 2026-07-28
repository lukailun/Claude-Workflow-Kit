import { createAnthropic } from '@ai-sdk/anthropic';
import type { LanguageModel } from 'ai';
import { getGlmFromEnv } from '@lukailun/dev-kit/env/get-glm-from-env';
import { debugFetch } from '@lukailun/dev-kit/utils/debug-fetch';

const env = getGlmFromEnv();
const provider = createAnthropic({
  name: '智谱 Z.ai',
  baseURL: `${env.baseUrl}/api/anthropic/v1`,
  apiKey: env.apiKey,
  fetch: debugFetch,
});

export const glmLanguageModel: LanguageModel = provider.chat('glm-5.2');
