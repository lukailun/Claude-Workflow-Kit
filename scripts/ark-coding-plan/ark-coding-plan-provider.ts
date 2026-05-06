import arkCodingPlanFromEnv from '../env/ark-coding-plan-from-env';
import AIProvider from '../ai/types/ai-provider';
import AIRequestParams from '../ai/types/ai-request-params';
import AIResponse from '../ai/types/ai-response';
import arkCodingPlanProviderInfo from './ark-coding-plan-provider-info';

interface ArkOutput {
  type: 'message' | 'reasoning';
  id: string;
  content?: Array<{
    type: string;
    text: string;
  }>;
  summary?: Array<{
    type: string;
    text: string;
  }>;
  status: string;
}

interface ArkRequest {
  model: string;
  input: string;
  max_output_tokens: number;
}

interface ArkResponse {
  model: string;
  output: ArkOutput[];
  status: string;
  usage?: {
    input_tokens: number;
    output_tokens: number;
    total_tokens: number;
  };
}

class ArkCodingPlanProvider implements AIProvider {
  info = arkCodingPlanProviderInfo;

  private baseURL: string;
  private apiKey: string;

  constructor() {
    this.baseURL = arkCodingPlanFromEnv.baseUrl;
    this.apiKey = arkCodingPlanFromEnv.apiKey;
  }

  async generate(params: AIRequestParams): Promise<AIResponse> {
    const input = params.messages.map((msg) => msg.content).join('\n');

    const requestBody: ArkRequest = {
      model: this.info.model,
      input,
      max_output_tokens: params.maxTokens,
    };

    const response = await fetch(`${this.baseURL}/api/v3/responses`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${this.apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(requestBody),
    });

    if (!response.ok) {
      throw new Error(
        `Ark Coding Plan API error: ${response.status} ${response.statusText}`
      );
    }

    const data = (await response.json()) as ArkResponse;

    const messageOutput = data.output.find(
      (output) => output.type === 'message'
    );

    let text = '';
    if (messageOutput?.content && messageOutput.content.length > 0) {
      text = messageOutput.content
        .map((item) => item.text)
        .join('')
        .trim();
    }

    return {
      text,
      tokenUsage: data.usage
        ? {
            input: data.usage.input_tokens,
            output: data.usage.output_tokens,
            cacheRead: 0,
            cacheWrite: 0,
          }
        : undefined,
    };
  }
}

export default new ArkCodingPlanProvider();
