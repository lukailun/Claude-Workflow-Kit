import { commitTypes } from '@/git/commit-type';

export function getCommitMessagePrompt(params: {
  diffStat: string;
  diffContent: string;
  branchName: string;
}) {
  const typeUnion = commitTypes.map((type) => `"${type}"`).join(' | ');
  return `生成提交信息的 JSON 输出。

当前分支: 
${params.branchName}

文件改动:
${params.diffStat}

改动详情:
${params.diffContent}

JSON 结构：
{
  "type": ${typeUnion},
  "subject": "简短描述"
}

规则：
- type: 从给定枚举中选择最匹配的一项
- subject: 中文描述改动内容，不超过 72 字符，不含类型前缀，结尾不加句号`;
}
