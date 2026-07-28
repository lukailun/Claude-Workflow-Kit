# Claude Workflow Kit - 项目记忆

## 架构

- Monorepo: pnpm catalogs + Turborepo 2.x + changesets
- 9 个包: shared → ai/openrouter/gitlab/github/linear → usage/review → workflow
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

## 注意事项

- `@openrouter/sdk` 0.13.67: `client.models.list()` 返回 `PageIterator`，数据路径 `response.result.data`
- pnpm v11 不再读 `package.json` 的 `pnpm` 字段，配置在 `pnpm-workspace.yaml`
- `declaration: true` 在 `noEmit: true` 下会触发 TS2742，不应启用
