# Claude Workflow Kit

一个强大的 Claude Code 工作流工具包，通过自定义 Hooks 和 Scripts 扩展 Claude Code 的功能，提升开发效率。

## 特性

- **智能 Hooks** - 自动处理 Linear issue 引用
- **工作流脚本** - 提供 GitLab 创建新功能分支、创建合并请求等实用工作流
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
- `GITLAB_HOST` - GitLab 地址
- `GITLAB_TOKEN` - GitLab 访问令牌
- `LINEAR_API_KEY` - Linear API 密钥
- `ANTHROPIC_BASE_URL` - Anthropic API 基础 URL（可选）
- `ANTHROPIC_API_KEY` - Anthropic API 密钥（可选）
- `ANTHROPIC_AUTH_TOKEN` - Anthropic 认证令牌（可选）
- `ARK_CODING_PLAN_API_KEY` - 火山引擎 Ark API 密钥（可选）
- `MINI_MAX_API_KEY` - MiniMax API 密钥（可选）
- `Z_AI_API_KEY` - 智谱 Z.AI API 密钥（可选）

### 3. 开始使用

配置完成后，所有功能即可在 Claude Code 中使用。

## 项目结构

```
Claude-Workflow-Kit/
├── hooks/                          # Hooks 实现
│   ├── UserPromptSubmit.ts         # 用户提示词提交处理
│   └── processors/                 # 处理器模块
│       ├── linearProcessor.ts      # Linear issue 引用处理
├── scripts/                        # 工作流脚本
│   ├── ai/                         # AI 模型集成层
│   │   ├── generate-merge-request-content.ts
│   │   ├── get-ai-provider.ts
│   │   └── merge-request-prompts.ts
│   ├── anthropic/                  # Anthropic Claude 集成
│   ├── ark-coding-plan/            # 火山引擎字节跳动集成
│   ├── mini-max/                   # MiniMax 集成
│   ├── z-ai/                       # 智谱 Z.AI 集成
│   ├── gitlab/                     # GitLab API 集成
│   ├── linear/                     # Linear API 集成
│   ├── workflow/                   # 工作流
│   │   ├── create-feature-branch.ts
│   │   └── merge-request.ts
│   └── env/                        # 环境变量读取
├── docs/                           # 文档
│   └── UserPromptSubmit.md
├── settings.json                   # Claude Code 设置
├── package.json                    # 项目配置
├── .env.template                   # 环境变量模板
└── README.md                       # 本文件
```

## 核心功能

### Hooks

#### UserPromptSubmit Hook

增强用户提示词功能，支持：

**1. Linear 集成**

快速引用 Linear issue 数据：

```
修复 linear(4t-1111) 中描述的 bug
```

自动将 issue 引用替换为完整的 issue 信息（标题、描述、状态等）。

[查看 UserPromptSubmit 完整文档 →](./docs/UserPromptSubmit.md)

#### PreToolUse Hook

在工具执行前进行安全检查：

- 拦截所有引用 `.env` 文件的命令
- 仅允许执行 `.claude/skills/*/scripts/` 目录下的脚本
- 保护项目安全

[查看 PreToolUse 完整文档 →](./docs/PreToolUse.md)

### 工作流脚本

#### Feature 分支工作流（`scripts/workflow/create-feature-branch.ts`）

- 从 Linear 待办任务中选择或直接指定任务
- 自动创建 feature 分支
- 自动更新 Linear issue 状态为「进行中」

#### 合并请求工作流（`scripts/workflow/merge-request.ts`）

- 使用 AI 自动分析代码变更，生成 MR 标题和描述
- 支持 4 个 AI Provider：Anthropic Claude、火山引擎 Ark、MiniMax、智谱 Z.AI
- 自动关联相关 Linear issues
- 创建 GitLab Merge Request

#### GitLab 集成脚本（`scripts/gitlab/`）

- 创建各类分支（feature、hotfix、release、experimental）
- 获取 MR 列表、详情、目标分支
- 获取项目信息、当前分支、远端分支列表
- 获取分支对比和提交记录

#### Linear 集成脚本（`scripts/linear/`）

- 获取用户工单列表
- 获取 issue 详情
- 更新 issue 状态

## 配置说明

### settings.json

项目的 Claude Code 配置文件，包含：

- **permissions** - 权限控制，允许/拒绝特定工具使用
- **statusLine** - 状态栏配置（使用 claude-powerline）
- **hooks** - PreToolUse 和 UserPromptSubmit Hook 配置

### 添加自定义 Skill

1. 在 `.claude/skills/` 目录下创建新的技能目录
2. 创建 `SKILL.md` 文件定义技能元数据
3. 在 `scripts/` 目录下实现技能逻辑
4. 在 `settings.json` 中添加权限配置

## 开发指南

### 技术栈

- **运行时**: Bun
- **语言**: TypeScript
- **SDK**: @anthropic-ai/claude-agent-sdk、@anthropic-ai/sdk
- **集成**: Linear API (@linear/sdk)、GitLab API (@gitbeaker/rest)

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
