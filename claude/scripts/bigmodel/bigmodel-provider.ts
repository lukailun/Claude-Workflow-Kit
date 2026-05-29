import OpenAI from 'openai';
import AIProvider from '@/ai/types/ai-provider';
import AIRequestParams from '@/ai/types/ai-request-params';
import AIResponse from '@/ai/types/ai-response';
import bigModelProviderInfo from '@/bigmodel/bigmodel-provider-info';
import bigModelFromEnv from '@/env/bigmodel-from.env';

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

export default new BigModelProvider();
