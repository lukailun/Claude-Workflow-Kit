---
name: read-console
description: 读取最近产生的 console 日志，支持关键词筛选，查看 logs 文件夹信息
allowed-tools:
  - Bash(bun run .claude/skills/read-console/scripts/read-console.ts:*)
  - Bash(bun run .claude/skills/read-console/scripts/read-console-info.ts:*)
---

## Console 日志阅读

读取开发环境下产生的 console 日志文件，从最新的日志开始显示（从下往上阅读）。支持按关键词筛选日志，并可查看 logs 文件夹的详细信息。

## 执行步骤

### 1. 读取日志内容

   **使用方法:**
   ```bash
   bun run .claude/skills/read-console/scripts/read-console.ts [lines] [keyword]
   ```

   **参数:**
   - `lines` (可选): 要读取的行数，默认为 100 行
   - `keyword` (可选): 筛选关键词，只显示包含该关键词的日志

   **示例:**
   ```bash
   # 读取最近 100 行日志（默认）
   bun run .claude/skills/read-console/scripts/read-console.ts

   # 读取最近 200 行日志
   bun run .claude/skills/read-console/scripts/read-console.ts 200

   # 读取最近 100 行包含 [app] 关键词的日志
   bun run .claude/skills/read-console/scripts/read-console.ts 100 "[app]"

   # 读取最近 50 行包含 ERROR 关键词的日志
   bun run .claude/skills/read-console/scripts/read-console.ts 50 "ERROR"
   ```

### 2. 查看 logs 文件夹信息

   **使用方法:**
   ```bash
   bun run .claude/skills/read-console/scripts/read-console-info.ts
   ```

   **功能:**
   - 显示 logs 文件夹的总大小和文件数量
   - 列出所有日志文件及其大小
   - 显示每个文件的修改时间
   - 按日期排序显示（最新的在前面）

   **示例:**
   ```bash
   bun run .claude/skills/read-console/scripts/read-console-info.ts
   ```

## 说明

- 日志文件存储在 `logs/dev-YYYY-MM-DD.log` 格式中
- 脚本会自动找到最新的日志文件
- 日志按时间倒序显示（最新的在最前面）
- 关键词筛选是大小写敏感的，会匹配日志行中任何位置的关键词
- 使用 `read-console-info.ts` 可以查看所有日志文件的详细信息，方便监控磁盘占用
