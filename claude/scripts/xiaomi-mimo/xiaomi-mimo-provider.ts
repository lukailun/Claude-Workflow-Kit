import { AnthropicCompatibleProvider } from '@/ai/anthropic-compatible-provider';
import { getXiaomiMimoFromEnv } from '@/env/get-xiaomi-mimo-from-env';
import { xiaomiMimoProviderInfo } from '@/xiaomi-mimo/xiaomi-mimo-provider-info';

function getSystemPrompt(): string {
  const now = new Date();
  const dateFormatter = new Intl.DateTimeFormat('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
  const date = dateFormatter.format(now);
  return `You are MiMo, an AI assistant developed by Xiaomi. Today's date: ${date}. Your knowledge cutoff date is December 2024.`;
}
const env = getXiaomiMimoFromEnv();
const xiaomiMimoProvider = new AnthropicCompatibleProvider({
  info: xiaomiMimoProviderInfo,
  baseUrl: env.baseUrl,
  apiKey: env.apiKey,
  systemPrompt: getSystemPrompt()
});

export { xiaomiMimoProvider };
