import { AnthropicCompatibleProvider } from '@/ai/anthropic-compatible-provider';
import { anthropicProviderInfo } from '@/anthropic/anthropic-provider-info';
import { getAnthropicFromEnv } from '@/env/get-anthropic-from-env';

const env = getAnthropicFromEnv();
const anthropicProvider = new AnthropicCompatibleProvider({
  info: anthropicProviderInfo,
  baseUrl: env.baseUrl,
  apiKey: env.apiKey,
  authToken: env.authToken,
});

export { anthropicProvider };
