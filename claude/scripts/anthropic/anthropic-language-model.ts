import { createAnthropic } from '@ai-sdk/anthropic';
import type { LanguageModel } from 'ai';
import { getAnthropicFromEnv } from '@/env/get-anthropic-from-env';

const env = getAnthropicFromEnv();
const provider = createAnthropic({
    name: 'Anthropic',
    baseURL: env.baseUrl,
    apiKey: env.apiKey,
    authToken: env.authToken,
});

const anthropicLanguageModel: LanguageModel = provider.chat('claude-sonnet-4-6')

export { anthropicLanguageModel };