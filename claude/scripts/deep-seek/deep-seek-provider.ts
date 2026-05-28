import OpenAI from 'openai';
import deepSeekFromEnv from '../env/deep-seek-from-env';
import AIProvider from '../ai/types/ai-provider';
import AIRequestParams from '../ai/types/ai-request-params';
import AIResponse from '../ai/types/ai-response';
import deepSeekProviderInfo from './deep-seek-provider-info';

class DeepSeekProvider implements AIProvider {
  info = deepSeekProviderInfo;

  async generate(params: AIRequestParams): Promise<AIResponse> {
    const client = new OpenAI({
      baseURL: deepSeekFromEnv.baseUrl,
      apiKey: deepSeekFromEnv.apiKey,
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

export default new DeepSeekProvider();
