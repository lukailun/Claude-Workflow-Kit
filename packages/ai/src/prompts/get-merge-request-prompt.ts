import { commitTypes } from '@cwkit/shared/git/commit-type';

export function getMergeRequestPrompt(params: {
  sourceBranch: string;
  targetBranch: string;
  diffStat: string;
  diffLog: string;
}) {
  const typeUnion = commitTypes.map((type) => `"${type}"`).join(' | ');
  return `生成合并请求的 JSON 输出。

当前分支:
${params.sourceBranch}

目标分支:
${params.targetBranch}

文件改动:
${params.diffStat}

提交记录:
${params.diffLog}

JSON 结构：
{
  "title": {
    "type": ${typeUnion},
    "subject": "合并请求标题"
  },
  "description": {
    "overview" "改动概述",
    "changes": "主要变更列表",
    "impact": {
      "files": "受影响的文件列表",
      "features": "受影响的功能列表"
    },
    "tests": "测试说明列表"
  }
}

规则：
- title.type: 从给定枚举中选择最匹配的一项
- title.subject: 中文描述改动内容，不超过 72 字符，不含类型前缀，结尾不加句号
- description.overview: 使用中文，简要描述本次改动的主要内容和目的
- description.changes: 主要变更列表，必须是数组，每项是一个简要描述
- description.impact.files: 受影响的文件列表，必须是数组
- description.impact.features: 受影响的功能列表，必须是数组
- description.tests: 测试说明列表，必须是数组`;
}
