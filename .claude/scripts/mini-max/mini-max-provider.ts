import OpenAI from 'openai';
import miniMaxFromEnv from '../env/mini-max-from-env';
import AIProvider from '../ai/types/ai-provider';
import AIRequestParams from '../ai/types/ai-request-params';
import AIResponse from '../ai/types/ai-response';
import miniMaxProviderInfo from './mini-max-provider-info';

class MiniMaxProvider implements AIProvider {
  info = miniMaxProviderInfo;

  async generate(params: AIRequestParams): Promise<AIResponse> {
    const client = new OpenAI({
      baseURL: `${miniMaxFromEnv.baseUrl}/v1`,
      apiKey: miniMaxFromEnv.apiKey,
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

export default new MiniMaxProvider();
