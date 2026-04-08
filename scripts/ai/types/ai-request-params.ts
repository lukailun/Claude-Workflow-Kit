import AIMessage from './ai-message';

interface AIRequestParams {
  messages: AIMessage[];
  maxTokens: number;
}

export default AIRequestParams;
