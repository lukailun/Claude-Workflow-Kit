import { createAnthropic } from '@ai-sdk/anthropic';
import { getClaudeFromEnv } from '@cwkit/shared/env/get-claude-from-env';
import { debugFetch } from '@cwkit/shared/utils/debug-fetch';
import type { LanguageModel } from 'ai';

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
