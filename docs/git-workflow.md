# Git 工作流

## 分支管理

### 创建 Feature 分支

创建 Feature 分支支持两种方式：指定分支名直接创建和交互式选择后创建。创建后分支使用 `feature/` 前缀。

```bash
# 指定分支名
bun feature feature-name
# 或者
bun feat feature-name

# 交互式选择（从 Linear 待办工单列表中选择）
bun feature
# 或者
bun feat
```

从 Linear 工单选择时，会显示当前用户的 Todo 工单列表，输入序号即可选中。选中后自动更新工单状态为 Developing。

### 创建 Experimental 分支

创建 Experimental 分支支持两种方式：指定分支名直接创建和交互式选择后创建。创建后分支使用 `experimental/` 前缀。

```bash
# 指定分支名
bun experimental feature-name
# 或者
bun exp feature-name

# 交互式选择（从 Linear 待办工单列表中选择）
bun experimental
# 或者
bun exp
```

从 Linear 工单选择时，会显示当前用户的 Todo 工单列表，输入序号即可选中。选中后自动更新工单状态为 Developing。

### 创建 Release 分支

```bash
bun release
```

创建后分支使用 `release/` 前缀。创建 Release 分支时会自动获取最新 git tag 并建议下一个 minor 版本号（如 `2.56.0` → `2.57.0`）。支持：

- `y` 或回车：接受建议版本
- `n`：取消
- 输入自定义版本号

如果远程已存在该 release 分支，会直接 checkout 并 pull。

### 创建 Hotfix 分支

```bash
bun hotfix
```

创建后分支使用 `hotfix/` 前缀。创建 Hotfix 分支时会自动获取最新 git tag 并建议下一个 patch 版本号（如 `2.56.0` → `2.56.1`）。支持：

- `y` 或回车：接受建议版本
- `n`：取消
- 输入自定义版本号

如果远程已存在该 hotfix 分支，会直接 checkout 并 pull。

## 分支命名规范

| 类型 | 格式 | 示例 |
|------|------|------|
| feature | `feature/<name>` | `feature/user-login` |
| release | `release/<version>` | `release/1.2.0` |
| hotfix | `hotfix/<version>` | `hotfix/1.2.1` |
| experimental | `experimental/<name>` | `experimental/new-ui` |

## 代码提交

### 提交并推送

```bash
bun commit \[--ai <provider>\]
```

自动暂存改动、使用 AI 生成 commit message 并推送到远程。

| **Option**    | **Type** | **Description**                                      |
| ------------- | -------- | ---------------------------------------------------- |
| **`--ai`**    | `string` | 详见 [docs/ai.md](ai.md) |

### 创建或更新合并请求

```bash
bun mr [--ai <provider>] [--receipt] [--auto-merge]
```

自动创建或更新 GitLab MR，使用 AI 生成合并请求内容。
如果当前分支曾经创建过 MR，但该 MR 已经 `merged` 或 `closed`，会重新创建一个新的 MR。

| **Option**       | **Type** | **Description**                                      |
| ---------------- | -------- | ---------------------------------------------------- |
| **`--ai`**       | `string` | 详见 [docs/ai.md](ai.md) |
| **`--receipt`**  | `flag`   | 创建 MR 时附带开发信息 |
| **`--auto-merge`** | `flag` | 创建/更新 MR 后开启 pipeline 通过后自动合并 |

### 提交并创建合并请求

```bash
bun submit [--ai <provider>] [--receipt] [--auto-merge]
```

一键完成 “提交、推送、创建合并请” 流程。等同于依次执行 `bun commit` 和 `bun mr`。

| **Option**       | **Type** | **Description**                                      |
| ---------------- | -------- | ---------------------------------------------------- |
| **`--ai`**       | `string` | 详见 [docs/ai.md](ai.md) |
| **`--receipt`**  | `flag`   | 创建 MR 时附带开发信息 |
| **`--auto-merge`** | `flag` | 创建/更新 MR 后开启 pipeline 通过后自动合并 |

## 发布

### 发布 Release

```bash
bun release:publish
```

自动执行：创建 MR -> 合并到主分支 -> 创建 tag -> 删除远程 release 分支。

### 发布 Hotfix

```bash
bun hotfix:publish
```

自动执行：创建 MR -> 合并到主分支 -> 创建 tag -> 删除远程 hotfix 分支 -> 主分支合并到 release 分支。