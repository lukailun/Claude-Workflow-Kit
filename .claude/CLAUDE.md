# CLAUDE.md — 项目配置

本文件是团队共享的 Claude Code 行为约定，所有成员使用 Claude Code 时自动生效。

---

## 语言约束

- 回复语言限定为：中文、英文

---

## 项目概览

**项目名称** — 通用项目模板

- 语言：TypeScript
- 代码仓库：GitLab

---

## 开发环境

### 包管理器

- **`.claude/` 脚本**：使用 `bun`，不要用 `node` 或 `ts-node`

### 常用命令

```bash
# 安装依赖
cd .claude && bun install

# 运行脚本
bun run .claude/scripts/workflow/create-feature.ts <branch-name>
bun run .claude/scripts/workflow/create-release.ts
bun run .claude/scripts/workflow/create-hotfix.ts
bun run .claude/scripts/workflow/commit-and-push.ts
bun run .claude/scripts/workflow/create-merge-request.ts
bun run .claude/scripts/workflow/submit.ts
```

---

## Claude Code 工作流

### 初始配置（首次使用必做）

1. 安装 bun（如未安装）：
   ```bash
   curl -fsSL https://bun.sh/install | bash
   ```

2. 安装 `.claude/` 依赖：
   ```bash
   cd .claude && bun install
   ```

3. 配置环境变量：
   ```bash
   cp .claude/.env.template .claude/.env
   # 编辑 .claude/.env，填入以下密钥
   ```

4. 安装 `glab` CLI（用于创建 MR）：
   ```bash
   brew install glab
   glab auth login
   ```

### 环境变量说明（`.claude/.env`）

| 变量名 | 用途 | 必需 |
|--------|------|------|
| `GITLAB_HOST` | GitLab 地址 | 是（MR 功能） |
| `GITLAB_TOKEN` | GitLab 认证 | 是（MR 功能） |
| `ANTHROPIC_BASE_URL` | Anthropic API 地址 | 可选  |
| `ANTHROPIC_API_KEY` | Anthropic 认证 | 可选 |
| `ANTHROPIC_AUTH_TOKEN` | Anthropic 认证 | 可选 |

---

## Git 工作流

### 分支结构

- **`main`** — 主分支，所有开发的基础，禁止直接提交
- **`release/*`** — 当期版本开发，来源：`main`，目标：合并回 `main`
- **`feature/*`** — 新功能，来源：`main`，目标：合并回 `main`
- **`hotfix/*`** — 紧急修复，来源：`main`，目标：`main`
- **`experimental/*`** — 实验探索，来源：`main`

### 分支创建规则

| 类型 | 来源 | 目标 | 命名示例 |
|------|------|------|---------|
| feature | `main` | `main` | `feature/ui-redesign` |
| release | `main` | `main` | `release/1.2.0` |
| hotfix | `main` | `main` | `hotfix/1.2.1` |
| experimental | `main` | 视情况 | `experimental/new-idea` |

### 提交规范

使用约定式提交格式：`type(scope): description`

类型：`feat` / `fix` / `docs` / `style` / `refactor` / `test` / `chore`

示例：`feat(auth): add OAuth2 authentication`

### 合并策略

- 功能分支 → **Squash and merge**（保持历史整洁）
- 发布/热修复分支 → **Merge commit**（保留分支历史）

### 禁止操作

- ❌ 直接提交到 `main`
- ❌ `git push --force`（用 `--force-with-lease` 替代）
- ❌ 在公共分支上 `git rebase`
- ❌ `--no-verify` 跳过 git hooks

---

## 可用脚本

| 脚本 | 用途 |
|------|------|
| `create-feature.ts` | 创建 feature 分支 |
| `create-release.ts` | 创建 release 分支 |
| `create-hotfix.ts` | 创建 hotfix 分支 |
| `create-experimental.ts` | 创建 experimental 分支 |
| `commit-and-push.ts` | 提交并推送代码（支持 AI 生成 commit message） |
| `create-merge-request.ts` | 创建 GitLab MR（支持 AI 生成 MR 内容） |
| `submit.ts` | 完整提交流程（commit + push + MR） |
| `publish-release.ts` | 发布 release 分支到 main |
| `publish-hotfix.ts` | 发布 hotfix 分支到 main |

---

## AI 功能

脚本支持多种 AI 服务生成 commit message 和 MR 内容：

- **Anthropic** - Claude
- **Ark Coding Plan** - 字节跳动
- **BigModel** - 智谱
- **DeepSeek**
- **LongCat**
- **MiniMax**
- **Xiaomi Mimo**

使用 `--ai` 参数指定 AI provider：
```bash
bun run .claude/scripts/workflow/commit-and-push.ts --ai anthropic
bun run .claude/scripts/workflow/create-merge-request.ts --ai mimo
```

---

## 注意事项

1. 所有脚本都使用 `bun` 运行，不要使用 `node` 或 `ts-node`
2. 创建分支前会自动拉取最新代码
3. 合并到 main 分支时会使用 `--no-ff` 选项保留分支历史
4. 发布操作会自动创建 tag 并删除已发布的分支
5. 使用 `@gitbeaker/rest` 库与 GitLab API 交互
