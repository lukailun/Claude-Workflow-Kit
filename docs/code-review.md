# AI 代码审查

## 使用方式

### CI 自动审查

在 GitLab CI 中配置：

```yaml
ai-review:
  stage: review
  image: oven/bun:latest
  script:
    - cd claude
    - bun install
    - bun run scripts/review/run.ts --ai mimo
  rules:
    - if: $CI_PIPELINE_SOURCE == "merge_request_event"
```

### 手动运行

```bash
# 在 MR 分支上运行
bun run scripts/review/run.ts
bun run scripts/review/run.ts --ai anthropic
```

需要设置 `GITLAB_TOKEN` 和 `CI_MERGE_REQUEST_PROJECT_ID`、`CI_MERGE_REQUEST_IID` 等环境变量。

## 审查状态标记

审查过程中通过 GitLab emoji reaction 标记进度：

| Reaction | 含义 |
|----------|------|
| 👀 | 审查进行中 |
| 👍 | 审查通过（无违规） |
| 👎 | 审查未通过（存在 error 级违规） |

error 级违规会阻塞 CI pipeline（exit 1），warning 级不会。

## 内置规则

### Error 规则（阻塞）

| 规则 | 检查内容 |
|------|----------|
| ERROR-1 | 禁止 `{value && <Component />}` 模式，防止空字符串/0 导致 RN 崩溃。应使用三元表达式或 `!!` 强转 |
| ERROR-2 | 字符串必须在 `<Text>` 组件内渲染，不能作为 `<View>` 的直接子节点 |
| ERROR-3 | 面向用户的文本必须使用 `useI18n`，禁止硬编码中文/英文 |
| ERROR-4 | `switch` 处理联合类型时，`default` 分支必须用 `never` 类型做穷尽性检查 |

### Warning 规则（不阻塞）

| 规则 | 检查内容 |
|------|----------|
| WARNING-1 | 仅使用 JSX 时不需要 `import React`（新 JSX Transform）。使用 `useState` 等 API 仍需导入 |
| WARNING-2 | 本地图片用 `Image`，网络图片用 `FastImage`。头像用 `cover`，图标必须指定 `resizeMode="contain"` |
| WARNING-3 | 列表场景头像使用 `item.avatar_thumb ?? item.avatar`，非列表场景直接用原图 |

## 创建自定义规则

### CLI 工具

```bash
bun run scripts/review/create-rule.ts
```

交互式选择严重程度、输入标题和描述，自动生成规则文件。

### 手动创建

在 `scripts/review/coding-standards/error-rules/` 或 `warning-rules/` 下创建 Markdown 文件：

```markdown
---
ruleId: ERROR-5
title: 自定义规则标题
severity: error
---

## 规则描述

说明这条规则检查什么...

## 错误示例

```tsx
// ❌ 错误代码
```

## 正确示例

```tsx
// ✅ 正确代码
```
```

**注意：**
- 文件名以 `0-` 开头的为示例文件，不会被加载
- `ruleId` 必须唯一
- `severity` 必须与所在目录一致
