---
name: linear-bot
description: Linear 项目管理工具集。查询单个 issue 详情、查询项目某版本所有 issue、生成 Gusto 项目版本进度报告并推送企业微信。当用户提到 Linear issue、版本进度、milestone、issue 查询、进度报告、企业微信推送时使用此 skill，即使用户没有明确说"linear-bot"。
---

# Linear Bot

Linear 项目管理工具集。skill 安装在项目的 `.claude/skills/linear-bot/` 下。

## 前置条件

- 当前项目 `.claude/.env` 中需有 `LINEAR_API_KEY=lin_api_xxx`
- 当前项目根目录需已运行 `npm install`（需要 `@linear/sdk`、`dotenv`、`commander`）

## 工具列表

- 查询单个 Issue 详情
- 获取某项目某版本所有 Issue 列表
- 生成 Gusto 项目某版本进度报告

### 查询单个 Issue

查询某个 issue 的详细信息，包括标题、状态、优先级、负责人、标签等。

```bash
bunx tsx --env-file=.claude/.env .claude/skills/linear-bot/scripts/index.ts issue <identifier>
```

**示例：**
```bash
bunx tsx --env-file=.claude/.env .claude/skills/linear-bot/scripts/index.ts issue 4T-8574
```

**输出（JSON）：**
```json
{
  "identifier": "ENG-123",
  "title": "Fix login bug",
  "description": "...",
  "status": "In Progress",
  "priority": "High",
  "assignee": "Zhang San",
  "labels": ["bug"],
  "team": "Engineering",
  "url": "https://linear.app/...",
  "createdAt": "...",
  "updatedAt": "..."
}
```

### 查询版本所有 Issue

查询某个项目指定版本（milestone）下的所有 issue 列表。

```bash
bunx tsx --env-file=.claude/.env .claude/skills/linear-bot/scripts/index.ts milestone-issues "<project>" "<milestone>"
```

**示例：**
```bash
bunx tsx --env-file=.claude/.env .claude/skills/linear-bot/scripts/index.ts milestone-issues "Gusto English App" "2.48.0"
```

**输出（JSON）：**
```json
{
  "project": "Gusto English App",
  "milestone": "2.48.0",
  "total": 42,
  "issues": [
    {
      "identifier": "ENG-100",
      "title": "...",
      "status": "Done",
      "priority": "Medium",
      "assignee": "Li Si",
      "labels": [],
      "url": "https://linear.app/..."
    }
  ]
}
```

### 生成版本进度报告

生成 Gusto English App 项目某版本的进度报告，包含完成率、状态分布、需要关注的高优先级 issue。可选推送到企业微信。

```bash
bunx tsx --env-file=.claude/.env .claude/skills/linear-bot/scripts/report.ts <version> [--push]
```

**示例：**
```bash
# 只打印报告
bunx tsx --env-file=.claude/.env .claude/skills/linear-bot/scripts/report.ts 2.48.0

# 打印并推送到企业微信
bunx tsx --env-file=.claude/.env .claude/skills/linear-bot/scripts/report.ts 2.48.0 --push
```

**输出（纯文本）：**
```
📦 Linear · Gusto English App · 2.48.0
  [##########..........] 50.0%  (21/42 done)

📊 进度概览：
  Done: 21
  Developing: 10
  In Code Review: 5
  Testing: 3
  Todo: 3

⚠️ 优先关注 (2):
  [urgent] [ENG-88] Fix crash on startup -- Developing
  [high] [ENG-91] Payment flow broken... -- Developing
```
