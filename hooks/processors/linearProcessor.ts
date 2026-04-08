import { LinearClient } from '@linear/sdk';
import { config } from 'dotenv';
import { join } from 'path';

config({ path: join(process.cwd(), '.claude', '.env') });

/**
 * 处理 Linear issue 引用
 * linear(4t-1111)
 */
export const processLinearReference = async (
  prompt: string
): Promise<string> => {
  // 如果没有配置 LINEAR_API_KEY，直接返回原始 prompt
  if (!process.env.LINEAR_API_KEY) {
    return prompt;
  }

  const linearClient = new LinearClient({
    apiKey: process.env.LINEAR_API_KEY,
  });

  let result = prompt;

  // 匹配 linear(issueId) 格式
  const linearMatches = [...result.matchAll(/linear\((.*?)\)/g)];
  for (const match of linearMatches) {
    const issueId = match[1];
    try {
      const issue = await linearClient.issue(issueId ?? '');
      result = result.replace(match[0], JSON.stringify(issue, null, 2));
    } catch (error) {
      console.error(`Failed to fetch linear issue ${issueId}:`, error);
    }
  }

  return result;
};
