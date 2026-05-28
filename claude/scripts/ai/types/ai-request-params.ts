import AIMessage from '@/ai/types/ai-message';

interface AIRequestParams {
  messages: AIMessage[];
  maxTokens: number;
}

export default AIRequestParams;
