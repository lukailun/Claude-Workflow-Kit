export const COMMANDS = {
  ':plan': {
    prefix: '针对以下内容，制定详细的分步计划：',
    description: '生成分步计划',
  },
  ':explain': {
    prefix: '针对以下内容，使用通俗易懂的语言进行解释：',
    description: '通俗解释',
  },
  ':summarize': {
    prefix: '针对以下内容，进行总结：',
    description: '总结',
  },
  ':analyze': {
    prefix: '针对以下内容，进行简要分析，指出核心问题和解决方向：',
    description: '分析',
  },
  ':zh': {
    prefix: '将以下内容翻译成中文：',
    description: '翻译为中文',
  },
  ':en': {
    prefix: 'Translate the following into natural English: ',
    description: '翻译为英文',
  },
  ':improve': {
    prefix: '优化以下文本的表达，使其更流畅专业：',
    description: '文本润色',
  },
  ':code': {
    prefix: '为以下需求编写代码：',
    description: '代码编写',
  },
  ':comment': {
    prefix: '为以下代码添加详细的注释：',
    description: '代码注释',
  },
  ':debug': {
    prefix: '针对以下内容，进行调试分析并提供解决方案：',
    description: '调试分析',
  },
  ':refactor': {
    prefix: '重构以下代码，提高可读性和性能：',
    description: '代码重构',
  },
  ':test': {
    prefix: '为以下代码编写测试用例：',
    description: '测试用例生成',
  },
  ':document': {
    prefix: '为以下代码编写技术文档：',
    description: '技术文档生成',
  },
  ':review': {
    prefix: '为以下代码进行代码审查，指出问题和改进建议：',
    description: '代码审查',
  },
} as const;

export type CommandKey = keyof typeof COMMANDS;
