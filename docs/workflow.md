# Git 工作流

## 分支管理

### 创建 Feature 分支

```bash
# 指定分支名
bun run scripts/workflow/create-feature.ts my-feature

# 交互式选择（从 Linear issue 列表中选择）
bun run scripts/workflow/create-feature.ts
```

从 Linear issue 选择时，会显示当前用户未开始的 issue 列表，输入序号即可选中。选中后自动更新 issue 状态为「Developing」。

### 创建 Release 分支

```bash
bun run scripts/workflow/create-release.ts
```

自动获取最新 git tag 并建议下一个 minor 版本号（如 `2.56.0` → `2.57.0`）。支持：
- `y` 或回车：接受建议版本
- `n`：取消
- 输入自定义版本号

如果远程已存在该 release 分支，会直接 checkout 并 pull。

### 创建 Hotfix 分支

```bash
bun run scripts/workflow/create-hotfix.ts
```

与 release 类似，自动建议 patch 版本号（如 `2.56.0` → `2.56.1`）。

### 创建 Experimental 分支

```bash
bun run scripts/workflow/create-experimental.ts my-experiment
```

与 feature 分支流程相同，使用 `experimental/` 前缀。

### 分支命名规范

| 类型 | 格式 | 示例 |
|------|------|------|
| feature | `feature/<name>` | `feature/user-login` |
| release | `release/<version>` | `release/1.2.0` |
| hotfix | `hotfix/<version>` | `hotfix/1.2.1` |
| experimental | `experimental/<name>` | `experimental/new-ui` |

---

## 代码提交

### commit-and-push

```bash
bun run scripts/workflow/commit-and-push.ts
bun run scripts/workflow/commit-and-push.ts --ai anthropic
```

**交互流程：**

1. 检测工作区变更，如有未暂存文件，提示是否全部暂存
2. AI 分析已暂存的 diff，生成 commit message
3. 显示生成的提交信息，可选择：
   - `y` 或回车：使用 AI 生成的信息
   - `n`：取消提交
   - 直接输入：使用自定义信息
4. 提交并推送

### submit（一键提交）

```bash
bun run scripts/workflow/submit.ts
bun run scripts/workflow/submit.ts --ai deepseek --receipt --auto-merge
```

自动完成 commit + push + 创建 MR 全流程。如果无新提交，会询问是否仍要创建 MR。

---

## 合并请求

### create-merge-request

```bash
bun run scripts/workflow/create-merge-request.ts
bun run scripts/workflow/create-merge-request.ts --ai anthropic --receipt --auto-merge
```

AI 分析分支差异，自动生成 MR 标题和描述（包含概览、变更列表、影响分析、测试说明）。

- 如果已存在同分支对的 MR，会更新内容而非重复创建
- 合并到 main 时自动禁用 squash
- 自动关联 Linear issue 并更新状态为「In Code Review」

**CLI 参数：**

| 参数 | 说明 |
|------|------|
| `--ai <provider>` | 选择 AI Provider，默认 `mimo` |
| `--receipt` | 将 Token 用量报告附加到 MR 描述和 Linear 评论 |
| `--auto-merge` | 开启 pipeline 通过后自动合并 |

---

## 发布

### 发布 Release

```bash
git checkout release/1.2.0
bun run scripts/workflow/publish-release.ts
```

自动执行：创建 MR → 合并到 main（`--no-ff`）→ 创建 tag `v1.2.0` → 删除远程 release 分支。

### 发布 Hotfix

```bash
git checkout hotfix/1.2.1
bun run scripts/workflow/publish-hotfix.ts
```

与发布 release 相同流程，额外将 main 同步回最新的 release 分支。

---

## Token 用量报告

```bash
# 当前分支
bun run scripts/workflow/build-branch-receipt.ts

# 指定分支
bun run scripts/workflow/build-branch-receipt.ts feature/my-feature

# 指定 ASCII art 样式（0-5）
bun run scripts/workflow/build-branch-receipt.ts 3
```

展示当前分支下 Claude Code / Codex 的 Token 用量、按模型费用明细（USD + CNY）、缓存命中率等信息。

---

## npm scripts 快捷方式

```bash
bun run commit            # commit-and-push
bun run pr                # create-merge-request
bun run submit            # submit
bun run release           # create-release
bun run publish-release   # publish-release
bun run hotfix            # create-hotfix
bun run publish-hotfix    # publish-hotfix
bun run feature           # create-feature
bun run experimental      # create-experimental
bun run receipt           # build-branch-receipt
```
