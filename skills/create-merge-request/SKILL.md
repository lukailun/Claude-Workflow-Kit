---
name: create-merge-request
description: 创建合并请求
allowed-tools:
  - Skill(timestamp)
  - Skill(file-write)
  - Bash(bun run .claude/skills/create-merge-request/scripts/create-merge-request.ts)
requirements:
  - timestamp
  - file-write
---

## 创建合并请求

自动创建 GitLab 合并请求,包含智能目标分支选择和 AI 生成的描述。

## 要求

1. 必须使用 timestamp SKILL 来生成时间戳
2. 必须使用 file-write SKILL 来写入文件
3. 需要安装并配置 glab CLI 工具
4. 需要配置 ANTHROPIC_BASE_URL 和 ANTHROPIC_AUTH_TOKEN 环境变量

## 执行步骤

1. 使用 timestamp SKILL 生成时间戳

2. 运行 create-merge-request 脚本创建合并请求

   **使用方法:**
   ```bash
   bun run .claude/skills/create-merge-request/scripts/create-merge-request.ts
   ```

   **功能:**
   - 自动确定目标分支（最新的 release/x.x.x 分支）
   - 比较当前分支与目标分支的代码改动
   - 使用 AI 生成合并请求的标题和描述
   - 使用 glab CLI 创建合并请求

   **环境变量要求:**
   - `ANTHROPIC_BASE_URL`: Anthropic API 的 base URL
   - `ANTHROPIC_AUTH_TOKEN`: Anthropic API 的认证 token

3. 使用 file-write SKILL 将 MR 信息写入文件

   **文件路径:**
   ```
   .claude/summaries/create-merge-request/{timestamp}.md
   ```

   其中 `{timestamp}` 是步骤 1 中生成的时间戳

## 注意事项

- 确保当前分支的改动已经提交
- 确保 glab 已经配置好 GitLab 访问权限
- 脚本会自动生成合并请求的标题和描述,无需手动输入
