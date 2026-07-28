/**
 * Claude MR 代码审查脚本 — Prompt 构建
 *
 * 负责构建发送给 Claude 的 prompt。
 * 每次只传入一条规则，AI 只检查该规则是否被违反。
 */

/**
 * 构建审查 prompt（单条规则）
 * @param diffText 代码 diff
 * @param ruleContent 单条规则的完整内容（Markdown）
 */
export function getReviewPrompt(diffText: string, ruleContent: string) {
  const instruction = `审查合并请求的代码变更，判断是否违反给定的规则，生成违规项的 JSON 输出。

## 审查规则

严格检查此规则：

\`\`\`markdown
${ruleContent}
\`\`\`

## 代码变更

每行前面的数字是新文件中的行号（如 \`   3 | +import ...\` 表示第 3 行）。
\`  -  |\` 开头的是被删除的行，不占新文件行号。

## JSON 结构
{
  "violations": [
    {
      "path": "文件路径（与代码变更中的路径一致）",
      "line": "行号（新文件中的行号，整数）",
      "rule": "规则编号",
      "severity": "严重等级",
      "body": "问题描述和修复建议（Markdown 格式）"
    }
  ]
}

## 要求：
- 如果没有发现任何违规，返回 {"violations": []}
- 只有非常确信代码违反给定规则时才报告。如果你需要假设某种极端情况才能构成违规，那就不算违规
- 如果在分析后得出“当前代码不违反该规则”的结论，就不要将该问题放入 violations 数组
- 规则有明确的适用场景，如果代码模式不属于规则描述的场景，不要报告
- 不要因为存在类型抑制注释就报告问题，除非该注释直接导致了规则中描述的具体违规
- 误报会浪费开发者时间并降低审查工具的可信度，不确定就不报告
- 如果没有违规，violations 数组必须为空`;

  const prompt = diffText;

  return {
    instruction,
    prompt,
  };
}
