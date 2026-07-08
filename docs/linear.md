# Linear 集成

## 配置

在 `.env` 中设置：

```bash
LINEAR_API_KEY=your-api-key
LINEAR_PROJECT_ID=your-project-id
```

## 使用方式

### 从 Linear Issue 创建分支

```bash
bun run scripts/workflow/create-feature.ts
bun run scripts/workflow/create-experimental.ts
```

不提供分支名时，会显示当前用户未开始的 issue 列表：

```
? 请输入序号选择任务或输入分支名称:

  1. [4T-1234] 实现用户登录功能
  2. [4T-1235] 优化首页加载速度
  3. [4T-1236] 修复支付流程 bug
```

- 输入数字：选中对应 issue，使用其标识符作为分支名
- 输入文字：使用自定义分支名

### Issue 状态自动流转

| 操作 | 状态变化 |
|------|----------|
| 从 issue 列表选择并创建分支 | `unstarted` → `Developing` |
| 创建 MR（commit-and-push / create-merge-request / submit） | → `In Code Review` |

### 分支名与 Issue 关联

分支名中包含 Linear issue ID（格式 `[A-Z]+-\d+`）时自动关联：

| 分支名 | 关联的 Issue |
|--------|-------------|
| `feature/4T-1234-user-login` | `4T-1234` |
| `feature/PROJ-567-fix-bug` | `PROJ-567` |
| `feature/my-feature` | 无关联 |

### 创建新 Issue

`create-feature` / `create-experimental` 时，如果分支名不含 issue ID，会提示：

```
是否创建 Linear 任务？(y/n):
```

选择 `y` 会基于分支名创建新 issue。

### Token 用量报告附加到 Issue

```bash
bun run scripts/workflow/create-merge-request.ts --receipt
bun run scripts/workflow/submit.ts --receipt
```

启用 `--receipt` 后，会将 Token 用量报告作为评论添加到关联的 Linear issue 中。
