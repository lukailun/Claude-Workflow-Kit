import { createOpenAI } from '@ai-sdk/openai';
import { debugFetch } from '@cwkit/shared/utils/debug-fetch';
import type { LanguageModel } from 'ai';
import { getQwenFromEnv } from '../env/get-qwen-from-env';

const env = getQwenFromEnv();
const provider = createOpenAI({
  name: 'DashScope',
  baseURL: `${env.baseUrl}/compatible-mode/v1`,
  apiKey: env.apiKey,
  fetch: debugFetch,
});

export const qwenLanguageModel: LanguageModel = provider.chat('qwen3.6-flash');
