# Linear 集成

## 配置

在 `.env` 中设置：

```bash
LINEAR_API_KEY=your-api-key
LINEAR_PROJECT_ID=your-project-id
```

详见 [环境变量](environment.md)

## 使用方式

### 从 Linear Todo 工单创建分支

```bash
bun feature feature-name
# 或者
bun experimental feature-name
```

详见 [Git 工作流](git-workflow.md#分支管理) “分支管理” 章节。

### Issue 状态自动更新

| 操作 | 状态变化 |
|------|----------|
| 从工单列表选择并创建分支 | `Todo` → `Developing` |
| 创建合并请求 | → `In Code Review` |

### 分支名与 Issue 关联

分支名中包含 Linear 工单ID（格式 `[A-Z]+-\d+`）时自动关联：

| 分支名 | 关联的 Issue |
|--------|-------------|
| `feature/4T-1234` | `4T-1234` |
| `feature/my-feature` | 无关联 |

### 开发用量报告

```bash
bun mr --receipt
# 或者
bun submit --receipt
```

详见 [Git 工作流](git-workflow.md#代码提交) “代码提交” 章节。

启用 `--receipt` 后，会将开发用量报告作为评论添加到关联的 Linear 工单中。
