import Anthropic from '@anthropic-ai/sdk';
import type { AIProvider } from '@/ai/types';
import type { AIRequestParams } from '@/ai/types';
import type { AIResponse } from '@/ai/types';
import { xiaomiMimoFromEnv } from '@/env';
import { xiaomiMimoProviderInfo } from '@/xiaomi-mimo/xiaomi-mimo-provider-info';

class XiaomiMimoProvider implements AIProvider {
  info = xiaomiMimoProviderInfo;

  private getSystemPrompt(): string {
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

  async generate(params: AIRequestParams): Promise<AIResponse> {
    const client = new Anthropic({
      baseURL: `${xiaomiMimoFromEnv.baseUrl}/anthropic/`,
      authToken: xiaomiMimoFromEnv.apiKey,
    });
    const response = await client.messages.create({
      model: this.info.model,
      max_tokens: params.maxTokens,
      system: this.getSystemPrompt(),
      messages: params.messages,
      stream: false,
    });

    const text =
      response.content[0].type === 'text'
        ? response.content[0].text.trim()
        : '';
    return {
      text,
      tokenUsage: {
        input: response.usage.input_tokens,
        output: response.usage.output_tokens,
        cacheRead: response.usage.cache_read_input_tokens ?? 0,
        cacheWrite: response.usage.cache_creation_input_tokens ?? 0,
      },
    };
  }
}

export const xiaomiMimoProvider = new XiaomiMimoProvider();
