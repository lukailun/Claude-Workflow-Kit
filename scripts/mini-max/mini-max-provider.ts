import miniMaxFromEnv from '../env/mini-max-from-env';
import AIProvider from '../ai/types/ai-provider';
import AIRequestParams from '../ai/types/ai-request-params';
import AIResponse from '../ai/types/ai-response';

interface MiniMaxMessage {
  role: string;
  content: string;
  name?: string;
}

interface MiniMaxRequest {
  model: string;
  messages: MiniMaxMessage[];
}

interface MiniMaxResponse {
  choices: Array<{
    message: {
      content: string;
    };
  }>;
}

class MiniMaxProvider implements AIProvider {
  private baseURL: string;
  private apiKey: string;

  constructor() {
    this.baseURL = miniMaxFromEnv.baseUrl;
    this.apiKey = miniMaxFromEnv.apiKey;
  }

  async generate(params: AIRequestParams): Promise<AIResponse> {
    const requestBody: MiniMaxRequest = {
      model: 'MiniMax-M2.7',
      messages: params.messages.map((msg) => ({
        role: msg.role,
        content: msg.content,
      })),
    };

    const response = await fetch(`${this.baseURL}/v1/text/chatcompletion_v2`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${this.apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(requestBody),
    });

    if (!response.ok) {
      throw new Error(
        `MiniMax API error: ${response.status} ${response.statusText}`
      );
    }

    const data = (await response.json()) as MiniMaxResponse;
    const text = data.choices[0]?.message?.content?.trim() || '';
    return { text };
  }
}

export default new MiniMaxProvider();
