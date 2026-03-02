---
name: get-merge-requests
description: 获取 GitLab 合并请求信息并生成摘要文件
allowed-tools:
  - Skill(timestamp)
  - Skill(file-write)
  - Bash(bun run .claude/skills/get-merge-requests/scripts/get-merge-requests.ts)
  - Bash(bun run .claude/skills/get-merge-requests/scripts/get-merge-request-details.ts:*)
  - AskUserQuestion
requirements:
  - timestamp
  - file-write
---

## GitLab 合并请求

获取 GitLab 合并请求信息并生成摘要文件。

## 要求

1. 必须使用 timestamp SKILL 来生成时间戳
2. 必须使用 file-write SKILL 来写入文件
3. 必须使用 AskUserQuestion 来选择合并请求
4. 需要安装并配置 glab CLI 工具

## 执行步骤

1. 使用 timestamp SKILL 生成时间戳

2. 运行 get-merge-requests 脚本获取所有打开的合并请求列表

   **使用方法:**
   ```bash
   bun run .claude/skills/get-merge-requests/scripts/get-merge-requests.ts
   ```

3. 使用 AskUserQuestion Tool 让用户从步骤 2 中获取到的所有合并请求列表中选择

4. 运行 get-merge-request-details 脚本获取选择的合并请求的详细信息

   **使用方法:**
   ```bash
   bun run .claude/skills/get-merge-requests/scripts/get-merge-request-details.ts <merge-request-id>
   ```

   **参数:**
   - `merge-request-id`: 合并请求的 ID（例如：123）

   **示例:**
   ```bash
   bun run .claude/skills/get-merge-requests/scripts/get-merge-request-details.ts 123
   ```

5. 使用 file-write SKILL 将合并请求信息写入文件

   **文件路径:**
   ```
   .claude/summaries/merge-requests/{timestamp}.md
   ```

   其中 `{timestamp}` 是步骤 1 中生成的时间戳
