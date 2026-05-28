# 新项目模板

这是一个通用的项目模板，包含了 Git 工作流脚本和 Claude Code 配置。

## 快速开始

### 1. 克隆或复制项目

```bash
# 如果是从模板创建
git clone <repository-url>
cd <project-name>
```

### 2. 初始化项目

```bash
# 运行初始化脚本
chmod +x init.sh
./init.sh
```

### 3. 开始开发

```bash
# 创建 feature 分支
bun run .claude/scripts/workflow/create-feature.ts my-feature

# 开发功能...
# 编辑代码文件

# 提交并推送（支持 AI 生成 commit message）
bun run .claude/scripts/workflow/commit-and-push.ts

# 创建 MR（支持 AI 生成 MR 内容）
bun run .claude/scripts/workflow/create-merge-request.ts
```

## 项目结构

```
.
├── .claude/                    # Claude Code 配置目录
│   ├── scripts/               # 脚本目录
│   │   ├── ai/                # AI 功能
│   │   ├── anthropic/         # Anthropic API
│   │   ├── big-model/         # BigModel API
│   │   ├── claude-code/       # Claude Code 功能
│   │   ├── deep-seek/         # DeepSeek API
│   │   ├── env/               # 环境变量
│   │   ├── git/               # Git 功能
│   │   ├── gitlab/            # GitLab API
│   │   ├── mini-max/          # MiniMax API
│   │   ├── workflow/          # Git 工作流脚本
│   │   │   ├── create-feature.ts
│   │   │   ├── create-release.ts
│   │   │   ├── create-hotfix.ts
│   │   │   ├── create-experimental.ts
│   │   │   ├── commit-and-push.ts
│   │   │   ├── create-merge-request.ts
│   │   │   ├── submit.ts
│   │   │   ├── publish-release.ts
│   │   │   └── publish-hotfix.ts
│   │   └── xiaomi-mimo/       # Xiaomi Mimo API
│   ├── .env.template          # 环境变量模板
│   ├── .gitignore             # Git 忽略文件
│   ├── CLAUDE.md              # Claude Code 行为约定
│   ├── README.md              # 详细使用说明
│   ├── package.json           # 依赖配置
│   └── settings.json          # Claude Code 权限配置
├── init.sh                    # 初始化脚本
├── test.sh                    # 测试脚本
└── README.md                  # 项目说明（本文件）
```

## 可用命令

### 分支管理

```bash
# 创建 feature 分支
bun run .claude/scripts/workflow/create-feature.ts <branch-name>

# 创建 release 分支（交互式）
bun run .claude/scripts/workflow/create-release.ts

# 创建 hotfix 分支（交互式）
bun run .claude/scripts/workflow/create-hotfix.ts

# 创建 experimental 分支
bun run .claude/scripts/workflow/create-experimental.ts <branch-name>
```

### 代码提交

```bash
# 提交并推送（支持 AI 生成 commit message）
bun run .claude/scripts/workflow/commit-and-push.ts

# 完整提交流程（commit + push + MR）
bun run .claude/scripts/workflow/submit.ts
```

### 合并请求

```bash
# 创建 GitLab MR（支持 AI 生成 MR 内容）
bun run .claude/scripts/workflow/create-merge-request.ts
```

### 发布

```bash
# 发布 release 分支到 main
bun run .claude/scripts/workflow/publish-release.ts

# 发布 hotfix 分支到 main
bun run .claude/scripts/workflow/publish-hotfix.ts
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

## AI 功能

脚本支持多种 AI 服务：

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

## 环境变量

| 变量名 | 用途 | 必需 |
|--------|------|------|
| `GITLAB_HOST` | GitLab 地址 | 是（MR 功能） |
| `GITLAB_TOKEN` | GitLab 认证 | 是（MR 功能） |
| `ANTHROPIC_BASE_URL` | Anthropic API 地址 | 可选  |
| `ANTHROPIC_API_KEY` | Anthropic 认证 | 可选 |
| `ANTHROPIC_AUTH_TOKEN` | Anthropic 认证 | 可选 |

## 注意事项

1. 所有脚本都使用 `bun` 运行，不要使用 `node` 或 `ts-node`
2. 创建分支前会自动拉取最新代码
3. 合并到 main 分支时会使用 `--no-ff` 选项保留分支历史
4. 发布操作会自动创建 tag 并删除已发布的分支
5. 使用 `@gitbeaker/rest` 库与 GitLab API 交互

## 更多信息

详细使用说明请参考：
- [Claude Code 配置说明](.claude/README.md)
