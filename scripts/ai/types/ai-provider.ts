import AIRequestParams from './ai-request-params';
import AIResponse from './ai-response';

interface AIProvider {
  generate(params: AIRequestParams): Promise<AIResponse>;
}

export default AIProvider;
