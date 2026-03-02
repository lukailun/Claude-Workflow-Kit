# PreToolUse Hook

## 概述

PreToolUse Hook 是一个在工具执行前触发的拦截器，用于控制和限制 Bash 命令的执行范围，确保系统安全性。

## 功能

该 Hook 主要实现以下安全策略：

### 1. 限制 Bash 命令执行范围

仅允许执行来自 `.claude/skills/*/scripts/` 目录的脚本，其他 Bash 命令将被拦截。

**允许的命令格式：**
```bash
bun run .claude/skills/[skill-name]/scripts/[script-name].ts
```

### 2. 禁止访问 .env 文件

任何包含 `.env` 引用的命令都会被自动拦截，防止敏感环境变量泄露。

### 3. 允许非 Bash 工具

所有非 Bash 工具（如 Read、Write、Edit 等）不受限制，可以正常使用。

## 实现逻辑

```typescript
if (input.tool_name === 'Bash') {
  const toolInput = input.tool_input as BashToolInput;
  const command = toolInput.command;

  // 拦截所有引用 .env 文件的命令
  if (command.includes('.env')) {
    process.exit(2); // 拦截命令
  }

  // 检查命令是否匹配允许的格式
  const allowedPattern = /^bun\s+run\s+\.claude\/skills\/[^/]+\/scripts\//;

  if (allowedPattern.test(command)) {
    process.exit(0); // 允许执行
  } else {
    process.exit(2); // 拦截命令
  }
}

// 允许执行所有非 Bash 工具
process.exit(0);
```

## 返回码说明

- `process.exit(0)` - 允许工具执行
- `process.exit(2)` - 拦截工具执行（Claude 会收到拦截信息）

## 使用示例

### ✅ 允许的命令

```bash
# 执行 skills 目录下的脚本
bun run .claude/skills/linear-bot/scripts/query-issue.ts

bun run .claude/skills/timestamp/scripts/create-timestamp.ts
```

### ❌ 被拦截的命令

```bash
# 直接执行系统命令
ls -la

# 读取 .env 文件
cat .env

# 执行非 skills 目录的脚本
bun run scripts/build.ts

# 包含 .env 的任何命令
grep "API_KEY" .env
```

## 配置文件

PreToolUse Hook 在 `.claude/settings.json` 中配置：

```json
{
  "hooks": {
    "preToolUse": ".claude/hooks/PreToolUse.ts"
  }
}
```

## 安全考虑

1. **环境变量保护**：通过拦截所有包含 `.env` 的命令，防止敏感信息泄露
2. **命令范围限制**：仅允许执行预定义的 skills 脚本，避免执行任意系统命令
3. **白名单机制**：采用白名单而非黑名单策略，默认拒绝所有未明确允许的命令

## 最佳实践

1. 所有需要执行的脚本应放在 `.claude/skills/[skill-name]/scripts/` 目录下
2. 脚本名称应具有描述性，清楚表明其功能
3. 如需执行新的 Bash 命令，应创建相应的 skill 和脚本文件
4. 避免在脚本中硬编码敏感信息，使用环境变量替代
