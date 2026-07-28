import { createOpenAI } from '@ai-sdk/openai';
import type { LanguageModel } from 'ai';
import { getQwenFromEnv } from '@lukailun/dev-kit/env/get-qwen-from-env';
import { debugFetch } from '@lukailun/dev-kit/utils/debug-fetch';

const env = getQwenFromEnv();
const provider = createOpenAI({
  name: 'DashScope',
  baseURL: `${env.baseUrl}/compatible-mode/v1`,
  apiKey: env.apiKey,
  fetch: debugFetch,
});

export const qwenLanguageModel: LanguageModel = provider.chat('qwen3.6-flash');
