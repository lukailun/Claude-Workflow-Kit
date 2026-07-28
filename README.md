# Claude Workflow Kit

一个面向 GitLab/GitHub 团队的 Git 工作流自动化工具包，提供 AI 驱动的 commit message 生成、Merge Request 创建、代码审查以及完整的分支发布生命周期管理。

## 技术栈

- 运行时: [Node.js](https://nodejs.org/) >= 22
- 包管理: [pnpm](https://pnpm.io/) + [catalogs](https://pnpm.io/catalogs) 统一版本
- 构建编排: [Turborepo](https://turbo.build/) 2.x
- 版本管理: [Changesets](https://github.com/changesets/changesets)
- 语言: [TypeScript](https://www.typescriptlang.org/) (ESM)

## Monorepo 结构

```
packages/
  shared/       # 共享工具：环境变量、Git 操作、shell 工具、重试等
  ai/           # AI Provider 抽象层（Anthropic、DeepSeek、Gemini、GLM 等）
  openrouter/   # OpenRouter SDK 集成、模型定价
  gitlab/       # GitLab API 客户端、分支管理、MR 操作
  github/       # GitHub API 客户端
  linear/       # Linear 集成
  usage/        # Claude Code / Codex token 用量统计
  review/       # AI 代码审查系统
  workflow/     # 工作流入口：分支管理、提交、MR、发布
```

## 快速开始

### 1. 安装依赖

```bash
pnpm install
```

### 2. 配置环境变量

```bash
cp .env.template .env
```

编辑 `.env`，填入你的 API 密钥和平台地址。详见 [环境变量](#环境变量)。

### 3. 开始使用

```bash
# 创建 feature 分支（可从 Linear issue 中选择）
pnpm feature my-feature

# 提交并推送（AI 自动生成 commit message）
pnpm commit

# 创建 Merge Request（AI 自动生成标题和描述）
pnpm mr
```

## 可用命令

所有命令在根目录执行，使用 `pnpm <command>`。

### 分支管理

| 命令 | 说明 |
|------|------|
| `pnpm feature <name>` | 创建 feature 分支，支持从 Linear 选择 issue |
| `pnpm release` | 创建 release 分支，自动建议版本号 |
| `pnpm hotfix` | 创建 hotfix 分支，自动建议补丁版本号 |
| `pnpm experimental <name>` | 创建 experimental 分支 |

### 代码提交

| 命令 | 说明 |
|------|------|
| `pnpm commit` | AI 生成 commit message，交互式确认后推送 |
| `pnpm submit` | 一键完成 commit + push + 创建 MR |

### Merge Request

| 命令 | 说明 |
|------|------|
| `pnpm mr` | AI 生成 MR 标题和描述，自动创建或更新 |

### 发布

| 命令 | 说明 |
|------|------|
| `pnpm publish-release` | 发布 release 到 main，创建 tag，清理远程分支 |
| `pnpm publish-hotfix` | 发布 hotfix 到 main，并同步回最新 release 分支 |

### Token 用量报告

| 命令 | 说明 |
|------|------|
| `pnpm receipt` | 生成当前分支的 Claude Code / Codex Token 用量及费用报告 |

### 开发工具

```bash
pnpm typecheck       # TypeScript 类型检查（全部 9 个包）
pnpm lint            # ESLint 检查
pnpm lint:fix        # ESLint 自动修复
pnpm test            # 运行测试
pnpm changeset       # 创建 changeset
pnpm version         # 应用 changeset，更新版本号
```

## AI 功能

### 支持的 AI Provider

通过 `--ai` 参数指定使用的 AI 服务，默认为 `mimo`：

```bash
pnpm commit -- --ai anthropic
pnpm mr -- --ai deepseek
```

| Provider | 标识 | 默认模型 |
|----------|------|----------|
| Anthropic Claude | `claude` | `claude-sonnet-4-6` |
| DeepSeek | `deepseek` | — |
| Google Gemini | `gemini` | — |
| 智谱 GLM | `glm` | — |
| 腾讯 HY | `hy` | — |
| LongCat | `longcat` | — |
| 小米 Mimo | `mimo` | `mimo-v2.5` |
| MiniMax | `minimax` | — |
| 阿里通义千问 | `qwen` | — |
| OpenRouter | `openrouter` | — |

### AI 应用场景

- **Commit Message 生成**: 分析 `git diff`，生成符合 Conventional Commits 规范的提交信息
- **Merge Request 生成**: 分析分支差异，生成包含概览、变更说明、影响分析、测试说明的 MR 描述
- **代码审查**: 基于可配置的编码规则，对 MR diff 进行 AI 审查并行评论（详见 `packages/review/`）
- **结构化输出**: 使用 Zod schema 确保 AI 输出格式可靠，内置重试机制

## 分支命名规范

| 分支类型 | 格式 | 示例 |
|----------|------|------|
| feature | `feature/<name>` | `feature/user-login` |
| release | `release/<version>` | `release/1.2.0` |
| hotfix | `hotfix/<version>` | `hotfix/1.2.1` |
| experimental | `experimental/<name>` | `experimental/new-ui` |

## 环境变量

在项目根目录 `.env` 中配置（从 `.env.template` 复制）。

### 平台集成

| 变量名 | 用途 | 必需 |
|--------|------|------|
| `GITHUB_BASE_URL` | GitHub API 地址 | GitHub 功能 |
| `GITHUB_TOKEN` | GitHub 认证 Token | GitHub 功能 |
| `GITLAB_BASE_URL` | GitLab API 地址 | GitLab 功能 |
| `GITLAB_TOKEN` | GitLab 认证 Token | GitLab 功能 |
| `LINEAR_API_KEY` | Linear API 密钥 | Linear 集成 |
| `LINEAR_PROJECT_ID` | Linear 项目 ID | Linear 集成 |
| `SENTRY_API_KEY` | Sentry API 密钥 | Sentry 集成 |
| `SENTRY_BASE_URL` | Sentry 地址 | Sentry 集成 |
| `SENTRY_ORGANIZATION` | Sentry 组织名 | Sentry 集成 |
| `SENTRY_PROJECT` | Sentry 项目名 | Sentry 集成 |

### AI Provider

每个 Provider 需要配置 `*_BASE_URL` 和 `*_API_KEY`，未使用的可以删除或注释：

| Provider | 变量名 |
|----------|--------|
| Anthropic | `CLAUDE_BASE_URL`, `CLAUDE_API_KEY`, `CLAUDE_AUTH_TOKEN` |
| DeepSeek | `DEEPSEEK_BASE_URL`, `DEEPSEEK_API_KEY` |
| Gemini | `GEMINI_BASE_URL`, `GEMINI_API_KEY` |
| GLM | `GLM_BASE_URL`, `GLM_API_KEY` |
| HY | `HY_BASE_URL`, `HY_API_KEY` |
| LongCat | `LONGCAT_BASE_URL`, `LONGCAT_API_KEY` |
| Mimo | `MIMO_BASE_URL`, `MIMO_API_KEY` |
| MiniMax | `MINIMAX_BASE_URL`, `MINIMAX_API_KEY` |
| Qwen | `QWEN_BASE_URL`, `QWEN_API_KEY` |
| OpenRouter | `OPENROUTER_BASE_URL`, `OPENROUTER_API_KEY` |

## Linear 集成

工作流与 Linear 深度集成：

- **创建分支时**: 可从 Linear issue 列表中选择，自动更新 issue 状态为「开发中」
- **创建 MR 时**: 自动关联 Linear issue，更新 issue 状态为「代码审查中」
- **分支名解析**: 自动从分支名中提取 Linear issue ID（格式 `[A-Z]+-\d+`）

## 代码审查系统

`packages/review/` 提供基于 AI 的 MR 代码审查能力：

- 规则以 Markdown 文件定义，支持 error / warning 两个级别
- 每条规则独立运行 AI 审查，结果以评论形式发布到 MR
- 通过 GitLab emoji reaction 标记审查状态（👀 审查中 / 👍 通过 / 👎 存在问题）
- 可集成到 GitLab CI/CD pipeline 中自动运行

## 文档

| 文档 | 说明 |
|------|------|
| [Git 工作流](docs/workflow.md) | 分支管理、代码提交、合并请求、发布流程 |
| [AI 集成](docs/ai.md) | AI Provider 配置、结构化输出、Prompt 模板 |
| [AI 代码审查](docs/code-review.md) | 审查规则配置、CI/CD 集成、自定义规则 |
| [Linear 集成](docs/linear.md) | Issue 管理、状态流转、分支关联 |
| [环境变量配置](docs/environment.md) | 平台集成、AI Provider、CI 变量 |
