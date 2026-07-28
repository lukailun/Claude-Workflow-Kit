import { createAnthropic } from '@ai-sdk/anthropic';
import { debugFetch } from '@cwkit/shared/utils/debug-fetch';
import type { LanguageModel } from 'ai';
import { getGlmFromEnv } from '../env/get-glm-from-env';

const env = getGlmFromEnv();
const provider = createAnthropic({
  name: '智谱 Z.ai',
  baseURL: `${env.baseUrl}/api/anthropic/v1`,
  apiKey: env.apiKey,
  fetch: debugFetch,
});

export const glmLanguageModel: LanguageModel = provider.chat('glm-5.2');
