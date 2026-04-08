import zAiFromEnv from '../env/z-ai-from.env';
import AIProvider from '../ai/types/ai-provider';
import AIRequestParams from '../ai/types/ai-request-params';
import AIResponse from '../ai/types/ai-response';

interface ZAIMessage {
  role: string;
  content: string;
}

interface ZAIRequest {
  model: string;
  messages: ZAIMessage[];
  max_tokens: number;
  stream: boolean;
}

interface ZAIResponse {
  choices: Array<{
    message: {
      content: string;
    };
  }>;
}

class ZAIProvider implements AIProvider {
  private baseURL: string;
  private apiKey: string;

  constructor() {
    this.baseURL = zAiFromEnv.baseUrl;
    this.apiKey = zAiFromEnv.apiKey;
  }

  async generate(params: AIRequestParams): Promise<AIResponse> {
    const requestBody: ZAIRequest = {
      model: 'glm-5-turbo',
      messages: params.messages,
      max_tokens: params.maxTokens,
      stream: false,
    };

    const response = await fetch(`${this.baseURL}/chat/completions`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${this.apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(requestBody),
    });

    if (!response.ok) {
      throw new Error(
        `ZAI API error: ${response.status} ${response.statusText}`
      );
    }

    const data = (await response.json()) as ZAIResponse;
    const text = data.choices[0]?.message?.content?.trim() || '';
    return { text };
  }
}

export default new ZAIProvider();
