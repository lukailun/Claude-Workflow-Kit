import type { TokenUsage } from '@/ai/types/token-usage';

interface AIResponse {
  text: string;
  tokenUsage?: TokenUsage;
}

export default AIResponse;
