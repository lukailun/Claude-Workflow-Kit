import { Issue } from '@linear/sdk';

export function getTitlePrompt(params: {
  description: string;
  relatedIssue?: Issue;
}) {
  const issueSection = params.relatedIssue
    ? `
关联工单:
- 标识: ${params.relatedIssue.identifier}
- 标题: ${params.relatedIssue.title}
- 描述: ${params.relatedIssue.description || '无'}
`
    : '';
  return `请根据以下合并请求描述内容${params.relatedIssue ? '和关联工单' : ''}，生成一个简洁明了的合并请求标题。

描述内容:
${params.description}
${issueSection}
要求：
- 标题格式：type: [工单号] 标题内容（如有工单号，如：fix: [PROJ-123] 修复 xxx 问题；如无工单号，如：fix: 修复 xxx 问题）
- type 可选：feat / fix / docs / style / refactor / test / chore / perf
- 标题内容使用中文
- 标题内容不超过 80 字符（不含工单号）
- 概括主要改动内容
- 使用清晰、专业的语言
- 直接返回标题文本，不要包含其他内容`;
}

const overviewTemplate = `## 改动概述
[简要描述本次改动的主要内容和目的]

## 主要变更

### [变更点 1]
* [改动简要描述]

### [变更点 2]
* [改动简要描述]

### [变更点 3]
* [改动简要描述]

## 影响范围
* **改动文件**: [受影响的文件列表]
* **影响模块**: [受影响的模块名称]
* **影响功能**: [受影响的功能描述]

## 测试说明
* [测试项 1]
* [测试项 2]
* [测试项 3]`;

export function getDescriptionPrompt(params: {
  sourceBranch: string;
  targetBranch: string;
  diffStat: string;
  diffLog: string;
}) {
  return `请根据以下 Git 改动信息，生成详细的合并请求描述。

当前分支: ${params.sourceBranch}
目标分支: ${params.targetBranch}

文件改动:
${params.diffStat}

提交记录:
${params.diffLog}

描述格式参考:
${overviewTemplate}

要求：
- 请求描述使用中文
- 按照格式模板生成
- 包含改动概述、主要变更、影响范围和测试说明
- 内容简要、结构清晰
- 直接返回 Markdown 格式的描述文本，不要包含其他内容`;
}
