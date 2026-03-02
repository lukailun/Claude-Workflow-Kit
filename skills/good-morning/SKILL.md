---
name: good-morning
description: 当用户说 "Good morning" 时，运行此技能，开启新的一天
allowed-tools:
  - Skill(timestamp)
  - Skill(linear-todo-issues)
  - Skill(get-merge-requests)
  - AskUserQuestion
  - EnterPlanMode
requirements:
  - timestamp
  - get-merge-requests
  - linear-todo-issues
---

# 早安

开启新的一天，检查待办事项和代码审查。

## 执行步骤

1. 使用 `linear-todo-issues` SKILL 获取 Linear 待办事项
   - 这会自动生成一个摘要文件在 `.claude/summaries/linear-todo-issues/{timestamp}.md`

2. 使用 `get-merge-requests` SKILL 获取合并请求

3. 运行 triage 脚本生成结构化摘要

   **使用方法:**
   ```bash
   bun run .claude/skills/good-morning/scripts/triage.ts <linear-summary-path> "<merge-request-summary-output>"
   ```

   **参数:**
   - `linear-summary-path`: Linear 摘要文件路径（从步骤 1 获取）
   - `merge-request-summary-output`: 合并请求摘要输出（从步骤 2 获取）

4. 使用 `AskUserQuestion` 帮助用户选择优先级
   - 询问主要关注领域（Milestone、Boss feedback、Code review、Infrastructure）
   - 询问紧急问题

5. 根据用户选择，使用 `EnterPlanMode` 协助用户开始工作