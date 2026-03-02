# Claude Workflow Kit

一个强大的 Claude Code 工作流工具包，通过自定义 Hooks 和 Skills 扩展 Claude Code 的功能，提升开发效率。

## 特性

- **智能 Hooks** - 自动处理 Linear issue 引用、多方案生成等
- **丰富的 Skills** - 提供 Git 状态、文件写入、Linear 集成等实用技能
- **安全控制** - PreToolUse Hook 限制敏感命令执行
- **开箱即用** - 基于 Bun 运行时，配置简单

## 前置要求

本项目使用 [Bun](https://bun.sh) 作为运行时和包管理器。

如果你还没有安装 Bun，请运行以下命令：

```bash
curl -fsSL https://bun.sh/install | bash
```

## 快速开始

### 1. 安装依赖

```bash
bun install
```

### 2. 配置环境变量

```bash
cp .env.template .env
# 编辑 .env 文件，填入你的配置信息
```

环境变量说明：
- `LINEAR_API_KEY` - Linear API 密钥（可选，用于 Linear 集成功能）
- `LINEAR_USER_EMAIL` - Linear 用户邮箱（可选）
- `ANTHROPIC_BASE_URL` - Anthropic API 基础 URL（可选）
- `ANTHROPIC_AUTH_TOKEN` - Anthropic 认证令牌（可选）

### 3. 开始使用

配置完成后，所有功能即可在 Claude Code 中使用。

## 项目结构

```
Claude-Workflow-Kit/
├── hooks/                    # Hooks 实现
│   ├── PreToolUse.ts        # 工具使用前的安全检查
│   ├── UserPromptSubmit.ts  # 用户提示词提交处理
│   ├── processors/          # 处理器模块
│   │   ├── linearProcessor.ts    # Linear issue 引用处理
│   │   └── variationProcessor.ts # 多方案生成处理
│   └── config/              # 配置文件
├── skills/                   # Skills 定义
│   ├── file-write/          # 文件写入技能
│   ├── git-status/          # Git 状态技能
│   ├── linear-todo-issues/  # Linear 工单技能
│   ├── timestamp/           # 时间戳技能
│   ├── create-merge-request/# 创建 MR 技能
│   ├── get-merge-requests/  # 获取 MR 技能
│   └── good-morning/        # 早安技能
├── prompts/                  # 提示词模板
├── docs/                     # 文档
├── settings.json            # Claude Code 设置
├── package.json             # 项目配置
└── README.md                # 本文件
```

## 核心功能

### Hooks

#### PreToolUse Hook

在工具执行前进行安全检查，防止敏感操作：

- 拦截所有引用 `.env` 文件的命令
- 仅允许执行 `bun run .claude/skills/*/scripts/*` 格式的脚本
- 保护项目安全

#### UserPromptSubmit Hook

增强用户提示词功能，支持：

**1. Linear 集成**

快速引用 Linear issue 数据：

```
修复 linear(4t-1111) 中描述的 bug
优化 4t(1111) 的性能问题
```

自动将 issue ID 替换为完整的 issue 信息（标题、描述、状态等）。

**2. 多方案生成**

生成多个不同的解决方案：

```
实现用户认证 v(3)
```

会生成 3 个不同的实现方案供选择。

[查看 UserPromptSubmit 完整文档 →](./docs/UserPromptSubmit.md)

### Skills

#### file-write

将内容写入指定文件，自动创建目录结构。

```bash
bun run .claude/skills/file-write/scripts/file-write.ts <file_path> <content>
```

#### git-status

生成 Git 状态摘要文件，包含当前分支、未跟踪文件、已暂存文件等信息。

#### linear-todo-issues

从 Linear 获取指定用户的工单并生成摘要文件。

#### timestamp

生成标准格式的时间戳，用于文件命名等场景。

#### create-merge-request

创建 GitLab Merge Request。

#### get-merge-requests

获取 GitLab Merge Request 列表和详情。

#### good-morning

早安技能，快速查看今日待办事项。

## 配置说明

### settings.json

项目的 Claude Code 配置文件，包含：

- **permissions** - 权限控制，允许/拒绝特定工具使用
- **statusLine** - 状态栏配置
- **hooks** - Hooks 配置

### 添加自定义 Skill

1. 在 `skills/` 目录下创建新的技能目录
2. 创建 `SKILL.md` 文件定义技能元数据
3. 在 `scripts/` 目录下实现技能逻辑
4. 在 `settings.json` 中添加权限配置

## 开发指南

### 技术栈

- **运行时**: Bun
- **语言**: TypeScript
- **SDK**: @anthropic-ai/claude-agent-sdk
- **集成**: Linear API, GitLab API

### 本地开发

```bash
# 安装依赖
bun install

# 运行测试
bun test

# 执行脚本
bun run <script-path>
```

## 贡献

欢迎提交 Issue 和 Pull Request 来改进这个工具包。

## 相关链接

- [Claude Code 官方文档](https://claude.com/claude-code)
- [Claude Agent SDK](https://github.com/anthropics/anthropic-sdk-typescript)
- [Linear API 文档](https://linear.app/developers/graphql)
- [Bun 官方文档](https://bun.sh/docs)

## 许可证

MIT
