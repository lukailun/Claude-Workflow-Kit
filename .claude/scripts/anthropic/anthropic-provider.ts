import Anthropic from '@anthropic-ai/sdk';
import anthropicFromEnv from '../env/anthropic-from-env';
import AIProvider from '../ai/types/ai-provider';
import AIRequestParams from '../ai/types/ai-request-params';
import AIResponse from '../ai/types/ai-response';
import anthropicProviderInfo from './anthropic-provider-info';

class AnthropicProvider implements AIProvider {
  info = anthropicProviderInfo;

  async generate(params: AIRequestParams): Promise<AIResponse> {
    const client = new Anthropic({
      baseURL: anthropicFromEnv.baseUrl,
      apiKey:
        (anthropicFromEnv.apiKey ?? '').length > 0
          ? anthropicFromEnv.apiKey
          : undefined,
      authToken:
        (anthropicFromEnv.authToken ?? '').length > 0
          ? anthropicFromEnv.authToken
          : undefined,
    });
    const response = await client.messages.create({
      model: this.info.model,
      max_tokens: params.maxTokens,
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

export default new AnthropicProvider();
