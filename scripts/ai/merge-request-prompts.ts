/**
 * MR 生成相关的 Prompt 模板
 */

export function getRelatedIssuesPrompt(params: {
  sourceBranch: string;
  commitMessages: string[];
  diffStat: string;
  issuesList: string;
}) {
  return `分析以下 Git 改动和 Linear Issues，判断哪些 issues 与改动相关。

分支名: ${params.sourceBranch}

提交信息:
${params.commitMessages.join('\n')}

文件改动:
${params.diffStat}

待办 Issues:
${params.issuesList}

要求：只返回相关的 issue identifiers，用逗号分隔（如：SIC-123,SIC-456）。如果没有相关的，返回"无"。`;
}

export function getTitlePrompt(params: {
  sourceBranch: string;
  targetBranch: string;
  diffStat: string;
  diffLog: string;
}) {
  return `请根据以下 Git 改动信息，生成一个简洁明了的合并请求标题。

当前分支: ${params.sourceBranch}
目标分支: ${params.targetBranch}

文件改动:
${params.diffStat}

提交记录:
${params.diffLog}

要求：
- 标题使用中文
- 标题不超过 80 字符
- 概括主要改动内容
- 使用清晰、专业的语言
- 直接返回标题文本，不要包含其他内容`;
}

const overviewTemplate = `## 改动概述
[简要描述本次改动的主要内容和目的]

## 关联事项
[关联 Linear 工单]

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
  issuesText: string;
}) {
  return `请根据以下 Git 改动信息，生成详细的合并请求描述。

当前分支: ${params.sourceBranch}
目标分支: ${params.targetBranch}

文件改动:
${params.diffStat}

提交记录:
${params.diffLog}

关联的 Linear Issues:
${params.issuesText || '无'}

描述格式参考:
${overviewTemplate}

要求：
- 请求描述使用中文
- 按照格式模板生成
- 在"关联事项"部分填入上述 Linear Issues
- 包含改动概述、关联事项、主要变更、影响范围和测试说明
- 内容详细、结构清晰
- 直接返回 Markdown 格式的描述文本，不要包含其他内容`;
}
