# 迁移指南：Bun Workspaces Monorepo

## 概览

已将单包项目拆分为 13 个包的 monorepo，采用 Bun Workspaces 工程化方案。

```
@lukailun/dev-kit                (core)              ← 无内部依赖
@lukailun/dev-kit-gitlab         ← core
@lukailun/dev-kit-github         ← core
@lukailun/dev-kit-linear         ← core
@lukailun/dev-kit-sentry         ← core
@lukailun/dev-kit-figma          ← core
@lukailun/dev-kit-openrouter     ← core
@lukailun/dev-kit-language-models ← core, openrouter
@lukailun/dev-kit-claudecode     ← core
@lukailun/dev-kit-codex          ← core
@lukailun/dev-kit-review         ← core, gitlab, linear
@lukailun/dev-kit-workflow       ← core, gitlab, linear, openrouter, language-models, claudecode, codex
@lukailun/dev-kit-cli            ← workflow, review
```

依赖图：

```
                    ┌─────────────┐
                    │     cli     │
                    └──────┬──────┘
                           │
                    ┌──────┴──────┐
                    ▼             ▼
              ┌──────────┐ ┌──────────┐
              │ workflow │ │  review  │
              └────┬─────┘ └────┬─────┘
                   │            │
         ┌─────────┼────────────┼─────────┐
         ▼         ▼            ▼         ▼
    ┌────────┐ ┌────────┐ ┌────────┐ ┌──────────┐
    │ gitlab │ │ github │ │ linear │ │language- │
    └───┬────┘ └───┬────┘ └───┬────┘ │ models   │
        │          │          │       └────┬─────┘
        ▼          ▼          ▼       ┌────┴────┐
    ┌──────────────────────────────┐  │openrouter│
    │              core            │  └────┬────┘
    └──────────────────────────────┘       │
                    ▲                      │
                    └──────────────────────┘
    独立叶子包（仅依赖 core）:
    sentry, figma, claudecode, codex
```

## 已完成的改造

### 1. 目录结构

- `claude/` → `packages/core/`、`packages/gitlab/`、`packages/workflow/` 等 13 个包
- 每个包有独立的 `package.json`、`tsconfig.json`、`src/index.ts`

### 2. 根配置

- `package.json` — Bun Workspaces 配置，聚合所有 npm scripts
- `tsconfig.base.json` — 共享 TypeScript 基础配置
- `eslint.config.js` — 统一 ESLint 规则
- `.env.template` — 环境变量模板

### 3. Import 路径

268 个 `@/` import 已重写为跨包引用：

| 旧路径 | 新路径 |
|--------|--------|
| `@/env/get-gitlab-from-env` | `@lukailun/dev-kit/env/get-gitlab-from-env` |
| `@/gitlab/gitlab-client` | `@lukailun/dev-kit-gitlab/gitlab-client` |
| `@/linear/get-linear-issues` | `@lukailun/dev-kit-linear/get-linear-issues` |
| `@/language-models/anthropic-language-model` | `@lukailun/dev-kit-language-models/anthropic-language-model` |

同包内 import 保持 `@/` 前缀不变。

### 4. 新增配置系统（TODO）

`packages/core/src/config/` 提供分层配置：

- **用户级**: `~/.dev-kit/config.json`、`~/.dev-kit/.env`
- **项目级**: `<repo>/.dev-kit/config.json`、`<repo>/.env.local`
- **环境变量诊断**: 检测来源、脱敏显示、警告提示

## 后续可选

- 实现 `packages/sentry/` Sentry 集成
- 实现 `packages/figma/` Figma 集成
- 添加 `packages/web/` 作为 Web 控制台入口
- 为每个包添加独立的 ESLint 配置
- 添加 Turborepo 优化构建缓存
