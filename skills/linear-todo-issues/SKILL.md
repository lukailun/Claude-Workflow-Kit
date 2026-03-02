---
name: linear-todo-issues
description: 从 Linear 中获取指定用户的工单并生成摘要文件
allowed-tools:
  - Skill(timestamp)
  - Skill(file-write)
  - Bash(bun run .claude/skills/linear-todo-issues/scripts/get-linear-api-key-from-env.ts)
  - Bash(bun run .claude/skills/linear-todo-issues/scripts/get-linear-user-email-from-env.ts)
  - Bash(bun run .claude/skills/linear-todo-issues/scripts/get-linear-users.ts:*)
  - Bash(bun run .claude/skills/linear-todo-issues/scripts/get-linear-todo-issues.ts:*)
  - AskUserQuestion
requirements:
  - timestamp
  - file-write
---

## Linear 工单

从 Linear 获取指定用户的工单并生成摘要文件。

## 要求

1. 必须使用 timestamp SKILL 来生成时间戳
2. 如果未配置 LINEAR_USER 环境变量，必须使用 AskUserQuestion 来选择用户
3. 必须使用 file-write SKILL 来写入文件

## 执行步骤

1. 使用 timestamp SKILL 生成时间戳

2. 运行 get-linear-api-key-from-env 脚本获取配置文件中的 Api Key

   **使用方法:**
   ```bash
   bun run .claude/skills/linear-todo-issues/scripts/get-linear-api-key-from-env.ts
   ```

3. 运行 get-linear-user-email-from-env 脚本获取配置文件中的默认用户邮箱

   **使用方法:**
   ```bash
   bun run .claude/skills/linear-todo-issues/scripts/get-linear-user-email-from-env.ts
   ```

4. 运行 get-linear-users 脚本获取所有用户

   **使用方法:**
   ```bash
   bun run .claude/skills/linear-todo-issues/scripts/get-linear-users.ts <apiKey>
   ```
  
   **参数:**
   - `apiKey`: 通过 get-linear-api-key-from-env 脚本获取到的 Api Key

5. 如果获取到配置文件中的用户邮箱，直接执行步骤 7；如果未获取到配置文件中的用户，执行步骤 6

6. 使用 AskUserQuestion Tool 让用户从步骤 4 中获取到的所有用户列表中选择用户

7. 使用生成的时间戳运行 get-linear-todo-issues 脚本获取 Linear 工单信息

   **使用方法:**
   ```bash
   bun run .claude/skills/linear-todo-issues/scripts/get-linear-todo-issues.ts <apiKey> <timestamp> <userEmail>
   ```

   **参数:**
   - `apiKey`: 通过 get-linear-api-key-from-env 脚本获取到的 Api Key
   - `timestamp`: 通过 timestamp SKILL 生成的时间戳
   - `userEmail`: 通过配置文件或 AskUserQuestion Tool 获取到的用户邮箱

   **示例:**
   ```bash
   bun run .claude/skills/linear-todo-issues/scripts/get-linear-todo-issues.ts 2026-02-28-10-00-00 user1
   ```

8. 使用 file-write SKILL 将状态信息写入文件

   **文件路径:**
   ```
   .claude/summaries/linear-todo-issues/{timestamp}.md
   ```

   其中 `{timestamp}` 是步骤 1 中生成的时间戳