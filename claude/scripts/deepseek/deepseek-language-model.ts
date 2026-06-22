import { getDeepSeekFromEnv } from '@/env/get-deepseek-from-env';
import { createOpenAI } from '@ai-sdk/openai';
import type { LanguageModel } from 'ai';

const env = getDeepSeekFromEnv();
const provider = createOpenAI({
    name: 'DeepSeek',
    baseURL: env.baseUrl,
    apiKey: env.apiKey,
});

const deepSeekLanguageModel: LanguageModel = provider.chat('deepseek-v4-flash')

export { deepSeekLanguageModel };