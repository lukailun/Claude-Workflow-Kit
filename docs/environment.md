# 环境变量配置

## 快速配置

```bash
cd claude
cp .env.template .env
```

编辑 `.env`，填入你的 API 密钥。CI/CD 环境下从 CI Settings 读取，不需要 `.env` 文件。

## 平台集成

| 变量名 | 用途 | 必需 |
|--------|------|------|
| `GITHUB_BASE_URL` | GitHub API 地址 | GitHub 功能 |
| `GITHUB_TOKEN` | GitHub Token | GitHub 功能 |
| `GITLAB_BASE_URL` | GitLab API 地址 | GitLab 功能 |
| `GITLAB_TOKEN` | GitLab Token | GitLab 功能 |
| `LINEAR_API_KEY` | Linear API 密钥 | Linear 集成 |
| `LINEAR_PROJECT_ID` | Linear 项目 ID | 创建 issue 时 |
| `SENTRY_API_KEY` | Sentry API 密钥 | Sentry 集成 |
| `SENTRY_BASE_URL` | Sentry 地址 | Sentry 集成 |
| `SENTRY_ORGANIZATION` | Sentry 组织名 | Sentry 集成 |
| `SENTRY_PROJECT` | Sentry 项目名 | Sentry 集成 |

## AI Provider

每个 Provider 需要 `*_BASE_URL` 和 `*_API_KEY`，未使用的可以删除或注释。

| Provider | 变量名 | 默认地址 |
|----------|--------|----------|
| Anthropic | `CLAUDE_BASE_URL`, `CLAUDE_API_KEY`, `CLAUDE_AUTH_TOKEN` | — |
| DeepSeek | `DEEPSEEK_BASE_URL`, `DEEPSEEK_API_KEY` | `https://api.deepseek.com` |
| Gemini | `GEMINI_BASE_URL`, `GEMINI_API_KEY` | `https://generativelanguage.googleapis.com` |
| GLM | `GLM_BASE_URL`, `GLM_API_KEY` | `https://open.bigmodel.cn` |
| HY | `HY_BASE_URL`, `HY_API_KEY` | `https://tokenhub.tencentmaas.com` |
| LongCat | `LONGCAT_BASE_URL`, `LONGCAT_API_KEY` | `https://api.longcat.chat` |
| Mimo | `MIMO_BASE_URL`, `MIMO_API_KEY` | `https://api.xiaomimimo.com` |
| MiniMax | `MINIMAX_BASE_URL`, `MINIMAX_API_KEY` | `https://api.minimaxi.com` |
| Qwen | `QWEN_BASE_URL`, `QWEN_API_KEY` | `https://dashscope.aliyuncs.com` |
| OpenRouter | `OPENROUTER_BASE_URL`, `OPENROUTER_API_KEY` | `https://openrouter.ai/api/v1` |

## CI 环境变量

代码审查系统需要以下 GitLab CI 变量（pipeline 中自动注入，无需手动配置）：

| 变量名 | 说明 |
|--------|------|
| `CI_MERGE_REQUEST_PROJECT_ID` | 项目 ID |
| `CI_MERGE_REQUEST_IID` | MR 编号 |
| `CI_MERGE_REQUEST_TITLE` | MR 标题 |
| `CI_MERGE_REQUEST_DIFF_BASE_SHA` | diff 基准 SHA |
| `CI_COMMIT_SHA` | 当前 commit SHA |
