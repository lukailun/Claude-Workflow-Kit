---
name: timestamp
description: 为文件、目录和其他资源创建时间戳，格式为 `YYYY-MM-DD-HH-MM-SS`
allowed-tools: Bash(bun run .claude/skills/timestamp/scripts/timestamp.ts)
---

## 时间戳

创建格式为 `YYYY-MM-DD-HH-MM-SS` 的时间戳。

## 执行步骤

1. 运行 timestamp 脚本获取时间戳

   **使用方法:**
   ```bash
   bun run .claude/skills/timestamp/scripts/timestamp.ts
   ```