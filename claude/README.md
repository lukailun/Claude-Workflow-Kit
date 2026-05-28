# Claude Code 工作流脚本

这个目录包含用于 Git 工作流的脚本，可以与 Claude Code 配合使用。

## 快速开始

### 1. 安装依赖

```bash
cd .claude && bun install
```

### 2. 配置环境变量

```bash
cp .env.template .env
# 编辑 .env 文件，填入必要的配置
```

### 3. 安装 glab CLI（可选，用于创建 MR）

```bash
brew install glab
glab auth login
```

## 可用脚本

### 创建分支

```bash
# 创建 feature 分支
bun run scripts/workflow/create-feature.ts <branch-name>

# 创建 release 分支（交互式）
bun run scripts/workflow/create-release.ts

# 创建 hotfix 分支（交互式）
bun run scripts/workflow/create-hotfix.ts

# 创建 experimental 分支
bun run scripts/workflow/create-experimental.ts <branch-name>
```

### 提交代码

```bash
# 提交并推送（支持 AI 生成 commit message）
bun run scripts/workflow/commit-and-push.ts

# 完整提交流程（commit + push + MR）
bun run scripts/workflow/submit.ts
```

### 创建合并请求

```bash
# 创建 GitHub PR（支持 AI 生成 PR 内容）
bun run scripts/workflow/create-merge-request.ts
```

### 发布

```bash
# 发布 release 分支到 main
bun run scripts/workflow/publish-release.ts

# 发布 hotfix 分支到 main
bun run scripts/workflow/publish-hotfix.ts
```

## 分支命名规范

- **feature/**: `feature/<descriptive-name>` - 新功能
- **release/**: `release/<version>` - 版本发布（如 `release/1.2.0`）
- **hotfix/**: `hotfix/<version>` - 紧急修复（如 `hotfix/1.2.1`）
- **experimental/**: `experimental/<name>` - 实验性功能

## 提交规范

使用约定式提交格式：

```
type(scope): description
```

类型：
- `feat`: 新功能
- `fix`: 修复 bug
- `docs`: 文档更新
- `style`: 代码格式调整
- `refactor`: 重构
- `test`: 测试相关
- `chore`: 构建/工具相关

示例：
```
feat(auth): add OAuth2 authentication
fix(api): handle null response
docs(readme): update installation guide
```

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
bun run scripts/workflow/commit-and-push.ts --ai anthropic
bun run scripts/workflow/create-merge-request.ts --ai mimo
```

## 环境变量

| 变量名 | 用途 | 必需 |
|--------|------|------|
| `GITHUB_TOKEN` | GitHub 认证 | 是（PR 功能） |
| `ANTHROPIC_BASE_URL` | Anthropic API 地址 | 可选  |
| `ANTHROPIC_API_KEY` | Anthropic 认证 | 可选 |
| `ANTHROPIC_AUTH_TOKEN` | Anthropic 认证 | 可选 |

## 注意事项

1. 所有脚本都使用 `bun` 运行，不要使用 `node` 或 `ts-node`
2. 创建分支前会自动拉取最新代码
3. 合并到 main 分支时会使用 `--no-ff` 选项保留分支历史
4. 发布操作会自动创建 tag 并删除已发布的分支
5. 使用 `@octokit/rest` 库与 GitHub API 交互
