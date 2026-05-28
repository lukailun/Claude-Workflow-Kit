import type { TokenUsage } from './token-usage';

interface AIResponse {
  text: string;
  tokenUsage?: TokenUsage;
}

export default AIResponse;
