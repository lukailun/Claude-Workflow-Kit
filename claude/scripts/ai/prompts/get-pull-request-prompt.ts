export function getPullRequestPrompt(params: {
  sourceBranch: string;
  targetBranch: string;
  diffStat: string;
  diffLog: string;
}) {
  return `请根据以下 Git 改动信息，生成详细的合并请求。

当前分支: ${params.sourceBranch}
目标分支: ${params.targetBranch}

文件改动:
${params.diffStat}

提交记录:
${params.diffLog}

要求：
- 请求描述使用中文
- type 可选：feat / fix / docs / style / refactor / test / chore / perf
- title 使用中文，不超过 80 字符
- description.overview: 简要描述本次改动的主要内容和目的
- description.changes: 主要变更列表，每项是一个简要描述
- description.impact.files: 受影响的文件列表
- description.impact.features: 受影响的功能列表
- description.tests: 测试说明列表
- 内容简要，结构清晰`;
}
