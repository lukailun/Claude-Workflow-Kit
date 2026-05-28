import AIProviderInfo from './ai-provider-info';
import AIRequestParams from './ai-request-params';
import AIResponse from './ai-response';

interface AIProvider {
  info: AIProviderInfo;
  generate(params: AIRequestParams): Promise<AIResponse>;
}

export default AIProvider;
