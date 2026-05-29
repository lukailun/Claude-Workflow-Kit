import OpenAI from 'openai';
import type { AIProvider } from '@/ai/types';
import type { AIRequestParams } from '@/ai/types';
import type { AIResponse } from '@/ai/types';
import { bigModelProviderInfo } from '@/bigmodel/bigmodel-provider-info';
import { bigModelFromEnv } from '@/env';

class BigModelProvider implements AIProvider {
  info = bigModelProviderInfo;

  async generate(params: AIRequestParams): Promise<AIResponse> {
    const client = new OpenAI({
      baseURL: `${bigModelFromEnv.baseUrl}/api/paas/v4`,
      apiKey: bigModelFromEnv.apiKey,
    });
    const response = await client.chat.completions.create({
      model: this.info.model,
      messages: params.messages,
      max_tokens: params.maxTokens,
      stream: false,
    });

    const text = response.choices[0]?.message?.content?.trim() || '';
    return {
      text,
      tokenUsage: response.usage
        ? {
            input: response.usage.prompt_tokens,
            output: response.usage.completion_tokens,
            cacheRead: response.usage.prompt_tokens_details?.cached_tokens ?? 0,
            cacheWrite: 0,
          }
        : undefined,
    };
  }
}

export const bigModelProvider = new BigModelProvider();
