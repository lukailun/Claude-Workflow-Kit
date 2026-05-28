import AIProviderInfo from '@/ai/types/ai-provider-info';
import AIRequestParams from '@/ai/types/ai-request-params';
import AIResponse from '@/ai/types/ai-response';

interface AIProvider {
  info: AIProviderInfo;
  generate(params: AIRequestParams): Promise<AIResponse>;
}

export default AIProvider;
