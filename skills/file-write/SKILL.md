---
name: file-write
description: 将内容写入指定文件，自动创建目录结构
allowed-tools: Bash(bun run .claude/skills/file-write/scripts/file-write.ts:*)
---

## 文件写入

将内容写入指定文件，如果目录不存在会自动创建。

## 执行步骤

1. 运行 file-write 脚本写入文件

   **使用方法:**
   ```bash
   bun run .claude/skills/file-write/scripts/file-write.ts <file_path> <content>
   ```

   **参数:**
   - `file_path`: 要写入的文件路径（相对或绝对路径）
   - `content`: 要写入的内容

   **示例:**
   ```bash
   bun run .claude/skills/file-write/scripts/file-write.ts "summaries/linear/2024-01-01.md" "# 标题\n\n内容"
   ```