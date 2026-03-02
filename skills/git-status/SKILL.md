---
name: git-status
description: 生成 Git 状态摘要文件，包含当前分支、未跟踪文件、已暂存文件和未暂存文件信息
allowed-tools:
  - Skill(timestamp)
  - Skill(file-write)
  - Bash(bun run .claude/skills/git-status/scripts/git-status.ts:*)
requirements:
  - timestamp
  - file-write
---

## Git 状态

生成一个包含当前 Git 状态的摘要文件。

## 要求

1. 必须使用 timestamp SKILL 来生成时间戳
2. 必须使用 file-write SKILL 来写入文件

## 执行步骤

1. 使用 timestamp SKILL 生成时间戳

2. 使用生成的时间戳运行 git-status 脚本获取 Git 状态信息

   **使用方法:**
   ```bash
   bun run .claude/skills/git-status/scripts/git-status.ts <timestamp>
   ```

   **参数:**
   - `timestamp`: 通过 timestamp SKILL 生成的时间戳

   **示例:**
   ```bash
   bun run .claude/skills/git-status/scripts/git-status.ts 2026-02-28-10-00-00
   ```

3. 使用 file-write SKILL 将状态信息写入文件

   **文件路径:**
   ```
   .claude/summaries/git-status/{timestamp}.md
   ```

   其中 `{timestamp}` 是步骤 1 中生成的时间戳