export function getCommitMessagePrompt(params: {
  diffStat: string;
  diffContent: string;
  branchName: string;
}) {
  return `请根据以下 Git 改动信息，生成一个符合约定式提交规范的 commit message。

当前分支: ${params.branchName}

文件改动:
${params.diffStat}

改动详情:
${params.diffContent}

要求：
- 使用约定式提交格式：type: description
- type 可选：feat / fix / docs / style / refactor / test / chore / perf
- description 使用中文，简洁明了
- 不超过 72 字符
- 直接返回 commit message 文本，不要包含其他内容，不要用代码块包裹`;
}
