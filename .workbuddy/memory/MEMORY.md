# Claude Workflow Kit - 项目记忆

## 架构

- Monorepo: pnpm catalogs + Turborepo 2.x + changesets
- 10 个包: shared → ai/openrouter/gitlab/github/linear → usage/review → workflow → cli
- 运行时: Node.js >= 22（从 Bun 迁移）
- 包导出: 源码级 `exports`（`./src/index.ts`），无构建步骤
- 跨包类型解析: `tsconfig.base.json` 中 `paths` 映射 `@cwkit/*` → `./packages/*/src/*`
- 同包内导入: 使用相对路径（非 `@/` 别名）
- ESLint: 从 root 直接运行，不走 turbo

## 关键文件

- `pnpm-workspace.yaml`: catalog 版本 + `onlyBuiltDependencies` 构建白名单
- `tsconfig.base.json`: 所有 `@cwkit/*` paths 映射
- `turbo.json`: build/typecheck/test 任务
- `eslint.config.js`: root 级 ESLint flat config

## 环境变量系统

- 分层加载: Shell export > 项目级 `.claude/.env` > 用户级 `~/.cwkit/.env`
- 用户级: 个人凭据（API keys、tokens），跨项目共享
- 项目级: 项目配置（base URLs、project IDs），因项目而异
- 核心文件: `packages/shared/src/env/env-manager.ts`（加载/保存/解析）
- 常量定义: `packages/shared/src/env/env-constants.ts`（USER_ENV_KEYS / PROJECT_ENV_KEYS）
- 目录结构: `packages/shared/src/env/home-dir.ts`（~/.cwkit/ 定义）
- 加载入口: `packages/shared/src/env/env-path.ts`（模块加载时自动执行 loadEnv）

## CLI

- 统一入口: `cwkit` 命令（`packages/cli/`）
- bin 包装器: `packages/cli/bin/cwkit.js` 使用 `--import tsx` 子进程运行 TS 入口
- 命令: feature/feat, experimental/exp, hotfix, release, commit, mr, submit, publish-release, publish-hotfix, receipt, yolo, config list/init
- 根 package.json 的 scripts 委托到 `pnpm cwkit <command>`

## 注意事项

- `@openrouter/sdk` 0.13.67: `client.models.list()` 返回 `PageIterator`，数据路径 `response.result.data`
- pnpm v11 不再读 `package.json` 的 `pnpm` 字段，配置在 `pnpm-workspace.yaml`
- `declaration: true` 在 `noEmit: true` 下会触发 TS2742，不应启用
- tsx v4+ 不支持 `register()` API，必须用 `--import tsx` 方式加载
