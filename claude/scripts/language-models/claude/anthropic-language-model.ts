import { createAnthropic } from '@ai-sdk/anthropic';
import type { LanguageModel } from 'ai';
import { getClaudeFromEnv } from '@/env/get-claude-from-env';
import { debugFetch } from '@/utils/debug-fetch';

const env = getClaudeFromEnv();
const provider = createAnthropic({
  name: 'Anthropic',
  baseURL: env.baseUrl,
  apiKey: env.apiKey,
  authToken: env.authToken,
  fetch: debugFetch,
});

export const claudeLanguageModel: LanguageModel =
  provider.chat('claude-sonnet-4-6');
