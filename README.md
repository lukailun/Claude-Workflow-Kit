# Claude Code 配置

这是项目的 Claude Code 配置目录，包含了自定义的命令、hooks 和提示词模板。

## 前置要求

本项目使用 [Bun](https://bun.sh) 作为运行时和包管理器。

如果你还没有安装 Bun，请运行以下命令：

```bash
curl -fsSL https://bun.sh/install | bash
```

## 目录结构

```
.claude/
├── commands/          # Slash Commands 定义
├── hooks/             # UserPromptSubmit Hook 实现
├── references/        # 提示词模板
├── docs/              # 文档
├── settings.json      # Claude Code 设置
└── README.md          # 本文件
```

## 功能文档

### [Slash Commands](./docs/Commands.md)

通过 `/command` 快速调用预定义的提示词模板。

支持的命令包括：
- **翻译类**: `/zh`, `/en`
- **代码类**: `/code`, `/comment`, `/debug`, `/refactor`, `/test`, `/review`, `/cleancode`
- **文档类**: `/document`
- **分析类**: `/analyze`, `/explain`, `/summarize`
- **规划类**: `/plan`
- **优化类**: `/improve`
- **工具类**: `/repomix`

[查看完整命令列表和使用说明 →](./docs/Commands.md)

### [UserPromptSubmit Hook](./docs/UserPromptSubmit.md)

增强提示词功能，支持：

1. **命令快捷方式** - 使用 `:command` 格式快速展开提示词
2. **Linear 集成** - 自动获取 Linear issue 详细信息
3. **多方案生成** - 使用 `v(n)` 生成多个解决方案

[查看 UserPromptSubmit 完整配置和使用说明 →](./docs/UserPromptSubmit.md)

## 快速开始

### 1. 安装依赖

```bash
cd .claude
bun install
```

### 2. 配置环境变量

```bash
cp .env.template .env
# 编辑 .env 文件，填入你的 LINEAR_API_KEY
```

### 3. 开始使用

配置完成后，所有功能即可使用：

- 输入 `/` 查看可用的 Slash Commands
- 在提示词末尾使用 `:command` 快捷方式
- 使用 `linear(issue-id)` 或 `team(number)` 引用 Linear issue
- 使用 `v(n)` 生成多个方案

## 自定义配置

### 添加自定义命令

在 `commands/` 目录下创建新的 `.md` 文件：

```markdown
---
argument-hint: [参数提示]
---

你的提示词模板
```

### 修改 Hook 行为

编辑 `hooks/processors/` 目录下的处理器文件来自定义行为。

## 贡献

欢迎提交 Issue 和 Pull Request 来改进这些配置和功能。

## 相关链接

- [Claude Code 官方文档](https://claude.com/claude-code)
- [Linear API 文档](https://linear.app/developers/graphql)
- [Bun 官方文档](https://bun.sh/docs)
