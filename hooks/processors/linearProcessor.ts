import { LinearClient } from '@linear/sdk';
import { config } from 'dotenv';
import { join } from 'path';

config({ path: join(process.cwd(), '.claude', '.env') });

/**
 * 处理 Linear issue 引用
 * 支持两种格式：
 * 1. linear(4t-1111) - 完整格式
 * 2. 4t(1111) - 简写格式
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

  // 匹配 4t(1111) 格式
  const shortMatches = [
    ...result.matchAll(/(?<!linear)([a-zA-Z0-9]+)\((\d+)\)/g),
  ];
  for (const match of shortMatches) {
    const teamPrefix = match[1];
    const issueNumber = match[2];
    const issueId = `${teamPrefix}-${issueNumber}`;

    try {
      const issue = await linearClient.issue(issueId);
      result = result.replace(match[0], JSON.stringify(issue, null, 2));
    } catch (error) {
      console.error(`Failed to fetch linear issue ${issueId}:`, error);
    }
  }

  // 匹配 4T-7861 的格式
  const dashMatches = [...result.matchAll(/(?<!linear\()([a-zA-Z0-9]+-\d+)/g)];
  for (const match of dashMatches) {
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
