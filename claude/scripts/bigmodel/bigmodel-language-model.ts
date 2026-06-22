import { createOpenAI } from '@ai-sdk/openai';
import type { LanguageModel } from 'ai';
import { getBigModelFromEnv } from '@/env/get-bigmodel-from-env';

const env = getBigModelFromEnv();
const provider = createOpenAI({
    name: '智谱 BigModel',
    baseURL: `${env.baseUrl}/api/paas/v4`,
    apiKey: env.apiKey,
});

const bigModelLanguageModel: LanguageModel = provider.chat('glm-5.1')

export { bigModelLanguageModel };