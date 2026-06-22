import { createOpenAI } from '@ai-sdk/openai';
import type { LanguageModel } from 'ai';
import { getXiaomiMimoFromEnv } from '@/env/get-xiaomi-mimo-from-env';

const env = getXiaomiMimoFromEnv();
const provider = createOpenAI({
    name: 'Xiaomi Mimo',
    baseURL: `${env.baseUrl}/v1`,
    apiKey: env.apiKey,
});

const xiaomiMimoLanguageModel: LanguageModel = provider.chat('mimo-v2.5-pro')

export { xiaomiMimoLanguageModel };