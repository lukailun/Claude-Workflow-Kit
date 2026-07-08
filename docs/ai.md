# AI 集成

## 支持的 Provider

| AI Provider | 参数 |
|----------|------|----------|
| Claude | `claude` |
| DeepSeek | `deepseek` |
| Gemini | `gemini` |
| 智谱 GLM | `glm` |
| 腾讯混元 | `hy` |
| 美团 LongCat | `longcat` |
| 小米 Mimo | `mimo` |
| MiniMax | `minimax` |
| 通义千问 | `qwen` |
| OpenRouter | `openrouter` |

默认 DEFAULT_AI 为 `mimo`，位于 `scripts/ai/get-language-model.ts`。

## AI 应用场景

### Commit Message 生成

生成规范的提交信息：

`bun commit [--ai <provider>]`

### Merge Request 生成

生成完整 MR 内容：

`bun mr [--ai <provider>]`

### 代码审查

对 MR diff 逐规则运行 AI 审查：

`bun review --ai mimo`

详见 [AI 代码审查](code-review.md)。

## 扩展新 Provider

1. 在 `scripts/language-models/` 下创建语言模型文件
2. 在 `scripts/env/` 下添加环境变量读取函数
3. 在 `.env.template` 中添加环境变量
4. 在 `scripts/ai/get-language-model.ts` 中添加 Provider 名称
