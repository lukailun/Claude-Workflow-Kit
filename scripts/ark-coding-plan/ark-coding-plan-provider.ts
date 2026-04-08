import arkCodingPlanFromEnv from '../env/ark-coding-plan-from-env';
import AIProvider from '../ai/types/ai-provider';
import AIRequestParams from '../ai/types/ai-request-params';
import AIResponse from '../ai/types/ai-response';

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
}

interface ArkResponse {
  model: string;
  output: ArkOutput[];
  status: string;
}

class ArkCodingPlanProvider implements AIProvider {
  private baseURL: string;
  private apiKey: string;

  constructor() {
    this.baseURL = arkCodingPlanFromEnv.baseUrl;
    this.apiKey = arkCodingPlanFromEnv.apiKey;
  }

  async generate(params: AIRequestParams): Promise<AIResponse> {
    // 将 messages 转换为 input 字符串
    const input = params.messages.map((msg) => msg.content).join('\n');

    const requestBody: ArkRequest = {
      model: 'doubao-seed-2-0-pro-260215',
      input,
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

    // 查找第一个 message 类型的 output
    const messageOutput = data.output.find(
      (output) => output.type === 'message'
    );

    let text = '';
    if (messageOutput?.content && messageOutput.content.length > 0) {
      // 从 content 数组中提取所有文本
      text = messageOutput.content
        .map((item) => item.text)
        .join('')
        .trim();
    }

    return { text };
  }
}

export default new ArkCodingPlanProvider();
