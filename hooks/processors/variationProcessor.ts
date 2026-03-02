import { join } from 'path';

/**
 * 生成多个解决方案
 * 用法: v(3) - 生成 3 个解决方案
 * 示例: 排序算法 v(5)
 */
export const processVariation = async (prompt: string): Promise<string> => {
  const match = prompt.match(/v\((\d+)\)/);
  if (!match) {
    return prompt;
  }

  const count = match[1];

  if (!count) {
    return prompt;
  }
  const templatePath = join(
    process.env.HOME ?? '~',
    '.claude',
    'prompts',
    'VARIATIONS.md'
  );

  const template = await Bun.file(templatePath).text();
  const instruction = prompt.replace(match[0], '').trim();

  if (!instruction) {
    throw new Error('v(n) 指令后需要提供具体的任务描述');
  }

  const processedPrompt = template
    .replace('$count', count)
    .replace('$instruction', instruction);

  return processedPrompt;
};
